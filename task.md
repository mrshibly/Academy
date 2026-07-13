# Checklist: Role-Based Dashboards & Approval Pipeline

## Phase 1: Backend Restrictions & Listing
- [x] Enforce status = draft on blog post creation/update if actor is not admin in `blog_service.py`
- [x] Add `instructor_id` parameter to `list_published` and `list_all` in `CourseRepository`
- [x] Add `instructor_id` parameter to list methods in `CourseService`
- [x] Revert public `/api/v1/courses` endpoint to public published-only listing
- [x] Implement secure `/api/v1/courses/managed` endpoint for instructors/admins

## Phase 2: Frontend Dynamic Sidebar & Route Guards
- [x] Implement dynamic navigation sections based on user role in `Sidebar.tsx`
- [x] Upgrade route protection in `ProtectedRoute.tsx` to handle role restrictions (implemented in DashboardLayout)

## Phase 3: Frontend Workspaces & Approvals
- [x] Create Instructor Courses Page `dashboard/instructor/courses/page.tsx`
- [x] Create Instructor Blog Page `dashboard/instructor/blog/page.tsx`
- [x] Add "Pending Approval" tab & publish button to Admin Courses Page `dashboard/admin/courses/page.tsx`
- [x] Add "Pending Approval" view & publish button to Admin Blog Page `dashboard/admin/blog/page.tsx`
