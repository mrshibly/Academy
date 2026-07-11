import Link from "next/link";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";

export default function CareersPage() {
  const jobs = [
    {
      id: "job-1",
      title: "Senior Security Consultant (Penetration Tester)",
      department: "Security Advisory",
      location: "San Francisco, CA / Remote",
      type: "Full-Time",
      description: "Perform offensive pentesting, AD compromise testing, and lead red-team compromise simulations for tech-forward enterprise organizations."
    },
    {
      id: "job-2",
      title: "AI Core & Solutions Engineer",
      department: "Applied Artificial Intelligence",
      location: "Silicon Valley / Remote",
      type: "Full-Time",
      description: "Build custom LLM workflows, multi-agent frameworks, deploy scalable vector databases, and help configure enterprise integrations."
    },
    {
      id: "job-3",
      title: "Cybersecurity Course Author & Instructor",
      department: "Academy Operations",
      location: "Remote",
      type: "Contract / Full-time",
      description: "Design high-quality educational content, practical security labs, and lecture videos for buggy web apps and network capture challenges."
    }
  ];

  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Join Our Team</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem", maxWidth: "35rem", margin: "0.5rem auto 0 auto" }}>
            Help us build clean enterprise AI platforms and secure modern network infrastructures from complex adversaries.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid" style={{ marginBottom: "5rem" }}>
          <div className="card" style={{ background: "white" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "0.5rem" }}>Remote-First Culture</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Work from anywhere in the world. We value ownership, clean documentation, and results over desk hours.</p>
          </div>
          <div className="card" style={{ background: "white" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "0.5rem" }}>Research & Lab Time</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Every engineer is allotted 20% of their work hours to dedicate to security research, CVE identification, or open-source AI tooling.</p>
          </div>
          <div className="card" style={{ background: "white" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "0.5rem" }}>Health & Learning Budgets</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Premium health insurance plans combined with annual education grants for OSCP, OSCE, or AI development certifications.</p>
          </div>
        </div>

        {/* Job Listings */}
        <div style={{ maxWidth: "45rem", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "2.5rem", textAlign: "center" }}>Open Roles</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {jobs.map((job) => (
              <div key={job.id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "2rem" }}>
                <div style={{ flex: "1 1 400px" }}>
                  <div style={{ display: "flex", gap: "1rem", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Briefcase size={14} /> {job.department}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><MapPin size={14} /> {job.location}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Clock size={14} /> {job.type}</span>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>{job.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.4 }}>{job.description}</p>
                </div>
                <div>
                  <Link href={`/careers/apply/${job.id}`} className="btn btn-outline" style={{ display: "flex", gap: "0.25rem", whiteSpace: "nowrap" }}>
                    <span>Apply Now</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
