"""
Certificate helper utility to generate certificates in-process (synchronously).
Used as a resilient fallback when Redis/Celery queue is offline.
"""
from __future__ import annotations
import uuid
import boto3
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import get_settings
from app.models.certificate import Certificate
from app.models.enrollment import Enrollment

async def generate_certificate_in_process(
    db: AsyncSession,
    enrollment_id: uuid.UUID,
    user_name: str,
    course_title: str
) -> Certificate | None:
    """Generate a graduation certificate PDF and save database record synchronously."""
    settings = get_settings()
    verification_id = uuid.uuid4()
    issued_at_str = datetime.now(timezone.utc).strftime("%B %d, %Y")

    html_content = f"""
    <html><body style="font-family:Arial;text-align:center;padding:60px;">
    <h1 style="color:#1a365d;">Certificate of Completion</h1>
    <p style="font-size:24px;margin-top:40px;">This certifies that</p>
    <h2 style="color:#2d3748;font-size:32px;">{user_name}</h2>
    <p style="font-size:20px;">has successfully completed</p>
    <h3 style="color:#1a365d;font-size:28px;">{course_title}</h3>
    <p style="margin-top:40px;">Issued: {issued_at_str}</p>
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
    
    # Connect to S3/MinIO
    try:
        s3_client = boto3.client(
            "s3",
            region_name=settings.S3_REGION,
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        s3_client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=file_key,
            Body=pdf_bytes,
            ContentType="application/pdf"
        )
        file_url = (
            f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{file_key}"
            if settings.S3_ENDPOINT_URL
            else f"https://{settings.S3_BUCKET_NAME}.s3.{settings.S3_REGION}.amazonaws.com/{file_key}"
        )
    except Exception as e:
        # Fallback file URL if S3 is unavailable
        import logging
        logging.getLogger("uvicorn.error").warning(f"S3 upload failed for certificate, using fallback: {e}")
        file_url = f"/api/v1/certificates/fallback/{verification_id}.pdf"

    # Find enrollment
    stmt = select(Enrollment).where(Enrollment.id == enrollment_id)
    res = await db.execute(stmt)
    enrollment = res.scalar_one_or_none()
    
    if enrollment:
        # Check if certificate already exists to avoid unique constraint violations
        existing_stmt = select(Certificate).where(Certificate.enrollment_id == enrollment_id)
        existing_cert = (await db.execute(existing_stmt)).scalar_one_or_none()
        if existing_cert:
            return existing_cert
            
        cert = Certificate(
            enrollment_id=enrollment.id,
            user_id=enrollment.user_id,
            course_id=enrollment.course_id,
            verification_id=verification_id,
            pdf_url=file_url,
            issued_at=datetime.now(timezone.utc)
        )
        db.add(cert)
        await db.flush()
        return cert
        
    return None
