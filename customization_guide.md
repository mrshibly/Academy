# Platform Role Customization & Workspace Manual

This guide explains how role elevation, workspaces, content creation, and admin approval pipelines are structured, and how you can customize them.

---

## 1. Dynamic User Promotion (Student to Instructor/Admin)
By design, **students cannot choose their roles** during public sign-up or Google OAuth. They are strictly assigned the `"student"` role.

To promote a student to an **Instructor** or **Administrator**:
1. Log into an account with the **Administrator** role.
2. Navigate to the **User Directory** tab (left sidebar menu under Operations, or visit `/dashboard/admin/users`).
3. Locate the student's profile inside the registered users list.
4. Locate the **Roles** dropdown selector for that user:
   * Select **Instructor** to elevate them to a teacher.
   * Select **Administrator** to grant full admin controls.
5. The role is instantly updated on the backend. When that user logs in, they will be routed to their new elevated dashboard workspace.

---

## 2. Dashboard Customization for Instructors
Instructors manage their curriculum and articles inside the **Teaching Workspace** (accessible via `/dashboard/instructor`).

### How to Manage Courses:
1. Open the **My Courses** tab.
2. Click **Create New Course Draft** to create a course.
3. Once created, click the **Syllabus** (list icon) button next to your course card:
   * Click **Add Module Section** to create chapters (e.g. "Module 1: Reconnaissance").
   * Click **Add Lecture** inside a module to create video or document lessons.
4. *Important:* All course creations or updates submitted by instructors default strictly to `DRAFT` status and are hidden from the store until approved.

---

## 3. Review & Approvals for Administrators
Administrators review pending submissions inside the **Admin Dashboard** (accessible via `/dashboard/admin`).

### How to Approve Submissions:
1. Navigate to the **Course Manager** or **Blog Manager** tabs.
2. Click the **Pending Approval** tab at the top of the content lists (indicated by red notification counts showing how many items require review).
3. Review the submissions. Click the green **Approve** button:
   * This changes the status to `published` instantly.
   * The course/post becomes visible in the public academy store catalog immediately.
