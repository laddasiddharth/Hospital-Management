from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db
from models.department import Department
from models.user import UserRole
from schemas.department import DepartmentResponse, DepartmentCreate, DepartmentUpdate
from auth.dependencies import require_role

router = APIRouter(prefix="/api/departments", tags=["Departments"])


@router.get("", response_model=list[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    """Get all departments. Public endpoint."""
    return db.query(Department).order_by(Department.name).all()


@router.post("", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    request: DepartmentCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_role([UserRole.ADMIN]))
):
    """Create a new department. Admin only."""
    existing = db.query(Department).filter(Department.name == request.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Department name already exists",
        )
    
    department = Department(**request.model_dump())
    db.add(department)
    db.commit()
    db.refresh(department)
    return department


@router.patch("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: UUID,
    request: DepartmentUpdate,
    db: Session = Depends(get_db),
    _ = Depends(require_role([UserRole.ADMIN]))
):
    """Update a department. Admin only."""
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(department, field, value)

    db.commit()
    db.refresh(department)
    return department
