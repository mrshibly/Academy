"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle2, Shield } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGoogleRegisterCallback = async (response: any) => {
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
        throw new Error(body.detail || "Google registration failed.");
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
          callback: handleGoogleRegisterCallback,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signup-btn"),
          { theme: "outline", size: "large", width: 340 }
        );
      }
    };
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || "Registration failed. Email might already be taken.");
      }

      setSuccess(true);
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
              background: "rgba(16, 185, 129, 0.08)",
              color: "var(--accent-emerald)"
            }}>
              <Shield size={20} />
            </div>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "0.02em" }}>Academy.</span>
          </div>

          {success ? (
            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <CheckCircle2 size={64} style={{ color: "var(--accent-emerald)", margin: "0 auto 1.5rem auto" }} />
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem", color: "var(--text-primary)" }}>Account Created</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "2rem", lineHeight: 1.5 }}>
                An email verification link has been sent to <strong>{email}</strong>. Please verify your email to unlock your workspace.
              </p>
              <Link href="/login" className="btn btn-primary" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", fontWeight: 750 }}>
                Proceed to Login
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Create Account</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  Join our cybersecurity & AI training tracks to earn certified digital credentials.
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

              {/* Google Sign-up */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
                <div id="google-signup-btn" style={{ width: "100%", display: "flex", justifyContent: "center" }}></div>
                
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
                  <span style={{ padding: "0 0.75rem" }}>OR JOIN WITH EMAIL</span>
                  <hr style={{ flex: 1, border: "0", borderTop: "1px solid var(--border-color)" }} />
                </div>
              </div>

              {/* Inputs Form */}
              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.02em" }}>Full Name</label>
                  <div style={{ position: "relative", marginTop: "0.35rem" }}>
                    <User size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                      required
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
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
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.02em" }}>Password</label>
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
                    background: "var(--accent-emerald)",
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
                  <UserPlus size={18} />
                  <span>{loading ? "Creating account..." : "Create Account"}</span>
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Already have an account? <Link href="/login" style={{ color: "var(--accent-emerald)", fontWeight: 700, textDecoration: "none" }}>Log in</Link>
              </p>
            </>
          )}

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
            
            {/* Massive Tech Dashboard screen (unDraw style) */}
            <rect x="120" y="70" width="260" height="210" rx="10" fill="#3f3d56" />
            <rect x="135" y="85" width="230" height="180" fill="#ffffff" />
            
            {/* Dashboard Graphs inside Screen */}
            <rect x="150" y="105" width="90" height="40" fill="#e0f2fe" rx="4" />
            <rect x="250" y="105" width="100" height="40" fill="#d1fae5" rx="4" />
            <rect x="150" y="160" width="200" height="8" fill="#e2e8f0" rx="4" />
            <rect x="150" y="175" width="160" height="8" fill="#e2e8f0" rx="4" />
            <rect x="150" y="190" width="180" height="8" fill="#e2e8f0" rx="4" />
            <circle cx="170" cy="225" r="12" fill="#10b981" />
            <circle cx="210" cy="225" r="12" fill="#0ea5e9" />
            <circle cx="250" cy="225" r="12" fill="#8b5cf6" />
            
            {/* Character standing and building nodes (unDraw style) */}
            {/* Legs */}
            <path d="M100,240 L85,320 H105 L115,240 Z" fill="#2f2e41" />
            <path d="M130,240 L145,320 H125 L120,240 Z" fill="#2f2e41" />
            {/* Torso */}
            <rect x="90" y="160" width="40" height="80" rx="12" fill="#10b981" />
            <circle cx="110" cy="130" r="16" fill="#ffdbb5" />
            {/* Hair */}
            <path d="M92,125 C92,112 128,112 128,125 C128,115 105,110 92,125 Z" fill="#2f2e41" />
            {/* Arms pointing at dashboard */}
            <path d="M125" />
            <path d="M115,180 C145,180 155,165 160,165" stroke="#ffdbb5" strokeWidth="8" strokeLinecap="round" />

            {/* Plants & Shapes */}
            <circle cx="430" cy="280" r="30" fill="#a7f3d0" opacity="0.6" />
            <circle cx="60" cy="90" r="20" fill="#e0f2fe" opacity="0.8" />
            <circle cx="390" cy="100" r="10" fill="#fef08a" />
            
            {/* Tiny floating elements */}
            <path d="M380,180 L400,200 M400,180 L380,200" stroke="#3f3d56" strokeWidth="3" strokeLinecap="round" />
            <path d="M420,130 H440 V150" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Messaging */}
        <div style={{ textAlign: "center", maxWidth: "26rem" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
            Certified Professional Education
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.925rem", lineHeight: 1.6 }}>
            Gain hands-on validation, track specialized syllabus modules, and compile verifiable digital credentials respected by industry-leading security teams.
          </p>
        </div>

      </div>

    </div>
  );
}
