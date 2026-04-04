from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class MedicalRecordBase(BaseModel):
    blood_pressure_sys: int | None = None
    blood_pressure_dia: int | None = None
    heart_rate_bpm: int | None = None
    respiratory_rate: int | None = None
    spo2_percent: int | None = None
    temperature_celsius: float | None = None
    weight_kg: float | None = None
    height_cm: float | None = None

    symptoms: str
    diagnosis: str | None = None
    prescription_notes: str | None = None
    lab_tests_requested: str | None = None

class MedicalRecordCreate(MedicalRecordBase):
    appointment_id: UUID | None = None
    patient_id: UUID
    doctor_id: UUID
    token_id: UUID | None = None  # To clear the live queue automatically

class MedicalRecordResponse(MedicalRecordBase):
    id: UUID
    appointment_id: UUID | None
    patient_id: UUID
    doctor_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
