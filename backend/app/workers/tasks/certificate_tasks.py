"""Certificate generation background task."""
from __future__ import annotations
import uuid
import asyncio
from app.workers.celery_app import celery_app
from app.db.session import async_session_factory
from app.services.certificate_utils import generate_certificate_in_process

@celery_app.task(bind=True, max_retries=2, default_retry_delay=30)
def generate_certificate_task(self, enrollment_id: str, user_name: str, course_title: str) -> dict:
    """
    Generate a high-fidelity PDF certificate in the background and upload to S3.
    Delegates core generation to certificate_utils function.
    """
    async def run_generation():
        async with async_session_factory() as db:
            cert = await generate_certificate_in_process(
                db, 
                uuid.UUID(enrollment_id), 
                user_name, 
                course_title
            )
            if cert:
                await db.commit()
                return {"verification_id": str(cert.verification_id), "pdf_url": cert.pdf_url, "enrollment_id": enrollment_id}
            return {"error": "Enrollment not found"}

    return asyncio.run(run_generation())
