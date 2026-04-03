from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth as auth_router
from routes import admin as admin_router

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


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Smart Hospital API"}
