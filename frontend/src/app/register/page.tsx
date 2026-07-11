"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    <div style={{ padding: "6rem 0", display: "flex", justifyContent: "center" }}>
      <div className="container" style={{ maxWidth: "26rem" }}>
        
        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2.5rem", boxShadow: "var(--shadow-md)" }}>
          
          {success ? (
            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <CheckCircle2 size={64} style={{ color: "var(--accent-emerald)", margin: "0 auto 1.5rem auto" }} />
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Registration Successful</h2>
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
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Create Account</h1>
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

              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Full Name</label>
                  <div style={{ position: "relative" }}>
                    <User size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: "100%", padding: "0.65rem 0.65rem 0.65rem 2.25rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "0.25rem", outline: "none" }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Email Address</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "0.65rem 0.65rem 0.65rem 2.25rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "0.25rem", outline: "none" }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "0.65rem 0.65rem 0.65rem 2.25rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "0.25rem", outline: "none" }} />
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
    </div>
  );
}
