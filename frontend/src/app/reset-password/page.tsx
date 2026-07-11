"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Reset token parameter is missing in URL.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || "Reset token has expired or is invalid.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2.5rem", boxShadow: "var(--shadow-md)" }}>
      {success ? (
        <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
          <CheckCircle2 size={64} style={{ color: "var(--accent-emerald)", margin: "0 auto 1.5rem auto" }} />
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>Password Updated</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
            Your login password has been reset successfully. You can now use your new credentials.
          </p>
          <Link href="/login" className="btn btn-primary" style={{ width: "100%" }}>
            Go to Login
          </Link>
        </div>
      ) : (
        <>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Define New Password</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Enter and confirm your new account security credentials
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
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>New Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "0.65rem 0.65rem 0.65rem 2.25rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "0.25rem", outline: "none" }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: "100%", padding: "0.65rem 0.65rem 0.65rem 2.25rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "0.25rem", outline: "none" }} />
              </div>
            </div>

            <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
              <span>{loading ? "Updating..." : "Update Password"}</span>
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ padding: "6rem 0", display: "flex", justifyContent: "center" }}>
      <div className="container" style={{ maxWidth: "26rem" }}>
        <Suspense fallback={
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p>Loading validation context...</p>
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
