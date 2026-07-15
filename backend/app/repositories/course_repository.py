"""Course repository — all course-related DB queries."""
from __future__ import annotations
from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.course import Course, Module, Lesson, CourseStatus

class CourseRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_published(self, page: int = 1, page_size: int = 20, category_id: UUID | None = None, level: str | None = None, search: str | None = None, instructor_id: UUID | None = None) -> tuple[list[Course], int]:
        base = select(Course).where(Course.status == CourseStatus.PUBLISHED, Course.deleted_at.is_(None))
        if instructor_id:
            base = base.where(Course.instructor_id == instructor_id)
        if category_id:
            base = base.where(Course.category_id == category_id)
        if level:
            base = base.where(Course.level == level)
        if search:
            base = base.where(or_(Course.title.ilike(f"%{search}%"), Course.short_description.ilike(f"%{search}%")))
        count_stmt = select(func.count()).select_from(base.subquery())
        total = (await self.db.execute(count_stmt)).scalar() or 0
        stmt = base.options(selectinload(Course.modules).selectinload(Module.lessons)).offset((page - 1) * page_size).limit(page_size).order_by(Course.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().unique().all()), int(total)

    async def list_all(self, page: int = 1, page_size: int = 20, category_id: UUID | None = None, level: str | None = None, search: str | None = None, instructor_id: UUID | None = None) -> tuple[list[Course], int]:
        base = select(Course).where(Course.deleted_at.is_(None))
        if instructor_id:
            base = base.where(Course.instructor_id == instructor_id)
        if category_id:
            base = base.where(Course.category_id == category_id)
        if level:
            base = base.where(Course.level == level)
        if search:
            base = base.where(or_(Course.title.ilike(f"%{search}%"), Course.short_description.ilike(f"%{search}%")))
        count_stmt = select(func.count()).select_from(base.subquery())
        total = (await self.db.execute(count_stmt)).scalar() or 0
        stmt = base.options(selectinload(Course.modules).selectinload(Module.lessons)).offset((page - 1) * page_size).limit(page_size).order_by(Course.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().unique().all()), int(total)

    async def get_by_slug(self, slug: str) -> Course | None:
        stmt = select(Course).where(Course.slug == slug, Course.deleted_at.is_(None)).options(selectinload(Course.modules).selectinload(Module.lessons))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, course_id: UUID) -> Course | None:
        stmt = select(Course).where(Course.id == course_id, Course.deleted_at.is_(None)).options(selectinload(Course.modules).selectinload(Module.lessons))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, **kwargs: object) -> Course:
        course = Course(**kwargs)
        self.db.add(course)
        await self.db.flush()
        return course

    async def update(self, course: Course, **kwargs: object) -> Course:
        for k, v in kwargs.items():
            setattr(course, k, v)
        await self.db.flush()
        return course

    async def soft_delete(self, course: Course) -> None:
        course.deleted_at = datetime.now(timezone.utc)
        await self.db.flush()

    async def create_module(self, **kwargs: object) -> Module:
        module = Module(**kwargs)
        self.db.add(module)
        await self.db.flush()
        return module

    async def create_lesson(self, **kwargs: object) -> Lesson:
        lesson = Lesson(**kwargs)
        self.db.add(lesson)
        await self.db.flush()
        return lesson

    async def get_module_by_id(self, module_id: UUID) -> Module | None:
        stmt = select(Module).where(Module.id == module_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_lesson_by_id(self, lesson_id: UUID) -> Lesson | None:
        stmt = select(Lesson).where(Lesson.id == lesson_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def update_module(self, module: Module, **kwargs: object) -> Module:
        for k, v in kwargs.items():
            setattr(module, k, v)
        await self.db.flush()
        return module

    async def update_lesson(self, lesson: Lesson, **kwargs: object) -> Lesson:
        for k, v in kwargs.items():
            setattr(lesson, k, v)
        await self.db.flush()
        return lesson

    async def delete_module(self, module: Module) -> None:
        await self.db.delete(module)
        await self.db.flush()

    async def delete_lesson(self, lesson: Lesson) -> None:
        await self.db.delete(lesson)
        await self.db.flush()
