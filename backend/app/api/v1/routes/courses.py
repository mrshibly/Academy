"""Course routes — public catalog + instructor/admin CRUD."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.models.user import User
from app.schemas.course import CourseCreate, CourseUpdate, CourseRead, ModuleCreate, LessonCreate, ModuleUpdate, LessonUpdate
from app.schemas.common import PaginatedResponse
from app.schemas.auth import MessageResponse
from app.services.course_service import CourseService

router = APIRouter()

@router.get("", response_model=PaginatedResponse[CourseRead], status_code=200)
async def list_courses(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), category_id: UUID | None = None, level: str | None = None, search: str | None = None, db: AsyncSession = Depends(get_db)):
    """Public: list published courses with filters."""
    svc = CourseService(db)
    courses, total = await svc.list_published(page, page_size, category_id, level, search)
    return PaginatedResponse(items=[CourseRead.model_validate(c) for c in courses], total=total, page=page, page_size=page_size)

@router.get("/managed", response_model=PaginatedResponse[CourseRead], status_code=200)
async def list_managed_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: UUID | None = None,
    level: str | None = None,
    search: str | None = None,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Instructor/Admin workspace: list courses they manage (instructors only see their own)."""
    svc = CourseService(db)
    is_admin = any(ur.role.name == "admin" for ur in user.user_roles)
    is_instructor = any(ur.role.name == "instructor" for ur in user.user_roles)
    
    if not is_admin and not is_instructor:
        from app.core.exceptions import ForbiddenError
        raise ForbiddenError(message="Only instructors and administrators can view managed courses.")
        
    instructor_filter = None if is_admin else user.id
    courses, total = await svc.list_all(page, page_size, category_id, level, search, instructor_id=instructor_filter)
    return PaginatedResponse(items=[CourseRead.model_validate(c) for c in courses], total=total, page=page, page_size=page_size)

@router.get("/{slug}", response_model=CourseRead, status_code=200)
async def get_course(slug: str, db: AsyncSession = Depends(get_db)):
    """Public: get course detail by slug."""
    svc = CourseService(db)
    return CourseRead.model_validate(await svc.get_course_detail(slug))

@router.post("", response_model=CourseRead, status_code=201, dependencies=[Depends(require_role("instructor", "admin"))])
async def create_course(data: CourseCreate, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Create a new course (instructor/admin)."""
    svc = CourseService(db)
    course = await svc.create_course(user.id, **data.model_dump())
    return CourseRead.model_validate(course)

@router.patch("/{course_id}", response_model=CourseRead, status_code=200, dependencies=[Depends(require_role("instructor", "admin"))])
async def update_course(course_id: UUID, data: CourseUpdate, user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Update a course (owner instructor or admin)."""
    svc = CourseService(db)
    is_admin = any(ur.role.name == "admin" for ur in user.user_roles)
    course = await svc.update_course(course_id, user.id, is_admin, **data.model_dump(exclude_unset=True))
    return CourseRead.model_validate(course)

@router.delete("/{course_id}", response_model=MessageResponse, status_code=200, dependencies=[Depends(require_role("admin"))])
async def delete_course(course_id: UUID, db: AsyncSession = Depends(get_db)):
    """Soft-delete a course (admin only)."""
    svc = CourseService(db)
    await svc.delete_course(course_id)
    return MessageResponse(message="Course deleted.")

@router.post("/{course_id}/modules", status_code=201, dependencies=[Depends(require_role("instructor", "admin"))])
async def create_module(course_id: UUID, data: ModuleCreate, db: AsyncSession = Depends(get_db)):
    """Add a module to a course."""
    svc = CourseService(db)
    module = await svc.create_module(course_id, **data.model_dump())
    return {"id": str(module.id), "title": module.title, "order": module.order}

@router.post("/modules/{module_id}/lessons", status_code=201, dependencies=[Depends(require_role("instructor", "admin"))])
async def create_lesson(module_id: UUID, data: LessonCreate, db: AsyncSession = Depends(get_db)):
    """Add a lesson to a module."""
    svc = CourseService(db)
    lesson = await svc.create_lesson(module_id=module_id, **data.model_dump())
    return {"id": str(lesson.id), "title": lesson.title, "order": lesson.order}


@router.patch("/modules/{module_id}", status_code=200, dependencies=[Depends(require_role("instructor", "admin"))])
async def update_module(module_id: UUID, data: ModuleUpdate, db: AsyncSession = Depends(get_db)):
    """Update a module's details."""
    svc = CourseService(db)
    module = await svc.update_module(module_id=module_id, **data.model_dump(exclude_unset=True))
    return {"id": str(module.id), "title": module.title, "order": module.order}


@router.delete("/modules/{module_id}", response_model=MessageResponse, status_code=200, dependencies=[Depends(require_role("instructor", "admin"))])
async def delete_module(module_id: UUID, db: AsyncSession = Depends(get_db)):
    """Delete a module."""
    svc = CourseService(db)
    await svc.delete_module(module_id)
    return MessageResponse(message="Module deleted.")


@router.patch("/lessons/{lesson_id}", status_code=200, dependencies=[Depends(require_role("instructor", "admin"))])
async def update_lesson(lesson_id: UUID, data: LessonUpdate, db: AsyncSession = Depends(get_db)):
    """Update a lesson's details."""
    svc = CourseService(db)
    lesson = await svc.update_lesson(lesson_id=lesson_id, **data.model_dump(exclude_unset=True))
    return {"id": str(lesson.id), "title": lesson.title, "order": lesson.order}


@router.delete("/lessons/{lesson_id}", response_model=MessageResponse, status_code=200, dependencies=[Depends(require_role("instructor", "admin"))])
async def delete_lesson(lesson_id: UUID, db: AsyncSession = Depends(get_db)):
    """Delete a lesson."""
    svc = CourseService(db)
    await svc.delete_lesson(lesson_id)
    return MessageResponse(message="Lesson deleted.")
