"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, LogIn, AlertCircle, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLoginCallback = async (response: any) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: response.credential }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Google authentication failed.");
      }

      const data = await res.json();
      
      const meResponse = await fetch("/api/v1/users/me", {
        headers: { "Authorization": `Bearer ${data.access_token}` },
      });

      if (!meResponse.ok) {
        throw new Error("Failed to retrieve user profile.");
      }

      const profile = await meResponse.json();
      login(data.access_token, profile);

      if (profile.roles.includes("admin")) {
        router.push("/dashboard/admin");
      } else if (profile.roles.includes("instructor")) {
        router.push("/dashboard/instructor");
      } else if (profile.roles.includes("corporate_client")) {
        router.push("/dashboard/client");
      } else {
        router.push("/dashboard/student");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: "1077790098218-or3jf6egdbmin5u10o6v0m1vnqsi6n9o.apps.googleusercontent.com",
          callback: handleGoogleLoginCallback,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 340 }
        );
      }
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || "Authentication failed. Please verify credentials.");
      }

      const data = await response.json();
      
      const meResponse = await fetch("/api/v1/users/me", {
        headers: { "Authorization": `Bearer ${data.access_token}` },
      });

      if (!meResponse.ok) {
        throw new Error("Failed to retrieve user profile.");
      }

      const profile = await meResponse.json();
      login(data.access_token, profile);

      if (profile.roles.includes("admin")) {
        router.push("/dashboard/admin");
      } else if (profile.roles.includes("instructor")) {
        router.push("/dashboard/instructor");
      } else if (profile.roles.includes("corporate_client")) {
        router.push("/dashboard/client");
      } else {
        router.push("/dashboard/student");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "92vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      backgroundColor: "#070a13",
      padding: "2rem 1.5rem",
      overflow: "hidden"
    }}>
      {/* Background decoration with blurred neon orbs */}
      <div style={{
        position: "absolute",
        top: "20%",
        left: "15%",
        width: "350px",
        height: "350px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)",
        filter: "blur(40px)",
        pointerEvents: "none",
        zIndex: 0
      }}></div>
      
      <div style={{
        position: "absolute",
        bottom: "15%",
        right: "15%",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
        filter: "blur(40px)",
        pointerEvents: "none",
        zIndex: 0
      }}></div>

      {/* Cyber Grid Vector overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.012) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        pointerEvents: "none",
        zIndex: 0
      }}></div>

      {/* Main Glassmorphic Login Console Card */}
      <div style={{
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        padding: "3.25rem 2.75rem",
        width: "100%",
        maxWidth: "28rem",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(14, 165, 233, 0.02)",
        position: "relative",
        zIndex: 10
      }}>
        
        {/* Brand Shield Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "rgba(14, 165, 233, 0.08)",
            border: "1px solid rgba(14, 165, 233, 0.15)",
            color: "var(--accent-blue)"
          }}>
            <Shield size={24} />
          </div>
        </div>

        {/* Text Header */}
        <div style={{ textAlign: "center", marginBottom: "2.25rem" }}>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.01em"
          }}>
            Sign In to Academy
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginTop: "0.4rem" }}>
            Unlock your secure learning workspace console.
          </p>
        </div>

        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#f87171",
            padding: "0.8rem 1rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            marginBottom: "1.75rem"
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Authentication */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.75rem" }}>
          <div id="google-signin-btn" style={{ width: "100%", display: "flex", justifyContent: "center" }}></div>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            margin: "1.5rem 0 0.5rem 0",
            color: "#475569",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.05em"
          }}>
            <hr style={{ flex: 1, border: "0", borderTop: "1px solid rgba(255,255,255,0.06)" }} />
            <span style={{ padding: "0 0.75rem", color: "#64748b" }}>OR CONTINUING WITH EMAIL</span>
            <hr style={{ flex: 1, border: "0", borderTop: "1px solid rgba(255,255,255,0.06)" }} />
          </div>
        </div>

        {/* Direct Email/Password Inputs Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.03em" }}>Email Address</label>
            <div style={{ position: "relative", marginTop: "0.4rem" }}>
              <Mail size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
              <input
                required
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(15, 23, 42, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  fontSize: "0.925rem",
                  color: "#ffffff",
                  outline: "none",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-blue)";
                  e.currentTarget.style.boxShadow = "0 0 10px rgba(14, 165, 233, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.03em" }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--accent-blue)", fontWeight: 600, textDecoration: "none" }}>Forgot password?</Link>
            </div>
            <div style={{ position: "relative", marginTop: "0.4rem" }}>
              <Lock size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
              <input
                required
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(15, 23, 42, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  fontSize: "0.925rem",
                  color: "#ffffff",
                  outline: "none",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-blue)";
                  e.currentTarget.style.boxShadow = "0 0 10px rgba(14, 165, 233, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            style={{
              background: "var(--accent-blue)",
              color: "#ffffff",
              padding: "0.8rem",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(14, 165, 233, 0.2)",
              marginTop: "0.5rem"
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#0284c7";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "var(--accent-blue)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            <LogIn size={18} />
            <span>{loading ? "Authenticating console..." : "Log In"}</span>
          </button>
        </form>

        {/* Link to Registration */}
        <p style={{ textAlign: "center", marginTop: "2.25rem", fontSize: "0.875rem", color: "#64748b" }}>
          Don't have an account? <Link href="/register" style={{ color: "var(--accent-blue)", fontWeight: 700, textDecoration: "none" }}>Create free account</Link>
        </p>

      </div>
    </div>
  );
}
