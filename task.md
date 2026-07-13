# Checklist: Role-Based Dashboard Separation & Signups

## Phase 1: Backend Role Restrictions & Promotion
- [x] Enforce student-only signup in `AuthService` (`register` and `oauth_login_or_register`)
- [x] Add admin-only manual user creation in `routes/users.py`
- [x] Add admin-only role promotion endpoint in `routes/users.py`

## Phase 2: Frontend Signups & Role Selection
- [x] Verify `register/page.tsx` has no public role selectors
- [x] Add manual user creation dialog in `dashboard/admin/users/page.tsx`
- [x] Add promotion dropdown menu to `dashboard/admin/users/page.tsx`

## Phase 3: Dashboard Layouts
- [x] Enhance Student Dashboard `dashboard/student/page.tsx`
- [x] Build out Instructor Dashboard `dashboard/instructor/page.tsx`
- [x] Verify role routing redirects in `login/page.tsx`
