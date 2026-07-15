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

    async def list_published(self, page: int = 1, page_size: int = 20, category_id: UUID | None = None, level: str | None = None, search: str | None = None, instructor_id: UUID | None = None):
        return await self.repo.list_published(page, page_size, category_id, level, search, instructor_id)

    async def list_all(self, page: int = 1, page_size: int = 20, category_id: UUID | None = None, level: str | None = None, search: str | None = None, instructor_id: UUID | None = None):
        return await self.repo.list_all(page, page_size, category_id, level, search, instructor_id)

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
        if not is_admin and "status" in kwargs:
            kwargs["status"] = CourseStatus.DRAFT
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

    async def update_module(self, module_id: UUID, **kwargs):
        module = await self.repo.get_module_by_id(module_id)
        if module is None:
            raise NotFoundError(resource="Module")
        module = await self.repo.update_module(module, **kwargs)
        await self.db.commit()
        return module

    async def delete_module(self, module_id: UUID):
        module = await self.repo.get_module_by_id(module_id)
        if module is None:
            raise NotFoundError(resource="Module")
        await self.repo.delete_module(module)
        await self.db.commit()

    async def update_lesson(self, lesson_id: UUID, **kwargs):
        lesson = await self.repo.get_lesson_by_id(lesson_id)
        if lesson is None:
            raise NotFoundError(resource="Lesson")
        lesson = await self.repo.update_lesson(lesson, **kwargs)
        await self.db.commit()
        return lesson

    async def delete_lesson(self, lesson_id: UUID):
        lesson = await self.repo.get_lesson_by_id(lesson_id)
        if lesson is None:
            raise NotFoundError(resource="Lesson")
        await self.repo.delete_lesson(lesson)
        await self.db.commit()
