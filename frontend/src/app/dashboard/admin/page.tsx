"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, BarChart3, Database, History, Terminal } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  
  const [metrics, setMetrics] = useState({ total_users: 0, total_courses: 0, total_enrollments: 0, total_revenue: 0.0, total_bookings: 0 });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user || !user.roles.includes("admin")) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { "Authorization": `Bearer ${token}` };

        // Fetch concurrently from FastAPI endpoints
        const metricsRes = await fetch("/api/v1/dashboard/admin/metrics", { headers });
        if (metricsRes.ok) {
          setMetrics(await metricsRes.json());
        }

        const logsRes = await fetch("/api/v1/dashboard/admin/audit-logs?page=1&page_size=20", { headers });
        if (logsRes.ok) {
          const body = await logsRes.json();
          setAuditLogs(body.items || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [user, token, loading, router]);

  if (loading || fetching) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "8rem 0" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading security metrics...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem 0" }}>
      <div className="container">
        
        {/* Banner */}
        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2.5rem", marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-violet)" }}>
            <ShieldCheck size={20} />
            <span style={{ fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Security Operations (SecOps)</span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem" }}>Platform Operations Center</h1>
          <p style={{ color: "var(--text-secondary)" }}>Real-time business aggregates and transactional state audit logs</p>
        </div>

        {/* Metrics Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "2.5rem", marginBottom: "4rem" }}>
          
          <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Total Users</span>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.25rem" }}>{metrics.total_users}</h3>
          </div>

          <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Active Courses</span>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-blue)", marginTop: "0.25rem" }}>{metrics.total_courses}</h3>
          </div>

          <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Enrollments</span>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-teal)", marginTop: "0.25rem" }}>{metrics.total_enrollments}</h3>
          </div>

          <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Bookings</span>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-violet)", marginTop: "0.25rem" }}>{metrics.total_bookings}</h3>
          </div>

          <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Total Revenue</span>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-emerald)", marginTop: "0.25rem" }}>
              ${metrics.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>

        </div>

        {/* Audit Logs */}
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <History size={22} style={{ color: "var(--text-primary)" }} /> Audit log stream
          </h2>

          <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            {auditLogs.length === 0 ? (
              <p style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                No state-changing activities recorded yet.
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600 }}>
                    <th style={{ padding: "1rem" }}>Timestamp</th>
                    <th style={{ padding: "1rem" }}>Action</th>
                    <th style={{ padding: "1rem" }}>Actor ID</th>
                    <th style={{ padding: "1rem" }}>Resource Type</th>
                    <th style={{ padding: "1rem" }}>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--border-color)", fontFamily: "monospace" }}>
                      <td style={{ padding: "1rem" }}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td style={{ padding: "1rem", color: "var(--accent-blue)", fontWeight: 600 }}>{log.action}</td>
                      <td style={{ padding: "1rem" }}>{log.actor_id || "System"}</td>
                      <td style={{ padding: "1rem" }}>{log.resource_type}</td>
                      <td style={{ padding: "1rem" }}>{log.ip_address || "127.0.0.1"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
