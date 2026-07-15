"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Database, Plus, Trash2, Search } from "lucide-react";

export default function AdminCohortsPage() {
  const { token } = useAuth();
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [cohortForm, setCohortForm] = useState({ course_id: "", title: "", start_date: "", end_date: "", capacity: 30, instructor_id: "" });

  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchCohortData = async () => {
    try {
      const cohortsRes = await fetch("/api/v1/cohorts", { headers });
      if (cohortsRes.ok) setCohorts(await cohortsRes.json());

      const coursesRes = await fetch("/api/v1/courses?page=1&page_size=100", { headers });
      if (coursesRes.ok) {
        const body = await coursesRes.json();
        setCourses(body.items || []);
      }

      const usersRes = await fetch("/api/v1/users?page=1&page_size=100", { headers });
      if (usersRes.ok) {
        const body = await usersRes.json();
        setUsers(body.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCohortData();
  }, []);

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/cohorts", { method: "POST", headers, body: JSON.stringify(cohortForm) });
      if (res.ok) {
        showMessage("Cohort created successfully!");
        setCohortForm({ course_id: "", title: "", start_date: "", end_date: "", capacity: 30, instructor_id: "" });
        fetchCohortData();
      } else {
        const err = await res.json();
        showMessage(err.detail || "Failed to create cohort.", "error");
      }
    } catch {
      showMessage("Error connecting to server.", "error");
    }
  };

  const handleDeleteCohort = async (cohortId: string) => {
    if (!confirm("Are you sure you want to delete this cohort?")) return;
    try {
      const res = await fetch(`/api/v1/cohorts/${cohortId}`, { method: "DELETE", headers });
      if (res.ok) {
        showMessage("Cohort deleted successfully.");
        fetchCohortData();
      } else {
        showMessage("Failed to delete cohort.", "error");
      }
    } catch {
      showMessage("Error connecting to server.", "error");
    }
  };

  const filtered = cohorts.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Database size={24} style={{ color: "var(--accent-blue)" }} /> Cohort Manager
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>Organize student groups, assign instructors, and set schedule dates for active bootcamps</p>
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

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "2.5rem" }} className="responsive-grid-split">
        {/* Listing */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Active Cohorts ({filtered.length})</h2>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text" placeholder="Search cohorts..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "0.5rem 0.5rem 0.5rem 2.25rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.85rem", width: "220px" }}
              />
            </div>
          </div>

          {fetching ? (
            <p style={{ color: "var(--text-muted)", padding: "3rem 0", textAlign: "center" }}>Loading cohorts...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "3rem 0" }}>No cohorts created.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filtered.map((cohort) => (
                <div key={cohort.id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
                        <span style={{ fontSize: "0.7rem", background: "rgba(14, 165, 233, 0.1)", color: "var(--accent-blue)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                          Capacity: {cohort.capacity} Students Max
                        </span>
                      </div>
                      <h4 style={{ fontWeight: 700, fontSize: "1.05rem" }}>{cohort.title}</h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                        Course ID: {cohort.course_id}
                      </p>
                      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
                        <span>Start: {new Date(cohort.start_date).toLocaleDateString()}</span>
                        <span>End: {new Date(cohort.end_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCohort(cohort.id)} style={{ color: "#ef4444", padding: "0.4rem", background: "transparent", border: "none", cursor: "pointer", marginLeft: "1rem" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.75rem", height: "fit-content", position: "sticky", top: "2rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={18} /> Deploy Cohort Batch
          </h2>
          <form onSubmit={handleCreateCohort} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Select Course Track *</label>
              <select 
                required 
                value={cohortForm.course_id} 
                onChange={(e) => setCohortForm({ ...cohortForm, course_id: e.target.value })}
                style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white", fontSize: "0.9rem" }}
              >
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Select Assigned Instructor *</label>
              <select 
                required 
                value={cohortForm.instructor_id} 
                onChange={(e) => setCohortForm({ ...cohortForm, instructor_id: e.target.value })}
                style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white", fontSize: "0.9rem" }}
              >
                <option value="">-- Select Instructor --</option>
                {users.filter((u: any) => u.roles.includes("instructor") || u.roles.includes("admin")).map((user) => (
                  <option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Cohort Title *</label>
              <input type="text" required placeholder="e.g. Cohort Alpha 2026" value={cohortForm.title} onChange={(e) => setCohortForm({ ...cohortForm, title: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Start Date *</label>
                <input type="date" required value={cohortForm.start_date} onChange={(e) => setCohortForm({ ...cohortForm, start_date: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>End Date *</label>
                <input type="date" required value={cohortForm.end_date} onChange={(e) => setCohortForm({ ...cohortForm, end_date: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Capacity *</label>
              <input type="number" required value={cohortForm.capacity} onChange={(e) => setCohortForm({ ...cohortForm, capacity: parseInt(e.target.value) })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
            </div>
            <button type="submit" className="btn btn-accent" style={{ width: "100%", marginTop: "0.5rem" }}>
              Deploy Cohort Batch
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
