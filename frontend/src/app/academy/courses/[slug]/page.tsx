"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Award, CheckCircle2, PlayCircle, BookOpen } from "lucide-react";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const courseData: Record<string, any> = {
    "ethical-hacking": {
      id: "course-1",
      title: "Ethical Hacking & Penetration Testing",
      level: "Intermediate",
      duration: "40 hours",
      price: "$299",
      description: "Acquire professional ethical hacking credentials. Complete extensive hands-on labs containing vulnerabilities, privilege escalation paths, and routing constraints.",
      modules: [
        "Introduction to Network Reconnaissance",
        "Target Port Scanning & Vulnerability Mapping",
        "Exploitation Frameworks & Custom Shells",
        "Privilege Escalation Strategies (Linux & Windows)",
        "Active Directory Compromise Auditing"
      ]
    },
    "bug-bounty": {
      id: "course-2",
      title: "Practical Bug Bounty Hunting",
      level: "Beginner",
      duration: "30 hours",
      price: "$199",
      description: "Learn web app vulnerability targeting. Learn CVE reporting patterns, verify injections, and start earning bug bounty rewards.",
      modules: [
        "Web Architecture Fundamentals",
        "SQL Injections & Cross-Site Scripting (XSS)",
        "CSRF & Token Validation Bypasses",
        "IDOR & Broken Access Control Checkups",
        "Writing Rigorous Security Advisories"
      ]
    }
  };

  const currentCourse = courseData[slug] || {
    id: "course-3",
    title: "Secure AI Applications Development",
    level: "Advanced",
    duration: "50 hours",
    price: "$399",
    description: "Design multi-agent LLM systems, configure input filters, mitigate prompt injections, and manage MLOps data streams safely.",
    modules: [
      "AI & Large Language Model Mechanics",
      "Retrieval-Augmented Gen (RAG) Architectures",
      "Prompt Injections & Jailbreaking Defenses",
      "Secure Multi-Agent Workflow Operations",
      "MLOps Deployments and Security Hardening"
    ]
  };

  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container" style={{ maxWidth: "45rem" }}>
        
        <button onClick={() => router.push("/academy")} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600, marginBottom: "2rem" }}>
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </button>

        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "3rem", boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", background: "rgba(14, 165, 233, 0.1)", color: "var(--accent-blue)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: 700, textTransform: "uppercase" }}>
                Academy Course Detail
              </span>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.5rem" }}>{currentCourse.title}</h1>
            </div>
            <span style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              {currentCourse.level}
            </span>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "2rem" }}>
            {currentCourse.description}
          </p>

          <div style={{ display: "flex", gap: "2rem", marginBottom: "3rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
              <Clock size={18} style={{ color: "var(--accent-blue)" }} />
              <span>{currentCourse.duration} content</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
              <BookOpen size={18} style={{ color: "var(--accent-teal)" }} />
              <span>PBR Labs & Quizzes</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
              <Award size={18} style={{ color: "var(--accent-violet)" }} />
              <span>PDF Certificate on 100% completion</span>
            </div>
          </div>

          <h3 style={{ fontWeight: 700, marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>Curriculum Syllabus</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem" }}>
            {currentCourse.modules.map((mod: string, idx: number) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--bg-secondary)" }}>
                <PlayCircle size={18} style={{ color: "var(--accent-blue)" }} />
                <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>{mod}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Tuition Price</span>
              <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>{currentCourse.price}</span>
            </div>
            <Link href={`/checkout?course=${currentCourse.id}`} className="btn btn-accent" style={{ padding: "0.75rem 2rem" }}>
              <span>Enroll Now & Start Lab</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
