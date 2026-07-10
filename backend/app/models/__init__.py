"""
Import all models so Alembic's autogenerate can discover them.
"""
from app.models.user import User  # noqa: F401
from app.models.role import Role, Permission, RolePermission, UserRole  # noqa: F401
from app.models.course import Course, Module, Lesson  # noqa: F401
from app.models.category import Category, Tag, CourseTag  # noqa: F401
from app.models.enrollment import Enrollment, LessonProgress  # noqa: F401
from app.models.organization import Organization, OrganizationMember  # noqa: F401
from app.models.cohort import Cohort  # noqa: F401
from app.models.order import Order, OrderItem, Invoice  # noqa: F401
from app.models.booking import Booking, TimeSlot  # noqa: F401
from app.models.contact import ContactSubmission, QuoteRequest  # noqa: F401
from app.models.blog import BlogPost, BlogPostTag  # noqa: F401
from app.models.research import Publication  # noqa: F401
from app.models.service import ServicePage  # noqa: F401
from app.models.certificate import Certificate  # noqa: F401
from app.models.ticket import SupportTicket, TicketReply  # noqa: F401
from app.models.audit import AuditLog  # noqa: F401
from app.models.career import JobPosting, JobApplication  # noqa: F401
