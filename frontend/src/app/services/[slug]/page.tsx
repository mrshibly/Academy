"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, Cpu, Laptop, MessageSquareQuote, Check } from "lucide-react";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  // Custom data based on slugs
  const serviceDetails: Record<string, any> = {
    "ai-dev": {
      title: "AI & Software Engineering Services",
      icon: Cpu,
      color: "var(--accent-violet)",
      subtitle: "Custom multi-agent architectures, LLM workflow systems, and secure MLOps deployments.",
      bullets: [
        "LLM fine-tuning and retrieval-augmented generation (RAG)",
        "Secure APIs and backend integration frameworks",
        "Autonomous multi-agent task execution architectures",
        "Scalable MLOps workflows and vector database deployments"
      ]
    },
    "pentesting": {
      title: "Offensive Penetration Testing",
      icon: ShieldAlert,
      color: "var(--accent-teal)",
      subtitle: " Rigorous security testing targeting applications, directory hierarchies, and cloud configs.",
      bullets: [
        "Web, Mobile (iOS & Android), and API penetration testing",
        "Active Directory hacking and internal compromise audits",
        "Red teaming simulation challenges targeting organizations",
        "Secure code audits and threat modeling designs"
      ]
    }
  };

  const currentService = serviceDetails[slug] || {
    title: "Technical Advisory & Services",
    icon: Laptop,
    color: "var(--accent-blue)",
    subtitle: "Custom software solutions engineered for production capacity, scalability, and security.",
    bullets: [
      "Next.js high-performance web frontends",
      "FastAPI lightweight backend databases integrations",
      "Docker deployments and microservices management",
      "Robust caching models with Redis configurations"
    ]
  };

  const Icon = currentService.icon;

  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container" style={{ maxWidth: "42rem" }}>
        
        <button onClick={() => router.push("/services")} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600, marginBottom: "2rem" }}>
          <ArrowLeft size={16} />
          <span>Back to Services</span>
        </button>

        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "3rem", boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{
              width: "3.5rem",
              height: "3.5rem",
              borderRadius: "var(--radius-sm)",
              background: "rgba(15, 23, 42, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: currentService.color
            }}>
              <Icon size={28} />
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{currentService.title}</h1>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "2.5rem" }}>
            {currentService.subtitle}
          </p>

          <h3 style={{ fontWeight: 700, marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>Deliverables & Scope</h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem" }}>
            {currentService.bullets.map((b: string, i: number) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontSize: "0.975rem", color: "var(--text-secondary)" }}>
                <Check size={18} style={{ color: "var(--accent-emerald)", marginTop: "0.2rem", flexShrink: 0 }} />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Link href={`/quote?service=${slug}`} className="btn btn-primary" style={{ display: "flex", gap: "0.5rem" }}>
              <MessageSquareQuote size={18} />
              <span>Request Quote</span>
            </Link>
            <Link href="/book" className="btn btn-outline">
              <span>Book Discovery Call</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
