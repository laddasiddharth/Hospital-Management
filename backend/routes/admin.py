from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
import secrets

from database import get_db
from models.user import User, UserRole
from schemas.user import UserResponse, UserCreate, UserUpdate, AdminUserCreate
from auth.security import hash_password, create_access_token
from auth.dependencies import require_role

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    request: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Create a user and invite them via email."""
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Generate a massive random string so the account is completely secure
    secure_placeholder = secrets.token_urlsafe(64)

    user = User(
        email=request.email,
        hashed_password=hash_password(secure_placeholder),
        full_name=request.full_name,
        phone=request.phone,
        role=request.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create an invite token
    invite_token = create_access_token({"sub": user.email, "type": "invite"})

    # In a real app this would send an email. For now we will return it via custom headers or mock logger
    setup_link = f"http://localhost:3000/setup-password?token={invite_token}"
    print(f"!!! IMPORTANT !!! Send this link to the new {user.role}: {setup_link}")

    return user


@router.get("/users", response_model=list[UserResponse])
def list_users(
    role: str | None = Query(None),
    is_active: bool | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.PATIENT])),
):
    """List all users with optional role and status filters."""
    # Patients and Doctors can only query for doctors (or themselves/receptionists as needed, but for safe measure:
    if current_user.role in [UserRole.PATIENT.value, UserRole.DOCTOR.value]:
        if role != UserRole.DOCTOR.value:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
            
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    return query.order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    request: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Update a user's role or status (Admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user
