# Engineering Instructions for Coding Agents
## How Every AI Coding Agent (Claude Code, Codex, Cursor, Cline, Gemini CLI, etc.) Must Work on This Project

**Stack:** FastAPI (backend) + Next.js/TypeScript (frontend) + PostgreSQL + Redis
**Read this file before writing any code. Read `/docs/prd.md` before touching this file's scope.**

---

## 1. Project Rules

1. This is a **production-grade codebase**, not a prototype. Never generate placeholder, "TODO later," or fake/mock implementations in place of real logic unless explicitly asked for a stub and clearly marked `# STUB:` with a linked ticket/reason.
2. Always check `/docs/prd.md` and `/docs/architecture.md` before implementing a feature. If a request conflicts with those docs, flag the conflict instead of silently deviating.
3. Never invent new architectural patterns mid-project. If an existing pattern solves the problem, reuse it.
4. Every change must be scoped — do not refactor unrelated code in the same change unless asked.
5. Ask for clarification only when a requirement is genuinely ambiguous and guessing wrong would be costly (e.g., payment logic, auth logic). Otherwise, make a reasonable assumption, state it in the PR/commit description, and proceed.

---

## 2. Architecture Rules

1. Follow **Clean Architecture** boundaries in the backend:
   - `api/` (routers — HTTP layer only, no business logic)
   - `services/` (business logic — framework-agnostic where possible)
   - `repositories/` (data access — all DB queries live here, never in routers or services)
   - `schemas/` (Pydantic request/response models)
   - `models/` (SQLAlchemy ORM models)
   - `core/` (config, security, dependencies, exceptions)
2. Routers **must not** contain SQL/ORM calls directly. Routers call services; services call repositories.
3. Business logic never lives inside frontend components. The frontend is a consumer of the API — it renders, validates UX-level input, and calls endpoints. Authoritative validation and business rules live server-side.
4. Follow **SOLID**, **DRY**, **KISS**. Prefer composition over inheritance, especially in service classes.
5. Never duplicate logic across routers/services — extract shared logic into a service or utility.
6. Cross-cutting concerns (auth, logging, rate limiting, error handling) are implemented as FastAPI dependencies/middleware, not repeated per-route.

---

## 3. Naming Conventions

**Backend (Python / FastAPI):**
- Files/modules: `snake_case.py`
- Classes: `PascalCase` (e.g., `CourseService`, `UserRepository`)
- Functions/variables: `snake_case`
- Pydantic schemas: suffix by purpose — `CourseCreate`, `CourseUpdate`, `CourseRead`, `CourseOut`
- SQLAlchemy models: singular noun, `PascalCase` (e.g., `User`, `Course`, `Enrollment`)
- DB tables: plural, `snake_case` (e.g., `users`, `courses`, `enrollments`)
- Environment variables: `UPPER_SNAKE_CASE`

**Frontend (TypeScript / Next.js):**
- Components: `PascalCase.tsx` (e.g., `CourseCard.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useAuth.ts`)
- Utilities: `camelCase.ts`
- Route folders (App Router): `kebab-case` matching URL segments
- Types/interfaces: `PascalCase`, prefer `type` unless extension/merging is needed (`interface`)
- Zod schemas: suffix `Schema` (e.g., `loginSchema`)

**General:**
- No abbreviations that aren't obvious (`usr`, `crs` — forbidden; `user`, `course` — required).
- Boolean variables/flags prefixed `is_`, `has_`, `can_` (Python) or `is`, `has`, `can` (TS).

---

## 4. Folder Structure

### Backend (`/backend`)
```
backend/
├── app/
│   ├── main.py                  # FastAPI app entrypoint
│   ├── core/
│   │   ├── config.py             # Settings (pydantic-settings)
│   │   ├── security.py           # JWT, password hashing
│   │   ├── dependencies.py       # get_current_user, RBAC guards
│   │   ├── exceptions.py         # Custom exception classes
│   │   └── logging.py
│   ├── db/
│   │   ├── base.py               # Declarative base
│   │   ├── session.py            # Async session/engine
│   │   └── migrations/           # Alembic migrations
│   ├── models/                   # SQLAlchemy models (one file per domain)
│   ├── schemas/                  # Pydantic schemas (one file per domain)
│   ├── repositories/             # DB access layer
│   ├── services/                 # Business logic
│   ├── api/
│   │   └── v1/
│   │       ├── router.py         # Aggregates all v1 routers
│   │       └── routes/           # auth.py, courses.py, users.py, admin.py, etc.
│   ├── workers/                  # Background jobs (Celery/ARQ tasks)
│   └── tests/
│       ├── unit/
│       └── integration/
├── alembic.ini
├── pyproject.toml
└── Dockerfile
```

### Frontend (`/frontend`)
```
frontend/
├── app/
│   ├── (marketing)/               # Public pages: home, about, services, blog, research
│   ├── (academy)/                 # Course catalog, course detail
│   ├── (auth)/                    # login, signup, forgot-password, verify-email
│   ├── (dashboard)/
│   │   ├── student/
│   │   ├── instructor/
│   │   ├── client/                 # corporate client dashboard
│   │   └── admin/                  # admin panel
│   └── api/                        # Next.js route handlers ONLY for BFF concerns (never business logic)
├── components/
│   ├── ui/                         # shadcn/ui primitives
│   ├── shared/                     # cross-feature reusable components
│   └── feature/                    # feature-specific components, grouped by domain
├── lib/
│   ├── api-client.ts               # typed fetch wrapper for FastAPI
│   ├── auth.ts
│   └── utils.ts
├── hooks/
├── types/                          # Shared TS types (mirrors backend schemas)
├── styles/
└── public/
```

Root-level:
```
/docs/          # All planning docs (prd.md, architecture.md, database.md, etc.)
/backend/
/frontend/
docker-compose.yml
```

---

## 5. Commit Message Style

Use **Conventional Commits**:

```
<type>(<scope>): <short summary>

[optional body]
[optional footer: BREAKING CHANGE / Refs #ticket]
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `security`, `style`.

Examples:
- `feat(courses): add course enrollment endpoint`
- `fix(auth): correct refresh token expiry check`
- `security(api): add rate limiting to login endpoint`
- `docs(prd): update roadmap phase 6`

Rules:
- Scope = the module/domain affected (`auth`, `courses`, `payments`, `admin`, `db`, etc.)
- One logical change per commit.
- No commits with messages like `fix stuff`, `wip`, `update`.

---

## 6. Code Style

**Backend:**
- Format with `black`, lint with `ruff`, type-check with `mypy` (or `pyright`) — all must pass in CI.
- Full type hints on every function signature (params + return type).
- Async I/O throughout (`async def` for all route handlers and DB calls) — use `AsyncSession`, not sync sessions.
- Docstrings on all public service methods explaining purpose, params, return, and raised exceptions.
- No bare `except:` — always catch specific exceptions and re-raise as domain exceptions where appropriate.

**Frontend:**
- Format with `prettier`, lint with `eslint` (Next.js config), strict TypeScript (`strict: true` in `tsconfig.json`).
- No `any` type unless justified with a comment explaining why.
- Functional components only, with hooks. No class components.
- Co-locate component-specific styles/logic; shared logic goes in `hooks/` or `lib/`.

---

## 7. Component Rules (Frontend)

1. Every component must be reusable where reasonably possible — avoid one-off components duplicating existing UI patterns.
2. Presentational components (`components/ui`, `components/shared`) must not fetch data directly — they receive data via props.
3. Data-fetching lives in server components (Next.js App Router) or dedicated hooks using TanStack Query for client-side fetching/caching.
4. Forms use **React Hook Form + Zod** for schema validation; validation schema should mirror backend Pydantic schema constraints.
5. All interactive components must be keyboard-accessible and use semantic HTML/ARIA attributes (see Accessibility Rules).

---

## 8. API Rules

1. All endpoints versioned under `/api/v1/...`. Breaking changes require a new version (`/api/v2`), not silent changes to `/v1`.
2. Every endpoint has:
   - A Pydantic request schema (if applicable) and response schema.
   - Explicit `status_code` on success.
   - Documented via FastAPI's automatic OpenAPI (docstring + `response_model` + `responses={}` for error cases).
3. Consistent error response shape across the entire API:
   ```json
   { "error": { "code": "string", "message": "string", "details": {} } }
   ```
4. Protected routes use a FastAPI dependency (`Depends(get_current_user)`, `Depends(require_role("admin"))`) — never manual token parsing inside route bodies.
5. Pagination is consistent across all list endpoints: `?page=&page_size=` with response envelope `{ items, total, page, page_size }`.
6. Idempotency: payment webhook handlers and any endpoint that can be safely retried must be idempotent (check for existing processed event ID before acting).
7. Full CRUD for admin-managed resources (courses, blog, services, users) must respect RBAC at the dependency level, not just hide UI elements on the frontend.

---

## 9. Database Rules

1. All schema changes go through **Alembic migrations** — never modify the DB schema by hand or via ad hoc scripts.
2. Every table has: `id` (UUID primary key), `created_at`, `updated_at` (and `deleted_at` for soft-deletable entities).
3. Foreign keys are always indexed. Add indexes for any column used in frequent `WHERE`/`JOIN`/`ORDER BY` clauses.
4. Use database-level constraints (unique, not-null, foreign key, check) — do not rely on application logic alone for data integrity.
5. No raw SQL string interpolation. Use SQLAlchemy Core/ORM constructs exclusively.
6. Soft-delete pattern for user-facing content (courses, blog posts) to preserve referential history; hard-delete only for genuinely ephemeral data (e.g., expired sessions).
7. See `/docs/database.md` for the full entity list and relationships — do not create new top-level entities without updating that doc first.

---

## 10. Security Rules

1. Passwords hashed with **argon2** or **bcrypt** — never store plaintext or reversibly-encrypted passwords.
2. JWT access tokens short-lived (≈15 min); refresh tokens stored in httpOnly, secure, SameSite=strict cookies.
3. Every protected route enforces RBAC server-side via dependency injection — frontend role checks are UX-only, never the source of truth.
4. All external input validated via Pydantic (backend) and Zod (frontend) — never trust client-supplied data, including values that "should" be safe (e.g., IDs, roles, prices).
5. Rate-limit auth endpoints, contact/booking/quote forms, and search endpoints.
6. Set secure headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) at the reverse-proxy or middleware layer.
7. File uploads: validate MIME type and size server-side (never trust the client-reported type), store in object storage, serve via signed URLs — never store user uploads on the app server's local filesystem.
8. Never log secrets, tokens, passwords, or full payment details.
9. All secrets (DB credentials, API keys, JWT signing keys) come from environment variables / secret manager — never hardcoded, never committed.
10. Every state-changing admin/auth action is written to the audit log (actor, action, target, timestamp, IP).

---

## 11. Testing Rules

1. **Backend:** `pytest` with `pytest-asyncio`. Minimum coverage:
   - Unit tests for all service-layer business logic.
   - Integration tests for all API endpoints (happy path + at least one failure/permission-denied path).
   - Repository tests against a real (test) PostgreSQL instance, not mocked, for query correctness.
2. **Frontend:** Component tests (`vitest`/`jest` + Testing Library) for interactive components; at least one E2E test (Playwright) per core user flow (signup → enroll → complete course → certificate; booking a consultation; admin publishing a blog post).
3. No feature is "done" without a corresponding test. Tests are written alongside the implementation, not deferred.
4. CI must run: lint, type-check, unit tests, integration tests before merge is allowed.

---

## 12. Documentation Rules

1. Every new module gets a short module-level docstring/README explaining its purpose.
2. Every new API endpoint is self-documenting via FastAPI's OpenAPI (title, description, response models) — the `/docs` (Swagger) page must always accurately reflect the live API.
3. Non-obvious business logic gets inline comments explaining *why*, not *what*.
4. Update `/docs/database.md`, `/docs/api.md`, or `/docs/ui-pages.md` whenever you add a new entity, endpoint, or page — these docs must never drift from the actual implementation.

---

## 13. Accessibility Rules

1. WCAG 2.1 AA is the baseline for all pages, including dashboards.
2. Semantic HTML first (`<button>`, `<nav>`, `<main>`, `<form>`) — ARIA roles only to fill genuine gaps, not as a substitute.
3. All interactive elements reachable and operable via keyboard; visible focus states required.
4. All images require meaningful `alt` text (or `alt=""` if purely decorative).
5. Color contrast must meet AA minimums; never convey state (error/success) by color alone.
6. Forms: every input has an associated `<label>`; errors are announced (via `aria-live` or equivalent) not just shown visually.

---

## 14. Performance Rules

1. Public/marketing/blog/course pages use SSR or ISR (Next.js) — never client-side-only render content that needs to be indexed by search engines.
2. Images served via Next.js `<Image>` with proper sizing/formats (WebP/AVIF) and lazy loading below the fold.
3. Backend: use `async` DB drivers (e.g., `asyncpg`), connection pooling, and avoid N+1 queries — use eager loading (`selectinload`/`joinedload`) where relationships are accessed in list views.
4. Cache expensive/read-heavy, infrequently-changing data (e.g., published course catalog) in Redis with sensible TTLs and explicit invalidation on writes.
5. Long-running or non-critical-path work (emails, certificate generation, webhooks side-effects) goes to a background queue — never block the request/response cycle.

---

## 15. Error Handling Rules

1. Backend: raise domain-specific exceptions (e.g., `CourseNotFoundError`, `InsufficientPermissionsError`) in the service layer; a global FastAPI exception handler maps these to the standard error response shape and correct HTTP status code.
2. Never leak internal details (stack traces, SQL errors, file paths) in API error responses — log them internally, return a generic safe message externally.
3. Frontend: every data-fetching hook/component handles loading, empty, and error states explicitly — no silent failures or blank screens.
4. User-facing error messages are actionable and human-readable; never show raw error codes/exceptions to end users.

---

## 16. Git Workflow & Branch Strategy

1. **Trunk-based with feature branches.** `main` is always deployable.
2. Branch naming: `feature/<scope>-<short-desc>`, `fix/<scope>-<short-desc>`, `chore/<scope>-<short-desc>`.
3. All work happens in a feature branch off `main`, merged via Pull Request — no direct commits to `main`.
4. PRs require: passing CI, at least one review (or self-review checklist if solo/agent-driven), and an up-to-date branch (rebase or merge `main` in before merging).
5. Squash-merge preferred to keep `main` history clean and readable.
6. Use `develop`/`staging` branch only if a formal staging environment requires a distinct deploy target from `main`; otherwise deploy `main` directly to staging on merge, and tag releases for production.

---

## 17. Deployment Rules

1. Both `backend` and `frontend` are containerized (`Dockerfile` each); local dev uses `docker-compose.yml` (Postgres, Redis, backend, frontend).
2. Environments: `local` → `staging` → `production`, each with isolated databases and environment variables — production secrets never touch staging/local.
3. Database migrations run automatically (or as an explicit, logged step) as part of the deploy pipeline, before the new app version receives traffic.
4. CI/CD pipeline stages: lint → type-check → test → build → migrate → deploy → smoke test.
5. Zero-downtime deploys expected once traffic matters (rolling/blue-green) — avoid deploy strategies that drop in-flight requests.
6. Health-check endpoints (`/healthz`, `/readyz`) required on the backend for orchestration/load-balancer checks.

---

## 18. Non-Negotiables (Summary)

- Never duplicate code — extract and reuse.
- Never hardcode secrets.
- Never put business logic inside UI components.
- Always follow Clean Architecture layering on the backend.
- Always follow SOLID, DRY, KISS.
- Always prefer composition over inheritance.
- Always write production-ready code — no placeholder implementations.
- Always enforce RBAC server-side, never trust the frontend for authorization.
- Always validate all input server-side, regardless of frontend validation.
- Always write tests alongside features, not after.
- Always keep `/docs` in sync with the actual implementation.
