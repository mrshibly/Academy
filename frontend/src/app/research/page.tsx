"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, FileText, ArrowUpRight, Search, Download, Loader } from "lucide-react";

export default function ResearchPage() {
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPubs = async () => {
      try {
        const response = await fetch("/api/v1/research");
        if (response.ok) {
          setPublications(await response.json());
        }
      } catch (err) {
        console.error("Error loading research publications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPubs();
  }, []);

  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container" style={{ maxWidth: "56rem" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{
            display: "inline-block",
            background: "rgba(14, 165, 233, 0.08)",
            color: "var(--accent-blue)",
            padding: "0.35rem 1rem",
            borderRadius: "9999px",
            fontSize: "0.8rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "1rem"
          }}>
            Technical Publications
          </span>
          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Research & Advisories</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem" }}>
            Disclosures, whitepapers, and technical analysis authored by our security researchers and core engineers.
          </p>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <Loader className="animate-spin text-accent" style={{ color: "var(--accent-blue)" }} size={32} />
          </div>
        ) : publications.length === 0 ? (
          <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "4rem 2rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>No research papers or advisories released yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {publications.map((pub) => (
              <div key={pub.id} style={{
                background: "white",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "2.25rem",
                boxShadow: "var(--shadow-sm)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
                      <span style={{ fontSize: "0.75rem", background: "rgba(139, 92, 246, 0.1)", color: "var(--accent-violet)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 700, textTransform: "uppercase" }}>
                        {pub.type}
                      </span>
                      {pub.cve_id && (
                        <span style={{ fontSize: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 700 }}>
                          {pub.cve_id}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)" }}>{pub.title}</h3>
                  </div>
                  {pub.file_url && (
                    <a href={pub.file_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                      <Download size={14} />
                      <span>PDF Document</span>
                    </a>
                  )}
                </div>

                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginTop: "1rem" }}>
                  {pub.abstract}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
