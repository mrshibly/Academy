# 🎓 Academy — AI Development & Cybersecurity Services Platform

A production-grade, SaaS-ready platform for **AI development services, cybersecurity services, professional training, and an integrated Learning Management System (LMS)**. Built with **Next.js 16 (App Router)** on the frontend and **FastAPI** on the backend.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.133+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16+-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Playwright](https://img.shields.io/badge/PDF_Engine-Playwright-45BA4B?logo=playwright&logoColor=white)](https://playwright.dev)
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
- [Certificate Generation Engine](#certificate-generation-engine)
- [Testing](#testing)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

The platform serves three converging product lines under one unified codebase:

1. **Marketing & Corporate Site** — Services CMS, case studies, blog engine, research hub, and B2B quote request system.
2. **Academy / LMS** — Course catalog, syllabus builder, quiz assessment engine, and verified completion certificates.
3. **Multi-Role Portals** — Responsive dashboards for Students, Instructors, Corporate Clients, and Platform Admins.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Lucide React, Vanilla CSS Tokens |
| **Backend** | FastAPI (Python 3.11+), Pydantic v2 |
| **Database & ORM** | PostgreSQL / SQLite (async via `asyncpg` / `aiosqlite`), SQLAlchemy 2.x (async) |
| **Migrations** | Alembic |
| **PDF Generation** | Playwright (Headless Chromium) with WeasyPrint & HTML fallback |
| **Auth & Security** | JWT (httpOnly cookies) + Argon2id / bcrypt, RBAC permissions matrix |
| **Cache & Queue** | Redis 7, Celery background workers |
| **Payments** | Stripe Checkout & Idempotent Webhook Processing |
| **Storage** | S3-Compatible Object Storage (AWS S3 / MinIO) |

---

## Features

### 🎨 Modern UI & Responsive Design System
- **Mobile-First Responsive Layout**: Drawer navigation with translucent backdrop blur, auto Safari focus zoom prevention, and touch momentum scroll containers.
- **Touch Canvas Signature Drawing**: Scaled coordinate drawing canvas for instructor profiles and custom certificates.
- **Teal Wave & Gold Foil Certificates**: High-fidelity completion certificate design with custom calligraphy, award badge, and verification QR/Ledger.

### 🔐 Auth & Multi-Role Governance
- Access token & httpOnly refresh cookie lifecycle.
- Role-based permissions matrix (`Student`, `Instructor`, `Corporate Client`, `Admin`).
- Cryptographic certificate verification ledger (`/verify/{verification_id}`).

### 📚 LMS & Assessment Engine
- Syllabus hierarchy: Course → Modules → Lessons (Video, Document, Quiz).
- Real-time quiz score evaluation (80% passing threshold) & progress tracking.
- Direct PDF certificate download (`Content-Disposition: attachment`).

---

## Project Structure

```
Academy/
├── backend/                    # FastAPI Clean Architecture Backend
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint & middleware
│   │   ├── api/v1/             # REST endpoints (auth, courses, certificates, admin...)
│   │   ├── models/             # SQLAlchemy async models
│   │   ├── repositories/       # Encapsulated DB queries
│   │   ├── services/           # Domain business logic & Playwright PDF builder
│   │   └── schemas/            # Pydantic v2 validation models
│   ├── tests/                  # Pytest unit & integration test suites
│   ├── alembic.ini             # Database migration configuration
│   └── pyproject.toml
│
├── frontend/                   # Next.js 16 App Router Frontend
│   ├── src/
│   │   ├── app/                # App router pages (marketing, LMS, dashboards)
│   │   ├── components/         # Reusable UI components & SyllabusBuilder
│   │   └── context/            # AuthContext & global state providers
│   ├── public/                 # Static assets & media
│   └── package.json
│
├── docker-compose.yml
├── README.md
└── task.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+ & `npm`
- Python 3.11+
- Git

### 1. Run Backend Server (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -e ".[dev]"

# Seed default database
python -m scripts.seed

# Start dev server
python -m uvicorn app.main:app --port 8000 --reload
```
> Backend API will be live at `http://localhost:8000` (Swagger UI at `http://localhost:8000/docs`).

### 2. Run Frontend Server (Next.js)

```bash
cd frontend

# Install packages
npm install

# Start Next.js development server
npm run dev
```
> Web App will be live at `http://localhost:3000`.

---

## Certificate Generation Engine

The platform features an automated PDF rendering pipeline:

1. **Playwright Chromium Renderer**: Uses Headless Chromium (`playwright.sync_api` executed inside `asyncio.to_thread`) to capture 100% pixel-perfect PDFs with embedded Google Fonts (`Great Vibes`, `Dancing Script`, `Plus Jakarta Sans`) and SVG graphics.
2. **Network Idle Font Guarantee**: Uses `page.set_content(html, wait_until="networkidle")` to ensure remote web fonts are fully downloaded before printing to PDF.
3. **Resilient Fallback Pipeline**: If Playwright is offline, gracefully falls back to `WeasyPrint` or raw HTML streaming.
4. **Direct Download**: Served with `Content-Disposition: attachment; filename="certificate-[id].pdf"` for instant download across desktop and mobile devices.

---

## Testing

Run the pytest test suite in the `backend/` directory:

```bash
cd backend
python -m pytest app/tests/unit/test_certificates.py
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ using Next.js, FastAPI, and Playwright
</p>
