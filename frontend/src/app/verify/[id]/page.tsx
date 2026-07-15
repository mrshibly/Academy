"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Award, CheckCircle, XCircle, ShieldCheck, Download, Home, Loader } from "lucide-react";
import Navbar from "@/app/Navbar";

interface VerificationData {
  is_valid: boolean;
  holder_name?: string;
  course_title?: string;
  issued_at?: string;
}

export default function CertificateVerificationPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VerificationData | null>(null);

  useEffect(() => {
    if (!id) return;

    const verify = async () => {
      try {
        const res = await fetch(`/api/v1/certificates/verify/${id}`);
        if (res.ok) {
          setData(await res.json());
        } else {
          setData({ is_valid: false });
        }
      } catch (err) {
        console.error("Verification fetch error:", err);
        setData({ is_valid: false });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [id]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-secondary)" }}>
      <Navbar />

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2.5rem 1.5rem" }}>
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <Loader className="animate-spin" style={{ color: "var(--accent-blue)", margin: "0 auto 1rem auto" }} size={36} />
            <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Decrypting security credential nodes...</p>
          </div>
        ) : data?.is_valid ? (
          <div className="premium-card" style={{ maxWidth: "560px", width: "100%", padding: "3rem 2rem", textAlign: "center", background: "var(--card-bg)" }}>
            {/* Verified Badge Icon */}
            <div style={{ display: "inline-flex", padding: "1rem", background: "rgba(16, 185, 129, 0.08)", borderRadius: "50%", color: "var(--accent-emerald)", marginBottom: "1.5rem" }}>
              <ShieldCheck size={48} />
            </div>

            <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", color: "var(--accent-emerald)", marginBottom: "0.5rem" }}>
              Cryptographically Signed & Verified
            </span>
            
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.5rem" }}>
              Official Certificate of Completion
            </h1>

            <div style={{ borderTop: "1px dashed var(--border-color)", borderBottom: "1px dashed var(--border-color)", padding: "1.5rem 0", margin: "1.5rem 0", textAlign: "left", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>CREDENTIAL HOLDER</span>
                <span style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 700 }}>{data.holder_name}</span>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>PROGRAM COMPLETED</span>
                <span style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 700 }}>{data.course_title}</span>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>DATE OF COMPLETION</span>
                <span style={{ fontSize: "1rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  {data.issued_at ? new Date(data.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                </span>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>VERIFICATION ID</span>
                <code style={{ fontSize: "0.8rem", color: "var(--accent-blue)", fontWeight: 700 }}>{id}</code>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem" }}>
              <a
                href={`/api/v1/certificates/fallback/${id}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", padding: "0.6rem 1.25rem" }}
              >
                <Download size={16} /> Download PDF Copy
              </a>

              <Link
                href="/"
                className="btn btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", padding: "0.6rem 1.25rem" }}
              >
                <Home size={16} /> Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="premium-card" style={{ maxWidth: "480px", width: "100%", padding: "3rem 2rem", textAlign: "center", background: "var(--card-bg)" }}>
            <div style={{ display: "inline-flex", padding: "1rem", background: "rgba(239, 68, 68, 0.08)", borderRadius: "50%", color: "#ef4444", marginBottom: "1.5rem" }}>
              <XCircle size={48} />
            </div>

            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              Invalid Credential
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.5 }}>
              The verification token code provided is invalid or has been revoked. Ensure the verification ID corresponds exactly to the printed code on your graduation metadata.
            </p>

            <Link href="/" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <Home size={16} /> Back to Academy Home
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
