import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BrainCircuit, ShieldAlert, Laptop, MessageSquareQuote, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Enterprise AI & Cybersecurity Auditing Services — Academy Bangladesh",
  description: "Elite penetration testing, Web/Mobile audits, custom LLM agent engineering, and Next.js web application development services in Bangladesh.",
};

export default function ServicesPage() {
  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Enterprise Technical Services</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem", maxWidth: "35rem", margin: "0.5rem auto 0 auto" }}>
            High-performance AI engineering, modern application development, and rigorous offensive security assessment.
          </p>
        </div>

        {/* Pillar 1: AI Development */}
        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "3rem", marginBottom: "3rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem" }}>
            <div style={{ flex: "1 1 500px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <BrainCircuit size={32} style={{ color: "var(--accent-violet)" }} />
                <h2 style={{ fontSize: "1.75rem", fontWeight: 700 }}>AI Development & Engineering</h2>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginBottom: "1.5rem" }}>
                We design and build production-ready artificial intelligence systems that automate complex business pipelines and interface securely with your existing backend architectures.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem 2rem", marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}><CheckCircle size={16} style={{ color: "var(--accent-emerald)" }} /> Custom LLM Applications</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}><CheckCircle size={16} style={{ color: "var(--accent-emerald)" }} /> Retrieval-Augmented Gen (RAG)</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}><CheckCircle size={16} style={{ color: "var(--accent-emerald)" }} /> Multi-Agent Workflows</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}><CheckCircle size={16} style={{ color: "var(--accent-emerald)" }} /> Secure MLOps Pipelines</div>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <Link href="/quote?service=ai" className="btn btn-primary" style={{ padding: "0.6rem 1.25rem" }}>
                  <MessageSquareQuote size={18} />
                  <span>Request AI Quote</span>
                </Link>
              </div>
            </div>
            <div style={{ flex: "1 1 300px", padding: "1.5rem", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)" }}>
              <h4 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Featured Case Study</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Built a secure custom LLM agent platform for a financial advisory firm, automating 85% of document classification tasks with full SOC-2 readiness.
              </p>
              <Link href="/research" style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--accent-violet)" }}>
                <span>Read whitepaper</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Pillar 2: Cybersecurity */}
        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "3rem", marginBottom: "3rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem" }}>
            <div style={{ flex: "1 1 500px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <ShieldAlert size={32} style={{ color: "var(--accent-teal)" }} />
                <h2 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Cybersecurity & Offensive Security</h2>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginBottom: "1.5rem" }}>
                Our team conducts thorough security audits, red teaming simulations, and multi-platform penetration tests to expose vulnerabilities before adversaries can exploit them.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem 2rem", marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}><CheckCircle size={16} style={{ color: "var(--accent-emerald)" }} /> Web & API Pentesting</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}><CheckCircle size={16} style={{ color: "var(--accent-emerald)" }} /> Active Directory Hacking</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}><CheckCircle size={16} style={{ color: "var(--accent-emerald)" }} /> Mobile App Audit (iOS/Android)</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}><CheckCircle size={16} style={{ color: "var(--accent-emerald)" }} /> Secure Code & Audit Reviews</div>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <Link href="/quote?service=cyber" className="btn btn-primary" style={{ padding: "0.6rem 1.25rem", backgroundColor: "var(--accent-teal)" }}>
                  <MessageSquareQuote size={18} />
                  <span>Request Security Audit</span>
                </Link>
              </div>
            </div>
            <div style={{ flex: "1 1 300px", padding: "1.5rem", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)" }}>
              <h4 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Research & Advisories</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                We actively discover and disclose CVE vulnerabilities to build authority and ensure the global digital footprint remains protected.
              </p>
              <Link href="/research" style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--accent-teal)" }}>
                <span>View Advisories</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Pillar 3: Application Development */}
        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "3rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem" }}>
            <div style={{ flex: "1 1 500px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <Laptop size={32} style={{ color: "var(--accent-blue)" }} />
                <h2 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Software & Web Development</h2>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginBottom: "1.5rem" }}>
                Clean, robust code engineered for speed, clean UX, and high capacity loads. We build custom dashboards, LMS tools, and SaaS integrations.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem 2rem", marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}><CheckCircle size={16} style={{ color: "var(--accent-emerald)" }} /> Next.js & React Frontends</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}><CheckCircle size={16} style={{ color: "var(--accent-emerald)" }} /> Fast API Async Backends</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}><CheckCircle size={16} style={{ color: "var(--accent-emerald)" }} /> PostgreSQL & Redis Caching</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}><CheckCircle size={16} style={{ color: "var(--accent-emerald)" }} /> Cloud & Docker Deployments</div>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <Link href="/quote?service=dev" className="btn btn-primary" style={{ padding: "0.6rem 1.25rem", backgroundColor: "var(--text-primary)" }}>
                  <MessageSquareQuote size={18} />
                  <span>Request Dev Quote</span>
                </Link>
              </div>
            </div>
            <div style={{ flex: "1 1 300px", padding: "1.5rem", background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)" }}>
              <h4 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Speed & Optimization</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Our applications score 95+ on Google Lighthouse. We focus on compression, caching, and server-side optimization.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
