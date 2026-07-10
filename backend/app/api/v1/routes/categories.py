"""Category routes — public listing + admin CRUD."""
from __future__ import annotations
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.models.category import Category, Tag
from app.schemas.category import CategoryCreate, CategoryRead, TagCreate, TagRead
from app.schemas.auth import MessageResponse

router = APIRouter()

@router.get("", response_model=list[CategoryRead], status_code=200)
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.name))
    return [CategoryRead.model_validate(c) for c in result.scalars().all()]

@router.post("", response_model=CategoryRead, status_code=201, dependencies=[Depends(require_role("admin"))])
async def create_category(data: CategoryCreate, db: AsyncSession = Depends(get_db)):
    cat = Category(**data.model_dump())
    db.add(cat)
    await db.commit()
    return CategoryRead.model_validate(cat)

@router.get("/tags", response_model=list[TagRead], status_code=200)
async def list_tags(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag).order_by(Tag.name))
    return [TagRead.model_validate(t) for t in result.scalars().all()]

@router.post("/tags", response_model=TagRead, status_code=201, dependencies=[Depends(require_role("admin"))])
async def create_tag(data: TagCreate, db: AsyncSession = Depends(get_db)):
    tag = Tag(**data.model_dump())
    db.add(tag)
    await db.commit()
    return TagRead.model_validate(tag)
