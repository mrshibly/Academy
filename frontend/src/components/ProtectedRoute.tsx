"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (allowedRoles && !allowedRoles.some(role => user.roles.includes(role))) {
        router.push("/"); // Redirect unauthorized role to home
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "2rem",
            height: "2rem",
            border: "3px solid #e2e8f0",
            borderTopColor: "#10b981",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 1rem auto"
          }} />
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Verifying credentials...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  if (allowedRoles && !allowedRoles.some(role => user.roles.includes(role))) {
    return null;
  }

  return <>{children}</>;
}
