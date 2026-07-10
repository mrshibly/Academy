# Product Requirements Document (PRD)
## AI Development + Cybersecurity Academy & Services Platform

**Version:** 1.0
**Owner:** Product / Engineering
**Backend:** FastAPI (Python)
**Frontend:** Next.js (TypeScript)
**Status:** Draft for coding-agent execution

---

## 1. Executive Summary

This platform is a production-grade, SaaS-ready business website for a company that offers **AI development services, cybersecurity services (including offensive security), software/web/mobile development, and professional training/academy programs**. It is not a marketing landing page — it is the foundation of a future **Learning Management System (LMS)** and **Client Portal**, and must be architected accordingly from day one.

The system has three converging product lines that must stay structurally distinct but share one identity and one codebase:

1. **Marketing & Business Site** — services, case studies, blog, research, contact/lead generation.
2. **Academy / LMS** — courses, cohorts, live training, corporate training, certifications.
3. **Client & Admin Portals** — dashboards for students, instructors, corporate clients, and internal admins/staff.

Backend is built on **FastAPI** for speed, async I/O, automatic OpenAPI documentation, and strong typing via Pydantic. Frontend is **Next.js** to support SSR/ISR for SEO-critical marketing/blog pages while also supporting authenticated, client-rendered dashboard experiences in the same codebase.

---

## 2. Vision

To become the go-to authority and service provider at the intersection of **applied AI and offensive/defensive cybersecurity**, delivering:

- Enterprise-grade AI and security services to businesses.
- A respected training academy producing certified AI and cybersecurity practitioners.
- A scalable content and research hub that builds authority and inbound demand.

Long-term, the platform evolves into a multi-tenant SaaS offering (white-labeled academy instances, client security-testing portals, and API-driven integrations).

---

## 3. Business Goals

| Goal | Description | Success Metric |
|---|---|---|
| Lead generation | Convert visitors into service inquiries/consultation bookings | Booking conversion rate, qualified leads/month |
| Course sales | Sell self-paced and cohort-based courses | Enrollments/month, revenue/course |
| Corporate training | Land B2B training contracts | # corporate contracts, contract value |
| Brand authority | Publish research, blogs, advisories | Organic traffic, backlinks, domain authority |
| Retention | Keep students/clients engaged post-purchase | Course completion rate, repeat purchases |
| Platform scalability | Support future LMS/marketplace features without rewrite | Zero major re-architecture events in 18 months |

---

## 4. User Personas

| Persona | Description | Primary Needs |
|---|---|---|
| **Student** | Individual learner buying courses | Clear curriculum, progress tracking, certificates |
| **Corporate Client (HR/L&D)** | Books corporate training/bootcamps | Custom quotes, invoicing, cohort management, reporting |
| **Business Owner / Decision Maker** | Seeking AI/security services | Clear service scope, case studies, easy consultation booking |
| **Researcher** | Reads whitepapers/advisories | Credible, well-organized research content, citations |
| **Recruiter / Partner** | Evaluates company credibility, careers | Careers page, team credentials, case studies |
| **Instructor** | Teaches/manages courses | Course authoring tools, student management, earnings visibility |
| **Admin / Staff** | Runs the business day-to-day | Full CMS + operational dashboards |

---

## 5. User Journeys

### 5.1 Visitor Journey
Landing → browse Services or Academy → read a blog/case study → build trust → book a consultation or start course checkout → becomes lead or customer.

### 5.2 Student Journey
Discover course → view curriculum/instructor/reviews → purchase or enroll → access Student Dashboard → consume lessons → complete quizzes/assignments → earn certificate → receive completion email → (optional) leave a review → get upsold to next course/corporate track.

### 5.3 Corporate Client Journey
Land on Corporate Training page → request a quote → sales/admin follow-up (offline or via CRM-like admin tool) → contract created → cohort created in Admin Panel → employees invited/enrolled → HR views Client Dashboard for progress/reporting → invoice issued → training completed → certificates issued in bulk.

### 5.4 Returning User Journey
Login → personalized dashboard (based on role) → resumes course / views new services / checks ticket status / downloads invoice.

---

## 6. Information Architecture (Sitemap)

```
Home

About
├── Company
├── Team
├── Careers
├── Partners

Services
├── AI Development
│   ├── Custom AI Solutions
│   ├── LLM Applications
│   ├── AI Agents
│   ├── Computer Vision
│   ├── NLP
│   └── MLOps
├── Cybersecurity
│   ├── Penetration Testing (Web / Mobile / API / Network)
│   ├── Cloud Security
│   ├── AI Security
│   ├── Secure Code Review
│   ├── Red Teaming
│   ├── Active Directory Security
│   └── Social Engineering Simulation
├── Web Development
├── Mobile Development
├── AI Security
└── Research & Consulting

Academy
├── AI Track
├── Cybersecurity Track
├── Development Track
├── Learning Paths
├── Certifications

Training
├── Live Bootcamps
├── Corporate Training
├── Workshops
├── Certification Programs

Research
├── Publications
├── Whitepapers
├── Security Advisories
├── AI Research

Blog
├── AI
├── Cybersecurity
├── Tutorials
├── Company News

Resources
├── Documentation
├── Tools
├── Downloads
├── FAQs

Contact
├── Book Consultation
├── Request a Quote
├── Support

Dashboards (auth-gated)
├── Student Dashboard
├── Instructor Dashboard
├── Client (Corporate) Dashboard
└── Admin Dashboard
```

> Full page-by-page breakdown lives in `/docs/ui-pages.md`. Full route inventory lives in `/docs/sitemap.md`.

---

## 7. Features

### 7.1 Core Feature List
- Authentication & Authorization (email/password + OAuth, role-based)
- Service pages (marketing, static/CMS-driven)
- Course Catalog & Course Detail pages
- Academy / LMS engine (modules, lessons, progress, quizzes, assignments)
- Blog (categories, tags, MDX/rich content)
- Research & Publications hub
- Contact / Lead capture forms
- Careers page + job applications
- Pricing pages (courses + service packages)
- Consultation Booking (calendar-based scheduling)
- Quote Request flow (for services/corporate training)
- Payments (course/service checkout, invoices)
- Student Dashboard
- Instructor Dashboard
- Corporate Client Dashboard
- Admin Dashboard (full CMS + operations)
- Certificates (auto-generated PDF on completion)
- Corporate Training / Cohort Management
- Email Notifications (transactional + marketing)
- SEO (metadata, sitemap.xml, structured data)
- Analytics (event tracking, admin-facing dashboards)
- Global Search (courses, blog, services, docs)
- CMS for blog/services/research (admin-managed content)
- Support Ticketing (basic helpdesk for students/clients)
- Audit Logging (admin/security actions)

### 7.2 Feature Requirements Detail

Each feature below follows: **Description / Acceptance Criteria / Priority / Dependencies / Future Improvements**.

#### Authentication
- **Description:** Secure account creation, login, session/token management, password reset, email verification, role assignment.
- **Acceptance Criteria:**
  - Users can register with email/password; email verification required before full access.
  - JWT access token (short-lived) + refresh token (httpOnly cookie) issued on login.
  - Password reset via time-limited signed token sent by email.
  - OAuth (Google, GitHub) supported as alternate login.
  - Role is embedded in token claims and enforced server-side on every protected route.
- **Priority:** P0
- **Dependencies:** Database, Email service
- **Future Improvements:** SSO/SAML for enterprise clients, MFA (TOTP), passkeys.

#### Course Catalog
- **Description:** Public listing/filtering/searching of courses by track, level, price, tags.
- **Acceptance Criteria:** Paginated API, filters (category, price range, level), course cards show price/duration/level/instructor.
- **Priority:** P0
- **Dependencies:** Courses table, Categories/Tags
- **Future Improvements:** Personalized recommendations.

#### Service Pages
- **Description:** Structured, CMS-editable service pages matching the sitemap (AI Dev, Cybersecurity sub-services, etc.).
- **Acceptance Criteria:** Each service has: hero, description, deliverables, process, case studies/testimonials, CTA (book consultation/get quote).
- **Priority:** P0
- **Dependencies:** CMS, Media storage
- **Future Improvements:** Service-specific ROI calculators.

#### Blog
- **Description:** Full blog engine with categories/tags, author attribution, rich content (MDX or block-based).
- **Acceptance Criteria:** Admin can create/edit/publish/schedule posts; public list + detail pages are SSR/ISR for SEO; RSS feed available.
- **Priority:** P1
- **Dependencies:** CMS, Auth (author identity)
- **Future Improvements:** Comments, newsletter auto-digest.

#### Research Pages
- **Description:** Publications, whitepapers, security advisories with downloadable PDFs.
- **Acceptance Criteria:** Each entry has abstract, authors, publish date, downloadable file, optional CVE/advisory metadata for security advisories.
- **Priority:** P2
- **Dependencies:** File storage
- **Future Improvements:** Citation export (BibTeX).

#### Contact / Booking / Quote
- **Description:** Contact form, consultation booking (calendar), corporate quote request.
- **Acceptance Criteria:** Forms validate server-side, persist to DB, trigger email to admin + confirmation to user; booking includes date/time slot selection with conflict prevention.
- **Priority:** P0
- **Dependencies:** Email service, Bookings table
- **Future Improvements:** Calendar sync (Google Calendar), automated reminders.

#### Payments
- **Description:** Checkout for courses and service deposits/invoices.
- **Acceptance Criteria:** Supports at least one payment gateway (e.g., Stripe) at launch; generates Order + Invoice records; webhook-driven payment status updates; idempotent webhook handling.
- **Priority:** P0
- **Dependencies:** Orders, Invoices, Payment gateway
- **Future Improvements:** Multiple gateways (regional, e.g., local payment processors), subscriptions/installments.

#### Student Dashboard
- **Description:** Enrolled courses, progress, certificates, purchase history.
- **Acceptance Criteria:** Shows per-course completion %, resumes last lesson, lists earned certificates with download links.
- **Priority:** P0
- **Dependencies:** Auth, Enrollments, Certificates
- **Future Improvements:** Learning streaks, gamification.

#### Instructor Dashboard
- **Description:** Course authoring, student roster, engagement stats.
- **Acceptance Criteria:** Instructor can create/edit their own courses (subject to admin approval before publish), view enrolled student count and completion stats.
- **Priority:** P1
- **Dependencies:** Auth, Courses, Enrollments
- **Future Improvements:** Direct messaging with students, revenue share reporting.

#### Client (Corporate) Dashboard
- **Description:** Cohort progress, invoices, training schedule for corporate accounts.
- **Acceptance Criteria:** HR/client user can view all employees enrolled under their organization, aggregate completion %, download invoices.
- **Priority:** P1
- **Dependencies:** Organizations, Enrollments, Invoices
- **Future Improvements:** Custom reporting exports (CSV/PDF).

#### Admin Panel
- **Description:** Central operations console — manage all entities (users, courses, blog, services, bookings, payments, tickets).
- **Acceptance Criteria:** Role-gated; full CRUD on all content entities; user role management; audit log view; dashboard with key business metrics.
- **Priority:** P0
- **Dependencies:** All modules
- **Future Improvements:** Configurable dashboards/widgets.

#### Certificates
- **Description:** Auto-generated PDF certificate on course completion.
- **Acceptance Criteria:** Includes unique verification ID; public verification page (`/verify/{cert_id}`).
- **Priority:** P1
- **Dependencies:** Enrollments, PDF generation service
- **Future Improvements:** Blockchain-backed verification (long-term/optional).

#### Training / Cohort Management
- **Description:** Manage live bootcamps, cohorts, schedules, corporate training batches.
- **Acceptance Criteria:** Admin creates a cohort tied to a course/track with start/end dates, capacity, assigned instructor; students/employees are enrolled into a specific cohort.
- **Priority:** P1
- **Dependencies:** Courses, Organizations, Enrollments
- **Future Improvements:** Live session integration (Zoom/Meet links, attendance tracking).

#### Email Notifications
- **Description:** Transactional emails (verification, booking confirmation, payment receipt, certificate issued) + marketing (newsletter).
- **Acceptance Criteria:** Uses templated emails, queued via background worker, retries on failure.
- **Priority:** P0
- **Dependencies:** Email provider (SMTP/API), Queue
- **Future Improvements:** In-app notification center.

#### SEO
- **Description:** Metadata, sitemap.xml, robots.txt, structured data (JSON-LD), OpenGraph/Twitter cards.
- **Acceptance Criteria:** All public pages have unique title/description; sitemap.xml auto-generated and includes all published content; Lighthouse SEO score ≥ 90.
- **Priority:** P0
- **Dependencies:** Next.js metadata API
- **Future Improvements:** Multi-language hreflang support.

#### Analytics
- **Description:** Track key events (signup, enrollment, purchase, booking) and surface in Admin dashboard.
- **Acceptance Criteria:** Event pipeline captures core funnel events; admin dashboard shows counts/trends over time ranges.
- **Priority:** P2
- **Dependencies:** Analytics provider or internal events table
- **Future Improvements:** Cohort/funnel analysis, A/B testing.

#### Search
- **Description:** Global search across courses, blog, services, docs.
- **Acceptance Criteria:** Single search endpoint returns ranked, typed results across content types; debounced client-side search UI.
- **Priority:** P2
- **Dependencies:** Postgres full-text search (initial), pluggable for a dedicated search engine later
- **Future Improvements:** Dedicated search engine (e.g., Meilisearch/OpenSearch) for relevance/typo-tolerance.

#### CMS
- **Description:** Admin-managed content for blog/services/research without redeploying code.
- **Acceptance Criteria:** Content editable via Admin Panel using a rich text/block editor; supports draft/published/scheduled states.
- **Priority:** P1
- **Dependencies:** Admin Panel, Media storage
- **Future Improvements:** Versioning/rollback, multi-editor workflows with approvals.

#### Support Ticketing
- **Description:** Lightweight helpdesk for student/client issues.
- **Acceptance Criteria:** User can open a ticket, add replies; admin can view/respond/close from Admin Panel.
- **Priority:** P2
- **Dependencies:** Auth, Email
- **Future Improvements:** SLA tracking, ticket categories/routing.

#### Audit Logs
- **Description:** Record sensitive admin/security-relevant actions.
- **Acceptance Criteria:** Every create/update/delete on protected entities and every auth event (login, role change, permission change) is logged with actor, timestamp, IP, and diff.
- **Priority:** P1
- **Dependencies:** All modules
- **Future Improvements:** SIEM export.

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | API p95 response time < 300ms for standard CRUD reads; homepage/blog pages First Contentful Paint < 1.5s via SSR/ISR |
| **Accessibility** | WCAG 2.1 AA compliance across all public and dashboard pages |
| **SEO** | Server-rendered/ISR pages for all public marketing/blog/course content; full structured data |
| **Security** | See Section 9 |
| **Scalability** | Stateless FastAPI app servers (horizontally scalable); DB connection pooling; background jobs offloaded to a queue |
| **Internationalization** | Architecture must support i18n (content/locale fields) even if only English ships at launch |
| **Responsiveness** | Fully responsive from 320px to 4K; mobile-first for public pages |
| **Browser Support** | Latest 2 versions of Chrome, Firefox, Safari, Edge |
| **Observability** | Structured logging, health-check endpoints, error tracking integration (e.g., Sentry) |
| **Availability** | Target 99.5% uptime for production once live |

---

## 9. Security Requirements

| Area | Requirement |
|---|---|
| **Authentication** | JWT access tokens (short TTL, e.g., 15 min) + refresh tokens (httpOnly, secure, SameSite=strict cookies); password hashing with bcrypt/argon2 |
| **Authorization** | Role-Based Access Control (RBAC) enforced at the API layer via FastAPI dependencies on every protected route — never trust frontend role checks alone |
| **Rate Limiting** | Applied per-IP and per-account on auth endpoints, contact/booking forms, and search |
| **CSRF** | CSRF protection for cookie-based session actions; SameSite cookies as first line of defense |
| **XSS** | All user-generated content sanitized before render (backend sanitization + frontend escaping); CSP headers set |
| **SQL Injection** | ORM (SQLAlchemy) with parameterized queries only — no raw string-interpolated SQL |
| **Secure Headers** | HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Content-Security-Policy |
| **Audit Logs** | See Section 7.2 Audit Logs feature |
| **Encryption** | TLS in transit everywhere; sensitive fields (e.g., PII where applicable) encrypted at rest as needed |
| **Secrets Management** | No secrets in source control; environment variables / secret manager only |
| **File Uploads** | Type/size validation, virus-scan hook point, stored in object storage (not on app servers) with signed URLs |
| **Dependency Hygiene** | Automated dependency vulnerability scanning in CI |

---

## 10. User Roles & Permission Model

| Role | Description | Key Permissions |
|---|---|---|
| **Visitor** | Unauthenticated | Read public content, submit contact/booking forms |
| **Student** | Registered learner | Enroll/purchase, access purchased course content, manage own profile, view own certificates |
| **Instructor** | Teaches courses | CRUD own courses (draft), view own students/stats, cannot access other instructors' data |
| **Corporate HR / Client** | Represents an organization account | View org's cohort(s), invoices, aggregate progress; cannot see other orgs |
| **Admin** | Internal staff, full control | Full CRUD across all entities, user/role management, view audit logs, publish content |
| **Super Admin** *(optional, future)* | Owns platform-level config | Manage admins themselves, billing/plan config, feature flags |

> Permission enforcement is implemented as a permissions matrix (role → allowed actions per resource), not just role name checks, so granularity can grow without rewriting logic. Store as explicit `roles` + `permissions` + `role_permissions` tables (see `/docs/database.md`), not hardcoded enums only.

---

## 11. Future Roadmap (Post-MVP)

| Initiative | Description |
|---|---|
| **Full LMS** | Structured modules/lessons with video hosting, drip content, prerequisites |
| **AI Chatbot** | Support/sales assistant trained on company content |
| **Discussion Forum** | Per-course or global community discussions |
| **Assignments & Grading** | Submittable assignments with instructor grading/feedback |
| **Live Classes** | Integrated video conferencing + attendance tracking |
| **Quiz Engine** | Timed quizzes, question banks, auto-grading, retakes |
| **Lab Environment** | Sandboxed environments for cybersecurity practicals (e.g., containerized labs) |
| **Bug Bounty Platform** | Internal/public bug bounty program management |
| **Marketplace** | Third-party instructors/partners publishing courses on a revenue-share basis |
| **Multi-tenant SaaS** | White-label academy instances for partner organizations |

---

## 12. Recommended Tech Stack Summary

> Full detail in `/docs/backend.md`, `/docs/frontend.md`, `/docs/architecture.md`.

- **Backend:** FastAPI, Python 3.12+, SQLAlchemy 2.x (async), Alembic (migrations), Pydantic v2, PostgreSQL, Redis (cache + queue broker), Celery or ARQ (background jobs), JWT (python-jose / pyjwt), Passlib/argon2 for hashing.
- **Frontend:** Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui, React Hook Form + Zod, TanStack Query, Framer Motion.
- **Storage:** S3-compatible object storage for media/certificates/uploads.
- **Payments:** Stripe (primary), pluggable gateway abstraction for regional processors.
- **Email:** Transactional email API (e.g., SES/Postmark/Resend) + background queue.
- **Infra:** Dockerized services, CI/CD pipeline, staging + production environments.

---

## 13. Definition of Done (MVP)

The MVP is complete when:
1. All P0 features above are implemented and pass acceptance criteria.
2. Auth + RBAC is enforced across every protected route (verified via tests).
3. A student can discover → purchase → complete a course → download a certificate end-to-end.
4. A visitor can submit a booking/quote request and admin receives it and can act on it from the Admin Panel.
5. Public pages meet the SEO and performance NFRs.
6. Core security requirements (Section 9) are implemented and verified.
7. CI passes: linting, type-checking, unit tests, and at least one end-to-end happy-path test per core flow.
