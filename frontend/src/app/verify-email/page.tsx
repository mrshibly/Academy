"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, AlertCircle, Loader } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token");
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Verification token parameter is missing in query string.");
      setVerifying(false);
      return;
    }

    const performVerification = async () => {
      try {
        const response = await fetch(`/api/v1/auth/verify?token=${token}`, {
          method: "POST"
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.detail || "Verification token has expired or is invalid.");
        }

        setSuccess(true);
      } catch (err: any) {
        setError(err.message || "Failed to verify account registration.");
      } finally {
        setVerifying(false);
      }
    };

    performVerification();
  }, [token]);

  if (verifying) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <Loader size={48} style={{ color: "var(--accent-blue)", margin: "0 auto 1.5rem auto", animation: "spin 2s linear infinite" }} />
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Verifying Registration</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          We are confirming your credentials with the core security directories...
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2.5rem", textAlign: "center" }}>
      {success ? (
        <>
          <ShieldCheck size={56} style={{ color: "var(--accent-emerald)", margin: "0 auto 1.25rem auto" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Account Verified</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.5 }}>
            Thank you! Your registration email context has been successfully verified. You can now log in.
          </p>
          <Link href="/login" className="btn btn-primary" style={{ width: "100%" }}>
            Log In
          </Link>
        </>
      ) : (
        <>
          <AlertCircle size={56} style={{ color: "#ef4444", margin: "0 auto 1.25rem auto" }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Verification Failed</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.5 }}>
            {error || "We could not verify your email address. The token may be invalid or expired."}
          </p>
          <Link href="/register" className="btn btn-primary" style={{ width: "100%" }}>
            Create New Account
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div style={{ padding: "6rem 0", display: "flex", justifyContent: "center" }}>
      <div className="container" style={{ maxWidth: "26rem" }}>
        <Suspense fallback={
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p>Loading validation context...</p>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
