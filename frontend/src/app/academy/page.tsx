import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Award, ShieldAlert, Cpu } from "lucide-react";

export default function AcademyPage() {
  const courses = [
    {
      id: "course-1",
      title: "Ethical Hacking & Penetration Testing",
      slug: "ethical-hacking",
      track: "Cybersecurity",
      level: "Intermediate",
      duration: "40 hours",
      price: "$299",
      description: "Learn offensive security techniques, network penetration testing, and practical vulnerability identification from scratch.",
      icon: ShieldAlert,
      color: "var(--accent-teal)"
    },
    {
      id: "course-2",
      title: "Practical Bug Bounty Hunting",
      slug: "bug-bounty",
      track: "Cybersecurity",
      level: "Beginner",
      duration: "30 hours",
      price: "$199",
      description: "A complete guide to finding web application vulnerabilities, writing security advisories, and earning bug bounty rewards.",
      icon: ShieldAlert,
      color: "var(--accent-teal)"
    },
    {
      id: "course-3",
      title: "Secure AI Applications Development",
      slug: "secure-ai-dev",
      track: "AI & Engineering",
      level: "Advanced",
      duration: "50 hours",
      price: "$399",
      description: "Architect secure multi-agent platforms, LLM applications, defend against prompt injections, and manage secure data pipelines.",
      icon: Cpu,
      color: "var(--accent-violet)"
    },
    {
      id: "course-4",
      title: "Production LLM Orchestration",
      slug: "llm-orchestration",
      track: "AI & Engineering",
      level: "Intermediate",
      duration: "35 hours",
      price: "$249",
      description: "Deploy custom RAG systems, configure vector databases, set up cache pools, and optimize high-throughput model architectures.",
      icon: Cpu,
      color: "var(--accent-violet)"
    }
  ];

  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Academy Catalog</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem", maxWidth: "35rem", margin: "0.5rem auto 0 auto" }}>
            Curated tracks designed to build qualified practitioners in artificial intelligence and offensive security.
          </p>
        </div>

        {/* Tracks Navigation / Filters */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "3rem" }}>
          <span style={{ cursor: "pointer", padding: "0.5rem 1.25rem", borderRadius: "9999px", background: "var(--text-primary)", color: "white", fontWeight: 600, fontSize: "0.9rem" }}>
            All Courses
          </span>
          <span style={{ cursor: "pointer", padding: "0.5rem 1.25rem", borderRadius: "9999px", background: "white", border: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.9rem" }}>
            Cybersecurity Track
          </span>
          <span style={{ cursor: "pointer", padding: "0.5rem 1.25rem", borderRadius: "9999px", background: "white", border: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.9rem" }}>
            AI Track
          </span>
        </div>

        {/* Course Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2.5rem" }}>
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <div key={course.id} className="card hover-lift" style={{ background: "white", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                  <div style={{
                    width: "2.75rem",
                    height: "2.75rem",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(15, 23, 42, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: course.color
                  }}>
                    <Icon size={22} />
                  </div>
                  <span style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)"
                  }}>
                    {course.level}
                  </span>
                </div>

                <span style={{ fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  {course.track}
                </span>

                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
                  {course.title}
                </h3>

                <p style={{ color: "var(--text-secondary)", fontSize: "0.925rem", lineHeight: 1.5, marginBottom: "1.5rem", flex: "1" }}>
                  {course.description}
                </p>

                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "1rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Clock size={14} />
                      {course.duration}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <BookOpen size={14} />
                      Practice Labs
                    </span>
                  </div>
                  <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {course.price}
                  </span>
                </div>

                <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <Link href={`/academy/courses/${course.slug}`} className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "0.5rem" }}>
                    Curriculum
                  </Link>
                  <Link href={`/checkout?course=${course.id}`} className="btn btn-accent" style={{ fontSize: "0.85rem", padding: "0.5rem" }}>
                    Buy Course
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
