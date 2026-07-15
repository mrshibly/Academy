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
      width: "100%",
      backgroundColor: "#ffffff",
      fontFamily: "inherit"
    }} className="responsive-flex-column">
      
      {/* Left Column - Clean Light Form Panel */}
      <div style={{
        flex: "1 1 45%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "3.5rem 2rem",
        backgroundColor: "#ffffff"
      }}>
        <div style={{ width: "100%", maxWidth: "25rem" }}>
          
          {/* Logo / Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "rgba(14, 165, 233, 0.08)",
              color: "var(--accent-blue)"
            }}>
              <Shield size={20} />
            </div>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "0.02em" }}>Academy.</span>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Welcome Back</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Sign in to access your modules, sandboxes, and achievements.
            </p>
          </div>

          {error && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              padding: "0.8rem 1rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginBottom: "1.5rem"
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
            <div id="google-signin-btn" style={{ width: "100%", display: "flex", justifyContent: "center" }}></div>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              margin: "1.25rem 0 0.5rem 0",
              color: "var(--text-muted)",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.05em"
            }}>
              <hr style={{ flex: 1, border: "0", borderTop: "1px solid var(--border-color)" }} />
              <span style={{ padding: "0 0.75rem" }}>OR</span>
              <hr style={{ flex: 1, border: "0", borderTop: "1px solid var(--border-color)" }} />
            </div>
          </div>

          {/* Login Inputs Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.02em" }}>Email Address</label>
              <div style={{ position: "relative", marginTop: "0.35rem" }}>
                <Mail size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  required
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.7rem 1rem 0.7rem 2.25rem",
                    fontSize: "0.9rem",
                    color: "var(--text-primary)",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.02em" }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--accent-blue)", fontWeight: 600, textDecoration: "none" }}>Forgot password?</Link>
              </div>
              <div style={{ position: "relative", marginTop: "0.35rem" }}>
                <Lock size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  required
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#ffffff",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.7rem 1rem 0.7rem 2.25rem",
                    fontSize: "0.9rem",
                    color: "var(--text-primary)",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              style={{
                background: "var(--text-primary)",
                color: "#ffffff",
                padding: "0.75rem",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                marginTop: "0.5rem"
              }}
            >
              <LogIn size={18} />
              <span>{loading ? "Signing in..." : "Sign In"}</span>
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Don't have an account? <Link href="/register" style={{ color: "var(--accent-blue)", fontWeight: 700, textDecoration: "none" }}>Create free account</Link>
          </p>

        </div>
      </div>

      {/* Right Column - unDraw Style Flat Vector Panel (Hidden on mobile via CSS) */}
      <div className="login-graphic" style={{
        flex: "1 1 55%",
        position: "relative",
        background: "#f8fafc",
        borderLeft: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "4rem"
      }}>
        
        {/* unDraw Style Inline SVG Vector Illustration */}
        <div style={{ width: "100%", maxWidth: "440px", marginBottom: "3rem" }}>
          <svg viewBox="0 0 500 380" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ground Shadow */}
            <ellipse cx="250" cy="330" rx="160" ry="12" fill="#e2e8f0" />
            
            {/* Big Laptop Monitor (unDraw Style) */}
            <rect x="100" y="80" width="300" height="200" rx="12" fill="#3f3d56" />
            <rect x="115" y="95" width="270" height="170" fill="#ffffff" />
            
            {/* Keyboard base */}
            <path d="M70,280 H430 L410,310 H90 Z" fill="#e6e6e6" />
            <path d="M90,310 H410 V315 H90 Z" fill="#cbd5e1" />
            <rect x="220" y="285" width="60" height="15" fill="#3f3d56" rx="4" opacity="0.1" />

            {/* Central Glowing Shield Icon on Screen */}
            <path d="M250,120 L290,135 V185 C290,215 250,235 250,235 C250,235 210,215 210,185 V135 Z" fill="#0ea5e9" />
            <path d="M250,140 L275,150 V185 C275,205 250,220 250,220 C250,220 225,205 225,185 V150 Z" fill="#7dd3fc" />
            <path d="M245,160 L235,175 H247 L242,200 L260,175 H248 L253,160 Z" fill="#ffffff" />

            {/* Flat Human Character (unDraw Style) */}
            {/* Sitting/leaning character on the laptop base */}
            {/* Legs */}
            <path d="M370,240 L385,310 H405 L390,240 Z" fill="#2f2e41" />
            {/* Torso */}
            <rect x="345" y="160" width="35" height="70" rx="10" fill="#0ea5e9" />
            <circle cx="362" cy="135" r="15" fill="#ffdbb5" />
            {/* Hair */}
            <path d="M347,130 C347,120 377,120 377,130 C377,122 355,118 347,130 Z" fill="#2f2e41" />
            {/* Arms interacting with screen */}
            <path d="M345,175 C310,175 300,165 295,165" stroke="#ffdbb5" strokeWidth="8" strokeLinecap="round" />
            
            {/* Decorative unDraw Dots & Plants */}
            <circle cx="80" cy="120" r="15" fill="#a7f3d0" opacity="0.7" />
            <circle cx="430" cy="160" r="25" fill="#e0f2fe" opacity="0.8" />
            <circle cx="120" cy="320" r="8" fill="#fef08a" />
            
            {/* Tiny floating vectors */}
            <path d="M60,190 H80 V210" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M420,100 L435,115 M435,100 L420,115" stroke="#3f3d56" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Catchy unDraw style messaging */}
        <div style={{ textAlign: "center", maxWidth: "26rem" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
            Secure Academic Sandbox
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.925rem", lineHeight: 1.6 }}>
            Our multi-layered virtual laboratories and cryptographically signed achievements give you industry-grade capabilities in applied artificial intelligence and cybersecurity.
          </p>
        </div>

      </div>

    </div>
  );
}
