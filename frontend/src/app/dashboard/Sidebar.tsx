"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  Home, BookOpen, FileText, User, Users, FolderKanban, 
  Settings, Award, ShieldAlert, LogOut, ChevronDown, 
  Menu, X, Briefcase, Sliders, Calendar, Shield, ChevronLeft, ChevronRight, PhoneCall
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

interface DashboardSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (mobileOpen: boolean) => void;
}

export default function DashboardSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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
    setMobileOpen(false);
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

  const getInitials = () => {
    if (!user || !user.full_name) return "U";
    return user.full_name
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const adminCategories: NavCategory[] = [
    {
      title: "Overview",
      items: [
        { label: "Operations Center", href: "/dashboard/admin", icon: <Home size={18} />, description: "Overview of stats & operations log stream" },
        { label: "Users Directory", href: "/dashboard/admin/users", icon: <Users size={18} />, description: "Manage platform users and role elevation overrides" },
        { label: "Support Tickets", href: "/dashboard/admin/tickets", icon: <ShieldAlert size={18} />, description: "Answer pending customer support requests" }
      ]
    },
    {
      title: "Academics",
      items: [
        { label: "Course Directory", href: "/dashboard/admin/courses", icon: <BookOpen size={18} />, description: "Approve, delete, or build course draft syllabi" },
        { label: "Cohorts Registry", href: "/dashboard/admin/cohorts", icon: <FolderKanban size={18} />, description: "Oversee active student learning groups" },
        { label: "Certificate Ledgers", href: "/dashboard/admin/certificates", icon: <Award size={18} />, description: "Issue and audit cryptographically verified credentials" }
      ]
    },
    {
      title: "Content Hub",
      items: [
        { label: "Blog Workspace", href: "/dashboard/admin/blog", icon: <FileText size={18} />, description: "Compose, edit, and publish platform articles" },
        { label: "Research Publications", href: "/dashboard/admin/research", icon: <Sliders size={18} />, description: "Manage technical whitepapers & writeups" },
        { label: "Careers Portal", href: "/dashboard/admin/careers", icon: <Briefcase size={18} />, description: "Add and review open corporate job applications" }
      ]
    },
    {
      title: "Services",
      items: [
        { label: "Service Editor", href: "/dashboard/admin/services", icon: <Settings size={18} />, description: "Configure B2B cybersecurity consulting options" },
        { label: "Bookings Catalog", href: "/dashboard/admin/bookings", icon: <Calendar size={18} />, description: "Manage client meeting slots and calendar schedules" },
        { label: "Contact Enquiries", href: "/dashboard/admin/contacts", icon: <PhoneCall size={18} />, description: "Review and respond to quote requests & contact logs" }
      ]
    }
  ];

  const instructorCategories: NavCategory[] = [
    {
      title: "Workspace",
      items: [
        { label: "Instructor Overview", href: "/dashboard/instructor", icon: <Home size={18} />, description: "Instructor statistics and workspace announcements" },
        { label: "My Direct Courses", href: "/dashboard/instructor/courses", icon: <BookOpen size={18} />, description: "Author, update, and build your course syllabi" },
        { label: "Blog Workspace", href: "/dashboard/instructor/blog", icon: <FileText size={18} />, description: "Write blog posts representing your track lectures" }
      ]
    }
  ];

  const studentCategories: NavCategory[] = [
    {
      title: "Sandbox",
      items: [
        { label: "My Lab Overview", href: "/dashboard/student", icon: <Home size={18} />, description: "Check progress roadmaps and download certificates" },
        { label: "Browse Academy", href: "/academy", icon: <BookOpen size={18} />, description: "Explore cyber security and AI courses catalog" }
      ]
    }
  ];

  const categories = activeWorkspace === "admin"
    ? adminCategories
    : activeWorkspace === "instructor"
    ? instructorCategories
    : studentCategories;

  return (
    <aside className={`dashboard-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      {/* Sidebar Header */}
      <div className="dashboard-sidebar-header">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)", textDecoration: "none" }}>
          <Shield style={{ color: "var(--accent-blue)" }} size={26} />
          {!collapsed && <span>Academy<span style={{ color: "var(--accent-blue)" }}>.</span></span>}
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}
            className="desktop-only-table"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", display: "flex", alignItems: "center" }}
            title="Close Navigation Drawer"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Sidebar Content Links */}
      <div className="dashboard-sidebar-content">
        {categories.map((cat, index) => (
          <div key={index} className="dashboard-sidebar-group">
            <div className="dashboard-sidebar-group-title">{cat.title}</div>
            {cat.items.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`dashboard-sidebar-item ${isActive ? "active" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="dashboard-sidebar-footer">
        {/* Workspace Switcher */}
        {user && user.roles.length > 1 && !collapsed && (
          <div style={{ position: "relative", width: "100%", marginBottom: "0.5rem" }}>
            <select
              value={activeWorkspace}
              onChange={(e) => handleWorkspaceChange(e.target.value)}
              style={{
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
                padding: "0.45rem 1.75rem 0.45rem 0.75rem",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                appearance: "none",
                width: "100%"
              }}
            >
              {user.roles.includes("admin") && <option value="admin">Admin Operations</option>}
              {(user.roles.includes("instructor") || user.roles.includes("admin")) && (
                <option value="instructor">Instructor Mode</option>
              )}
              <option value="student">Student Sandbox</option>
            </select>
            <ChevronDown size={12} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-secondary)" }} />
          </div>
        )}

        {/* Profile Controls */}
        <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: collapsed ? "center" : "flex-start" }}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            style={{
              background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.25rem", width: collapsed ? "auto" : "100%"
            }}
          >
            <div style={{
              width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "var(--accent-emerald)",
              color: "white", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.85rem", fontWeight: 700, flexShrink: 0
            }}>
              {getInitials()}
            </div>
            {!collapsed && (
              <div style={{ textAlign: "left", overflow: "hidden", width: "100%" }}>
                <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.full_name}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.email}
                </div>
              </div>
            )}
          </button>

          {userDropdownOpen && (
            <div style={{
              position: "absolute", left: collapsed ? "3.5rem" : "0", bottom: collapsed ? "0" : "3rem", width: "12rem",
              background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: "6px",
              boxShadow: "var(--shadow-md)", padding: "0.5rem", zIndex: 120, display: "flex", flexDirection: "column", gap: "0.25rem"
            }}>
              <Link
                href="/dashboard/profile"
                onClick={() => setUserDropdownOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem",
                  fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", borderRadius: "4px"
                }}
                className="dashboard-sidebar-item"
              >
                <User size={14} /> Profile Settings
              </Link>
              <button
                onClick={() => { logout(); setUserDropdownOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem", width: "100%",
                  fontSize: "0.85rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderRadius: "4px"
                }}
                className="dashboard-sidebar-item"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>

        {/* Collapsed Expand Toggle Button (At Bottom) */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
              display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "0.5rem 0"
            }}
            className="desktop-only-table"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
