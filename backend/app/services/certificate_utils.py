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
    """Generate a high-fidelity PDF certificate and save database record synchronously."""
    settings = get_settings()
    verification_id = uuid.uuid4()
    issued_at_str = datetime.now(timezone.utc).strftime("%B %d, %Y")

    # Find enrollment, course and instructor signature
    stmt = select(Enrollment).where(Enrollment.id == enrollment_id)
    res = await db.execute(stmt)
    enrollment = res.scalar_one_or_none()
    
    instructor_name = "Course Instructor"
    signature_img_html = ""
    
    if enrollment:
        from app.models.course import Course
        from app.models.user import User
        course_stmt = select(Course).where(Course.id == enrollment.course_id)
        course = (await db.execute(course_stmt)).scalar_one_or_none()
        if course:
            course_title = course.title
            instructor_stmt = select(User).where(User.id == course.instructor_id)
            instructor = (await db.execute(instructor_stmt)).scalar_one_or_none()
            if instructor:
                instructor_name = instructor.full_name
                if instructor.signature_url:
                    signature_img_html = f'<img src="{instructor.signature_url}" style="max-height: 50px; max-width: 200px; position: absolute; bottom: 5px; left: 20px; object-fit: contain;" />'

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @page {{
          size: A4 landscape;
          margin: 0;
        }}
        body {{
          margin: 0;
          padding: 0;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }}
        .cert-container {{
          width: 297mm;
          height: 210mm;
          position: relative;
          box-sizing: border-box;
          border: 20px solid transparent;
          background-image: linear-gradient(white, white), linear-gradient(135deg, #0ea5e9, #4f46e5);
          background-origin: border-box;
          background-clip: content-box, border-box;
          padding: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
        }}
        .header {{
          text-align: center;
          margin-top: 10px;
        }}
        .brand-title {{
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #64748b;
          font-weight: 800;
        }}
        .brand-url {{
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
        }}
        .title-section {{
          text-align: center;
        }}
        .main-title {{
          font-size: 48px;
          font-weight: 700;
          color: #1e3a8a;
          margin: 0;
          letter-spacing: 0.05em;
        }}
        .divider {{
          width: 250px;
          height: 2px;
          background: linear-gradient(to right, transparent, #1e3a8a, transparent);
          margin: 8px auto;
        }}
        .sub-title {{
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #475569;
          font-weight: 700;
          margin-top: 5px;
        }}
        .student-name {{
          font-family: Georgia, serif;
          font-size: 44px;
          font-style: italic;
          color: #1d4ed8;
          margin: 15px 0;
          text-align: center;
          font-weight: 600;
        }}
        .course-info {{
          font-size: 16px;
          color: #475569;
          text-align: center;
          max-width: 650px;
          line-height: 1.5;
        }}
        .course-title {{
          font-weight: 800;
          color: #0f172a;
        }}
        .footer-section {{
          width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 0 40px;
          margin-bottom: 10px;
          box-sizing: border-box;
        }}
        .footer-col {{
          display: flex;
          flex-direction: column;
          width: 240px;
          position: relative;
        }}
        .signature-line {{
          border-bottom: 2px solid #cbd5e1;
          height: 45px;
          margin-bottom: 10px;
          position: relative;
        }}
        .col-label {{
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }}
        .col-sublabel {{
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          margin-top: 2px;
          font-weight: 600;
        }}
      </style>
    </head>
    <body>
      <div class="cert-container">
        <div class="header">
          <div class="brand-title">ACADEMY PLATFORM</div>
          <div class="brand-url">www.academy.dev</div>
        </div>

        <div class="title-section">
          <h1 class="main-title">CERTIFICATE</h1>
          <div class="sub-title">OF COMPLETION</div>
          <div class="divider"></div>
          <p style="font-size: 11px; color: #64748b; margin-top: 15px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; margin-bottom: 0;">
            We proudly present this certificate to
          </p>
        </div>

        <div class="student-name">{user_name}</div>

        <div class="course-info">
          for successfully completing the specialized learning curriculum of<br>
          <span class="course-title">{course_title}</span>
        </div>

        <div class="footer-section">
          <div class="footer-col" style="text-align: left;">
            <div class="signature-line">
              {signature_img_html}
            </div>
            <div class="col-label">{instructor_name}</div>
            <div class="col-sublabel">Course Instructor</div>
          </div>
          
          <div class="footer-col" style="text-align: right;">
            <div style="height: 45px; display: flex; flex-direction: column; justify-content: flex-end; margin-bottom: 10px;">
              <div style="font-size: 10px; font-weight: 600; color: #475569; margin-bottom: 2px;">ISSUING DATE: {issued_at_str}</div>
              <div style="font-size: 10px; font-weight: 600; color: #475569;">CREDENTIAL ID: {verification_id}</div>
            </div>
            <div class="col-label">VERIFIED CREDENTIAL</div>
            <div class="col-sublabel">verification.academy.dev</div>
          </div>
        </div>
      </div>
    </body>
    </html>
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
        import logging
        logging.getLogger("uvicorn.error").warning(f"S3 upload failed for certificate, using fallback: {e}")
        file_url = f"/api/v1/certificates/fallback/{verification_id}.pdf"

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
