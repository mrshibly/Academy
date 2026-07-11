"""Unit tests for CourseService."""
from __future__ import annotations
import uuid
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.course_service import CourseService
from app.core.exceptions import NotFoundError

@pytest.mark.anyio
async def test_get_nonexistent_course(db_session: AsyncSession) -> None:
    svc = CourseService(db_session)
    with pytest.raises(NotFoundError):
        await svc.get_course_detail("nonexistent-course-slug")
