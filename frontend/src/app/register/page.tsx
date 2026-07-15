"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

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
      
      // Fetch user profile info
      const meResponse = await fetch("/api/v1/users/me", {
        headers: { "Authorization": `Bearer ${data.access_token}` },
      });

      if (!meResponse.ok) {
        throw new Error("Failed to retrieve user profile.");
      }

      const profile = await meResponse.json();
      login(data.access_token, profile);

      // Redirect based on user role
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
    // Load Google GSI client library dynamically
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
          { theme: "outline", size: "large", width: 350 }
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
    <div style={{ minHeight: "92vh", display: "flex", width: "100%", background: "var(--bg-primary)" }}>
      {/* Left Column - Form */}
      <div style={{ flex: "1 1 45%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "3rem 2rem", zIndex: 10 }}>
        <div className="glass-panel" style={{ width: "100%", maxWidth: "26rem", padding: "2.5rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--card-bg)" }}>
          
          {success ? (
            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <CheckCircle2 size={64} style={{ color: "var(--accent-emerald)", margin: "0 auto 1.5rem auto" }} />
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-primary)" }}>Registration Successful</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
                An email verification link has been sent to <strong>{email}</strong>. Please check your inbox to activate your account.
              </p>
              <Link href="/login" className="btn btn-primary" style={{ width: "100%" }}>
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Create Account</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  Join our training tracks and acquire expert credentials
                </p>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "0.75rem", borderRadius: "6px", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Google Sign-up Button */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
                <div id="google-signup-btn" style={{ width: "100%", display: "flex", justifyContent: "center" }}></div>
                <div style={{ display: "flex", alignItems: "center", width: "100%", margin: "1.25rem 0", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  <hr style={{ flex: 1, border: "0", borderTop: "1px solid var(--border-color)" }} />
                  <span style={{ padding: "0 0.75rem" }}>OR</span>
                  <hr style={{ flex: 1, border: "0", borderTop: "1px solid var(--border-color)" }} />
                </div>
              </div>

              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Full Name</label>
                  <div style={{ position: "relative" }}>
                    <User size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" style={{ paddingLeft: "2.25rem", marginTop: "0.25rem" }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Email Address</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" style={{ paddingLeft: "2.25rem", marginTop: "0.25rem" }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" style={{ paddingLeft: "2.25rem", marginTop: "0.25rem" }} />
                  </div>
                </div>

                <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                  <UserPlus size={18} />
                  <span>{loading ? "Registering..." : "Sign Up"}</span>
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Already have an account? <Link href="/login" style={{ color: "var(--accent-blue)", fontWeight: 600 }}>Login</Link>
              </p>
            </>
          )}

        </div>
      </div>

      {/* Right Column - Visual Graphic (Hidden on mobile via css media query) */}
      <div className="login-graphic" style={{ flex: "1 1 55%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "5rem", borderLeft: "1px solid var(--border-color)", background: "#0b0f19" }}>
        {/* Futuristic SVG Cyber Vector Graphic */}
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.85, zIndex: 0 }}>
          <svg width="100%" height="100%" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="cyberGlow2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="academicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <rect width="800" height="800" fill="#0b0f19" />
            <circle cx="400" cy="350" r="320" fill="url(#cyberGlow2)" />
            
            {/* Grid Pattern overlay */}
            <path d="M 0,150 L 800,150 M 0,250 L 800,250 M 0,350 L 800,350 M 0,450 L 800,450 M 0,550 L 800,550 M 0,650 L 800,650" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
            <path d="M 150,0 L 150,800 M 250,0 L 250,800 M 350,0 L 350,800 M 450,0 L 450,800 M 550,0 L 550,800 M 650,0 L 650,800" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
            
            {/* Academic Concentric Network Rings */}
            <circle cx="400" cy="350" r="160" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="2" strokeDasharray="20, 10" />
            <circle cx="400" cy="350" r="210" fill="none" stroke="rgba(14, 165, 233, 0.12)" strokeWidth="1" />
            <circle cx="400" cy="350" r="270" fill="none" stroke="rgba(139, 92, 246, 0.08)" strokeWidth="1.5" strokeDasharray="40, 40" />
            
            {/* Connecting Pathways */}
            <path d="M400,350 L250,250 H200" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M400,350 L550,250 H600" stroke="rgba(14, 165, 233, 0.3)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M400,350 L300,480 H240" stroke="rgba(139, 92, 246, 0.25)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M400,350 L500,480 H560" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Nodes */}
            <circle cx="200" cy="250" r="8" fill="#10b981" />
            <circle cx="200" cy="250" r="14" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.4" />
            <circle cx="600" cy="250" r="8" fill="#0ea5e9" />
            <circle cx="600" cy="250" r="14" fill="none" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.4" />
            <circle cx="240" cy="480" r="8" fill="#8b5cf6" />
            <circle cx="560" cy="480" r="8" fill="#10b981" />
            
            {/* Knowledge Core Emblem */}
            <circle cx="400" cy="350" r="60" fill="url(#academicGrad)" />
            {/* Graduation Cap Vector inside Core */}
            <path d="M400,325 L435,340 L400,355 L365,340 Z" fill="#ffffff" />
            <path d="M375,346 V362 C375,372 425,372 425,362 V346" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M430,342 V358" fill="none" stroke="#ffffff" strokeWidth="2" />
            <circle cx="430" cy="359" r="2" fill="#ffffff" />
          </svg>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11, 15, 25, 0.98) 0%, rgba(11, 15, 25, 0.4) 60%, rgba(11, 15, 25, 0.1) 100%)", zIndex: 1 }} />
        <div style={{ position: "relative", zIndex: 2, color: "#ffffff", maxWidth: "34rem" }}>
          <span style={{ background: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#a7f3d0", padding: "0.4rem 0.8rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "inline-block", marginBottom: "1.5rem" }}>
            Certified Professional Education
          </span>
          <h2 style={{ fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "1.25rem" }}>
            Become a Certified Ethical Hacker & AI Engineer
          </h2>
          <p style={{ color: "#cbd5e1", fontSize: "1rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            "The curriculum covers advanced AI security vulnerability assessments and machine learning operations. It prepared me perfectly for my role as a security consultant."
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", color: "#ffffff" }}>AS</div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>Amina Sultana</div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>DevSecOps Specialist</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
