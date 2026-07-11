import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Users, Shield, Target, ArrowRight, Video, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Live Bootcamps & Hacking Cohorts — Academy Bangladesh",
  description: "Enroll in live virtual ethical hacking classes, offensive penetration testing training, and secure AI systems engineering bootcamps in Bangladesh.",
};

export default function TrainingPage() {
  const bootcamps = [
    { title: "Offensive Security Cohort", schedule: "August 1st — October 15th, 2026", format: "Live Virtual + Practical Labs", description: "Comprehensive preparation covering active directory compromise, buffer overflows, and complex network pivoting.", price: "৳35,000 / Seat" },
    { title: "Secure AI Solutions Architect", schedule: "September 5th — October 30th, 2026", format: "Live Class + Capstone Project", description: "Design fully secure enterprise agent architectures, secure RAG nodes, and protect models from malicious prompt injections.", price: "৳45,000 / Seat" }
  ];

  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container">
        
        {/* Header */}
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
            Cohorts & Live Programs
          </span>
          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Live Training & Bootcamps</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem", maxWidth: "35rem", margin: "0.5rem auto 0 auto" }}>
            Rigorous live cohort training directed by OSCP security experts and production AI engineers.
          </p>
        </div>

        {/* Bootcamp Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginBottom: "5rem" }}>
          {bootcamps.map((camp, idx) => (
            <div key={idx} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "3rem", display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", color: "var(--accent-blue)", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>
                <Video size={16} />
                <span>{camp.format}</span>
              </div>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.75rem" }}>{camp.title}</h3>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem", fontWeight: 500 }}>
                <Calendar size={14} />
                <span>{camp.schedule}</span>
              </div>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "1rem", flex: 1, marginBottom: "2rem" }}>
                {camp.description}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>{camp.price}</span>
                <Link href="/book" className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}>
                  <span>Apply Seat</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Corporate L&D Promo */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "white",
          borderRadius: "var(--radius-md)",
          padding: "4rem",
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "4rem",
          alignItems: "center"
        }}>
          <div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "1rem" }}>Corporate Cohorts & Custom Curricula</h2>
            <p style={{ color: "#94a3b8", fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "2rem" }}>
              Looking to upskill your entire development or security team? We design tailored bootcamps, configure isolated target practice labs, and issue branded completion certificates.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <Link href="/quote?service=corporate" className="btn btn-accent" style={{ color: "white" }}>
                <MessageSquare size={16} />
                <span>Request Corporate Quote</span>
              </Link>
            </div>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&q=80&auto=format&fit=crop"
              alt="Corporate Training Workspace"
              style={{ width: "100%", height: "260px", objectFit: "cover", borderRadius: "12px" }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
