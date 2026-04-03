"""
Seed script to create initial database tables and default admin user.
Run: python seed.py
"""
from database import SessionLocal, engine, Base
from models import User, UserRole
from auth.security import hash_password


def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")

    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@hospital.com").first()
        if not admin:
            admin = User(
                email="admin@hospital.com",
                hashed_password=hash_password("Admin@123"),
                full_name="System Administrator",
                phone="+1234567890",
                role=UserRole.ADMIN.value,
            )
            db.add(admin)
            db.commit()
            print("✅ Default admin created: admin@hospital.com / Admin@123")
        else:
            print("ℹ️  Admin already exists, skipping seed")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
