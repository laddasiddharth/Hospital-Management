import logging
from uuid import UUID

# Setup simple logger for mock notifications
logger = logging.getLogger("notifications")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

def send_appointment_confirmation(patient_name: str, patient_contact: str, doctor_name: str, date: str, start_time: str) -> None:
    """
    Mock sending an SMS/Email to the patient with appointment details.
    In a real app, integrate Twilio / SendGrid here.
    """
    message = f"Hello {patient_name}, your appointment with {doctor_name} is confirmed for {date} at {start_time}."
    logger.info(f"MOCK SMS/EMAIL sent to {patient_contact}: {message}")


def send_token_alert(patient_name: str, patient_contact: str, token_number: str) -> None:
    """
    Mock sending an SMS/Email when a token is nearing its turn.
    """
    message = f"Hello {patient_name}, your token {token_number} is nearing its turn. Please proceed to the waiting area."
    logger.info(f"MOCK SMS/EMAIL sent to {patient_contact}: {message}")


def send_appointment_cancellation(patient_name: str, patient_contact: str, doctor_name: str, date: str) -> None:
    """
    Mock sending an SMS/Email when an appointment is cancelled.
    """
    message = f"Hello {patient_name}, your appointment with {doctor_name} on {date} has been cancelled."
    logger.info(f"MOCK SMS/EMAIL sent to {patient_contact}: {message}")
