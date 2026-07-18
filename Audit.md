Academy Platform — Comprehensive Audit Report
Executive Summary
The Academy platform is a well-structured FastAPI + Next.js monorepo with clean architecture, proper RBAC, and a solid domain model. However, there are 5 critical bugs, 8 significant gaps, and 12+ improvement opportunities across both frontend and backend.
---
🔴 Critical Bugs (Must Fix)
BUG-1: Booking Form Sends Wrong Payload Shape
Severity: Critical | Location: book/page.tsx
The frontend booking form sends `{ scheduled_time, client_name, client_email, company_name, notes }` but the backend BookingCreate schema expects `{ name, email, phone, service_type, time_slot_id, notes }`.
```diff
# Frontend sends:
-  { scheduled_time, client_name, client_email, company_name, notes }
# Backend expects:
+  { name, email, phone, service_type, time_slot_id?, notes }
```
> [!CAUTION]
> This means **every booking submission from the UI will fail** with a 422 validation error. The form also doesn't fetch actual `TimeSlot` records from the API — it uses hardcoded date/time arrays that have no relationship to the `time_slots` table.
---
BUG-2: Course Approval Button Non-Functional
Severity: Critical | Location: Admin Dashboard → Course Manager
The "Approve" button on pending courses in the admin dashboard does nothing. The frontend likely calls `PATCH /api/v1/courses/{id}` with `{ status: "published" }`, but the backend course_service.py L39-40 has a guard:
```python
if not is_admin and "status" in kwargs:
    kwargs["status"] = CourseStatus.DRAFT
```
This guard is correct for non-admins, but the admin status check requires that `user` is extracted from the dependency. The route uses `dependencies=[Depends(require_role(...))]` separately from the `user: User = Depends(...)` param — need to verify that the admin dashboard page is actually sending the token and the correct `status` value in its PATCH request. The console showed no network error, suggesting the frontend handler may be incomplete or swallowing errors silently.
---
BUG-3: Dashboard Profile Page Hangs Indefinitely
Severity: Critical | Location: dashboard/layout.tsx + `/dashboard/profile`
Navigating to `/dashboard/profile` shows "Loading workspace..." spinner forever. The dashboard layout.tsx renders the loading spinner while `loading` is true. The profile page path `/dashboard/profile` doesn't match any of the RBAC redirect paths (`/dashboard/admin`, `/dashboard/instructor`, `/dashboard/student`), but the profile directory exists at dashboard/profile/page.tsx.
The hang suggests the `loading` state from `useAuth()` never resolves to `false` for this route, or the profile page itself has an unresolved data fetch that prevents render completion.
---
BUG-4: Admin Sidebar Links Not Clickable (Service Editor & Bookings Catalog)
Severity: High | Location: Sidebar.tsx
The sidebar entries for "Service Editor" (`/dashboard/admin/services`) and "Bookings Catalog" (`/dashboard/admin/bookings`) are defined in the nav data correctly but appear as non-interactive text in the UI. While navigating directly to the URLs works, the sidebar links themselves are broken — likely a rendering issue in the sidebar component where this "Services" category is not rendering its items as `<Link>` elements properly.
---
BUG-5: `with_for_update()` Fails on SQLite
Severity: High | Location: booking_repository.py L22-28
```python
async def get_slot_for_update(self, slot_id: UUID) -> TimeSlot | None:
    result = await self.db.execute(
        select(TimeSlot)
        .where(TimeSlot.id == slot_id, TimeSlot.is_available == True)
        .with_for_update()  # ← Not supported by SQLite!
    )
```
The local dev environment uses SQLite (`DATABASE_URL=sqlite+aiosqlite://...`), but `SELECT ... FOR UPDATE` is a PostgreSQL-only feature. Any booking that includes a `time_slot_id` will crash with a database error.
---
🟠 Significant Gaps
GAP-1: PostgreSQL-Specific Types Used with SQLite
Location: db/base.py, booking.py
Multiple models import `from sqlalchemy.dialects.postgresql import UUID` and use `UUID(as_uuid=True)`. While SQLAlchemy can fall back for some operations, this creates fragile behavior with SQLite. The codebase should either:
Commit fully to PostgreSQL (even for local dev via Docker)
Or use `sqlalchemy.types.Uuid` (SA 2.0+) which is dialect-agnostic
---
GAP-2: No Token Blacklisting / Refresh Token Rotation
Location: auth_service.py
The refresh token flow generates new tokens but never invalidates the old ones. An attacker who steals a refresh token can use it indefinitely since:
There is no server-side token store / blacklist
Old refresh tokens are not revoked when new ones are issued
The `/logout` endpoint only clears the cookie client-side — the token itself remains valid
---
GAP-3: Email Tasks Fail Silently Without Celery
Location: auth_service.py L56-63
During registration and password reset, `send_email_task.delay()` is called unconditionally. If Redis/Celery is offline (which is the current state), this call will raise a `ConnectionError` — but it happens after the user is created and committed. This means:
Registration succeeds but the verification email never sends
Password reset appears to work but no email arrives
No fallback or user-visible feedback about email delivery failure
---
GAP-4: Enrollment Route `/{enrollment_id}` Has Inline DB Queries
Location: enrollments.py L63-113
The `get_enrollment_detail` route contains raw `select()` queries, model imports, and business logic directly in the router — violating Clean Architecture. This should be delegated to the service layer.
---
GAP-5: Payment Service Has Unreachable `course` Reference
Location: payment_service.py L56
```python
order_currency = "BDT" if (len(order_items_data) > 0 and course.currency.upper() == "BDT") else "USD"
```
The variable `course` is scoped inside the `for item in items` loop but referenced outside it. If `items` is empty, this raises `NameError`. If there are multiple items, it incorrectly uses only the last course's currency.
---
GAP-6: No Alembic Migration History
Location: backend/app/db/migrations/
The project uses SQLite with what appears to be a manually-created database (`academy.db`). There are no migration files visible, meaning schema changes are applied ad-hoc. Per the project's own rules, all schema changes must go through Alembic.
---
GAP-7: Frontend Calls `/api/v1/auth/refresh` Without Credentials
Location: AuthContext.tsx L63-79
```typescript
const res = await fetch("/api/v1/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" }
});
```
The refresh endpoint expects the refresh token either as an httpOnly cookie or in the request body. The `fetch` call sends neither — no `credentials: "include"` (for cookies) and no JSON body with the token.
---
GAP-8: Missing `Contact` and `Quote` Frontend → Backend Mapping
Location: Footer links `/services/ai-dev`, `/services/pentesting`, `/services/cloud-sec`, `/services/app-pentest`
These footer service sub-page links return 404 — the services page exists at `/services` but there are no sub-route pages. The `/contact` page exists but is separate from the `/quote` page CTA on the homepage.
---
🟡 Visual & UX Issues
VIS-1: Homepage Uses External Unsplash Images (No Fallback)
Location: page.tsx
The homepage loads 8 high-resolution images directly from `images.unsplash.com`. These will:
Fail if the user is offline
Add ~5-10s of load time on slow connections
Violate the project's own Performance Rule #2 (use Next.js `<Image>` with proper sizing)
> [!WARNING]
> All images use raw `<img>` tags with no lazy loading, no `srcSet`, no WebP/AVIF optimization, and no `next/image` wrapper. This significantly hurts Core Web Vitals (LCP).
---
VIS-2: Course Descriptions Contain Placeholder/Gibberish Text
Some course entries in the database have descriptions like `"djfidjfdkjfdkjfdkjfkd"`. These render on the public `/academy` catalog — poor first impression for visitors.
---
VIS-3: Booking Page Has Hardcoded Static Dates (Already Past)
Location: book/page.tsx L16-22
The dates are hardcoded as `"Mon, Jul 13"` through `"Fri, Jul 17"` — these dates may already be in the past. The page should dynamically generate dates or fetch from the API's `GET /api/v1/bookings/slots`.
---
VIS-4: Inline Styles Everywhere Instead of CSS Classes
The entire frontend uses inline `style={{...}}` objects on every element (591 lines in `page.tsx` alone). This:
Prevents responsive design via media queries
Cannot use hover/focus pseudo-classes
Makes the codebase very hard to maintain
Bloats HTML output
---
VIS-5: Navbar Dropdown Doesn't Close on Outside Click
Location: Navbar.tsx
The user profile dropdown toggles on click but has no `onClickOutside` handler. Clicking anywhere else on the page leaves the dropdown open.
---
VIS-6: Footer Contact Info Is Placeholder
Location: layout.tsx L69-72
The footer shows "Silicon Valley, CA" and a fake US phone number, but the platform is clearly targeted at Bangladesh (BDT currency, "Bangladeshi Instructors", SSLCommerz integration). This creates a credibility disconnect.
---
🔵 Technical Improvement Recommendations
#	Area	Recommendation
1	Testing	Only 8 tests exist. Need integration tests for all API endpoints, especially payments, enrollments, and course approval flows
2	Error handling	Frontend `handleBook` uses `alert()` for errors — should use the existing `Toast` component
3	Docker	`docker-compose.yml` references `./backend/.env` as `env_file` but also hardcodes `DATABASE_URL` in `environment:` — the env var will override `.env`, making the file partially misleading
4	Security	The `IntegrityError` handler in exceptions.py L138 leaks raw DB error messages in `details.error_message` — this should be scrubbed in production
5	Auth	Account lockout (5 failed attempts) only works when Redis is online. With Redis offline, brute-force protection is completely bypassed
6	CORS	`allow_methods=["*"]` and `allow_headers=["*"]` is overly permissive — should be scoped to actual HTTP methods and headers used
7	Frontend State	No state management library (TanStack Query, SWR, Zustand). All dashboard pages likely duplicate fetch logic
8	SEO	The homepage is a client-rendered component (`page.tsx` as a React component with no `generateMetadata`). Since it's a Server Component by default in Next.js App Router, the Unsplash images load server-side, but there are no per-page meta descriptions for `/services`, `/about`, `/careers`, etc.
9	Accessibility	No visible focus states, no `aria-label` on icon-only buttons, no skip-to-content link
10	Performance	`user_roles` relationship on `User` model uses `lazy="selectin"` which eagerly loads roles on every user query — fine for auth, but wasteful for list endpoints
11	Database	The `BookingRead` schema has `created_at: str` instead of `datetime` — loses type safety
12	Payments	SSLCommerz callback URLs point to `{frontend_origin}/api/v1/payments/sslcommerz/success` — but these routes don't appear to exist in the Next.js frontend. They should be backend routes
---
Summary Scorecard
Category	Score	Notes
Architecture	⭐⭐⭐⭐	Clean Architecture mostly followed, good separation
Security	⭐⭐⭐	Solid RBAC, argon2, JWT — but refresh token rotation & lockout gaps
Visual Design	⭐⭐⭐	Modern dark theme, professional feel — but heavy inline styles, no responsive breakpoints in code
Frontend Quality	⭐⭐	No TypeScript strict mode enforcement, no data fetching library, inline styles pervasive
Backend Quality	⭐⭐⭐⭐	Well-structured services/repos, good error envelope — a few leaked DB details
Testing	⭐	Only 8 tests total, no E2E, no payment/booking coverage
Data Quality	⭐⭐	Placeholder/gibberish course data, hardcoded booking dates
DevOps	⭐⭐⭐	Docker Compose setup exists, health checks present — no CI/CD, no Alembic migrations
---
> [!IMPORTANT]
> **Priority fix order:** BUG-1 (booking form) → BUG-5 (SQLite FOR UPDATE) → BUG-3 (profile hang) → GAP-3 (email silently fails) → GAP-7 (refresh token) → BUG-4 (sidebar links) → VIS-1 (images)