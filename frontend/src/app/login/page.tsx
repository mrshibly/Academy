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
      <div className="login-graphic" style={{ flex: "1 1 55%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "5rem", borderLeft: "1px solid var(--border-color)" }}>
        <img
          src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&q=80&auto=format&fit=crop"
          alt="Cybersecurity defense operation center network graphic"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11, 15, 25, 0.95) 0%, rgba(11, 15, 25, 0.5) 50%, rgba(11, 15, 25, 0.1) 100%)", zIndex: 1 }} />
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
