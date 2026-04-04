# Smart Hospital Appointment & Queue Management System

A full-stack, real-time hospital management system designed to coordinate patients, doctors, administrative staff, and receptionists. 

## Features
- **Role-Based Access Control**: Secure login spaces for `Patient`, `Doctor`, `Receptionist`, and `Admin` users.
- **Smart Appointment Booking**: Automated conflict checking for appointment slots and role-restricted capabilities.
- **Live WebSocket Queue Console**: Token generation with real-time TV waiting board display. Automatically pushes "Emergency" priorities to the front of the queue.
- **Notification Services**: Backend architecture designed to plug directly into SendGrid/Twilio to dispatch alerts when tokens are generated or called.
- **Analytics Dashboard**: Live overview tracking of wait times, no-show rates, patient throughput, and system peak hours.

## Tech Stack
### Backend
- **Framework**: FastAPI (Python 3.x)
- **Database**: PostgreSQL via SQLAlchemy & Alembic
- **Authentication**: JWT (JSON Web Tokens) and bcrypt hashing.
- **Real-time**: WebSockets

### Frontend
- **Framework**: Next.js (React 15) with App Router
- **Styling**: Tailwind CSS
- **HTTP Client**: Native Fetch API wrapped with auto-refresh JWT strategies.

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL server

### 1. Build and Run the Backend
```bash
cd backend
python -m venv venv

# Activate venv (Windows)
.\venv\Scripts\activate
# Activate venv (Mac/Linux)
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Build and Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

Your backend will now be running on `http://localhost:8000` (along with automatic Swagger docs at `/api/docs`) and the Next.js frontend will be running on `http://localhost:3000`.