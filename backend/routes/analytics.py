from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, literal_column
from datetime import datetime, date, timedelta
from typing import Dict, Any

from database import get_db
from models.user import User, UserRole
from models.appointment import Appointment, AppointmentStatus
from models.token_queue import TokenQueue, TokenStatus
from auth.dependencies import require_role

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/dashboard", response_model=Dict[str, Any])
def get_dashboard_analytics(
    days: int = 30,
    db: Session = Depends(get_db),
    _ = Depends(require_role([UserRole.ADMIN, UserRole.RECEPTIONIST]))
):
    """
    Get dashboard analytics for the specified number of days.
    Available to Admin and Receptionist roles.
    Includes:
    - Total tokens/patients
    - Average wait time
    - No-show rate
    - Peak usage times
    """
    # Calculate date range
    start_date = date.today() - timedelta(days=days)

    # 1. Wait Times (TokenQueue)
    # Average wait time: time between check_in_time and called_time
    # We'll calculate it in minutes
    completed_tokens = db.query(TokenQueue).filter(
        TokenQueue.queue_date >= start_date,
        TokenQueue.status.in_([TokenStatus.COMPLETED.value, TokenStatus.CALLED.value, TokenStatus.IN_CONSULTATION.value]),
        TokenQueue.check_in_time.isnot(None),
        TokenQueue.called_time.isnot(None)
    ).all()
    
    total_wait_minutes = 0
    valid_tokens = 0
    for token in completed_tokens:
        if token.check_in_time and token.called_time:
            wait_time = (token.called_time - token.check_in_time).total_seconds()
            if wait_time > 0:
                total_wait_minutes += (wait_time / 60)
                valid_tokens += 1
                
    avg_wait_time = round(total_wait_minutes / valid_tokens) if valid_tokens > 0 else 0

    # 2. No-Show Rates (Appointments)
    # Consider only appointments in the past that aren't cancelled by patient
    appointments = db.query(Appointment).filter(
        Appointment.appointment_date >= start_date,
        Appointment.appointment_date <= date.today()
    ).all()
    
    total_appointments = 0
    no_shows = 0
    for appt in appointments:
        if appt.status != AppointmentStatus.CANCELLED.value:
            total_appointments += 1
            if appt.status == AppointmentStatus.NO_SHOW.value:
                no_shows += 1
                
    no_show_rate = round((no_shows / total_appointments) * 100) if total_appointments > 0 else 0

    # 3. Peak Load Metrics
    # Let's count tokens by hour for the period
    tokens = db.query(TokenQueue).filter(
        TokenQueue.queue_date >= start_date
    ).all()
    
    hourly_loads = {i: 0 for i in range(24)}
    for token in tokens:
        if token.check_in_time:
            hour = token.check_in_time.hour
            hourly_loads[hour] += 1
            
    # Find peak hour
    peak_hour = max(hourly_loads, key=hourly_loads.get) if any(hourly_loads.values()) else 0
    # Format hour to am/pm
    avg_peak_load = hourly_loads[peak_hour] // days if days > 0 else hourly_loads[peak_hour]
    formatted_peak = f"{peak_hour}:00 {'AM' if peak_hour < 12 else 'PM'} (avg {avg_peak_load} patients)" if valid_tokens > 0 else "N/A"

    return {
        "summary": {
            "avgWaitTimeMinutes": avg_wait_time,
            "noShowRatePercent": no_show_rate,
            "totalTokensProcessed": valid_tokens,
            "peakHourLabel": formatted_peak
        },
        "hourlyData": [{"hour": f"{h}:00", "count": c} for h, c in hourly_loads.items() if (8 <= h <= 20)] # Filter to normal hours
    }
