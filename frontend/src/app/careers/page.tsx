"use client";

import { useEffect, useState } from "react";
import { Briefcase, MapPin, Clock, ArrowRight, Loader, User, Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Application Modal state
  const [applyJob, setApplyJob] = useState<any | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/v1/careers");
      if (response.ok) {
        setJobs(await response.json());
      }
    } catch (err) {
      console.error("Error loading jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyJob) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/careers/${applyJob.slug}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          cover_letter: coverLetter,
          resume_url: ""
        })
      });

      if (!response.ok) {
        throw new Error("Failed to submit application. Please verify details.");
      }

      setSuccess(true);
      setFullName("");
      setEmail("");
      setCoverLetter("");
    } catch (err: any) {
      setError(err.message || "Error submitting job application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container" style={{ maxWidth: "56rem" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{
            display: "inline-block",
            background: "rgba(16, 185, 129, 0.08)",
            color: "var(--accent-emerald)",
            padding: "0.35rem 1rem",
            borderRadius: "9999px",
            fontSize: "0.8rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "1rem"
          }}>
            Join the Mission
          </span>
          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Careers & Open Positions</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem" }}>
            Help us build clean enterprise AI platforms and secure modern network infrastructures.
          </p>
        </div>

        {/* Modal Overlay / Form view */}
        {applyJob ? (
          <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "3rem", marginBottom: "4rem", boxShadow: "var(--shadow-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "2rem" }}>
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--accent-emerald)", fontWeight: 700 }}>APPLYING FOR POSITION</span>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{applyJob.title}</h2>
              </div>
              <button className="btn btn-outline" onClick={() => { setApplyJob(null); setSuccess(false); setError(null); }} style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                Close Form
              </button>
            </div>

            {success ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <CheckCircle2 size={56} style={{ color: "var(--accent-emerald)", margin: "0 auto 1.5rem auto" }} />
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Application Received</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
                  Thank you. Our operations directors will review your application and resume. We will contact you soon.
                </p>
                <button className="btn btn-primary" onClick={() => { setApplyJob(null); setSuccess(false); }}>
                  Return to Listings
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {error && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "0.75rem", borderRadius: "6px", fontSize: "0.85rem" }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Full Name *</label>
                  <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid var(--border-color)", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Email Address *</label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid var(--border-color)", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Cover Letter & Resume Summary *</label>
                  <textarea required value={coverLetter} rows={6} placeholder="Provide details of your experience, certifications (OSCP, OSCE, etc.), and link to your online resume/portfolio." onChange={(e) => setCoverLetter(e.target.value)} style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid var(--border-color)", outline: "none", fontFamily: "sans-serif" }} />
                </div>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                  <Send size={16} />
                  <span>{submitting ? "Submitting application..." : "Send Application"}</span>
                </button>
              </form>
            )}
          </div>
        ) : null}

        {/* Listings */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <Loader className="animate-spin text-accent" style={{ color: "var(--accent-blue)" }} size={32} />
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "4rem 2rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>No open positions currently listed. Please check back later!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {jobs.map((job) => (
              <div key={job.id} style={{
                background: "white",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1.5rem"
              }}>
                <div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.1)", color: "var(--accent-emerald)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 700, textTransform: "uppercase" }}>
                      {job.department}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)" }}>{job.title}</h3>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <MapPin size={14} />
                      {job.location}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Briefcase size={14} />
                      {job.type}
                    </span>
                  </div>
                </div>

                <button className="btn btn-accent" onClick={() => setApplyJob(job)}>
                  <span>Apply Now</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
