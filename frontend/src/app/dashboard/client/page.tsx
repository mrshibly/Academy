"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Building, Users, FileText, Download, Plus, Mail, CheckCircle2 } from "lucide-react";

export default function ClientDashboard() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [data, setData] = useState<any>({ organization: null, total_enrollments: 0, invoices: [] });
  const [fetching, setFetching] = useState(true);
  
  // Invite members form
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { "Authorization": `Bearer ${token}` };
        const res = await fetch("/api/v1/dashboard/client/overview", { headers });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [user, token, loading, router]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingInvite(true);
    setInviteSuccess(false);

    try {
      // Simulate invite API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setInviteSuccess(true);
      setInviteEmail("");
    } catch (err) {
      console.error(err);
    } finally {
      setSendingInvite(false);
    }
  };

  if (loading || fetching) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "8rem 0" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading corporate dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem 0" }}>
      <div className="container">
        
        {/* Banner */}
        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2.5rem", marginBottom: "3rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "2rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-blue)" }}>
              <Building size={20} />
              <span style={{ fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Enterprise Organization Portal</span>
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem" }}>Corporate Client Console</h1>
            <p style={{ color: "var(--text-secondary)" }}>Manage training cohorts and view invoices</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "var(--bg-secondary)", padding: "1rem 1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <Users size={24} style={{ color: "var(--accent-blue)" }} />
            <div>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, display: "block", lineHeight: "1" }}>{data.total_enrollments}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Total Employee Enrollments</span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "3rem", flexWrap: "wrap" }}>
          
          {/* Left Panel: Invoices */}
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileText size={22} style={{ color: "var(--accent-blue)" }} /> Corporate Invoices
            </h2>

            {data.invoices.length === 0 ? (
              <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                No active corporate invoices found.
              </div>
            ) : (
              <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>
                      <th style={{ padding: "1rem" }}>Invoice #</th>
                      <th style={{ padding: "1rem" }}>Status</th>
                      <th style={{ padding: "1rem", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.invoices.map((inv: any) => (
                      <tr key={inv.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "1rem", fontWeight: 600 }}>{inv.invoice_number}</td>
                        <td style={{ padding: "1rem" }}>
                          <span style={{
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background: inv.status === "paid" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                            color: inv.status === "paid" ? "var(--accent-emerald)" : "#d97706"
                          }}>
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-blue)", display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", fontWeight: 600 }}>
                            <Download size={14} /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Panel: Invite Employees */}
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Plus size={22} style={{ color: "var(--accent-teal)" }} /> Invite Employees
            </h2>

            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2rem", boxShadow: "var(--shadow-sm)" }}>
              {inviteSuccess && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(16, 185, 129, 0.05)", border: "1px solid var(--accent-emerald)", color: "var(--accent-emerald)", padding: "0.75rem", borderRadius: "6px", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                  <CheckCircle2 size={16} />
                  <span>Invitation sent successfully!</span>
                </div>
              )}

              <form onSubmit={handleSendInvite} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.4 }}>
                  Invite employees to join your organization's custom bootcamp track. They will receive an email instructions setup.
                </p>

                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Employee Email</label>
                  <div style={{ position: "relative", marginTop: "0.25rem" }}>
                    <Mail size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input required type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} style={{ width: "100%", padding: "0.65rem 0.65rem 0.65rem 2.25rem", borderRadius: "6px", border: "1px solid var(--border-color)", outline: "none" }} />
                  </div>
                </div>

                <button disabled={sendingInvite} type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  <span>{sendingInvite ? "Inviting..." : "Send Invite"}</span>
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
