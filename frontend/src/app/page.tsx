import Link from "next/link";
import { ArrowRight, ShieldCheck, BrainCircuit, Cpu, Users, Award, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container" style={{ padding: "4rem 0" }}>
          <span style={{
            display: "inline-block",
            background: "rgba(14, 165, 233, 0.1)",
            color: "var(--accent-blue)",
            padding: "0.4rem 1rem",
            borderRadius: "9999px",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "1.5rem"
          }}>
            Secure AI & Cybersecurity Services
          </span>
          <h1 className="hero-title" style={{ maxWidth: "55rem", margin: "0 auto 1.5rem auto" }}>
            The Convergence of Applied AI & Offensive Security
          </h1>
          <p className="hero-subtitle">
            Enterprise AI architectures, advanced penetration testing services, and professional-grade practitioner bootcamps to future-proof your organization.
          </p>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/academy" className="btn btn-accent">
              <span>Explore Academy</span>
              <ArrowRight size={18} />
            </Link>
            <Link href="/book" className="btn btn-outline">
              <span>Book Consultation</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Verification Badges */}
      <section style={{ background: "#ffffff", borderBottom: "1px solid var(--border-color)", padding: "2.5rem 0" }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around", alignItems: "center", gap: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-secondary)" }}>
            <Award size={24} style={{ color: "var(--accent-teal)" }} />
            <span style={{ fontWeight: 600 }}>OSCP & OSCE Certified Instructors</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-secondary)" }}>
            <BrainCircuit size={24} style={{ color: "var(--accent-violet)" }} />
            <span style={{ fontWeight: 600 }}>Custom LLM & RAG Solutions</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-secondary)" }}>
            <ShieldCheck size={24} style={{ color: "var(--accent-blue)" }} />
            <span style={{ fontWeight: 600 }}>ISO 27001 Audit Ready Services</span>
          </div>
        </div>
      </section>

      {/* Main Pillars Section */}
      <section style={{ padding: "6rem 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.25rem", fontWeight: 700, letterSpacing: "-0.025em" }}>Our Core Offerings</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Structured to deliver technical excellence for businesses and practitioners.</p>
          </div>

          <div className="grid">
            {/* Pillar 1: AI Services */}
            <div className="card hover-lift">
              <div className="card-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "var(--accent-violet)" }}>
                <Cpu size={24} />
              </div>
              <h3 className="card-title">AI & Software Engineering</h3>
              <p className="card-text" style={{ marginBottom: "1.5rem" }}>
                End-to-end custom artificial intelligence systems, multi-agent LLM systems, MLOps orchestration, computer vision, and secure application development.
              </p>
              <Link href="/services" style={{ color: "var(--accent-violet)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <span>Learn more</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Pillar 2: Cybersecurity */}
            <div className="card hover-lift">
              <div className="card-icon" style={{ background: "rgba(13, 148, 136, 0.1)", color: "var(--accent-teal)" }}>
                <ShieldCheck size={24} />
              </div>
              <h3 className="card-title">Cybersecurity Services</h3>
              <p className="card-text" style={{ marginBottom: "1.5rem" }}>
                Offensive pentesting (Web, Mobile, AD, API), red teaming simulations, threat modeling, AI security audits, and cloud configuration hardening.
              </p>
              <Link href="/services" style={{ color: "var(--accent-teal)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <span>Learn more</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Pillar 3: Academy */}
            <div className="card hover-lift">
              <div className="card-icon" style={{ background: "rgba(14, 165, 233, 0.1)", color: "var(--accent-blue)" }}>
                <BookOpen size={24} />
              </div>
              <h3 className="card-title">Training Academy</h3>
              <p className="card-text" style={{ marginBottom: "1.5rem" }}>
                Self-paced curricula and intensive live bootcamps covering ethical hacking, practical bug hunting, secure coding, and production LLM orchestration.
              </p>
              <Link href="/academy" style={{ color: "var(--accent-blue)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <span>Browse catalog</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics & Statistics */}
      <section style={{ background: "#ffffff", padding: "5rem 0", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "3rem", textAlign: "center" }}>
          <div>
            <h3 style={{ fontSize: "2.75rem", fontWeight: 800, color: "var(--accent-blue)" }}>98%</h3>
            <p style={{ color: "var(--text-secondary)", fontWeight: 500, marginTop: "0.25rem" }}>Course Completion Rate</p>
          </div>
          <div>
            <h3 style={{ fontSize: "2.75rem", fontWeight: 800, color: "var(--accent-teal)" }}>50+</h3>
            <p style={{ color: "var(--text-secondary)", fontWeight: 500, marginTop: "0.25rem" }}>Enterprise Clients Served</p>
          </div>
          <div>
            <h3 style={{ fontSize: "2.75rem", fontWeight: 800, color: "var(--accent-violet)" }}>10k+</h3>
            <p style={{ color: "var(--text-secondary)", fontWeight: 500, marginTop: "0.25rem" }}>Certified Graduates</p>
          </div>
          <div>
            <h3 style={{ fontSize: "2.75rem", fontWeight: 800, color: "var(--text-primary)" }}>100%</h3>
            <p style={{ color: "var(--text-secondary)", fontWeight: 500, marginTop: "0.25rem" }}>Practical Lab Focus</p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section style={{ padding: "6rem 0", background: "radial-gradient(circle at center, rgba(14, 165, 233, 0.05) 0%, transparent 100%)", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "1rem" }}>Ready to Build or Harden?</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "35rem", margin: "0 auto 2rem auto" }}>
            Speak directly with our senior developers and security engineers to build custom platforms or protect existing systems.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/book" className="btn btn-primary">
              <PhoneCallIcon />
              <span>Schedule Call</span>
            </Link>
            <Link href="/quote" className="btn btn-outline" style={{ background: "white" }}>
              <span>Request Quote</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Simple helpers
function PhoneCallIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  );
}
