from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from uuid import UUID

from database import get_db
from models.doctor import Doctor
from models.department import Department
from models.user import User, UserRole
from schemas.doctor import DoctorResponse, DoctorCreate, DoctorUpdate
from auth.dependencies import require_role, get_current_user

router = APIRouter(prefix="/api/doctors", tags=["Doctors"])


@router.get("", response_model=list[DoctorResponse])
def get_doctors(
    department_id: UUID | None = Query(None),
    is_available: bool | None = Query(None),
    db: Session = Depends(get_db)
):
    """Get all doctors with optional department and availability filters."""
    query = db.query(Doctor)
    if department_id:
        query = query.filter(Doctor.department_id == department_id)
    if is_available is not None:
        query = query.filter(Doctor.is_available == is_available)
        
    return query.all()


@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor_by_id(doctor_id: UUID, db: Session = Depends(get_db)):
    """Get details of a specific doctor."""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )
    return doctor


@router.post("", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
def create_doctor(
    request: DoctorCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_role([UserRole.ADMIN]))
):
    """Create a doctor profile mapped to a User. Admin only."""
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role != UserRole.DOCTOR.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User role must be 'doctor'")
        
    existing = db.query(Doctor).filter(Doctor.user_id == request.user_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Doctor profile already exists for this user")
        
    if request.department_id:
        dept = db.query(Department).filter(Department.id == request.department_id).first()
        if not dept:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    doctor = Doctor(**request.model_dump())
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor


@router.patch("/{doctor_id}", response_model=DoctorResponse)
def update_doctor(
    doctor_id: UUID,
    request: DoctorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a doctor's profile. Can be done by Admin or the Doctor themselves."""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
        
    if current_user.role != UserRole.ADMIN.value and doctor.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this doctor profile")

    if request.department_id:
        dept = db.query(Department).filter(Department.id == request.department_id).first()
        if not dept:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(doctor, field, value)

    db.commit()
    db.refresh(doctor)
    return doctor
