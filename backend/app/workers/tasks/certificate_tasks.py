"""Certificate generation background task."""
from __future__ import annotations
from app.workers.celery_app import celery_app

@celery_app.task(bind=True, max_retries=2, default_retry_delay=30)
def generate_certificate_task(self, enrollment_id: str, user_name: str, course_title: str) -> dict:
    """
    Generate a PDF certificate and upload to S3.

    This is a placeholder that uses WeasyPrint for PDF generation.
    Full template customization can be added later.
    """
    import uuid
    import boto3
    from io import BytesIO
    from datetime import datetime, timezone
    from app.core.config import get_settings

    settings = get_settings()
    verification_id = str(uuid.uuid4())
    issued_at = datetime.now(timezone.utc).strftime("%B %d, %Y")

    html_content = f"""
    <html><body style="font-family:Arial;text-align:center;padding:60px;">
    <h1 style="color:#1a365d;">Certificate of Completion</h1>
    <p style="font-size:24px;margin-top:40px;">This certifies that</p>
    <h2 style="color:#2d3748;font-size:32px;">{user_name}</h2>
    <p style="font-size:20px;">has successfully completed</p>
    <h3 style="color:#1a365d;font-size:28px;">{course_title}</h3>
    <p style="margin-top:40px;">Issued: {issued_at}</p>
    <p style="font-size:12px;color:#718096;">Verification ID: {verification_id}</p>
    </body></html>
    """

    try:
        from weasyprint import HTML
        pdf_bytes = HTML(string=html_content).write_pdf()
    except Exception:
        # Fallback: store HTML content as-is if WeasyPrint is unavailable
        pdf_bytes = html_content.encode()

    file_key = f"certificates/{enrollment_id}/{verification_id}.pdf"
    s3_client = boto3.client("s3", region_name=settings.S3_REGION, endpoint_url=settings.S3_ENDPOINT_URL, aws_access_key_id=settings.AWS_ACCESS_KEY_ID, aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)
    s3_client.put_object(Bucket=settings.S3_BUCKET_NAME, Key=file_key, Body=pdf_bytes, ContentType="application/pdf")

    file_url = f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{file_key}" if settings.S3_ENDPOINT_URL else f"https://{settings.S3_BUCKET_NAME}.s3.{settings.S3_REGION}.amazonaws.com/{file_key}"

    return {"verification_id": verification_id, "pdf_url": file_url, "enrollment_id": enrollment_id}
