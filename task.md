# Checklist: Platform Enhancements & Syllabus Builder

## Phase 1: Sidebar Workspace Switcher
- [x] Add state for active workspace and role selections in `Sidebar.tsx`
- [x] Add switcher dropdown markup and styling at the bottom of the sidebar

## Phase 2: Syllabus Outline Builder Component
- [x] Create `components/SyllabusBuilder.tsx` file fetching and posting modules/lessons
- [x] Embed the syllabus panel in Admin Course Manager page
- [x] Embed the syllabus panel in Instructor Course Manager page

## Phase 3: Tabbed Directories & Badges
- [x] Implement tab filtering and pending counters in Admin Courses Page
- [x] Implement tab filtering and pending counters in Admin Blog Page
- [x] Implement quiz player layout in LMS learn page
- [x] Implement graduation UI section and certificate download button in LMS learn page
- [x] Create database query utility for synchronous certificate generation
- [x] Update enrollment progress handler fallback to run synchronous certificate generation in-process
- [x] Add certificate key payload to GET /api/v1/enrollments/{enrollment_id} API endpoint
