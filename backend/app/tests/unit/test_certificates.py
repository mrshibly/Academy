import uuid
from datetime import datetime, timezone
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.certificate import Certificate
from app.services.certificate_utils import render_certificate_pdf_bytes, generate_certificate_in_process

@pytest.mark.anyio
async def test_render_certificate_pdf_bytes(db_session: AsyncSession) -> None:
    # 1. Create a course instructor
    instructor = User(
        email="instructor@academy.dev",
        hashed_password="hashedpassword123",
        full_name="Dr. Jane Doe",
        signature_url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        is_active=True,
        is_verified=True
    )
    db_session.add(instructor)
    await db_session.flush()

    # 2. Create a course
    course = Course(
        title="Advanced AI Security",
        slug="advanced-ai-security",
        description="Learn to defend AI systems.",
        instructor_id=instructor.id,
        level="advanced",
        status="published"
    )
    db_session.add(course)
    await db_session.flush()

    # 3. Create a student
    student = User(
        email="student@academy.dev",
        hashed_password="hashedpassword123",
        full_name="Alice Graduate",
        is_active=True,
        is_verified=True
    )
    db_session.add(student)
    await db_session.flush()

    # 4. Create an enrollment
    enrollment = Enrollment(
        user_id=student.id,
        course_id=course.id,
        status=EnrollmentStatus.COMPLETED,
        enrolled_at=datetime.now(timezone.utc)
    )
    db_session.add(enrollment)
    await db_session.flush()

    # 5. Call render_certificate_pdf_bytes
    verification_id = uuid.uuid4()
    issued_at = datetime.now(timezone.utc)
    pdf_bytes, media_type = await render_certificate_pdf_bytes(
        db_session,
        enrollment.id,
        student.full_name,
        course.title,
        verification_id,
        issued_at
    )

    # 6. Verify outputs
    assert len(pdf_bytes) > 0
    assert media_type in ("application/pdf", "text/html")
    if media_type == "text/html":
        # Check that signature and student name render in HTML fallback
        html_str = pdf_bytes.decode()
        assert "Alice Graduate" in html_str
        assert "Advanced AI Security" in html_str
        assert "Dr. Jane Doe" in html_str
        assert "data:image/png;base64" in html_str

@pytest.mark.anyio
async def test_generate_certificate_in_process(db_session: AsyncSession) -> None:
    # Set up records
    instructor = User(
        email="inst2@academy.dev",
        hashed_password="pwd",
        full_name="Prof. Smith",
        is_active=True,
        is_verified=True
    )
    db_session.add(instructor)
    await db_session.flush()

    course = Course(
        title="Web Hacking 101",
        slug="web-hacking-101",
        description="Intrusion testing basics.",
        instructor_id=instructor.id,
        level="beginner",
        status="published"
    )
    db_session.add(course)
    await db_session.flush()

    student = User(
        email="stud2@academy.dev",
        hashed_password="pwd",
        full_name="Bob Coder",
        is_active=True,
        is_verified=True
    )
    db_session.add(student)
    await db_session.flush()

    enrollment = Enrollment(
        user_id=student.id,
        course_id=course.id,
        status=EnrollmentStatus.COMPLETED,
        enrolled_at=datetime.now(timezone.utc)
    )
    db_session.add(enrollment)
    await db_session.flush()

    # Generate certificate
    cert = await generate_certificate_in_process(db_session, enrollment.id, student.full_name, course.title)
    
    # Assert certificate was recorded
    assert cert is not None
    assert cert.enrollment_id == enrollment.id
    assert cert.user_id == student.id
    assert cert.pdf_url is not None
    assert "/api/v1/certificates/fallback/" in cert.pdf_url or "academy-uploads" in cert.pdf_url

@pytest.mark.anyio
async def test_certificate_fallback_route(db_session: AsyncSession) -> None:
    from httpx import AsyncClient, ASGITransport
    from app.main import app

    # 1. Create entities
    instructor = User(
        email="inst3@academy.dev",
        hashed_password="pwd",
        full_name="Prof. Alice",
        is_active=True,
        is_verified=True
    )
    db_session.add(instructor)
    await db_session.flush()

    course = Course(
        title="Python Defenses",
        slug="python-defenses",
        description="Write secure Python code.",
        instructor_id=instructor.id,
        level="intermediate",
        status="published"
    )
    db_session.add(course)
    await db_session.flush()

    student = User(
        email="stud3@academy.dev",
        hashed_password="pwd",
        full_name="Charlie Brown",
        is_active=True,
        is_verified=True
    )
    db_session.add(student)
    await db_session.flush()

    enrollment = Enrollment(
        user_id=student.id,
        course_id=course.id,
        status=EnrollmentStatus.COMPLETED,
        enrolled_at=datetime.now(timezone.utc)
    )
    db_session.add(enrollment)
    await db_session.flush()

    # Create certificate record manually pointing to fallback URL
    verification_id = uuid.uuid4()
    cert = Certificate(
        enrollment_id=enrollment.id,
        user_id=student.id,
        course_id=course.id,
        verification_id=verification_id,
        pdf_url=f"/api/v1/certificates/fallback/{verification_id}.pdf",
        issued_at=datetime.now(timezone.utc)
    )
    db_session.add(cert)
    await db_session.flush() # flush to generate ID and associate

    # Call the fallback route using AsyncClient
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get(f"/api/v1/certificates/fallback/{verification_id}.pdf")
        assert resp.status_code == 200
        assert any(resp.headers.get("content-type", "").startswith(t) for t in ("application/pdf", "text/html"))
        assert len(resp.content) > 0
