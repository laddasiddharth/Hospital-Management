from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class DoctorBase(BaseModel):
    specialization: str | None = Field(None, max_length=255)
    qualification: str | None = Field(None, max_length=255)
    experience_years: int = Field(0, ge=0)
    max_patients_per_slot: int = Field(10, ge=1)
    consultation_duration_minutes: int = Field(15, ge=5)
    is_available: bool = True

class DoctorCreate(DoctorBase):
    user_id: UUID
    department_id: UUID | None = None

class DoctorUpdate(BaseModel):
    department_id: UUID | None = None
    specialization: str | None = Field(None, max_length=255)
    qualification: str | None = Field(None, max_length=255)
    experience_years: int | None = Field(None, ge=0)
    max_patients_per_slot: int | None = Field(None, ge=1)
    consultation_duration_minutes: int | None = Field(None, ge=5)
    is_available: bool | None = None

class DoctorResponse(DoctorBase):
    id: UUID
    user_id: UUID
    department_id: UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
