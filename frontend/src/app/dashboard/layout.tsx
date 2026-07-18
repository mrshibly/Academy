"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { Menu, Shield } from "lucide-react";
import DashboardSidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const is_admin = user.roles.includes("admin");
    const is_instructor = user.roles.includes("instructor");

    if (pathname.startsWith("/dashboard/admin") && !is_admin) {
      if (is_instructor) {
        router.push("/dashboard/instructor");
      } else {
        router.push("/dashboard/student");
      }
    } else if (pathname.startsWith("/dashboard/instructor") && !is_instructor && !is_admin) {
      router.push("/dashboard/student");
    }
  }, [user, loading, router, pathname]);

  useEffect(() => {
    // Automatically close mobile menu drawer on route transition
    setMobileOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg-secondary)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              border: "3px solid #e2e8f0",
              borderTopColor: "#10b981",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem auto",
            }}
          />
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Loading workspace...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* Mobile Top Header */}
      <div className="mobile-dashboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)" }}>
          <Shield style={{ color: "var(--accent-blue)" }} size={24} />
          <span>Academy<span style={{ color: "var(--accent-blue)" }}>.</span></span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Drawer Overlay Backdrop */}
      <div 
        className={`mobile-sidebar-backdrop ${mobileOpen ? "open" : ""}`} 
        onClick={() => setMobileOpen(false)} 
        aria-label="Close menu"
      />

      {/* Sidebar Component */}
      <DashboardSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Wrapper */}
      <div className={`dashboard-content-wrapper ${collapsed ? "collapsed" : ""}`}>
        <main style={{ flex: 1, padding: "2rem 2.5rem" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
