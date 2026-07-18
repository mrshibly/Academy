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
    """Build a high-fidelity HTML layout matching the HackerRank Certificate of Accomplishment design."""
    sig_html = signature_img_html if signature_img_html else f'<span style="font-family: \'Dancing Script\', \'Great Vibes\', cursive, Georgia, serif; font-size: 24px; color: #18181b; font-style: italic; font-weight: 700;">{instructor_name}</span>'
    short_id = str(verification_id).replace("-", "")[:12].upper()
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Dancing+Script:wght@700&display=swap');
        
        @page {{
          size: A4 landscape;
          margin: 0;
        }}
        body {{
          margin: 0;
          padding: 0;
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          background-color: #f4f4f5;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          -webkit-print-color-adjust: exact;
        }}
        .cert-outer-canvas {{
          width: 297mm;
          height: 210mm;
          position: relative;
          box-sizing: border-box;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 42px 56px;
          overflow: hidden;
          border: 1px solid #e4e4e7;
        }}

        /* Outer Guilloché Multi-Wavy Frame Border */
        .guilloche-border {{
          position: absolute;
          top: 16px; left: 16px; right: 16px; bottom: 16px;
          border: 2px solid #e4e4e7;
          border-radius: 6px;
          pointer-events: none;
        }}
        .guilloche-inner-border {{
          position: absolute;
          top: 22px; left: 22px; right: 22px; bottom: 22px;
          border: 1px dashed #d4d4d8;
          border-radius: 4px;
          pointer-events: none;
        }}

        /* Top Circular Stamp Emblem */
        .top-emblem {{
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2px solid #18181b;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          margin-top: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }}
        .top-emblem-inner {{
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #18181b;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 20px;
          letter-spacing: -0.05em;
        }}

        /* Main Serif Title */
        .cert-main-title {{
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 38px;
          font-weight: 800;
          color: #18181b;
          margin: 14px 0 16px 0;
          letter-spacing: -0.01em;
          text-align: center;
        }}

        /* Dark Chevron Ribbon Banner */
        .course-ribbon-wrapper {{
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }}
        .course-ribbon {{
          position: relative;
          background: #18181b;
          color: #ffffff;
          padding: 8px 48px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 12px;
        }}
        .ribbon-chevron-left {{
          width: 0; height: 0;
          border-top: 17px solid transparent;
          border-bottom: 17px solid transparent;
          border-right: 16px solid #18181b;
          margin-right: -16px;
        }}
        .ribbon-chevron-right {{
          width: 0; height: 0;
          border-top: 17px solid transparent;
          border-bottom: 17px solid transparent;
          border-left: 16px solid #18181b;
          margin-left: -16px;
        }}

        /* Presented To & Recipient Name */
        .presented-tag {{
          font-size: 10px;
          font-weight: 700;
          color: #71717a;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-bottom: 8px;
          text-align: center;
        }}
        .recipient-name-box {{
          width: 70%;
          border-bottom: 1px solid #d4d4d8;
          padding-bottom: 4px;
          margin-bottom: 16px;
          text-align: center;
        }}
        .recipient-name {{
          font-family: 'Playfair Display', 'Dancing Script', Georgia, serif;
          font-style: italic;
          font-size: 38px;
          font-weight: 700;
          color: #18181b;
          margin: 0;
          line-height: 1.1;
        }}

        /* Body Statement */
        .cert-statement {{
          font-size: 13px;
          color: #52525b;
          text-align: center;
          max-width: 580px;
          line-height: 1.5;
          margin-bottom: 20px;
        }}

        /* Footer Section */
        .cert-footer-row {{
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          width: 92%;
          margin-bottom: 10px;
        }}

        /* Bottom Left Metadata */
        .meta-left {{
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 11px;
          color: #71717a;
        }}
        .meta-left-label {{
          font-weight: 500;
        }}
        .meta-left-val {{
          font-weight: 800;
          color: #18181b;
        }}
        .meta-left-id {{
          font-family: monospace;
          font-size: 10px;
          color: #a1a1aa;
        }}

        /* Bottom Right Signature Block */
        .sig-block {{
          display: flex;
          flex-direction: column;
          align-items: flex-center;
          text-align: center;
          width: 180px;
        }}
        .sig-container {{
          height: 40px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          margin-bottom: 4px;
          width: 100%;
        }}
        .sig-name {{
          font-weight: 800;
          font-size: 12px;
          color: #18181b;
        }}
        .sig-title {{
          font-size: 10px;
          color: #71717a;
          font-weight: 600;
        }}
      </style>
    </head>
    <body>
      <div class="cert-outer-canvas">
        <!-- Guilloché Borders -->
        <div class="guilloche-border"></div>
        <div class="guilloche-inner-border"></div>

        <!-- Top Circular Emblem -->
        <div class="top-emblem">
          <div class="top-emblem-inner">
            A
          </div>
        </div>

        <!-- Main Title -->
        <h1 class="cert-main-title">Certificate of Accomplishment</h1>

        <!-- Dark Chevron Course Ribbon -->
        <div class="course-ribbon-wrapper">
          <div class="ribbon-chevron-left"></div>
          <div class="course-ribbon">
            <span>{course_title}</span>
          </div>
          <div class="ribbon-chevron-right"></div>
        </div>

        <!-- Presented To Tag & Cursive Recipient Name -->
        <span class="presented-tag">PRESENTED TO</span>
        <div class="recipient-name-box">
          <h2 class="recipient-name">{user_name}</h2>
        </div>

        <!-- Body Statement -->
        <div class="cert-statement">
          The bearer of this certificate has passed the Academy skill certification test
        </div>

        <!-- Footer Section: Left Metadata & Right Signature -->
        <div class="cert-footer-row">
          <div class="meta-left">
            <div>
              <span class="meta-left-label">Earned on: </span>
              <span class="meta-left-val">{issued_at_str}</span>
            </div>
            <div class="meta-left-id">ID: {short_id}</div>
          </div>

          <div class="sig-block">
            <div class="sig-container">
              {sig_html}
            </div>
            <div class="sig-name">{instructor_name}</div>
            <div class="sig-title">Lead Instructor, Academy</div>
          </div>
        </div>
      </div>
    </body>
    </html>
    """

def _render_pdf_with_playwright_sync(html_content: str) -> bytes:
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_content(html_content, wait_until="networkidle")
        pdf_bytes = page.pdf(
            format="A4",
            landscape=True,
            print_background=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
        )
        browser.close()
        return pdf_bytes


async def render_html_to_pdf_bytes(html_content: str) -> tuple[bytes, str]:
    """Render HTML string to true PDF bytes using Playwright, falling back to WeasyPrint or HTML bytes."""
    import asyncio
    try:
        pdf_bytes = await asyncio.to_thread(_render_pdf_with_playwright_sync, html_content)
        return pdf_bytes, "application/pdf"
    except Exception as e1:
        import logging
        logging.getLogger("uvicorn.error").warning(f"Playwright PDF generation failed, attempting WeasyPrint fallback: {e1}")

    try:
        from weasyprint import HTML
        pdf_bytes = HTML(string=html_content).write_pdf()
        return pdf_bytes, "application/pdf"
    except Exception as e2:
        import logging
        logging.getLogger("uvicorn.error").warning(f"WeasyPrint PDF generation failed: {e2}")

    return html_content.encode(), "text/html"


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
                    signature_img_html = f'<img src="{instructor.signature_url}" style="max-height: 36px; max-width: 160px; object-fit: contain; margin-bottom: 2px;" />'

    html_content = build_certificate_html(
        user_name=user_name,
        course_title=course_title,
        issued_at_str=issued_at_str,
        verification_id=verification_id,
        instructor_name=instructor_name,
        signature_img_html=signature_img_html
    )

    return await render_html_to_pdf_bytes(html_content)


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
            signature_img_html = f'<img src="{instructor.signature_url}" style="max-height: 36px; max-width: 160px; object-fit: contain; margin-bottom: 2px;" />'

    html_content = build_certificate_html(
        user_name=user_name,
        course_title=course_title,
        issued_at_str=issued_at_str,
        verification_id=verification_id,
        instructor_name=instructor_name,
        signature_img_html=signature_img_html
    )

    return await render_html_to_pdf_bytes(html_content)
