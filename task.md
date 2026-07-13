# Academy Platform Overhaul — Task Tracker

## Phase 1: Admin Dashboard Sidebar + Google OAuth

### Dashboard Layout System
- [x] Create `dashboard/layout.tsx` — sidebar layout, no public navbar/footer
- [x] Create `dashboard/Sidebar.tsx` — collapsible sidebar with grouped nav items
- [x] Modify root `layout.tsx` — hide navbar/footer for `/dashboard/*` routes

### Admin Dashboard Decomposition
- [x] Refactor `admin/page.tsx` — SecOps overview only (~150 lines)
- [x] Create `admin/courses/page.tsx` — Course manager
- [x] Create `admin/users/page.tsx` — User directory
- [x] Create `admin/blog/page.tsx` — Blog CMS
- [x] Create `admin/bookings/page.tsx` — Bookings list
- [x] Create `admin/services/page.tsx` — Service catalog CMS
- [x] Create `admin/research/page.tsx` — Research publications
- [x] Create `admin/careers/page.tsx` — Careers CMS + applications
- [x] Create `admin/contacts/page.tsx` — Inbox
- [x] Create `admin/tickets/page.tsx` — Support desk
- [x] Create `admin/enrollments/page.tsx` — Enrollment management
- [x] Create `admin/certificates/page.tsx` — Certificate management
- [x] Create `admin/cohorts/page.tsx` — Cohort management

### Google OAuth Integration
- [x] Add `authlib` to `pyproject.toml`
- [x] Create `backend/app/api/v1/routes/oauth.py` — OAuth routes
- [x] Add `oauth_login_or_register` to `auth_service.py`
- [x] Register OAuth router in `router.py`
- [x] Add "Continue with Google" button to login page
- [x] Add "Sign up with Google" button to register page

## Phase 2: Data Quality + Auth Robustness
- [x] Token auto-refresh in `AuthContext.tsx`
- [x] `ProtectedRoute.tsx` component
- [x] `Toast.tsx` global notification system
- [x] `DataTable.tsx` reusable component

## Phase 3: Polish + Production Hardening
- [x] Password complexity validation
- [x] Account lockout
- [x] `readyz` probe with real DB/Redis checks
- [x] Dark mode toggle
- [x] Skeleton loading screens
- [x] Self-hosted hero image
