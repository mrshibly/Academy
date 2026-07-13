"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Users, Trash2, CheckCircle, XCircle, Search } from "lucide-react";

export default function AdminUsersPage() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/v1/users?page=1&page_size=100", { headers });
      if (res.ok) {
        const body = await res.json();
        setUsers(body.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: string, selectedRole: string) => {
    try {
      const res = await fetch(`/api/v1/users/${userId}/role`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ roles: [selectedRole] })
      });
      if (res.ok) {
        showMessage("User role updated successfully.");
        fetchUsers();
      } else {
        showMessage("Failed to update role.", "error");
      }
    } catch {
      showMessage("Error updating role.", "error");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to soft-delete this user?")) return;
    try {
      const res = await fetch(`/api/v1/users/${userId}`, { method: "DELETE", headers });
      if (res.ok) {
        showMessage("User account deleted successfully.");
        fetchUsers();
      } else {
        showMessage("Failed to delete user.", "error");
      }
    } catch {
      showMessage("Error connecting to server.", "error");
    }
  };

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Users size={24} style={{ color: "var(--accent-blue)" }} /> User Directory
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>Manage platform user profiles, role elevations, and access overrides</p>
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
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Registered Users ({filtered.length})</h2>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text" placeholder="Search by name or email..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "0.5rem 0.5rem 0.5rem 2.25rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.85rem", width: "260px" }}
            />
          </div>
        </div>

        {fetching ? (
          <p style={{ color: "var(--text-muted)", padding: "3rem 0", textAlign: "center" }}>Loading user list...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "3rem 0" }}>No users match the search parameters.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600 }}>
                  <th style={{ padding: "1rem" }}>Full Name</th>
                  <th style={{ padding: "1rem" }}>Email</th>
                  <th style={{ padding: "1rem" }}>Roles</th>
                  <th style={{ padding: "1rem" }}>States</th>
                  <th style={{ padding: "1rem" }}>Action Override</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "1rem", fontWeight: 600 }}>{u.full_name}</td>
                    <td style={{ padding: "1rem", fontFamily: "monospace" }}>{u.email}</td>
                    <td style={{ padding: "1rem" }}>
                      <select 
                        value={u.roles[0] || "student"} 
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        style={{ padding: "0.3rem 0.6rem", border: "1px solid var(--border-color)", borderRadius: "4px", background: "white", fontSize: "0.85rem", fontWeight: 600 }}
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="corporate_client">Corporate Client</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: u.is_verified ? "var(--accent-emerald)" : "var(--text-muted)", fontSize: "0.8rem", fontWeight: 500 }}>
                          {u.is_verified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          <span>Verified</span>
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: u.is_active ? "var(--accent-emerald)" : "#ef4444", fontSize: "0.8rem", fontWeight: 500 }}>
                          {u.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          <span>Active</span>
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {u.id !== currentUser?.id ? (
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          style={{ color: "#ef4444", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 600, fontSize: "0.85rem" }}
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Self (Current Actor)</span>
                      )}
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
