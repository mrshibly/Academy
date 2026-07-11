"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Download, Calendar, Tag } from "lucide-react";

export default function ResearchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const data: Record<string, any> = {
    "pub-1": {
      title: "Mitigating Prompt Injections in Multi-Agent LLM Architectures",
      type: "Whitepaper",
      date: "June 2026",
      tags: ["AI Security", "Large Language Models", "Defense Models"],
      content: "As autonomous agent workflows become increasingly integrated into enterprise software pipelines, the threat of indirect prompt injections grows exponentially. This research outlines a multi-stage validation framework that sanitizes input vectors prior to pipeline ingestion. We demonstrate how introducing isolated validation LLM checkpoints reduces injection vulnerabilities by up to 98.4% without introducing significant query latency."
    },
    "pub-2": {
      title: "CVE-2026-10291: Authentication Bypass in Corporate ERP Router Engines",
      type: "Security Advisory",
      date: "May 2026",
      tags: ["Offensive Security", "CVE Disclosure", "ERP Security"],
      content: "This advisory details a critical vulnerability discovered in popular ERP router configurations. By exploiting parameter sequence mismatch triggers during the initial handshake, remote unauthenticated adversaries could bypass credential check logic and execute API commands under full administrator context. Patch versions have been merged in coordination with upstream vendors."
    }
  };

  const currentPub = data[slug] || {
    title: "Zero-Trust Deployment Blueprints for AWS Active Directory Integrations",
    type: "Whitepaper",
    date: "April 2026",
    tags: ["Cloud Security", "Active Directory", "Zero-Trust"],
    content: "Zero-trust model deployments require complete configuration validation. This paper highlights access controls parameters in hybrid cloud configurations, mapping Kerberoasting exposures, secure ticket signing, and directory path boundaries."
  };

  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container" style={{ maxWidth: "42rem" }}>
        
        <button onClick={() => router.push("/research")} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600, marginBottom: "2rem" }}>
          <ArrowLeft size={16} />
          <span>Back to Research</span>
        </button>

        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "3rem", boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <span style={{
              display: "inline-block",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 600,
              background: currentPub.type === "Whitepaper" ? "rgba(139, 92, 246, 0.1)" : "rgba(13, 148, 136, 0.1)",
              color: currentPub.type === "Whitepaper" ? "var(--accent-violet)" : "var(--accent-teal)"
            }}>
              {currentPub.type}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Calendar size={14} />
              {currentPub.date}
            </span>
          </div>

          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "1.5rem" }}>{currentPub.title}</h1>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2.5rem" }}>
            {currentPub.tags.map((t: string) => (
              <span key={t} style={{ fontSize: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "0.2rem 0.5rem", borderRadius: "4px", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                <Tag size={12} />
                {t}
              </span>
            ))}
          </div>

          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2rem", marginBottom: "3rem" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "0.75rem" }}>Abstract Description</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.975rem", lineHeight: 1.6 }}>
              {currentPub.content}
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "2rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Publication ID: {slug}</span>
            <a href="#" className="btn btn-primary" style={{ display: "flex", gap: "0.5rem" }}>
              <Download size={18} />
              <span>Download Full Document PDF</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
