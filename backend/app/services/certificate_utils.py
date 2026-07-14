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

def build_certificate_html(
    user_name: str,
    course_title: str,
    issued_at_str: str,
    verification_id: str | uuid.UUID,
    instructor_name: str,
    signature_img_html: str
) -> str:
    """Build the high-fidelity HTML structure for a completion certificate."""
    return f"""
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
          font-family: 'Inter', 'Segoe UI', -apple-system, sans-serif;
          background-color: #f8fafc;
          color: #0f172a;
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
          border: 16px solid transparent;
          background-image: linear-gradient(#ffffff, #ffffff), linear-gradient(135deg, #10b981, #8b5cf6, #3b82f6);
          background-origin: border-box;
          background-clip: content-box, border-box;
          padding: 50px 70px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          overflow: hidden;
        }}
        /* Digital futuristic grid background in light-mode */
        .cert-container::before {{
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: 
            linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
          z-index: 1;
        }}
        .content-wrap {{
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          width: 100%;
        }}
        .header {{
          text-align: center;
          margin-top: 5px;
        }}
        .brand-title {{
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: #10b981;
        }}
        .brand-url {{
          font-size: 10px;
          color: #94a3b8;
          margin-top: 3px;
          letter-spacing: 0.1em;
        }}
        .title-section {{
          text-align: center;
        }}
        .main-title {{
          font-size: 44px;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }}
        .sub-title {{
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: #8b5cf6;
          font-weight: 800;
          margin-top: 4px;
        }}
        .divider {{
          width: 320px;
          height: 2px;
          background: linear-gradient(to right, transparent, #8b5cf6, #10b981, transparent);
          margin: 12px auto;
        }}
        .presentation-text {{
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 600;
          margin: 5px 0;
        }}
        .student-name {{
          font-size: 40px;
          font-weight: 800;
          color: #0f172a;
          margin: 10px 0;
          text-align: center;
          letter-spacing: 0.02em;
        }}
        .course-info {{
          font-size: 15px;
          color: #475569;
          text-align: center;
          max-width: 700px;
          line-height: 1.6;
        }}
        .course-title {{
          font-weight: 900;
          color: #10b981;
          font-size: 18px;
          letter-spacing: 0.02em;
        }}
        .footer-section {{
          width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 0 20px;
          margin-top: 15px;
          box-sizing: border-box;
        }}
        .footer-col {{
          display: flex;
          flex-direction: column;
          width: 250px;
          position: relative;
        }}
        .signature-box {{
          border: 1px solid rgba(15, 23, 42, 0.06);
          background: rgba(15, 23, 42, 0.015);
          border-radius: 8px;
          height: 55px;
          margin-bottom: 8px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }}
        .signature-line-placeholder {{
          position: absolute;
          bottom: 12px;
          left: 20px;
          right: 20px;
          border-bottom: 1px dashed rgba(15, 23, 42, 0.1);
          height: 1px;
          z-index: 1;
        }}
        .signature-image {{
          position: relative;
          z-index: 2;
          max-height: 48px;
          max-width: 210px;
          object-fit: contain;
        }}
        .col-label {{
          font-size: 11px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }}
        .col-sublabel {{
          font-size: 9px;
          color: #64748b;
          text-transform: uppercase;
          margin-top: 3px;
          font-weight: 600;
          letter-spacing: 0.05em;
        }}
        .metadata-box {{
          text-align: right;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }}
        .meta-text {{
          font-size: 9px;
          font-family: monospace;
          color: #475569;
          margin-bottom: 3px;
          letter-spacing: 0.05em;
        }}
      </style>
    </head>
    <body>
      <div class="cert-container">
        <div class="content-wrap">
          <div class="header">
            <div class="brand-title">ACADEMY PLATFORM</div>
            <div class="brand-url">www.academy.dev</div>
          </div>

          <div class="title-section">
            <h1 class="main-title">Certificate of Completion</h1>
            <div class="sub-title">Graduation Credential</div>
            <div class="divider"></div>
            <p class="presentation-text">This is proudly awarded to</p>
          </div>

          <div class="student-name">{user_name}</div>

          <div class="course-info">
            for successfully completing the specialized learning curriculum of<br>
            <span class="course-title">{course_title}</span>
          </div>

          <div class="footer-section">
            <div class="footer-col" style="text-align: left;">
              <div class="signature-box">
                <div class="signature-line-placeholder"></div>
                {signature_img_html}
              </div>
              <div class="col-label">{instructor_name}</div>
              <div class="col-sublabel">Course Instructor</div>
            </div>
            
            <div class="footer-col metadata-box" style="text-align: right;">
              <div style="margin-bottom: 8px;">
                <div class="meta-text">ISSUED ON: {issued_at_str}</div>
                <div class="meta-text">CREDENTIAL ID: {verification_id}</div>
              </div>
              <div class="col-label">VERIFIED SECURE CREDENTIAL</div>
              <div class="col-sublabel">verify.academy.dev</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
    """

async def render_certificate_pdf_bytes(
    db: AsyncSession,
    enrollment_id: uuid.UUID,
    user_name: str,
    course_title: str,
    verification_id: uuid.UUID,
    issued_at: datetime
) -> tuple[bytes, str]:
    """Helper to render certificate HTML or PDF bytes on the fly, returning (bytes, media_type)."""
    issued_at_str = issued_at.strftime("%B %d, %Y")

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

    html_content = build_certificate_html(
        user_name=user_name,
        course_title=course_title,
        issued_at_str=issued_at_str,
        verification_id=verification_id,
        instructor_name=instructor_name,
        signature_img_html=signature_img_html
    )

    try:
        from weasyprint import HTML
        pdf_bytes = HTML(string=html_content).write_pdf()
        media_type = "application/pdf"
    except Exception:
        # Fallback: store HTML content as-is if WeasyPrint is unavailable
        pdf_bytes = html_content.encode()
        media_type = "text/html"

    return pdf_bytes, media_type


async def generate_certificate_in_process(
    db: AsyncSession,
    enrollment_id: uuid.UUID,
    user_name: str,
    course_title: str
) -> Certificate | None:
    """Generate a high-fidelity PDF certificate and save database record synchronously."""
    settings = get_settings()
    verification_id = uuid.uuid4()
    issued_at = datetime.now(timezone.utc)

    # Find enrollment, course and instructor signature
    stmt = select(Enrollment).where(Enrollment.id == enrollment_id)
    res = await db.execute(stmt)
    enrollment = res.scalar_one_or_none()

    if enrollment:
        # Check if certificate already exists to avoid unique constraint violations
        existing_stmt = select(Certificate).where(Certificate.enrollment_id == enrollment_id)
        existing_cert = (await db.execute(existing_stmt)).scalar_one_or_none()
        if existing_cert:
            return existing_cert

        from app.models.user import User
        from app.models.course import Course
        user_stmt = select(User).where(User.id == enrollment.user_id)
        user_obj = (await db.execute(user_stmt)).scalar_one()
        user_name = user_obj.full_name

        course_stmt = select(Course).where(Course.id == enrollment.course_id)
        course_obj = (await db.execute(course_stmt)).scalar_one()
        course_title = course_obj.title
    else:
        return None

    # Generate PDF / HTML bytes
    pdf_bytes, media_type = await render_certificate_pdf_bytes(
        db, enrollment_id, user_name, course_title, verification_id, issued_at
    )

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
            ContentType=media_type
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

    cert = Certificate(
        enrollment_id=enrollment.id,
        user_id=enrollment.user_id,
        course_id=enrollment.course_id,
        verification_id=verification_id,
        pdf_url=file_url,
        issued_at=issued_at
    )
    db.add(cert)
    await db.flush()
    return cert

async def get_certificate_pdf_bytes_by_verification_id(
    db: AsyncSession,
    verification_id: uuid.UUID
) -> tuple[bytes, str] | None:
    """Retrieve certificate details and compile/render PDF or HTML dynamically."""
    from sqlalchemy.orm import selectinload
    from app.models.user import User
    from app.models.course import Course

    stmt = (
        select(Certificate)
        .where(Certificate.verification_id == verification_id)
        .options(selectinload(Certificate.user), selectinload(Certificate.course))
    )
    res = await db.execute(stmt)
    cert = res.scalar_one_or_none()
    if cert is None:
        return None

    user_name = cert.user.full_name
    course_title = cert.course.title
    issued_at_str = cert.issued_at.strftime("%B %d, %Y")

    instructor_name = "Course Instructor"
    signature_img_html = ""
    instructor_stmt = select(User).where(User.id == cert.course.instructor_id)
    instructor = (await db.execute(instructor_stmt)).scalar_one_or_none()
    if instructor:
        instructor_name = instructor.full_name
        if instructor.signature_url:
            signature_img_html = f'<img src="{instructor.signature_url}" style="max-height: 50px; max-width: 200px; position: absolute; bottom: 5px; left: 20px; object-fit: contain;" />'

    html_content = build_certificate_html(
        user_name=user_name,
        course_title=course_title,
        issued_at_str=issued_at_str,
        verification_id=verification_id,
        instructor_name=instructor_name,
        signature_img_html=signature_img_html
    )

    try:
        from weasyprint import HTML
        pdf_bytes = HTML(string=html_content).write_pdf()
        media_type = "application/pdf"
    except Exception:
        pdf_bytes = html_content.encode()
        media_type = "text/html"

    return pdf_bytes, media_type
