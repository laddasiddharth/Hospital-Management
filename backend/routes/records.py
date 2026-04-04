from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from models.user import User, UserRole
from models.medical_record import MedicalRecord
from models.appointment import Appointment, AppointmentStatus
from models.token_queue import TokenQueue, TokenStatus
from schemas.medical_record import MedicalRecordCreate, MedicalRecordResponse
from auth.dependencies import require_role, get_current_user
from routes.websocket import manager

router = APIRouter(prefix="/api/records", tags=["Medical Records"])


@router.post("", response_model=MedicalRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_medical_record(
    request: MedicalRecordCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_role([UserRole.DOCTOR, UserRole.ADMIN]))
):
    """
    Saves an immutable medical record. Closes out the active Appointment and Queue Token.
    """
    # 1. Ensure record doesn't already exist for this appointment
    exists = db.query(MedicalRecord).filter(MedicalRecord.appointment_id == request.appointment_id).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A record already exists for this appointment.")

    # 2. Extract token_id since it's not a database column on MedicalRecord
    token_id = request.token_id
    record_data = request.model_dump(exclude={"token_id"})

    record = MedicalRecord(**record_data)
    db.add(record)

    # 3. Finalize associated appointment
    appointment = db.query(Appointment).filter(Appointment.id == request.appointment_id).first()
    if appointment:
        appointment.status = AppointmentStatus.COMPLETED.value
    
    # 4. Finalize Token (if passed) and Broadcast WebSocket completion to clear the live TV Board
    if token_id:
        token = db.query(TokenQueue).filter(TokenQueue.id == token_id).first()
        if token:
            token.status = TokenStatus.COMPLETED.value
            await manager.broadcast({
                "event": "STATE_UPDATE",
                "data": {
                    "id": str(token.id),
                    "token_number": token.token_number,
                    "status": token.status,
                    "doctor_id": str(token.doctor_id)
                }
            })

    db.commit()
    db.refresh(record)

    return record


@router.get("", response_model=list[MedicalRecordResponse])
def get_medical_records(
    patient_id: UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch history. Patients naturally filter to themselves.
    Doctors/Admins can query specific patients with patient_id.
    """
    query = db.query(MedicalRecord)

    if current_user.role == UserRole.PATIENT.value:
        query = query.filter(MedicalRecord.patient_id == current_user.id)
    else:
        if patient_id:
            query = query.filter(MedicalRecord.patient_id == patient_id)

    return query.order_by(MedicalRecord.created_at.desc()).all()
