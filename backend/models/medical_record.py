import uuid
from datetime import datetime

from sqlalchemy import String, Text, ForeignKey, func, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP

from database import Base

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    appointment_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("appointments.id", ondelete="CASCADE"), nullable=True
    )
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    doctor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False
    )

    # Vitals
    blood_pressure_sys: Mapped[int | None] = mapped_column(nullable=True)
    blood_pressure_dia: Mapped[int | None] = mapped_column(nullable=True)
    heart_rate_bpm: Mapped[int | None] = mapped_column(nullable=True)
    temperature_celsius: Mapped[float | None] = mapped_column(Float, nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Clinical Notes
    symptoms: Mapped[str] = mapped_column(Text, nullable=False)
    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    prescription_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    lab_tests_requested: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Immutable creation timestamp
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )

    # Relationships
    patient: Mapped["User"] = relationship("User", foreign_keys=[patient_id])
    doctor: Mapped["Doctor"] = relationship("Doctor")
    appointment: Mapped["Appointment"] = relationship("Appointment")

    def __repr__(self) -> str:
        return f"<MedicalRecord {self.id}>"
