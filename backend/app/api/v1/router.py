"""
Aggregated v1 API router.

All v1 route modules are included here with their prefixes and tags.
"""

from __future__ import annotations

from fastapi import APIRouter

api_v1_router = APIRouter()

# ---- Auth ----
from app.api.v1.routes.auth import router as auth_router

api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])

# ---- Users ----
from app.api.v1.routes.users import router as users_router

api_v1_router.include_router(users_router, prefix="/users", tags=["Users"])

# ---- Courses ----
from app.api.v1.routes.courses import router as courses_router

api_v1_router.include_router(courses_router, prefix="/courses", tags=["Courses"])

# ---- Categories ----
from app.api.v1.routes.categories import router as categories_router

api_v1_router.include_router(categories_router, prefix="/categories", tags=["Categories"])

# ---- Enrollments ----
from app.api.v1.routes.enrollments import router as enrollments_router

api_v1_router.include_router(enrollments_router, prefix="/enrollments", tags=["Enrollments"])

# ---- Payments ----
from app.api.v1.routes.payments import router as payments_router

api_v1_router.include_router(payments_router, prefix="/payments", tags=["Payments"])

# ---- Bookings ----
from app.api.v1.routes.bookings import router as bookings_router

api_v1_router.include_router(bookings_router, prefix="/bookings", tags=["Bookings"])

# ---- Contacts ----
from app.api.v1.routes.contacts import router as contacts_router

api_v1_router.include_router(contacts_router, prefix="/contacts", tags=["Contacts"])

# ---- Blog ----
from app.api.v1.routes.blog import router as blog_router

api_v1_router.include_router(blog_router, prefix="/blog", tags=["Blog"])

# ---- Research ----
from app.api.v1.routes.research import router as research_router

api_v1_router.include_router(research_router, prefix="/research", tags=["Research"])

# ---- Services (CMS) ----
from app.api.v1.routes.services import router as services_router

api_v1_router.include_router(services_router, prefix="/services", tags=["Services"])

# ---- Careers ----
from app.api.v1.routes.careers import router as careers_router

api_v1_router.include_router(careers_router, prefix="/careers", tags=["Careers"])

# ---- Certificates ----
from app.api.v1.routes.certificates import router as certificates_router

api_v1_router.include_router(certificates_router, prefix="/certificates", tags=["Certificates"])

# ---- Cohorts ----
from app.api.v1.routes.cohorts import router as cohorts_router

api_v1_router.include_router(cohorts_router, prefix="/cohorts", tags=["Cohorts"])

# ---- Support Tickets ----
from app.api.v1.routes.tickets import router as tickets_router

api_v1_router.include_router(tickets_router, prefix="/tickets", tags=["Support Tickets"])

# ---- Search ----
from app.api.v1.routes.search import router as search_router

api_v1_router.include_router(search_router, prefix="/search", tags=["Search"])

# ---- Uploads ----
from app.api.v1.routes.uploads import router as uploads_router

api_v1_router.include_router(uploads_router, prefix="/uploads", tags=["Uploads"])

# ---- Dashboards ----
from app.api.v1.routes.dashboard.student import router as student_dashboard_router
from app.api.v1.routes.dashboard.instructor import router as instructor_dashboard_router
from app.api.v1.routes.dashboard.client import router as client_dashboard_router
from app.api.v1.routes.dashboard.admin import router as admin_dashboard_router

api_v1_router.include_router(student_dashboard_router, prefix="/dashboard/student", tags=["Dashboard - Student"])
api_v1_router.include_router(instructor_dashboard_router, prefix="/dashboard/instructor", tags=["Dashboard - Instructor"])
api_v1_router.include_router(client_dashboard_router, prefix="/dashboard/client", tags=["Dashboard - Client"])
api_v1_router.include_router(admin_dashboard_router, prefix="/dashboard/admin", tags=["Dashboard - Admin"])
