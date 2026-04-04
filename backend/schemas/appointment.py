from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime, date, time
from models.appointment import AppointmentStatus

class AppointmentBase(BaseModel):
    doctor_id: UUID
    appointment_date: date
    start_time: time
    end_time: time
    notes: str | None = Field(None, max_length=1000)

class AppointmentCreate(AppointmentBase):
    patient_id: UUID | None = None  # None if patient books themselves, required if receptionist books

class AppointmentUpdate(BaseModel):
    status: AppointmentStatus | None = None
    notes: str | None = Field(None, max_length=1000)

class AppointmentResponse(AppointmentBase):
    id: UUID
    patient_id: UUID
    status: AppointmentStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
