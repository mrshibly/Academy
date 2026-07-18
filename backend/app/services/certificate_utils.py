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
    """Build a high-fidelity HTML layout matching the teal wave modern certificate design."""
    sig_html = signature_img_html if signature_img_html else f'<span style="font-family: \'Great Vibes\', \'Dancing Script\', cursive, Georgia, serif; font-size: 24px; color: #0c6478; font-weight: 700;">{instructor_name}</span>'
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Dancing+Script:wght@700&display=swap');
        
        @page {{
          size: A4 landscape;
          margin: 0;
        }}
        body {{
          margin: 0;
          padding: 0;
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          background-color: #0c6478;
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
          background: linear-gradient(135deg, #0a4f5f 0%, #0c6478 50%, #073844 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }}

        /* Abstract Flowing Teal & Yellow Waves Background Graphics */
        .wave-bg-svg {{
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          width: 100%; height: 100%;
          pointer-events: none;
          z-index: 1;
        }}

        /* Top Left Academy Box Logo */
        .top-logo-box {{
          position: absolute;
          top: 24px;
          left: 36px;
          border: 2px solid #ffffff;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 10;
          background: rgba(12, 100, 120, 0.4);
          backdrop-filter: blur(4px);
        }}
        .top-logo-icon {{
          width: 28px;
          height: 28px;
          color: #ffffff;
        }}
        .top-logo-text {{
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: 0.05em;
        }}

        /* Inner White Sheet Card */
        .cert-card {{
          width: 248mm;
          height: 156mm;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
          position: relative;
          z-index: 5;
          box-sizing: border-box;
          padding: 36px 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
        }}

        /* Main Title Block Grid */
        .title-block {{
          display: flex;
          align-items: center;
          gap: 24px;
          width: 100%;
          margin-top: 10px;
        }}
        .title-left {{
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
          width: 40%;
        }}
        .title-left h1 {{
          font-size: 32px;
          font-weight: 900;
          color: #1e293b;
          margin: 0;
          letter-spacing: 0.06em;
          line-height: 1.05;
        }}
        .title-left h3 {{
          font-size: 15px;
          font-weight: 700;
          color: #475569;
          margin: 4px 0 0 0;
          letter-spacing: 0.12em;
        }}

        .vertical-teal-bar {{
          width: 5px;
          height: 70px;
          background: #0c6478;
          border-radius: 4px;
          flex-shrink: 0;
        }}

        .title-right {{
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          width: 55%;
        }}
        .presented-tag {{
          font-size: 10.5px;
          font-weight: 800;
          color: #475569;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }}
        .recipient-name {{
          font-family: 'Great Vibes', 'Dancing Script', cursive, Georgia, serif;
          font-size: 46px;
          font-weight: 700;
          color: #0c6478;
          margin: 0;
          line-height: 1.1;
        }}

        /* Body Statement */
        .cert-statement {{
          font-size: 13px;
          color: #334155;
          text-align: center;
          max-width: 650px;
          line-height: 1.65;
          margin: 10px 0;
        }}
        .course-title-highlight {{
          font-weight: 800;
          color: #0f172a;
        }}

        /* Footer Section */
        .cert-footer-row {{
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          width: 100%;
          margin-bottom: 4px;
        }}

        .sig-column {{
          width: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }}
        .sig-container {{
          height: 48px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          margin-bottom: 4px;
          width: 100%;
          position: relative;
        }}
        .sig-rule {{
          width: 100%;
          height: 2px;
          background-color: #334155;
          margin-bottom: 6px;
        }}
        .sig-role-title {{
          font-size: 11px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }}
        .sig-person-name {{
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          margin-top: 1px;
        }}

        /* Ribbon Medal Award Badge */
        .medal-badge {{
          position: relative;
          width: 76px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
        }}
        .medal-circle {{
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: #0284c7;
          border: 4px dashed #ffffff;
          box-shadow: 0 0 0 2px #0284c7, 0 6px 15px rgba(2, 132, 199, 0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          z-index: 2;
        }}
        .medal-ribbon-left, .medal-ribbon-right {{
          position: absolute;
          bottom: -12px;
          width: 16px;
          height: 32px;
          background: #0369a1;
          z-index: 1;
        }}
        .medal-ribbon-left {{ left: 20px; transform: rotate(18deg); clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%); }}
        .medal-ribbon-right {{ right: 20px; transform: rotate(-18deg); clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%); }}

        /* Security Bar at Bottom */
        .security-bar {{
          width: 100%;
          border-top: 1px solid #f1f5f9;
          padding-top: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: monospace;
          font-size: 8px;
          color: #94a3b8;
        }}
      </style>
    </head>
    <body>
      <div class="cert-outer-canvas">
        <!-- SVG Background Shapes & Golden Curves -->
        <svg class="wave-bg-svg" viewBox="0 0 1000 700" preserveAspectRatio="none">
          <!-- Translucent Teal Circles -->
          <circle cx="260" cy="120" r="140" fill="#0891b2" opacity="0.25" />
          <circle cx="920" cy="560" r="160" fill="#0891b2" opacity="0.25" />
          
          <!-- Golden Yellow Waves -->
          <path d="M 380 0 Q 600 150 900 0 Z" fill="#f59e0b" opacity="0.85" />
          <path d="M 240 700 Q 500 520 750 700 Z" fill="#fbbf24" opacity="0.75" />
          
          <!-- Golden Fine Contour Lines (Guilloché curves) -->
          <path d="M 500 0 C 700 120, 850 150, 1000 50 M 500 10 C 700 130, 850 160, 1000 60 M 500 20 C 700 140, 850 170, 1000 70" fill="none" stroke="#fcd34d" stroke-width="1.5" opacity="0.6" />
          <path d="M 0 350 C 200 450, 350 500, 600 700 M 0 360 C 200 460, 350 510, 600 710" fill="none" stroke="#fcd34d" stroke-width="1.5" opacity="0.6" />
        </svg>

        <!-- Top Left Academy Box Logo -->
        <div class="top-logo-box">
          <svg class="top-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
            <path d="M7 9l2 2-2 2M13 13h4" stroke-width="1.5" />
          </svg>
          <div class="top-logo-text">
            ACADEMY<br>CREDENTIAL
          </div>
        </div>

        <!-- Central White Sheet Card -->
        <div class="cert-card">
          <!-- Title & Recipient Header Block -->
          <div class="title-block">
            <div class="title-left">
              <h1>CERTIFICATE</h1>
              <h3>OF COMPLETION</h3>
            </div>
            
            <div class="vertical-teal-bar"></div>
            
            <div class="title-right">
              <span class="presented-tag">THIS IS PROUDLY PRESENTED TO</span>
              <h2 class="recipient-name">{user_name}</h2>
            </div>
          </div>

          <!-- Body Description -->
          <div class="cert-statement">
            This certificate is presented for completing the 
            <span class="course-title-highlight">"{course_title}"</span> 
            from Academy on {issued_at_str}.
          </div>

          <!-- Footer Signatures & Ribbon Badge -->
          <div class="cert-footer-row">
            <!-- Left Teacher Signature -->
            <div class="sig-column">
              <div class="sig-container">
                {sig_html}
              </div>
              <div class="sig-rule"></div>
              <div class="sig-role-title">Teacher</div>
              <div class="sig-person-name">{instructor_name}</div>
            </div>

            <!-- Central Ribbon Medal Award Badge -->
            <div class="medal-badge">
              <div class="medal-ribbon-left"></div>
              <div class="medal-ribbon-right"></div>
              <div class="medal-circle">
                <span style="font-size: 7px; font-weight: 800; text-transform: uppercase; opacity: 0.9;">The</span>
                <span style="font-size: 11px; font-weight: 900; letter-spacing: 0.05em;">BEST</span>
                <span style="font-size: 7px; font-weight: 800; text-transform: uppercase; opacity: 0.9;">Award</span>
              </div>
            </div>

            <!-- Right Principal Signature -->
            <div class="sig-column">
              <div class="sig-container" style="font-family: 'Great Vibes', 'Dancing Script', cursive; font-size: 22px; color: #0c6478; font-weight: 700;">
                Academic Board
              </div>
              <div class="sig-rule"></div>
              <div class="sig-role-title">Principal</div>
              <div class="sig-person-name">Academic Senate</div>
            </div>
          </div>

          <!-- Bottom Security Bar -->
          <div class="security-bar">
            <span>VERIFICATION ID: {verification_id}</span>
            <span>OFFICIALLY REGISTERED</span>
            <span>VERIFY AT: www.academy.dev/verify/{verification_id}</span>
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
