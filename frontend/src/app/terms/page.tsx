export default function TermsPage() {
  return (
    <div style={{ padding: "5rem 0" }}>
      <div className="container" style={{ maxWidth: "42rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "1.5rem" }}>Terms of Service</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "2rem" }}>Last updated: July 11, 2026</p>

        <div style={{ lineHeight: 1.8, fontSize: "1.025rem", display: "flex", flexDirection: "column", gap: "1.5rem", color: "var(--text-secondary)" }}>
          <p>
            Welcome to <strong style={{ color: "var(--text-primary)" }}>Academy</strong>. By accessing our platform, course catalogs, or engaging our consulting services, you agree to comply with the terms set forth below.
          </p>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "1rem" }}>1. Permitted Use & Hacking Lab Rules</h2>
          <p>
            Ethical hacking challenges, target networks, and payload validation scripts provided in our modules must be executed STRICTLY inside our isolated containers. Running these payloads or scanning corporate networks outside the sandboxed workspace is a violation of these terms.
          </p>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "1rem" }}>2. Academic License</h2>
          <p>
            Upon course purchase, you are granted a non-transferable, single-user license to consume video modules and complete quizzes. Sharing account credentials will result in instant session termination.
          </p>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "1rem" }}>3. Refunding Terms</h2>
          <p>
            Tuition seats for cohort programs and self-paced course tracks are non-refundable once practice labs have been launched.
          </p>
        </div>
      </div>
    </div>
  );
}
