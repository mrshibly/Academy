"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  BarChart3,
  BookOpen,
  Calendar,
  Settings,
  Users,
  FileText,
  Terminal,
  Layers,
  MessageSquare,
  HelpCircle,
  Award,
  Database,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  GraduationCap,
  Sun,
  Moon,
  User,
} from "lucide-react";
import { useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const adminSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard/admin", icon: <BarChart3 size={18} /> },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Courses", href: "/dashboard/admin/courses", icon: <BookOpen size={18} /> },
      { label: "Blog", href: "/dashboard/admin/blog", icon: <FileText size={18} /> },
      { label: "Research", href: "/dashboard/admin/research", icon: <Terminal size={18} /> },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Users", href: "/dashboard/admin/users", icon: <Users size={18} /> },
      { label: "Enrollments", href: "/dashboard/admin/enrollments", icon: <GraduationCap size={18} /> },
      { label: "Certificates", href: "/dashboard/admin/certificates", icon: <Award size={18} /> },
      { label: "Cohorts", href: "/dashboard/admin/cohorts", icon: <Database size={18} /> },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Bookings", href: "/dashboard/admin/bookings", icon: <Calendar size={18} /> },
      { label: "Services", href: "/dashboard/admin/services", icon: <Settings size={18} /> },
      { label: "Careers", href: "/dashboard/admin/careers", icon: <Layers size={18} /> },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Tickets", href: "/dashboard/admin/tickets", icon: <HelpCircle size={18} /> },
      { label: "Inbox", href: "/dashboard/admin/contacts", icon: <MessageSquare size={18} /> },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile Settings", href: "/dashboard/profile", icon: <User size={18} /> },
    ],
  },
];

const instructorSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard/instructor", icon: <BarChart3 size={18} /> },
    ],
  },
  {
    title: "Teaching Workspace",
    items: [
      { label: "My Courses", href: "/dashboard/instructor/courses", icon: <BookOpen size={18} /> },
      { label: "Blog Workspace", href: "/dashboard/instructor/blog", icon: <FileText size={18} /> },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile Settings", href: "/dashboard/profile", icon: <User size={18} /> },
    ],
  },
];

const studentSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard/student", icon: <Home size={18} /> },
    ],
  },
  {
    title: "Learning Tracks",
    items: [
      { label: "Browse Academy", href: "/academy", icon: <BookOpen size={18} /> },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile Settings", href: "/dashboard/profile", icon: <User size={18} /> },
    ],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const getInitialWorkspace = () => {
    if (pathname.startsWith("/dashboard/admin")) return "admin";
    if (pathname.startsWith("/dashboard/instructor")) return "instructor";
    if (pathname.startsWith("/dashboard/client")) return "client";
    return "student";
  };

  const [activeWorkspace, setActiveWorkspace] = useState(getInitialWorkspace());

  useEffect(() => {
    setActiveWorkspace(getInitialWorkspace());
  }, [pathname]);

  const handleWorkspaceChange = (workspace: string) => {
    setActiveWorkspace(workspace);
    if (workspace === "admin") {
      router.push("/dashboard/admin");
    } else if (workspace === "instructor") {
      router.push("/dashboard/instructor");
    } else if (workspace === "client") {
      router.push("/dashboard/client");
    } else {
      router.push("/dashboard/student");
    }
  };

  const sections = activeWorkspace === "admin"
    ? adminSections
    : activeWorkspace === "instructor"
    ? instructorSections
    : studentSections;

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const getInitials = () => {
    if (!user || !user.full_name) return "U";
    return user.full_name
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard/admin") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      style={{
        width: collapsed ? "4.5rem" : "16.5rem",
        minHeight: "100vh",
        background: "#0f172a",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        overflowX: "hidden",
      }}
    >
      {/* Logo Area */}
      <div
        style={{
          padding: collapsed ? "1.25rem 0.75rem" : "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          minHeight: "4.5rem",
        }}
      >
        {!collapsed && (
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: 800,
              fontSize: "1.15rem",
              color: "#ffffff",
              textDecoration: "none",
            }}
          >
            <Shield size={22} style={{ color: "#10b981" }} />
            <span>
              Academy<span style={{ color: "#10b981" }}>.</span>
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "none",
            borderRadius: "6px",
            padding: "0.4rem",
            cursor: "pointer",
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: collapsed ? "1rem 0.5rem" : "1rem 0.75rem",
        }}
      >
        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: "1.5rem" }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#64748b",
                  padding: "0 0.75rem",
                  marginBottom: "0.5rem",
                }}
              >
                {section.title}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.65rem",
                      padding: collapsed ? "0.6rem" : "0.55rem 0.75rem",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      fontWeight: active ? 600 : 400,
                      color: active ? "#ffffff" : "#94a3b8",
                      background: active ? "rgba(16, 185, 129, 0.15)" : "transparent",
                      textDecoration: "none",
                      transition: "all 0.15s",
                      justifyContent: collapsed ? "center" : "flex-start",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      if (!active) e.currentTarget.style.color = "#cbd5e1";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = "transparent";
                      if (!active) e.currentTarget.style.color = "#94a3b8";
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <span style={{ flexShrink: 0, display: "flex", color: active ? "#10b981" : "inherit" }}>
                      {item.icon}
                    </span>
                    {!collapsed && <span>{item.label}</span>}
                    {active && (
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "3px",
                          height: "60%",
                          background: "#10b981",
                          borderRadius: "0 3px 3px 0",
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Back to Site link */}
      <div style={{ padding: collapsed ? "0.75rem 0.5rem" : "0.75rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            padding: collapsed ? "0.6rem" : "0.55rem 0.75rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            color: "#64748b",
            textDecoration: "none",
            transition: "all 0.15s",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "#cbd5e1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#64748b";
          }}
          title="Back to site"
        >
          <Home size={18} />
          {!collapsed && <span>Back to Site</span>}
        </Link>
      </div>

      {/* Workspace Switcher */}
      {user && user.roles && user.roles.includes("admin") && !collapsed && (
        <div style={{ padding: "0 0.75rem", marginBottom: "1rem" }}>
          <select
            value={activeWorkspace}
            onChange={(e) => handleWorkspaceChange(e.target.value)}
            style={{
              width: "100%",
              padding: "0.45rem 0.65rem",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              color: "#e2e8f0",
              fontSize: "0.8rem",
              fontWeight: 600,
              outline: "none",
              cursor: "pointer"
            }}
          >
            {user.roles.includes("admin") && <option value="admin" style={{ background: "#0f172a" }}>Workspace: Admin</option>}
            {user.roles.includes("instructor") && <option value="instructor" style={{ background: "#0f172a" }}>Workspace: Instructor</option>}
            {user.roles.includes("corporate_client") && <option value="client" style={{ background: "#0f172a" }}>Workspace: Client</option>}
            <option value="student" style={{ background: "#0f172a" }}>Workspace: Student</option>
          </select>
        </div>
      )}

      {/* User Profile + Logout */}
      <div
        style={{
          padding: collapsed ? "1rem 0.5rem" : "1rem 0.75rem",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            width: "2.25rem",
            height: "2.25rem",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #0d9488)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.8rem",
            flexShrink: 0,
          }}
        >
          {getInitials()}
        </div>
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "#e2e8f0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.full_name}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#64748b",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email}
              </div>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                padding: "0.35rem",
                borderRadius: "6px",
                display: "flex",
                transition: "all 0.15s",
                marginRight: "0.25rem"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#10b981";
                e.currentTarget.style.background = "rgba(16, 185, 129, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.background = "none";
              }}
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button
              onClick={logout}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                padding: "0.35rem",
                borderRadius: "6px",
                display: "flex",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.background = "none";
              }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
