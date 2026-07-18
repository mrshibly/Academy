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
  
  const [newUserForm, setNewUserForm] = useState({
    email: "", password: "", full_name: "", role: "instructor"
  });

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: newUserForm.email,
          password: newUserForm.password,
          full_name: newUserForm.full_name,
          roles: [newUserForm.role]
        })
      });
      if (res.ok) {
        showMessage("User created successfully!");
        setNewUserForm({ email: "", password: "", full_name: "", role: "instructor" });
        fetchUsers();
      } else {
        const body = await res.json().catch(() => ({}));
        showMessage(body.detail || "Failed to create user.", "error");
      }
    } catch {
      showMessage("Error connecting to server.", "error");
    }
  };

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
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>Manage platform user profiles, role elevations, and manual teacher creation</p>
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

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2.5rem" }} className="responsive-grid-split">
        {/* User List */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.5rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Registered Users ({filtered.length})</h2>
            <div style={{ position: "relative", width: "100%", maxWidth: "240px" }}>
              <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text" placeholder="Search by name or email..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "0.5rem 0.5rem 0.5rem 2.25rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.85rem", width: "100%" }}
              />
            </div>
          </div>

          {fetching ? (
            <p style={{ color: "var(--text-muted)", padding: "3rem 0", textAlign: "center" }}>Loading user list...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "3rem 0" }}>No users match the search parameters.</p>
          ) : (
            <>
              {/* Desktop/Tablet Table View */}
              <div className="desktop-only-table" style={{ overflowX: "auto" }}>
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
                            style={{ padding: "0.3rem 0.6rem", border: "1px solid var(--border-color)", borderRadius: "4px", background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}
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

              {/* Mobile Card List View */}
              <div className="mobile-only-cards" style={{ display: "none", flexDirection: "column", gap: "1rem" }}>
                {filtered.map((u) => (
                  <div key={u.id} style={{
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "10px",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>{u.full_name}</span>
                      {u.id !== currentUser?.id ? (
                        <button onClick={() => handleDeleteUser(u.id)} style={{ color: "#ef4444", background: "transparent", border: "none", cursor: "pointer", padding: "0.25rem" }}>
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Self</span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "monospace", overflowWrap: "break-word" }}>{u.email}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Role:</span>
                      <select 
                        value={u.roles[0] || "student"} 
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        style={{ padding: "0.25rem 0.5rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="corporate_client">Corporate Client</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.6rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: u.is_verified ? "var(--accent-emerald)" : "var(--text-muted)", fontSize: "0.75rem", fontWeight: 500 }}>
                        {u.is_verified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        Verified
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: u.is_active ? "var(--accent-emerald)" : "#ef4444", fontSize: "0.75rem", fontWeight: 500 }}>
                        {u.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        }
        </div>

        {/* Create User Form */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.75rem", height: "fit-content", position: "sticky", top: "2rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1.25rem" }}>Create New User</h2>
          <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Full Name *</label>
              <input type="text" required value={newUserForm.full_name} onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Email Address *</label>
              <input type="email" required value={newUserForm.email} onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Password *</label>
              <input type="password" required value={newUserForm.password} onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Role *</label>
              <select value={newUserForm.role} onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: "0.9rem" }}>
                <option value="student">Student</option>
                <option value="instructor">Instructor (Teacher)</option>
                <option value="corporate_client">Corporate Client</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <button type="submit" className="btn btn-accent" style={{ width: "100%", marginTop: "0.5rem" }}>
              Create User Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
