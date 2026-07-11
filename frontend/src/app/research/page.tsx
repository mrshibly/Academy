import Link from "next/link";
import { ShieldCheck, FileText, ArrowUpRight, Search, Download } from "lucide-react";

export default function ResearchPage() {
  const publications = [
    {
      id: "pub-1",
      title: "Mitigating Prompt Injections in Multi-Agent LLM Architectures",
      type: "Whitepaper",
      date: "June 2026",
      abstract: "This paper introduces a robust guardrail design pattern utilizing isolated verification nodes to detect and neutralize indirect prompt injections in autonomous agent workflows.",
      tags: ["AI Security", "Large Language Models", "Defense Models"]
    },
    {
      id: "pub-2",
      title: "CVE-2026-10291: Authentication Bypass in Corporate ERP Router Engines",
      type: "Security Advisory",
      date: "May 2026",
      abstract: "Detailed breakdown of a critical zero-day authentication bypass vulnerability discovered by our red teaming group in a widely-deployed ERP routing middleware.",
      tags: ["Offensive Security", "CVE Disclosure", "ERP Security"]
    },
    {
      id: "pub-3",
      title: "Zero-Trust Deployment Blueprints for AWS Active Directory Integrations",
      type: "Whitepaper",
      date: "April 2026",
      abstract: "A comprehensive guide to configuring zero-trust networking parameters, securing DNS routing pathways, and blocking kerberoasting threats in cloud environments.",
      tags: ["Cloud Security", "Active Directory", "Zero-Trust"]
    }
  ];

  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Research & Advisories</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem", maxWidth: "35rem", margin: "0.5rem auto 0 auto" }}>
            Disclosures, whitepapers, and technical analysis authored by our security researchers and core engineers.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ maxWidth: "35rem", margin: "0 auto 3rem auto", position: "relative" }}>
          <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={18} />
          <input
            type="text"
            placeholder="Search papers, CVEs, or advisories..."
            style={{
              width: "100%",
              padding: "0.75rem 1rem 0.75rem 2.75rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              fontSize: "0.95rem",
              outline: "none"
            }}
          />
        </div>

        {/* Publications List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "50rem", margin: "0 auto" }}>
          {publications.map((pub) => (
            <div key={pub.id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <span style={{
                  display: "inline-block",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  background: pub.type === "Whitepaper" ? "rgba(139, 92, 246, 0.1)" : "rgba(13, 148, 136, 0.1)",
                  color: pub.type === "Whitepaper" ? "var(--accent-violet)" : "var(--accent-teal)"
                }}>
                  {pub.type}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{pub.date}</span>
              </div>

              <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
                {pub.title}
              </h3>

              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                {pub.abstract}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {pub.tags.map((t) => (
                    <span key={t} style={{ fontSize: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "0.2rem 0.5rem", borderRadius: "4px", color: "var(--text-secondary)" }}>
                      {t}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <Link href={`/research/${pub.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--accent-blue)" }}>
                    <span>Read online</span>
                    <ArrowUpRight size={16} />
                  </Link>
                  <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                    <Download size={14} />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
