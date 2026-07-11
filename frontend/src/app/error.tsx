"use client";

import { useEffect } from "react";
import { ShieldX, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandleable client-side application error:", error);
  }, [error]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "2rem" }}>
      <div style={{ maxWidth: "32rem", textAlign: "center", background: "white", border: "1px solid var(--border-color)", padding: "3rem", borderRadius: "16px", boxShadow: "var(--shadow-md)" }}>
        <ShieldX size={56} style={{ color: "#ef4444", margin: "0 auto 1.5rem auto" }} />
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>System Override Failed</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "2rem" }}>
          An unhandled error occurred in the execution engine loop. Please reload the current stack parameters or return to home.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => reset()}>
            <RotateCcw size={16} />
            <span>Reset Stack</span>
          </button>
          <a href="/" className="btn btn-outline">
            <span>Return Home</span>
          </a>
        </div>
      </div>
    </div>
  );
}
