"""Dashboard service — aggregates stats and logs for dashboard views."""
from __future__ import annotations
import asyncio
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.certificate import Certificate
from app.models.booking import Booking
from app.models.order import Order, OrderStatus, Invoice
from app.models.organization import OrganizationMember
from app.repositories.audit_repository import AuditRepository

class DashboardService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.audit_repo = AuditRepository(db)

    async def get_student_overview(self, user_id: UUID) -> dict:
        enrolled_count = (await self.db.execute(select(func.count()).select_from(Enrollment).where(Enrollment.user_id == user_id))).scalar() or 0
        completed_count = (await self.db.execute(select(func.count()).select_from(Enrollment).where(Enrollment.user_id == user_id, Enrollment.status == "completed"))).scalar() or 0
        cert_count = (await self.db.execute(select(func.count()).select_from(Certificate).where(Certificate.user_id == user_id))).scalar() or 0
        return {"enrolled_courses": enrolled_count, "completed_courses": completed_count, "certificates_earned": cert_count}

    async def get_instructor_overview(self, user_id: UUID) -> dict:
        courses = (await self.db.execute(select(Course).where(Course.instructor_id == user_id, Course.deleted_at.is_(None)))).scalars().all()
        course_ids = [c.id for c in courses]

        enrollment_counts = {}
        if course_ids:
            count_stmt = select(Enrollment.course_id, func.count().label("cnt")).where(Enrollment.course_id.in_(course_ids)).group_by(Enrollment.course_id)
            for row in (await self.db.execute(count_stmt)).all():
                enrollment_counts[row.course_id] = row.cnt

        course_stats = [{
            "course_id": str(c.id),
            "title": c.title,
            "status": c.status.value,
            "enrolled_students": enrollment_counts.get(c.id, 0)
        } for c in courses]

        return {"total_courses": len(courses), "courses": course_stats}

    async def get_client_overview(self, user_id: UUID) -> dict:
        mem_result = await self.db.execute(select(OrganizationMember).where(OrganizationMember.user_id == user_id))
        membership = mem_result.scalar_one_or_none()
        if membership is None:
            return {"organization": None, "total_enrollments": 0, "invoices": []}

        org_id = membership.organization_id
        total = (await self.db.execute(select(func.count()).select_from(Enrollment).where(Enrollment.organization_id == org_id))).scalar() or 0
        invoices = (await self.db.execute(select(Invoice).where(Invoice.organization_id == org_id).order_by(Invoice.created_at.desc()))).scalars().all()

        return {
            "organization_id": str(org_id),
            "total_enrollments": total,
            "invoices": [{"id": str(i.id), "invoice_number": i.invoice_number, "status": i.status.value} for i in invoices]
        }

    async def get_admin_metrics(self) -> dict:
        # Run DB metrics concurrently via asyncio.gather to avoid blocking/slow queries
        async def count_model(model, *filters):
            stmt = select(func.count()).select_from(model)
            for f in filters:
                stmt = stmt.where(f)
            return (await self.db.execute(stmt)).scalar() or 0

        async def sum_revenue():
            stmt = select(func.sum(Order.total_amount)).where(Order.status == OrderStatus.PAID)
            val = (await self.db.execute(stmt)).scalar() or 0
            return float(val)

        total_users, total_courses, total_enrollments, total_bookings, total_revenue = await asyncio.gather(
            count_model(User, User.deleted_at.is_(None)),
            count_model(Course, Course.deleted_at.is_(None)),
            count_model(Enrollment),
            count_model(Booking),
            sum_revenue()
        )

        return {
            "total_users": total_users,
            "total_courses": total_courses,
            "total_enrollments": total_enrollments,
            "total_revenue": total_revenue,
            "total_bookings": total_bookings
        }

    async def list_audit_logs(self, page: int = 1, page_size: int = 50) -> tuple[list, int]:
        logs, total = await self.audit_repo.list_paginated(page, page_size)
        items = [{
            "id": str(l.id),
            "actor_id": str(l.actor_id) if l.actor_id else None,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "ip_address": l.ip_address,
            "timestamp": l.timestamp.isoformat()
        } for l in logs]
        return items, total
