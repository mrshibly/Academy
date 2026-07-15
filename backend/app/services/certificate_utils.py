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
    """Build a high-fidelity, premium HTML layout for completion certificates."""
    # Fallback/placeholder signature if instructor has none
    sig_html = signature_img_html if signature_img_html else f'<span style="font-family: \'Dancing Script\', cursive, Georgia, serif; font-size: 24px; color: #1e293b; font-style: italic; opacity: 0.85;">{instructor_name}</span>'
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Inter:wght@400;600;700;800&display=swap');
        
        @page {{
          size: A4 landscape;
          margin: 0;
        }}
        body {{
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, sans-serif;
          background-color: #f8fafc;
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
          background-color: #fcfbf7; /* Ivory background */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 40px;
          overflow: hidden;
          
          /* Dual navy & gold border */
          border: 16px solid #0f172a;
          outline: 4px solid #d4af37;
          outline-offset: -12px;
        }}
        
        /* Subtle corner decorations */
        .corner-dec {{
          position: absolute;
          width: 30px;
          height: 30px;
          border: 2px solid #d4af37;
          z-index: 10;
        }}
        .corner-top-left {{ top: 20px; left: 20px; border-right: none; border-bottom: none; }}
        .corner-top-right {{ top: 20px; right: 20px; border-left: none; border-bottom: none; }}
        .corner-bottom-left {{ bottom: 20px; left: 20px; border-right: none; border-top: none; }}
        .corner-bottom-right {{ bottom: 20px; right: 20px; border-left: none; border-top: none; }}

        /* Watermark Background */
        .watermark-bg {{
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 500px;
          opacity: 0.015;
          pointer-events: none;
          z-index: 1;
        }}

        .cert-header {{
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 15px;
          z-index: 5;
        }}
        
        .brand-section {{
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 20px;
        }}
        .brand-logo {{
          width: 20px;
          height: 20px;
          color: #d4af37;
        }}
        .brand-name {{
          font-size: 11px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.15em;
        }}

        .cert-title {{
          font-family: 'Cinzel', Georgia, serif;
          font-size: 32px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 0;
        }}
        .cert-subtitle {{
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-top: 5px;
        }}

        .cert-body {{
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin: 20px 0;
          z-index: 5;
          width: 80%;
        }}
        
        .presented-to {{
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }}
        
        .student-name {{
          font-family: 'Cinzel', Georgia, serif;
          font-size: 36px;
          font-weight: 800;
          color: #0f172a;
          margin: 15px 0 10px 0;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
          width: 80%;
          text-align: center;
        }}
        
        .course-info {{
          font-size: 13px;
          line-height: 1.6;
          color: #475569;
          max-width: 600px;
          margin-top: 10px;
        }}
        .course-name {{
          font-weight: 800;
          color: #0ea5e9;
        }}

        .cert-footer {{
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          width: 85%;
          margin-bottom: 10px;
          z-index: 5;
        }}

        .signature-block {{
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 200px;
          position: relative;
        }}
        
        .sig-line {{
          width: 100%;
          height: 1px;
          background-color: #cbd5e1;
          margin-top: 45px;
          margin-bottom: 8px;
        }}
        
        .sig-title {{
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }}
        
        .sig-name {{
          font-size: 11px;
          font-weight: 600;
          color: #0f172a;
        }}

        /* Central seal */
        .seal-container {{
          width: 90px;
          height: 90px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }}
        
        .seal-bg {{
          width: 100%;
          height: 100%;
          background-color: #fef08a;
          border: 4px double #d4af37;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(212, 175, 55, 0.15);
        }}
        
        .seal-text {{
          font-size: 8px;
          font-weight: 800;
          color: #d4af37;
          text-transform: uppercase;
        }}

        /* Mono security info */
        .security-info {{
          font-family: monospace;
          font-size: 8px;
          color: #94a3b8;
          width: 100%;
          text-align: center;
          margin-top: 5px;
          z-index: 5;
        }}
      </style>
    </head>
    <body>
      <div class="cert-container">
        <!-- Corner Borders -->
        <div class="corner-dec corner-top-left"></div>
        <div class="corner-dec corner-top-right"></div>
        <div class="corner-dec corner-bottom-left"></div>
        <div class="corner-dec corner-bottom-right"></div>

        <!-- Watermark -->
        <svg class="watermark-bg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#000" stroke-width="0.5" />
          <polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="#000" stroke-width="0.5" />
        </svg>

        <!-- Header -->
        <div class="cert-header">
          <div class="brand-section">
            <svg class="brand-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span class="brand-name">ACADEMY VERIFIED CREDENTIAL</span>
          </div>
          <h1 class="cert-title">Certificate of Completion</h1>
          <div class="cert-subtitle">Recognizing Academic Excellence</div>
        </div>

        <!-- Body -->
        <div class="cert-body">
          <span class="presented-to">This certificate is proudly awarded to</span>
          <h2 class="student-name">{user_name}</h2>
          <p class="course-info">
            for successfully passing all required module tests, assignments, and practical laboratory criteria designated under the curriculum guidelines of:
            <br>
            <span class="course-name">{course_title}</span>
          </p>
        </div>

        <!-- Footer signatures & seal -->
        <div class="cert-footer">
          <!-- Left signature -->
          <div class="signature-block">
            <div style="position: absolute; bottom: 35px; width: 100%; text-align: center;">
              {sig_html}
            </div>
            <div class="sig-line"></div>
            <span class="sig-name">{instructor_name}</span>
            <span class="sig-title">Lead Instructor</span>
          </div>

          <!-- Central gold seal -->
          <div class="seal-container">
            <div class="seal-bg">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                <svg style="width: 18px; height: 18px; color: #d4af37;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span class="seal-text">VERIFIED</span>
              </div>
            </div>
          </div>

          <!-- Right signature -->
          <div class="signature-block">
            <div style="position: absolute; bottom: 35px; width: 100%; text-align: center; font-family: 'Cinzel', Georgia, serif; font-size: 13px; font-weight: bold; color: #0f172a; opacity: 0.85;">
              Academy Council
            </div>
            <div class="sig-line"></div>
            <span class="sig-name">Academic Board</span>
            <span class="sig-title">Verification Council</span>
          </div>
        </div>

        <!-- Security monospace identifier link -->
        <div class="security-info">
          VERIFICATION CODE: {verification_id} &bull; SECURELY REGISTERED &bull; VERIFY AT: www.academy.dev/verify/{verification_id}
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
