from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from uuid import UUID

from database import get_db
from models.appointment import Appointment, AppointmentStatus
from models.doctor import Doctor
from models.user import User, UserRole
from schemas.appointment import AppointmentResponse, AppointmentCreate, AppointmentUpdate
from auth.dependencies import require_role, get_current_user
from services.notifications import send_appointment_confirmation, send_appointment_cancellation

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


@router.get("", response_model=list[AppointmentResponse])
def get_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get appointments relevant to the current user:
    - PATIENT: Returns only their appointments.
    - DOCTOR: Returns appointments assigned to them.
    - ADMIN/RECEPTIONIST: Returns all appointments.
    """
    query = db.query(Appointment)
    
    if current_user.role == UserRole.PATIENT.value:
        query = query.filter(Appointment.patient_id == current_user.id)
    elif current_user.role == UserRole.DOCTOR.value:
        # Get doctor_id for this user
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if doctor:
            query = query.filter(Appointment.doctor_id == doctor.id)
        else:
            return []
            
    return query.order_by(Appointment.appointment_date, Appointment.start_time).all()


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def book_appointment(
    request: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Book a new appointment.
    - Patients book for themselves.
    - Receptionists/Admins can book for explicitly noted patient_id.
    """
    patient_id = request.patient_id
    
    if current_user.role == UserRole.PATIENT.value:
        patient_id = current_user.id
    elif not patient_id:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="patient_id is required for staff booking")
         
    # Check if doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == request.doctor_id).first()
    if not doctor or not doctor.is_available:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Doctor is not available")

    appointment_data = request.model_dump()
    appointment_data["patient_id"] = patient_id
    
    appointment = Appointment(**appointment_data)
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    # 1. Fetch user for notification
    patient_user = db.query(User).filter(User.id == patient_id).first()
    doctor_user = db.query(User).filter(User.id == doctor.user_id).first()
    
    # 2. Send SMS/Email simulation
    if patient_user and doctor_user:
        send_appointment_confirmation(
            patient_name=patient_user.full_name,
            patient_contact=patient_user.email,
            doctor_name=doctor_user.full_name,
            date=str(appointment.appointment_date),
            start_time=str(appointment.start_time)
        )
        
    return appointment


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: UUID,
    request: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update appointment status/notes.
    - Patients can only CANCEL their own appointments.
    - Doctors can update to CONFIRMED, COMPLETED, NO_SHOW for their appointments.
    - Receptionist/Admin can update anything.
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    if current_user.role == UserRole.PATIENT.value:
        if appointment.patient_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        if request.status and request.status != AppointmentStatus.CANCELLED:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patients can only cancel appointments")
            
    elif current_user.role == UserRole.DOCTOR.value:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or appointment.doctor_id != doctor.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appointment, field, value)

    db.commit()
    db.refresh(appointment)
    
    # Check if cancelled and send notification
    if request.status == AppointmentStatus.CANCELLED:
        patient_user = db.query(User).filter(User.id == appointment.patient_id).first()
        doctor = db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
        if patient_user and doctor:
            doctor_user = db.query(User).filter(User.id == doctor.user_id).first()
            if doctor_user:
                send_appointment_cancellation(
                    patient_name=patient_user.full_name,
                    patient_contact=patient_user.email,
                    doctor_name=doctor_user.full_name,
                    date=str(appointment.appointment_date)
                )

    return appointment
