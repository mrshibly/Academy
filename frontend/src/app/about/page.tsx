import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Cpu, Users, Award, Target, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — Academy Bangladesh",
  description: "Learn more about our elite team of OSCP & OSCE certified security consultants and our secure Applied AI mission in Bangladesh.",
};

export default function AboutPage() {
  const team = [
    { name: "Alex Mercer", role: "Principal Security Consultant", certs: "OSCP, OSCE, OSWE", desc: "10+ years of offensive penetration testing and infrastructure compromise simulation.", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80&auto=format&fit=crop" },
    { name: "Dr. Sarah Chen", role: "AI Research Lead", certs: "PhD Machine Learning", desc: "Author of multiple whitepapers on LLM prompt injection defense and secure agent orchestration.", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&auto=format&fit=crop" },
    { name: "Marcus Vance", role: "Director of Academy Operations", certs: "CISSP, CEH", desc: "Designed training pipelines for 10,000+ engineers globally across cybersecurity tracks.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop" }
  ];

  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container">
        
        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
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
            Who We Are
          </span>
          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>About Our Academy</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.15rem", marginTop: "0.5rem", maxWidth: "38rem", margin: "0.5rem auto 0 auto", lineHeight: 1.6 }}>
            We exist at the convergence of Applied AI and Offensive Security, delivering state-of-the-art enterprise services and practitioner-led bootcamps.
          </p>
        </div>

        {/* Visual Banner */}
        <div style={{
          position: "relative",
          height: "400px",
          borderRadius: "16px",
          overflow: "hidden",
          marginBottom: "5rem",
          boxShadow: "var(--shadow-lg)"
        }}>
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80&auto=format&fit=crop"
            alt="Academy Team Work"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, transparent 40%, rgba(15, 23, 42, 0.9) 100%)",
            display: "flex",
            alignItems: "flex-end",
            padding: "3rem"
          }}>
            <div>
              <h3 style={{ color: "white", fontSize: "1.75rem", fontWeight: 800 }}>Pioneering Secure AI Operations</h3>
              <p style={{ color: "#cbd5e1", marginTop: "0.5rem", maxWidth: "32rem" }}>
                Our solutions enable tech-forward companies to deploy custom LLMs securely while defending their network perimeters from advanced adversaries.
              </p>
            </div>
          </div>
        </div>

        {/* Value Pillars */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2.5rem", marginBottom: "6rem" }}>
          <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "2rem" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "rgba(14, 165, 233, 0.1)", color: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>Technical Rigor</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              No marketing fluff. All of our course content and advisory perimeters are designed and reviewed by elite practitioner labs.
            </p>
          </div>

          <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "2rem" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "rgba(139, 92, 246, 0.1)", color: "var(--accent-violet)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>Applied AI Focus</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              We build and secure agents, configure scalable vector indexing databases, and block critical injection flaws in modern applications.
            </p>
          </div>

          <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "2rem" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "rgba(13, 148, 136, 0.1)", color: "var(--accent-teal)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <Target size={24} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>Zero-Trust Integrity</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Every network boundary, Active Directory forest, and API pipeline is verified under the most rigorous standards.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800 }}>Meet the Instructors</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Elite credential holders directing our live bootcamps and corporate training.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2.5rem" }}>
            {team.map((member, i) => (
              <div key={i} style={{ background: "white", borderRadius: "12px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                <div style={{ height: "260px", overflow: "hidden" }}>
                  <img
                    src={member.img}
                    alt={member.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <h4 style={{ fontWeight: 700, fontSize: "1.2rem" }}>{member.name}</h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>{member.role}</span>
                    <span style={{ fontSize: "0.75rem", background: "rgba(14, 165, 233, 0.1)", color: "var(--accent-blue)", padding: "0.15rem 0.4rem", borderRadius: "4px", fontWeight: 600 }}>
                      {member.certs}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "1rem", lineHeight: 1.5 }}>
                    {member.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
