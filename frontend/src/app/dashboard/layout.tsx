"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import DashboardSidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#f8fafc",
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
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <DashboardSidebar />
      <div
        className="dashboard-content"
        style={{
          flex: 1,
          marginLeft: "16.5rem",
          transition: "margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main style={{ flex: 1, padding: "2rem 2.5rem" }}>{children}</main>
      </div>
    </div>
  );
}
