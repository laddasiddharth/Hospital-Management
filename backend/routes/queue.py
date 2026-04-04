from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from datetime import datetime, date

from database import get_db
from models.token_queue import TokenQueue, TokenStatus, TokenPriority
from models.doctor import Doctor
from models.department import Department
from models.user import User, UserRole
from schemas.token_queue import TokenResponse, TokenCreate, TokenUpdateStatus, TokenUpdatePriority
from auth.dependencies import require_role, get_current_user
from routes.websocket import manager

router = APIRouter(prefix="/api/queue", tags=["Live Queue"])


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Public WebSocket endpoint for Live TV Board and real-time dashboard updates.
    """
    await manager.connect(websocket)
    try:
        while True:
            # We don't really expect clients to send messages, just listen.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@router.get("", response_model=list[TokenResponse])
def get_live_queue(
    doctor_id: UUID | None = None,
    db: Session = Depends(get_db)
):
    """
    Get the live queue for today. Optional filter by doctor.
    """
    query = db.query(TokenQueue).filter(TokenQueue.queue_date == date.today())
    if doctor_id:
        query = query.filter(TokenQueue.doctor_id == doctor_id)
        
    return query.order_by(TokenQueue.position).all()


@router.post("/generate", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def generate_token(
    request: TokenCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_role([UserRole.RECEPTIONIST, UserRole.ADMIN]))
):
    """
    Generates a token sequence for a patient today.
    """
    today = date.today()
    
    # 1. Determine Position
    current_max_pos = db.query(func.max(TokenQueue.position)).filter(
        TokenQueue.doctor_id == request.doctor_id,
        TokenQueue.queue_date == today
    ).scalar()
    new_position = (current_max_pos or 0) + 1
    
    # 2. Determine Department Prefix for Token
    doctor = db.query(Doctor).filter(Doctor.id == request.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
        
    prefix = "GEN"
    if doctor.department_id:
         dept = db.query(Department).filter(Department.id == doctor.department_id).first()
         if dept:
             # take first 3 letters uppercase
             prefix = dept.name[:3].upper()
             
    token_number = f"{prefix}-{str(new_position).zfill(3)}"
    
    # Check if patient already has a token today for this doc
    existing = db.query(TokenQueue).filter(
        TokenQueue.patient_id == request.patient_id,
        TokenQueue.doctor_id == request.doctor_id,
        TokenQueue.queue_date == today,
        TokenQueue.status.notin_([TokenStatus.COMPLETED, TokenStatus.CANCELLED])
    ).first()
    
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Patient already in queue for this doctor today.")

    token = TokenQueue(
        **request.model_dump(),
        token_number=token_number,
        queue_date=today,
        position=new_position,
        check_in_time=func.now()
    )
    
    db.add(token)
    db.commit()
    db.refresh(token)
    
    # BROADCAST new token over WebSocket
    await manager.broadcast({
        "event": "NEW_TOKEN",
        "data": {
            "id": str(token.id),
            "token_number": token.token_number,
            "status": token.status,
            "doctor_id": str(token.doctor_id)
        }
    })
    
    return token


@router.patch("/{token_id}/status", response_model=TokenResponse)
async def update_token_status(
    token_id: UUID,
    request: TokenUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Doctors advance token states. Triggers WebSockets to flash the TV Board!
    """
    if current_user.role not in [UserRole.DOCTOR.value, UserRole.RECEPTIONIST.value, UserRole.ADMIN.value]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    token = db.query(TokenQueue).filter(TokenQueue.id == token_id).first()
    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token not found")
        
    # Apply status and timestamps
    token.status = request.status.value
    if request.status == TokenStatus.CALLED:
         token.called_time = func.now()
    elif request.status == TokenStatus.COMPLETED:
         token.completed_time = func.now()

    db.commit()
    db.refresh(token)
    
    # BROADCAST updated status over WebSocket
    await manager.broadcast({
        "event": "STATE_UPDATE",
        "data": {
            "id": str(token.id),
            "token_number": token.token_number,
            "status": token.status,
            "doctor_id": str(token.doctor_id)
        }
    })

    return token


@router.patch("/{token_id}/priority", response_model=TokenResponse)
async def update_token_priority(
    token_id: UUID,
    request: TokenUpdatePriority,
    db: Session = Depends(get_db),
    _ = Depends(require_role([UserRole.RECEPTIONIST, UserRole.ADMIN]))
):
    """
    Receptionists can mark someone as EMERGENCY pushing them to front via websocket reload command.
    """
    token = db.query(TokenQueue).filter(TokenQueue.id == token_id).first()
    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token not found")
        
    token.priority = request.priority.value
    db.commit()
    db.refresh(token)
    
    await manager.broadcast({
        "event": "QUEUE_REORDER",
        "doctor_id": str(token.doctor_id)
    })

    return token
