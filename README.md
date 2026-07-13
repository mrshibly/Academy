# 🎓 Academy — AI Development & Cybersecurity Services Platform

A production-grade, SaaS-ready platform for **AI development services, cybersecurity services, professional training, and an integrated Learning Management System (LMS)**. Built with **FastAPI** (backend) and designed for a **Next.js** (frontend).

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Background Workers](#background-workers)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The platform serves three converging product lines under one codebase:

1. **Marketing & Business Site** — Services, case studies, blog, research, contact/lead generation
2. **Academy / LMS** — Courses, cohorts, live training, corporate training, certifications
3. **Client & Admin Portals** — Dashboards for students, instructors, corporate clients, and admins

### Business Goals

| Goal | Description |
|------|-------------|
| **Lead Generation** | Convert visitors into service inquiries and consultation bookings |
| **Course Sales** | Sell self-paced and cohort-based courses with Stripe payments |
| **Corporate Training** | Manage B2B training contracts with cohort management |
| **Brand Authority** | Publish research, whitepapers, security advisories, and blog content |
| **Retention** | Track student progress, issue certificates, support ticketing |

---

## Architecture

The backend follows **Clean Architecture** with strict layer separation:

```
┌─────────────────────────────────────────────┐
│                 API Layer                    │
│   (FastAPI Routers — HTTP only, no logic)   │
├─────────────────────────────────────────────┤
│              Service Layer                   │
│   (Business logic — framework-agnostic)     │
├─────────────────────────────────────────────┤
│            Repository Layer                  │
│   (Data access — all DB queries live here)  │
├─────────────────────────────────────────────┤
│              Data Layer                      │
│   (SQLAlchemy ORM models + PostgreSQL)      │
└─────────────────────────────────────────────┘
```

**Key Principles:**
- Routers never contain SQL/ORM calls — they delegate to services
- Services never import FastAPI — they're framework-agnostic
- Repositories encapsulate all database queries
- Cross-cutting concerns (auth, RBAC, rate limiting) are FastAPI dependencies/middleware

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | FastAPI (Python 3.12+) |
| **Database** | PostgreSQL 16 (async via asyncpg) |
| **ORM** | SQLAlchemy 2.x (async) |
| **Migrations** | Alembic |
| **Validation** | Pydantic v2 |
| **Auth** | JWT (python-jose) + Argon2 password hashing |
| **Cache / Queue** | Redis 7 |
| **Background Jobs** | Celery |
| **Payments** | Stripe |
| **File Storage** | S3-compatible (AWS S3 / MinIO) |
| **PDF Generation** | WeasyPrint |
| **Logging** | structlog (JSON in prod, console in dev) |
| **Containerization** | Docker + Docker Compose |

---

## Features

### Authentication & Security
- Email/password registration with email verification
- JWT access tokens (15min) + refresh tokens (httpOnly cookies)
- OAuth support (Google, GitHub)
- Password reset via signed time-limited tokens
- Argon2 password hashing
- Role-Based Access Control (RBAC) with granular permissions matrix

### Academy / LMS
- Course catalog with filtering (category, level, price) and search
- Hierarchical content: Courses → Modules → Lessons
- Student enrollment and per-lesson progress tracking
- Auto-generated PDF certificates with instructor signatures, public verification, and resilient in-process fallbacks
- Cohort management for live bootcamps and corporate training
- Instructor course authoring (admin approval before publish)

### Business & Marketing
- CMS-managed service pages (draft/published states)
- Blog engine with categories, tags, and SEO metadata
- Research publications hub (whitepapers, security advisories, CVEs)
- Contact forms and service quote requests
- Consultation booking with calendar slot management and conflict prevention
- Careers page with job postings and application tracking

### Payments
- Stripe checkout session integration
- Idempotent webhook handling (prevents duplicate processing)
- Order and invoice management
- Corporate invoicing support

### Dashboards
- **Student**: Enrolled courses, completion %, certificates
- **Instructor**: Course stats, enrolled student counts
- **Corporate Client**: Organization enrollments, invoices
- **Admin**: Business metrics, audit logs, full CRUD on all entities

### Operations
- Support ticketing system (user + admin)
- Global search across courses, blog, services, research
- Audit logging (actor, action, resource, diff, IP, timestamp)
- File upload with MIME/size validation → S3
- Health check endpoints (`/healthz`, `/readyz`)
- Background email sending with retry logic

---

## Project Structure

```
Academy/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app factory
│   │   ├── core/
│   │   │   ├── config.py              # Pydantic-settings configuration
│   │   │   ├── security.py            # JWT + Argon2 password hashing
│   │   │   ├── dependencies.py        # Auth guards, RBAC dependencies
│   │   │   ├── exceptions.py          # Domain exceptions + global handlers
│   │   │   └── logging.py             # Structured logging (structlog)
│   │   ├── db/
│   │   │   ├── base.py                # Declarative base + mixins (UUID, timestamps, soft-delete)
│   │   │   ├── session.py             # Async engine + session factory
│   │   │   └── migrations/            # Alembic migrations
│   │   ├── models/                    # 18 SQLAlchemy ORM models
│   │   │   ├── user.py, role.py       # Users + RBAC (roles, permissions, role_permissions)
│   │   │   ├── course.py, category.py # Courses, modules, lessons, categories, tags
│   │   │   ├── enrollment.py          # Enrollments + lesson progress
│   │   │   ├── organization.py        # Corporate client orgs
│   │   │   ├── cohort.py              # Training cohorts / bootcamps
│   │   │   ├── order.py               # Orders, order items, invoices
│   │   │   ├── booking.py, contact.py # Bookings, contacts, quotes
│   │   │   ├── blog.py, research.py   # Blog posts, publications
│   │   │   ├── service.py             # CMS service pages
│   │   │   ├── certificate.py         # Completion certificates
│   │   │   ├── ticket.py              # Support tickets + replies
│   │   │   ├── audit.py               # Audit log
│   │   │   └── career.py              # Job postings + applications
│   │   ├── schemas/                   # Pydantic v2 request/response schemas
│   │   ├── repositories/             # Data access layer
│   │   ├── services/                  # Business logic layer
│   │   │   ├── auth_service.py        # Register, login, token management
│   │   │   ├── user_service.py        # Profile + admin user ops
│   │   │   ├── course_service.py      # Course CRUD + ownership checks
│   │   │   ├── enrollment_service.py  # Enrollment + progress tracking
│   │   │   └── payment_service.py     # Stripe checkout + webhook handling
│   │   ├── api/v1/
│   │   │   ├── router.py             # Aggregates all v1 routers
│   │   │   └── routes/               # 18 route modules + 4 dashboard routes
│   │   │       ├── auth.py, users.py, courses.py, categories.py
│   │   │       ├── enrollments.py, payments.py, bookings.py, contacts.py
│   │   │       ├── blog.py, research.py, services.py, careers.py
│   │   │       ├── certificates.py, cohorts.py, tickets.py
│   │   │       ├── search.py, uploads.py
│   │   │       └── dashboard/ (student, instructor, client, admin)
│   │   ├── workers/
│   │   │   ├── celery_app.py          # Celery configuration
│   │   │   └── tasks/                 # Background tasks
│   │   │       ├── email_tasks.py     # Transactional emails with retry
│   │   │       └── certificate_tasks.py # PDF generation + S3 upload
│   │   └── tests/
│   ├── scripts/
│   │   └── seed.py                    # Seed roles, permissions, admin user
│   ├── alembic.ini
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
├── instructions.md                     # Engineering instructions for AI agents
└── prd.md                              # Product requirements document
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (recommended)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/mrshibly/Academy.git
cd Academy

# Copy environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Start all services
docker compose up -d

# Run migrations
docker compose exec backend alembic upgrade head

# Seed default data
docker compose exec backend python -m scripts.seed

# API is live at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Option 2: Local Development

```bash
# Clone and navigate
git clone https://github.com/mrshibly/Academy.git
cd Academy/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -e ".[dev]"

# Copy and configure environment
cp .env.example .env

# Start PostgreSQL and Redis (ensure they're running)
# Update DATABASE_URL and REDIS_URL in .env

# Run migrations
alembic revision --autogenerate -m "initial_schema"
alembic upgrade head

# Seed default data
python -m scripts.seed

# Start the server
uvicorn app.main:app --reload --port 8000
```

---

## API Documentation

Once the server is running, interactive API docs are available at:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

### Key Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/register` | Public | Register new account |
| `POST` | `/api/v1/auth/login` | Public | Login, receive JWT tokens |
| `POST` | `/api/v1/auth/refresh` | Public | Refresh access token |
| `GET` | `/api/v1/users/me` | Bearer | Get current user profile |
| `GET` | `/api/v1/courses` | Public | List published courses (paginated) |
| `GET` | `/api/v1/courses/{slug}` | Public | Course detail |
| `POST` | `/api/v1/courses` | Instructor | Create course (draft) |
| `POST` | `/api/v1/enrollments` | Bearer | Enroll in a course |
| `POST` | `/api/v1/payments/checkout` | Bearer | Create Stripe checkout |
| `POST` | `/api/v1/payments/webhook` | Stripe | Payment webhook |
| `GET` | `/api/v1/blog` | Public | List blog posts |
| `POST` | `/api/v1/bookings` | Public | Book a consultation |
| `POST` | `/api/v1/contacts` | Public | Submit contact form |
| `GET` | `/api/v1/search?q=` | Public | Global search |
| `GET` | `/api/v1/certificates/verify/{id}` | Public | Verify certificate |
| `GET` | `/api/v1/dashboard/admin/metrics` | Admin | Business metrics |

> All list endpoints support pagination: `?page=1&page_size=20`
> All error responses follow: `{"error": {"code": "...", "message": "...", "details": {}}}`

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL async connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `JWT_SECRET_KEY` | ✅ | Secret key for JWT signing |
| `STRIPE_SECRET_KEY` | ✅ | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signing secret |
| `ALLOWED_ORIGINS` | ✅ | CORS allowed origins (comma-separated) |
| `S3_BUCKET_NAME` | ⬚ | Object storage bucket name |
| `SMTP_HOST` / `SMTP_PORT` | ⬚ | Email SMTP configuration |
| `GOOGLE_CLIENT_ID` | ⬚ | Google OAuth client ID |
| `GITHUB_CLIENT_ID` | ⬚ | GitHub OAuth client ID |

---

## Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "describe_change"

# Apply all pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

---

## Background Workers & Resilient Certificate Generation

Start the Celery worker for background tasks (emails, certificate generation):

```bash
celery -A app.workers.celery_app worker --loglevel=info
```

Or via Docker Compose (already configured):
```bash
docker compose up celery-worker -d
```

### In-Process Fallback Logic

To ensure students are never locked out of their certificates when Redis/Celery is offline or S3 upload fails:
1. **Redis Health Check**: The service performs a quick non-blocking port ping to check if Redis broker is online before scheduling Celery tasks.
2. **In-Process Compilation**: If Redis is offline, the certificate is compiled synchronously in-process using WeasyPrint.
3. **Dynamic On-The-Fly Fallback**: If S3 uploads fail, the platform records the fallback path `/api/v1/certificates/fallback/{verification_id}.pdf` in the database. When requested, the endpoint compiles the HTML/PDF certificate on-the-fly and streams it to the user.

---

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=term-missing

# Run specific test file
pytest app/tests/unit/test_auth_service.py
```

---

## Deployment

### Production Checklist

- [ ] Set `ENVIRONMENT=production` and `DEBUG=false`
- [ ] Use a strong, unique `JWT_SECRET_KEY` (Enforced: The app will fail to start in production if the default `CHANGE_ME_GENERATE_A_SECURE_RANDOM_KEY` placeholder is used)
- [ ] Set `DATABASE_URL` to a production PostgreSQL database (Enforced: The app will block starting if a local SQLite database is used with `ENVIRONMENT=production` or `staging`)
- [ ] Configure `REDIS_URL` pointing to a running Redis instance (Enforced: Silent in-memory fallback for rate limiting is disabled in production/staging; a functional Redis connection check is performed during startup)
- [ ] Configure real Stripe keys (not test keys)
- [ ] Set up proper SMTP for transactional emails
- [ ] Configure S3 bucket with proper IAM policies
- [ ] Set `ALLOWED_ORIGINS` to your frontend domain
- [ ] Enable HTTPS (TLS) via reverse proxy
- [ ] Run migrations before deploying new version
- [ ] Set up monitoring (Sentry, health checks)

### Docker Production Build

```bash
docker build -t academy-backend ./backend
docker run -p 8000:8000 --env-file backend/.env academy-backend
```

---

## User Roles & Permissions

| Role | Description | Key Access |
|------|-------------|------------|
| **Student** | Registered learner | Enroll, track progress, earn certificates |
| **Instructor** | Course teacher | Create/edit own courses, view student stats |
| **Corporate Client** | Organization HR | View org enrollments, invoices, cohort progress |
| **Admin** | Platform operator | Full CRUD on all entities, audit logs, metrics |

RBAC is enforced server-side via a granular **permissions matrix** (`roles → role_permissions → permissions`), not just role name checks. The seed script creates 60 default permissions across 15 resources.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat(scope): description`
4. Write tests alongside your implementation
5. Ensure linting passes: `ruff check app/ && black --check app/ && mypy app/`
6. Submit a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ using FastAPI, SQLAlchemy, and PostgreSQL
</p>
