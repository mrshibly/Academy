"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "2rem" }}>
      <div style={{ maxWidth: "30rem", textAlign: "center", background: "white", border: "1px solid var(--border-color)", padding: "3rem", borderRadius: "16px", boxShadow: "var(--shadow-md)" }}>
        <ShieldAlert size={56} style={{ color: "var(--accent-blue)", margin: "0 auto 1.5rem auto" }} />
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Page Not Found</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "2rem" }}>
          The requested system parameter or endpoint route is invalid. The address could have changed or been deprecatorily revoked.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button className="btn btn-outline" onClick={() => router.back()}>
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
          <Link href="/" className="btn btn-primary">
            <Home size={16} />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
