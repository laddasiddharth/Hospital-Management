from pydantic import BaseModel
from uuid import UUID
from datetime import datetime, date
from models.token_queue import TokenStatus, TokenPriority

class TokenBase(BaseModel):
    priority: TokenPriority = TokenPriority.NORMAL

class TokenCreate(TokenBase):
    patient_id: UUID
    doctor_id: UUID
    appointment_id: UUID | None = None

class TokenUpdateStatus(BaseModel):
    status: TokenStatus
    
class TokenUpdatePriority(BaseModel):
    priority: TokenPriority

class TokenResponse(TokenBase):
    id: UUID
    token_number: str
    appointment_id: UUID | None
    patient_id: UUID
    doctor_id: UUID
    queue_date: date
    status: TokenStatus
    position: int
    check_in_time: datetime | None
    called_time: datetime | None
    completed_time: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
