"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || "Unable to request password reset code.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
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
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Reset Link Dispatched</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
                An instructions link has been sent to <strong>{email}</strong> if an account exists under that address.
              </p>
              <Link href="/login" className="btn btn-primary" style={{ width: "100%" }}>
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Reset Password</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  Provide your email to receive recovery instructions
                </p>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "0.75rem", borderRadius: "6px", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Email Address</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "0.65rem 0.65rem 0.65rem 2.25rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "0.25rem", outline: "none" }} />
                  </div>
                </div>

                <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                  <Send size={18} />
                  <span>{loading ? "Sending..." : "Request Reset Link"}</span>
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Remember password? <Link href="/login" style={{ color: "var(--accent-blue)", fontWeight: 600 }}>Log in</Link>
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
