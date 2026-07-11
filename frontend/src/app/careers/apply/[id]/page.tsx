"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, CheckCircle2, Upload, FileText } from "lucide-react";

export default function JobApplyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const jobDetails: Record<string, any> = {
    "job-1": { title: "Senior Security Consultant (Penetration Tester)", dept: "Security Advisory" },
    "job-2": { title: "AI Core & Solutions Engineer", dept: "Applied Artificial Intelligence" }
  };

  const currentJob = jobDetails[id] || { title: "Cybersecurity Course Author & Instructor", dept: "Academy Operations" };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate file upload & database creation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container" style={{ maxWidth: "35rem" }}>
        
        <button onClick={() => router.push("/careers")} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600, marginBottom: "2rem" }}>
          <ArrowLeft size={16} />
          <span>Back to Careers</span>
        </button>

        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2.5rem", boxShadow: "var(--shadow-md)" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <CheckCircle2 size={64} style={{ color: "var(--accent-emerald)", margin: "0 auto 1.5rem auto" }} />
              <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>Application Submitted</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
                Thank you for applying for the <strong>{currentJob.title}</strong> role. Our operations team will review your CV and respond shortly.
              </p>
              <button className="btn btn-outline" onClick={() => setSuccess(false)}>
                Back to careers
              </button>
            </div>
          ) : (
            <form onSubmit={handleApply}>
              <div style={{ marginBottom: "2rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>{currentJob.dept}</span>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: "0.25rem" }}>Apply: {currentJob.title}</h1>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Full Name</label>
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "0.25rem", outline: "none" }} />
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Email Address</label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "0.25rem", outline: "none" }} />
                </div>

                {/* File Uploader */}
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Upload CV / Resume (PDF)</label>
                  <div style={{
                    border: "2px dashed var(--border-color)",
                    borderRadius: "8px",
                    padding: "1.5rem",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "var(--bg-secondary)",
                    marginTop: "0.25rem",
                    position: "relative"
                  }}>
                    <input
                      required
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setResumeFile(e.target.files[0]);
                        }
                      }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer"
                      }}
                    />
                    <Upload size={24} style={{ color: "var(--text-muted)", margin: "0 auto 0.5rem auto" }} />
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block" }}>
                      {resumeFile ? resumeFile.name : "Click to select CV PDF file"}
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Cover Letter / Brief Intro (Optional)</label>
                  <textarea placeholder="Tell us why you are interested in this position..." value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={4} style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "0.25rem", outline: "none", resize: "none", fontFamily: "inherit" }} />
                </div>

                <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                  <Send size={18} />
                  <span>{loading ? "Submitting..." : "Submit Application"}</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
