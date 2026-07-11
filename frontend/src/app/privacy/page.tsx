export default function PrivacyPage() {
  return (
    <div style={{ padding: "5rem 0" }}>
      <div className="container" style={{ maxWidth: "42rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "1.5rem" }}>Privacy Policy</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "2rem" }}>Last updated: July 11, 2026</p>

        <div style={{ lineHeight: 1.8, fontSize: "1.025rem", display: "flex", flexDirection: "column", gap: "1.5rem", color: "var(--text-secondary)" }}>
          <p>
            At <strong style={{ color: "var(--text-primary)" }}>Academy</strong>, we take the confidentiality of your academic progress and security metrics seriously. This Privacy Policy details how we collect, process, and protect your information.
          </p>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "1rem" }}>1. Data Collection</h2>
          <p>
            We collect your full name, email address, password hashes, billing credentials, and course progress coordinates during your enrollment cycle.
          </p>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "1rem" }}>2. Processing Scope</h2>
          <p>
            Your information is processed to maintain login authentication sessions, track module and lesson completions, compute average grades, issue completion certificates, and verify compliance under ISO 27001 requirements.
          </p>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "1rem" }}>3. Academic Integrity</h2>
          <p>
            Practitioner lab solutions and answer submissions are logged strictly for grading verification. They are never shared, white-labeled, or sold to external corporate recruiting agencies.
          </p>
        </div>
      </div>
    </div>
  );
}
