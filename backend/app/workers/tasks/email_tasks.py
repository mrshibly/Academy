"""Email background tasks."""
from __future__ import annotations
from app.workers.celery_app import celery_app

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_task(self, to_email: str, subject: str, body_html: str) -> dict:
    """Send a transactional email via SMTP. Retries on failure."""
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    from app.core.config import get_settings

    settings = get_settings()
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg["To"] = to_email
        msg.attach(MIMEText(body_html, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_USER:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAILS_FROM_EMAIL, to_email, msg.as_string())

        return {"status": "sent", "to": to_email}
    except Exception as exc:
        raise self.retry(exc=exc)
