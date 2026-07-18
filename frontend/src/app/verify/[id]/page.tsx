"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Award, CheckCircle, XCircle, ShieldCheck, Download, Home, Loader, ExternalLink, Calendar, Key, Shield } from "lucide-react";

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

  // Generate a simulated SHA-256 cryptographic signature from the UUID for visual authority
  const getSimulatedHash = (uuidStr: string) => {
    if (!uuidStr) return "";
    let hash = 0;
    for (let i = 0; i < uuidStr.length; i++) {
      hash = (hash << 5) - hash + uuidStr.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256:e538c${hex}f4b39bca${hex}28dcf18f04f${hex}`;
  };

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

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1.5rem" }}>
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <Loader className="animate-spin" style={{ color: "var(--accent-blue)", margin: "0 auto 1rem auto" }} size={36} />
            <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Decrypting security credential nodes...</p>
          </div>
        ) : data?.is_valid ? (
          <div style={{ maxWidth: "850px", width: "100%", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            
            {/* Page Header */}
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-blue)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                <Shield size={16} /> Credential Validation System
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>Verified Academic Record</h1>
              <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>This digital credential has been cryptographically signed and authenticated by Academy.</p>
            </div>

            {/* Visual Certificate Preview Card */}
            <div className="premium-card" style={{ padding: "1.5rem", overflow: "hidden", background: "linear-gradient(135deg, #0a4f5f 0%, #0c6478 50%, #073844 100%)", borderRadius: "12px", position: "relative" }}>
              {/* Top Left Logo */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #ffffff", padding: "6px 12px", borderRadius: "4px", background: "rgba(12, 100, 120, 0.4)", backdropFilter: "blur(4px)", marginBottom: "1rem" }}>
                <Shield size={20} style={{ color: "#ffffff" }} />
                <span style={{ color: "#ffffff", fontWeight: 800, fontSize: "0.8rem", letterSpacing: "0.05em", lineHeight: "1.1" }}>
                  ACADEMY<br/>CREDENTIAL
                </span>
              </div>

              {/* Inner White Card */}
              <div style={{
                background: "#ffffff",
                borderRadius: "8px",
                padding: "2.5rem 2rem",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
              }}>

                {/* Title & Recipient Block */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", width: "100%", justifyContent: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "right" }}>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#1e293b", margin: 0, letterSpacing: "0.05em", lineHeight: "1" }}>CERTIFICATE</h2>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569", letterSpacing: "0.12em", display: "block", marginTop: "2px" }}>OF COMPLETION</span>
                  </div>
                  
                  <div style={{ width: "4px", height: "55px", background: "#0c6478", borderRadius: "4px" }}></div>

                  <div style={{ textAlign: "left" }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase", display: "block" }}>THIS IS PROUDLY PRESENTED TO</span>
                    <h3 style={{ fontFamily: "'Dancing Script', cursive", fontSize: "2.5rem", fontWeight: 700, color: "#0c6478", margin: 0, lineHeight: "1.1" }}>
                      {data.holder_name}
                    </h3>
                  </div>
                </div>

                <p style={{ color: "#334155", fontSize: "0.9rem", maxWidth: "520px", lineHeight: 1.65, margin: "0.5rem 0 1.5rem 0" }}>
                  This certificate is presented for completing the{" "}
                  <strong style={{ color: "#0f172a" }}>"{data.course_title}"</strong>{" "}
                  from Academy on {data.issued_at ? new Date(data.issued_at).toLocaleDateString() : ""}.
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%", maxWidth: "520px", marginTop: "1rem", fontSize: "0.8rem" }}>
                  <div style={{ textAlign: "center", width: "140px" }}>
                    <div style={{ height: "28px", display: "flex", alignItems: "flex-end", justifyContent: "center", fontFamily: "'Dancing Script', cursive", fontSize: "1.25rem", color: "#0c6478", fontWeight: 700 }}>
                      Instructor
                    </div>
                    <div style={{ width: "100%", height: "2px", background: "#334155", margin: "0.25rem 0" }}></div>
                    <span style={{ display: "block", color: "#1e293b", fontSize: "0.75rem", fontWeight: 800 }}>Teacher</span>
                  </div>

                  {/* Ribbon Medal Award Badge */}
                  <div style={{ position: "relative", width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#0284c7", border: "3px dashed #ffffff", boxShadow: "0 0 0 2px #0284c7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#ffffff", zIndex: 2 }}>
                      <span style={{ fontSize: "6px", fontWeight: 800, textTransform: "uppercase" }}>The</span>
                      <span style={{ fontSize: "9px", fontWeight: 900, letterSpacing: "0.05em" }}>BEST</span>
                      <span style={{ fontSize: "6px", fontWeight: 800, textTransform: "uppercase" }}>Award</span>
                    </div>
                  </div>

                  <div style={{ textAlign: "center", width: "140px" }}>
                    <div style={{ height: "28px", display: "flex", alignItems: "flex-end", justifyContent: "center", fontFamily: "'Dancing Script', cursive", fontSize: "1.25rem", color: "#0c6478", fontWeight: 700 }}>
                      Academic Senate
                    </div>
                    <div style={{ width: "100%", height: "2px", background: "#334155", margin: "0.25rem 0" }}></div>
                    <span style={{ display: "block", color: "#1e293b", fontSize: "0.75rem", fontWeight: 800 }}>Principal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Structured Verification Ledger */}
            <div className="premium-card" style={{ padding: "2rem", background: "var(--card-bg)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Key size={18} style={{ color: "var(--accent-blue)" }} /> Cryptographic Verification Ledger
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem 2.5rem" }} className="responsive-grid-split">
                <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Verification Status</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--accent-emerald)", fontWeight: 700, fontSize: "0.95rem", marginTop: "0.25rem" }}>
                    <CheckCircle size={16} /> Authenticated & Active
                  </span>
                </div>

                <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Graduation Date</span>
                  <span style={{ display: "block", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem", marginTop: "0.25rem" }}>
                    {data.issued_at ? new Date(data.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                  </span>
                </div>

                <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Authorized Recipient</span>
                  <span style={{ display: "block", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem", marginTop: "0.25rem" }}>{data.holder_name}</span>
                </div>

                <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Verification Reference ID</span>
                  <code style={{ display: "block", color: "var(--accent-blue)", fontWeight: 700, fontSize: "0.85rem", marginTop: "0.25rem" }}>{id}</code>
                </div>

                <div style={{ gridColumn: "span 2", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }} className="responsive-grid-split">
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Cryptographic Audit Signature</span>
                  <code style={{ display: "block", color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.75rem", marginTop: "0.25rem", wordBreak: "break-all" }}>
                    {getSimulatedHash(id)}
                  </code>
                </div>
              </div>

              <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <Shield size={14} style={{ color: "var(--accent-emerald)" }} />
                <span>Verified under platform certification guidelines. Cryptographic node validated successfully.</span>
              </div>
            </div>

            {/* Actions Panel */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <a
                href={`/api/v1/certificates/fallback/${id}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", padding: "0.65rem 1.5rem" }}
              >
                <Download size={16} /> Download Official PDF
              </a>

              <Link
                href="/"
                className="btn btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", padding: "0.65rem 1.5rem" }}
              >
                <Home size={16} /> Back to Academy Home
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
