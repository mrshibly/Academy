"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Layers, Plus, Trash2, Search } from "lucide-react";

export default function AdminCareersPage() {
  const { token } = useAuth();
  const [careers, setCareers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [careerForm, setCareerForm] = useState({ title: "", slug: "", department: "", location: "", type: "Full-Time", description: "", requirements: "", status: "draft" });

  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchCareers = async () => {
    try {
      const res = await fetch("/api/v1/careers", { headers });
      if (res.ok) {
        setCareers(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/careers", { method: "POST", headers, body: JSON.stringify(careerForm) });
      if (res.ok) {
        showMessage("Job posting created successfully!");
        setCareerForm({ title: "", slug: "", department: "", location: "", type: "Full-Time", description: "", requirements: "", status: "draft" });
        fetchCareers();
      } else {
        const err = await res.json();
        showMessage(err.detail || "Failed to create job posting.", "error");
      }
    } catch {
      showMessage("Error connecting to server.", "error");
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      const res = await fetch(`/api/v1/careers/${id}`, { method: "DELETE", headers });
      if (res.ok) {
        showMessage("Job posting deleted.");
        setSelectedJobId(null);
        setApplications([]);
        fetchCareers();
      } else {
        showMessage("Failed to delete job posting.", "error");
      }
    } catch {
      showMessage("Error connecting to server.", "error");
    }
  };

  const handleViewApplications = async (jobId: string) => {
    setSelectedJobId(jobId);
    try {
      const res = await fetch(`/api/v1/careers/${jobId}/applications`, { headers });
      if (res.ok) {
        setApplications(await res.json());
      } else {
        showMessage("Failed to fetch applications.", "error");
      }
    } catch {
      showMessage("Error connecting to server.", "error");
    }
  };

  const filtered = careers.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Layers size={24} style={{ color: "var(--accent-blue)" }} /> Careers CMS
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>Review open roles, post new positions, and view applicant details</p>
      </div>

      {message && (
        <div style={{
          background: message.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
          color: message.type === "success" ? "var(--accent-emerald)" : "#ef4444",
          padding: "0.85rem 1rem", borderRadius: "8px",
          border: `1px solid ${message.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
          marginBottom: "1.5rem", fontWeight: 600, fontSize: "0.9rem"
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "2.5rem" }}>
        {/* Listing */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Careers Openings ({filtered.length})</h2>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text" placeholder="Search positions..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "0.5rem 0.5rem 0.5rem 2.25rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.85rem", width: "220px" }}
              />
            </div>
          </div>

          {fetching ? (
            <p style={{ color: "var(--text-muted)", padding: "3rem 0", textAlign: "center" }}>Loading jobs...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "3rem 0" }}>No jobs listed.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {filtered.map((job) => (
                <div key={job.id} style={{ background: "white", border: selectedJobId === job.id ? "2px solid var(--accent-blue)" : "1px solid var(--border-color)", borderRadius: "12px", padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
                        <span style={{ fontSize: "0.7rem", background: "rgba(13, 148, 136, 0.1)", color: "var(--accent-teal)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>{job.department}</span>
                        <span style={{ fontSize: "0.7rem", background: "var(--bg-secondary)", color: "var(--text-secondary)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>{job.type}</span>
                        <span style={{ fontSize: "0.7rem", background: job.status === "open" ? "rgba(16, 185, 129, 0.1)" : "rgba(148, 163, 184, 0.1)", color: job.status === "open" ? "var(--accent-emerald)" : "var(--text-muted)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>{job.status.toUpperCase()}</span>
                      </div>
                      <h4 style={{ fontWeight: 700, fontSize: "1.05rem" }}>{job.title}</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.15rem" }}>{job.location}</p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, marginLeft: "1rem" }}>
                      <button onClick={() => handleViewApplications(job.id)} style={{ fontSize: "0.8rem", color: "var(--accent-blue)", padding: "0.35rem 0.75rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white", fontWeight: 600, cursor: "pointer" }}>
                        Applicants
                      </button>
                      <button onClick={() => handleDeleteJob(job.id)} style={{ color: "#ef4444", padding: "0.4rem", background: "transparent", border: "none", cursor: "pointer" }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Applicants Panel */}
        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.75rem", height: "fit-content" }}>
          {selectedJobId ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Applicants list</h2>
                <button onClick={() => setSelectedJobId(null)} className="btn btn-outline" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}>
                  Back to Form
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {applications.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem 0", fontSize: "0.85rem" }}>No applications received yet.</p>
                ) : (
                  applications.map((app) => (
                    <div key={app.id} style={{ border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{app.name}</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{app.email}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", fontSize: "0.75rem" }}>
                        <span style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Status: {app.status}</span>
                        {app.resume_url && (
                          <a href={app.resume_url} target="_blank" rel="noreferrer" style={{ color: "var(--accent-teal)", textDecoration: "underline", fontWeight: 600 }}>
                            View Resume
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem" }}>Create Job Posting</h2>
              <form onSubmit={handleCreateJob} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Job Title *</label>
                  <input type="text" required value={careerForm.title} onChange={(e) => setCareerForm({ ...careerForm, title: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Slug *</label>
                  <input type="text" required value={careerForm.slug} placeholder="e.g. senior-security-consultant" onChange={(e) => setCareerForm({ ...careerForm, slug: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Department *</label>
                  <input type="text" required value={careerForm.department} placeholder="e.g. Academy Operations" onChange={(e) => setCareerForm({ ...careerForm, department: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Location *</label>
                  <input type="text" required value={careerForm.location} placeholder="e.g. San Francisco, CA / Remote" onChange={(e) => setCareerForm({ ...careerForm, location: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Job Type</label>
                  <select value={careerForm.type} onChange={(e) => setCareerForm({ ...careerForm, type: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white", fontSize: "0.9rem" }}>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Description *</label>
                  <textarea required value={careerForm.description} rows={4} onChange={(e) => setCareerForm({ ...careerForm, description: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontFamily: "inherit", fontSize: "0.9rem", resize: "vertical" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Status</label>
                  <select value={careerForm.status} onChange={(e) => setCareerForm({ ...careerForm, status: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white", fontSize: "0.9rem" }}>
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-accent" style={{ width: "100%", marginTop: "0.5rem" }}>
                  Add Job Posting
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
