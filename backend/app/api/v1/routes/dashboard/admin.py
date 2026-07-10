"""Admin dashboard routes — key business metrics and audit logs."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.order import Order, OrderStatus
from app.models.booking import Booking
from app.models.audit import AuditLog

router = APIRouter()

@router.get("/metrics", status_code=200, dependencies=[Depends(require_role("admin"))])
async def admin_metrics(db: AsyncSession = Depends(get_db)):
    """Key business metrics for the admin dashboard."""
    total_users = (await db.execute(select(func.count()).select_from(User).where(User.deleted_at.is_(None)))).scalar() or 0
    total_courses = (await db.execute(select(func.count()).select_from(Course).where(Course.deleted_at.is_(None)))).scalar() or 0
    total_enrollments = (await db.execute(select(func.count()).select_from(Enrollment))).scalar() or 0
    total_revenue = (await db.execute(select(func.sum(Order.total_amount)).where(Order.status == OrderStatus.PAID))).scalar() or 0
    total_bookings = (await db.execute(select(func.count()).select_from(Booking))).scalar() or 0
    return {"total_users": total_users, "total_courses": total_courses, "total_enrollments": total_enrollments, "total_revenue": float(total_revenue), "total_bookings": total_bookings}

@router.get("/audit-logs", status_code=200, dependencies=[Depends(require_role("admin"))])
async def list_audit_logs(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200), db: AsyncSession = Depends(get_db)):
    """Paginated audit log view."""
    total = (await db.execute(select(func.count()).select_from(AuditLog))).scalar() or 0
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).offset((page - 1) * page_size).limit(page_size))
    logs = [{"id": str(l.id), "actor_id": str(l.actor_id) if l.actor_id else None, "action": l.action, "resource_type": l.resource_type, "resource_id": l.resource_id, "ip_address": l.ip_address, "timestamp": l.timestamp.isoformat()} for l in result.scalars().all()]
    return {"items": logs, "total": total, "page": page, "page_size": page_size}
