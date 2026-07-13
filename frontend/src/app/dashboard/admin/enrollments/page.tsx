"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Trash2, Search } from "lucide-react";

export default function AdminEnrollmentsPage() {
  const { token } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const headers = { "Authorization": `Bearer ${token}` };

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchEnrollments = async () => {
    try {
      const res = await fetch("/api/v1/enrollments", { headers });
      if (res.ok) {
        setEnrollments(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to cancel this student's enrollment?")) return;
    try {
      const res = await fetch(`/api/v1/enrollments/${enrollmentId}`, { method: "DELETE", headers });
      if (res.ok) {
        showMessage("Enrollment cancelled successfully.");
        fetchEnrollments();
      } else {
        showMessage("Failed to cancel enrollment.", "error");
      }
    } catch {
      showMessage("Error connecting to server.", "error");
    }
  };

  const filtered = enrollments.filter(e =>
    e.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.course_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <GraduationCap size={24} style={{ color: "var(--accent-blue)" }} /> Enrollments Manager
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>Monitor student learning progress, enrollment states, and cancel access when necessary</p>
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

      <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Student Enrollments ({filtered.length})</h2>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text" placeholder="Search by student or course..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "0.5rem 0.5rem 0.5rem 2.25rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.85rem", width: "260px" }}
            />
          </div>
        </div>

        {fetching ? (
          <p style={{ color: "var(--text-muted)", padding: "3rem 0", textAlign: "center" }}>Loading enrollments...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "3rem 0" }}>No enrollments found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600 }}>
                  <th style={{ padding: "1rem" }}>Student</th>
                  <th style={{ padding: "1rem" }}>Course Track</th>
                  <th style={{ padding: "1rem" }}>Enrolled Date</th>
                  <th style={{ padding: "1rem" }}>Status</th>
                  <th style={{ padding: "1rem" }}>Action Override</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 600 }}>{e.user_name}</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{e.user_email}</div>
                    </td>
                    <td style={{ padding: "1rem", fontWeight: 600 }}>{e.course_title}</td>
                    <td style={{ padding: "1rem" }}>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontSize: "0.75rem", background: e.status === "completed" ? "rgba(16, 185, 129, 0.1)" : "rgba(14, 165, 233, 0.1)", color: e.status === "completed" ? "var(--accent-emerald)" : "var(--accent-blue)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                        {e.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <button 
                        onClick={() => handleDeleteEnrollment(e.id)}
                        style={{ color: "#ef4444", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 600, fontSize: "0.85rem" }}
                      >
                        <Trash2 size={16} />
                        <span>Cancel Enrollment</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
