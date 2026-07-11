"""Course service — course CRUD, module/lesson management."""
from __future__ import annotations
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundError, ForbiddenError
from app.models.course import CourseStatus
from app.repositories.course_repository import CourseRepository

class CourseService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = CourseRepository(db)

    async def list_published(self, page: int = 1, page_size: int = 20, category_id: UUID | None = None, level: str | None = None, search: str | None = None):
        return await self.repo.list_published(page, page_size, category_id, level, search)

    async def get_course_detail(self, slug: str):
        course = await self.repo.get_by_slug(slug)
        if course is None:
            raise NotFoundError(resource="Course")
        return course

    async def create_course(self, instructor_id: UUID, **kwargs):
        from sqlalchemy.orm.attributes import set_committed_value
        course = await self.repo.create(instructor_id=instructor_id, status=CourseStatus.DRAFT, **kwargs)
        set_committed_value(course, "modules", [])
        await self.db.commit()
        return course

    async def update_course(self, course_id: UUID, actor_id: UUID, is_admin: bool, **kwargs):
        course = await self.repo.get_by_id(course_id)
        if course is None:
            raise NotFoundError(resource="Course")
        if not is_admin and course.instructor_id != actor_id:
            raise ForbiddenError(message="You can only edit your own courses.")
        course = await self.repo.update(course, **kwargs)
        await self.db.commit()
        return course

    async def delete_course(self, course_id: UUID):
        course = await self.repo.get_by_id(course_id)
        if course is None:
            raise NotFoundError(resource="Course")
        await self.repo.soft_delete(course)
        await self.db.commit()

    async def create_module(self, course_id: UUID, **kwargs):
        course = await self.repo.get_by_id(course_id)
        if course is None:
            raise NotFoundError(resource="Course")
        module = await self.repo.create_module(course_id=course_id, **kwargs)
        await self.db.commit()
        return module

    async def create_lesson(self, module_id: UUID, **kwargs):
        lesson = await self.repo.create_lesson(module_id=module_id, **kwargs)
        await self.db.commit()
        return lesson
