from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth as auth_router
from routes import admin as admin_router
from routes import departments as departments_router
from routes import doctors as doctors_router
from routes import appointments as appointments_router
from routes import queue as queue_router

app = FastAPI(
    title="Smart Hospital API",
    description="Smart Hospital Appointment & Queue Management System",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router.router)
app.include_router(admin_router.router)
app.include_router(departments_router.router)
app.include_router(doctors_router.router)
app.include_router(appointments_router.router)
app.include_router(queue_router.router)


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Smart Hospital API"}
