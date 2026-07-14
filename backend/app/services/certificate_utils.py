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
          background-color: #cbd5e1;
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
          background-color: #ffffff;
          display: flex;
          overflow: hidden;
        }}
        
        /* Left solid blue panel */
        .left-panel {{
          width: 42%;
          height: 100%;
          background-color: #1e6fd9;
          position: relative;
          z-index: 10;
          clip-path: polygon(0 0, 100% 0, 100% 76%, 72% 100%, 0 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 50px 30px;
          box-sizing: border-box;
        }}
        
        /* Logo sunburst */
        .logo-container {{
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 10px;
        }}
        .logo-svg {{
          width: 44px;
          height: 44px;
        }}
        .logo-title {{
          font-size: 15px;
          font-weight: 800;
          color: #ffffff;
          margin-top: 8px;
          letter-spacing: 0.05em;
        }}
        .logo-url {{
          font-size: 9px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 3px;
          letter-spacing: 0.05em;
        }}
        
        /* Left Title Block */
        .left-main-title {{
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 80px;
        }}
        .title-line {{
          width: 240px;
          height: 2px;
          background-color: #ffffff;
          position: relative;
          margin: 15px 0;
        }}
        .title-line::before, .title-line::after {{
          content: "";
          position: absolute;
          top: -3px;
          width: 8px;
          height: 8px;
          background-color: #ffffff;
          border-radius: 50%;
        }}
        .title-line::before {{ left: 0; }}
        .title-line::after {{ right: 0; }}
        
        .title-text-main {{
          font-size: 34px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }}
        .title-text-sub {{
          font-size: 20px;
          color: #ffffff;
          font-weight: 300;
          margin-top: 2px;
        }}
        
        /* Horizontal dots in blue panel */
        .left-dots {{
          display: flex;
          gap: 10px;
          position: absolute;
          bottom: 40px;
          left: 30px;
        }}
        .dot {{
          width: 6px;
          height: 6px;
          background-color: #ffffff;
          border-radius: 50%;
        }}

        /* Right panel container */
        .right-panel {{
          flex: 1;
          height: 100%;
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 50px 40px 50px 20px;
          box-sizing: border-box;
        }}
        
        .cert-subtitle {{
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }}
        .cert-presented {{
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-top: 4px;
        }}
        .student-name {{
          font-size: 38px;
          font-weight: 800;
          color: #0f172a;
          margin: 22px 0 10px 0;
          text-align: center;
          letter-spacing: 0.02em;
        }}
        .horizontal-line {{
          width: 420px;
          height: 1px;
          background-color: #e2e8f0;
          margin: 12px 0;
        }}
        .course-info {{
          font-size: 13px;
          color: #475569;
          text-align: center;
          max-width: 480px;
          line-height: 1.5;
        }}
        .course-title {{
          font-weight: 700;
          color: #0f172a;
        }}
        
        /* Speaker details signature section */
        .speaker-section {{
          margin-top: 25px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }}
        .signature-container {{
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }}
        .signature-image {{
          max-height: 44px;
          max-width: 180px;
          object-fit: contain;
        }}
        .speaker-name {{
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 5px;
        }}
        .speaker-title {{
          font-size: 11px;
          color: #64748b;
          margin-top: 3px;
          font-weight: 600;
        }}
        
        /* Metadata bottom row details */
        .metadata-row {{
          display: flex;
          justify-content: space-between;
          width: 400px;
          margin-top: 35px;
        }}
        .metadata-col {{
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 160px;
        }}
        .metadata-label {{
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 4px;
        }}
        .metadata-val-line {{
          width: 100%;
          height: 1px;
          background-color: #cbd5e1;
          margin-bottom: 6px;
        }}
        .metadata-val {{
          font-size: 11px;
          font-weight: 700;
          color: #0f172a;
        }}

        /* GEOMETRICAL ACCENT SHAPES */
        
        /* Top right red block */
        .accent-red-block {{
          position: absolute;
          top: 0;
          right: 8%;
          width: 150px;
          height: 12px;
          background-color: #f87171;
          z-index: 1;
        }}
        
        /* Orange diagonal strip at top center */
        .accent-orange-strip {{
          position: absolute;
          top: -40px;
          left: 58%;
          width: 35px;
          height: 180px;
          background-color: #f59e0b;
          transform: rotate(45deg);
          z-index: 1;
        }}
        
        /* Right blue chevron */
        .accent-blue-chevron {{
          position: absolute;
          right: 0;
          top: 35%;
          width: 35px;
          height: 70px;
          background-color: #1e6fd9;
          clip-path: polygon(100% 0, 0 50%, 100% 100%, 40% 50%);
          z-index: 1;
        }}
        
        /* Yellow bar peeking out behind left blue panel */
        .accent-yellow-bar {{
          position: absolute;
          left: 0;
          bottom: 16%;
          width: 290px;
          height: 48px;
          background-color: #f59e0b;
          z-index: 2;
        }}
        
        /* Bottom center blue triangle */
        .accent-blue-triangle {{
          position: absolute;
          bottom: 0;
          left: 15%;
          width: 140px;
          height: 70px;
          background-color: #1e6fd9;
          clip-path: polygon(50% 0, 100% 100%, 75% 100%, 50% 35%, 25% 100%, 0 100%);
          z-index: 5;
        }}
        
        /* Bottom center red block triangle */
        .accent-bottom-red-block {{
          position: absolute;
          bottom: 0;
          left: 32%;
          width: 110px;
          height: 40px;
          background-color: #f87171;
          clip-path: polygon(0 100%, 100% 100%, 100% 0);
          z-index: 4;
        }}
        
        /* Top-left hatch lines */
        .accent-hatch-topleft {{
          position: absolute;
          top: 0;
          left: 0;
          width: 150px;
          height: 150px;
          background: repeating-linear-gradient(45deg, rgba(30, 111, 217, 0.2), rgba(30, 111, 217, 0.2) 1px, transparent 1px, transparent 8px);
          z-index: 1;
        }}
        
        /* Bottom-right hatch lines */
        .accent-hatch-bottomright {{
          position: absolute;
          bottom: 0;
          right: 0;
          width: 180px;
          height: 180px;
          background: repeating-linear-gradient(45deg, rgba(30, 111, 217, 0.2), rgba(30, 111, 217, 0.2) 1px, transparent 1px, transparent 8px);
          z-index: 1;
        }}
        
        /* Decorative yellow dots in top-right */
        .accent-dots-topright {{
          position: absolute;
          top: 30px;
          right: 30px;
          width: 80px;
          height: 40px;
          background-image: radial-gradient(#f59e0b 2px, transparent 2.5px);
          background-size: 15px 15px;
          z-index: 1;
        }}
        
        /* Decorative yellow dots in bottom-left */
        .accent-dots-bottomleft {{
          position: absolute;
          bottom: 30px;
          left: 30px;
          width: 120px;
          height: 25px;
          background-image: radial-gradient(#f59e0b 2.5px, transparent 3px);
          background-size: 18px 18px;
          z-index: 12;
        }}
      </style>
    </head>
    <body>
      <div class="cert-container">
        <!-- Geometrical background accents -->
        <div class="accent-hatch-topleft"></div>
        <div class="accent-hatch-bottomright"></div>
        <div class="accent-orange-strip"></div>
        <div class="accent-red-block"></div>
        <div class="accent-dots-topright"></div>
        <div class="accent-blue-chevron"></div>
        
        <!-- peeking yellow block -->
        <div class="accent-yellow-bar"></div>
        <div class="accent-dots-bottomleft"></div>
        
        <!-- Bottom shapes -->
        <div class="accent-blue-triangle"></div>
        <div class="accent-bottom-red-block"></div>

        <!-- Left blue panel -->
        <div class="left-panel">
          <div class="logo-container">
            <svg class="logo-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="10" fill="none" stroke="white" stroke-width="4" stroke-dasharray="6,6" />
              <line x1="50" y1="18" x2="50" y2="32" stroke="white" stroke-width="5" stroke-linecap="round" />
              <line x1="50" y1="68" x2="50" y2="82" stroke="white" stroke-width="5" stroke-linecap="round" />
              <line x1="18" y1="50" x2="32" y2="50" stroke="white" stroke-width="5" stroke-linecap="round" />
              <line x1="68" y1="50" x2="82" y2="50" stroke="white" stroke-width="5" stroke-linecap="round" />
              <line x1="27" y1="27" x2="37" y2="37" stroke="white" stroke-width="5" stroke-linecap="round" />
              <line x1="63" y1="63" x2="73" y2="73" stroke="white" stroke-width="5" stroke-linecap="round" />
              <line x1="73" y1="27" x2="63" y2="37" stroke="white" stroke-width="5" stroke-linecap="round" />
              <line x1="37" y1="63" x2="27" y2="73" stroke="white" stroke-width="5" stroke-linecap="round" />
            </svg>
            <div class="logo-title">ACADEMY PLATFORM</div>
            <div class="logo-url">www.academy.dev</div>
          </div>

          <div class="left-main-title">
            <div class="title-line"></div>
            <div class="title-text-main">CERTIFICATE</div>
            <div class="title-text-sub">of Completion</div>
            <div class="title-line"></div>
          </div>

          <div class="left-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>

        <!-- Right content panel -->
        <div class="right-panel">
          <div class="cert-subtitle">Certificate of Completion</div>
          <div class="cert-presented">is proudly presented to</div>
          
          <div class="student-name">{user_name}</div>
          
          <div class="horizontal-line"></div>
          
          <div class="course-info">
            for successfully completing the specialized learning<br>
            curriculum of <span class="course-title">{course_title}</span> course
          </div>

          <div class="speaker-section">
            <div class="signature-container">
              {signature_img_html}
            </div>
            <div class="speaker-name">{instructor_name}</div>
            <div class="speaker-title">Course Speaker</div>
          </div>

          <div class="metadata-row">
            <div class="metadata-col">
              <div class="metadata-label">Certified on:</div>
              <div class="metadata-val-line"></div>
              <div class="metadata-val">{issued_at_str}</div>
            </div>
            
            <div class="metadata-col">
              <div class="metadata-label">Certificate ID</div>
              <div class="metadata-val-line"></div>
              <div class="metadata-val">{verification_id}</div>
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
