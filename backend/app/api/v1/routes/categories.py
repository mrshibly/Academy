"""Category routes — public listing + admin CRUD."""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.schemas.category import CategoryCreate, CategoryRead, TagCreate, TagRead
from app.services.category_service import CategoryService

router = APIRouter()

@router.get("", response_model=list[CategoryRead], status_code=200)
async def list_categories(db: AsyncSession = Depends(get_db)):
    svc = CategoryService(db)
    cats = await svc.list_categories()
    return [CategoryRead.model_validate(c) for c in cats]

@router.post("", response_model=CategoryRead, status_code=201, dependencies=[Depends(require_role("admin"))])
async def create_category(data: CategoryCreate, db: AsyncSession = Depends(get_db)):
    svc = CategoryService(db)
    cat = await svc.create_category(**data.model_dump())
    return CategoryRead.model_validate(cat)

@router.get("/tags", response_model=list[TagRead], status_code=200)
async def list_tags(db: AsyncSession = Depends(get_db)):
    svc = CategoryService(db)
    tags = await svc.list_tags()
    return [TagRead.model_validate(t) for t in tags]

@router.post("/tags", response_model=TagRead, status_code=201, dependencies=[Depends(require_role("admin"))])
async def create_tag(data: TagCreate, db: AsyncSession = Depends(get_db)):
    svc = CategoryService(db)
    tag = await svc.create_tag(**data.model_dump())
    return TagRead.model_validate(tag)
