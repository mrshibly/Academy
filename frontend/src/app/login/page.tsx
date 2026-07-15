"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";

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
          // Client ID can be configured; using placeholder, backend validates token signatures
          client_id: "1077790098218-or3jf6egdbmin5u10o6v0m1vnqsi6n9o.apps.googleusercontent.com",
          callback: handleGoogleLoginCallback,
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 350 }
        );
      }
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Direct integration call to FastAPI backend router
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

  return (
    <div style={{ minHeight: "92vh", display: "flex", width: "100%", background: "var(--bg-primary)" }}>
      {/* Left Column - Form */}
      <div style={{ flex: "1 1 45%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "3rem 2rem", zIndex: 10 }}>
        <div className="glass-panel" style={{ width: "100%", maxWidth: "26rem", padding: "2.5rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--card-bg)" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Welcome Back</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Log in to resume your training tracks
            </p>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "0.75rem", borderRadius: "6px", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in Button */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
            <div id="google-signin-btn" style={{ width: "100%", display: "flex", justifyContent: "center" }}></div>
            <div style={{ display: "flex", alignItems: "center", width: "100%", margin: "1.25rem 0", color: "var(--text-muted)", fontSize: "0.8rem" }}>
              <hr style={{ flex: 1, border: "0", borderTop: "1px solid var(--border-color)" }} />
              <span style={{ padding: "0 0.75rem" }}>OR</span>
              <hr style={{ flex: 1, border: "0", borderTop: "1px solid var(--border-color)" }} />
            </div>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" style={{ paddingLeft: "2.25rem", marginTop: "0.25rem" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--accent-blue)", fontWeight: 500 }}>Forgot password?</Link>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" style={{ paddingLeft: "2.25rem", marginTop: "0.25rem" }} />
              </div>
            </div>

            <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
              <LogIn size={18} />
              <span>{loading ? "Logging in..." : "Login"}</span>
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Don't have an account? <Link href="/register" style={{ color: "var(--accent-blue)", fontWeight: 600 }}>Sign up</Link>
          </p>
        </div>
      </div>

      {/* Right Column - Visual Graphic (Hidden on mobile via css media query) */}
      <div className="login-graphic" style={{ flex: "1 1 55%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "5rem", borderLeft: "1px solid var(--border-color)", background: "#0b0f19" }}>
        {/* Futuristic SVG Cyber Vector Graphic */}
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.85, zIndex: 0 }}>
          <svg width="100%" height="100%" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="cyberGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#0eabec" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#0d9488" />
              </linearGradient>
            </defs>
            <rect width="800" height="800" fill="#0b0f19" />
            <circle cx="400" cy="350" r="300" fill="url(#cyberGlow)" />
            
            {/* Grid Pattern overlay */}
            <path d="M 0,100 L 800,100 M 0,200 L 800,200 M 0,300 L 800,300 M 0,400 L 800,400 M 0,500 L 800,500 M 0,600 L 800,600 M 0,700 L 800,700" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            <path d="M 100,0 L 100,800 M 200,0 L 200,800 M 300,0 L 300,800 M 400,0 L 400,800 M 500,0 L 500,800 M 600,0 L 600,800 M 700,0 L 700,800" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            
            {/* Rotating Orbits */}
            <circle cx="400" cy="350" r="180" fill="none" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1.5" strokeDasharray="15, 10" />
            <circle cx="400" cy="350" r="230" fill="none" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="1" strokeDasharray="30, 20" />
            <circle cx="400" cy="350" r="120" fill="none" stroke="rgba(13, 148, 136, 0.2)" strokeWidth="2" strokeDasharray="5, 5" />
            
            {/* Tech Nodes & Connecting Vectors */}
            <line x1="400" y1="350" x2="280" y2="230" stroke="rgba(14, 165, 233, 0.3)" strokeWidth="1.5" />
            <line x1="400" y1="350" x2="520" y2="230" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1.5" />
            <line x1="400" y1="350" x2="400" y2="170" stroke="rgba(13, 148, 136, 0.3)" strokeWidth="1.5" />
            <line x1="400" y1="350" x2="240" y2="350" stroke="rgba(14, 165, 233, 0.2)" strokeWidth="1.5" />
            <line x1="400" y1="350" x2="560" y2="350" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1.5" />
            
            {/* Outer Nodes */}
            <circle cx="280" cy="230" r="8" fill="#0ea5e9" />
            <circle cx="280" cy="230" r="16" fill="none" stroke="#0ea5e9" strokeWidth="1" opacity="0.5" />
            <circle cx="520" cy="230" r="8" fill="#8b5cf6" />
            <circle cx="520" cy="230" r="16" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
            <circle cx="400" cy="170" r="6" fill="#0d9488" />
            <circle cx="240" cy="350" r="5" fill="#0ea5e9" />
            <circle cx="560" cy="350" r="5" fill="#8b5cf6" />
            
            {/* Core Shield Vector */}
            <path d="M400,280 L460,300 L460,370 C460,420 400,450 400,450 C400,450 340,420 340,370 L340,300 L400,280 Z" fill="url(#shieldGrad)" />
            {/* Innermost Core Icon */}
            <path d="M400,320 L370,350 H390 L380,390 L420,350 H400 L410,320 Z" fill="#ffffff" />
          </svg>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11, 15, 25, 0.98) 0%, rgba(11, 15, 25, 0.4) 60%, rgba(11, 15, 25, 0.1) 100%)", zIndex: 1 }} />
        <div style={{ position: "relative", zIndex: 2, color: "#ffffff", maxWidth: "34rem" }}>
          <span style={{ background: "rgba(14, 165, 233, 0.2)", border: "1px solid rgba(14, 165, 233, 0.4)", color: "#7dd3fc", padding: "0.4rem 0.8rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "inline-block", marginBottom: "1.5rem" }}>
            Offensive Security & AI
          </span>
          <h2 style={{ fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "1.25rem" }}>
            Master the Advanced Skills Demanded by the Industry
          </h2>
          <p style={{ color: "#cbd5e1", fontSize: "1rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            "The training curriculum is exceptionally hands-on. The labs provided me with real-world scenarios that allowed me to secure our enterprise pipelines within weeks."
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#0ea5e9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", color: "#ffffff" }}>JD</div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>John Doe</div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Lead Security Engineer, SecureOps</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
