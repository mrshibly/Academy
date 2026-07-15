"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Terminal, Plus, Trash2, Search } from "lucide-react";

export default function AdminResearchPage() {
  const { token } = useAuth();
  const [research, setResearch] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [researchForm, setResearchForm] = useState({ title: "", slug: "", abstract: "", type: "whitepaper", cve_id: "", status: "draft" });

  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchResearch = async () => {
    try {
      const res = await fetch("/api/v1/research", { headers });
      if (res.ok) {
        setResearch(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchResearch();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/research", { method: "POST", headers, body: JSON.stringify(researchForm) });
      if (res.ok) {
        showMessage("Research publication added successfully!");
        setResearchForm({ title: "", slug: "", abstract: "", type: "whitepaper", cve_id: "", status: "draft" });
        fetchResearch();
      } else {
        const err = await res.json();
        showMessage(err.detail || "Failed to create publication.", "error");
      }
    } catch {
      showMessage("Error connecting to server.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this publication?")) return;
    try {
      const res = await fetch(`/api/v1/research/${id}`, { method: "DELETE", headers });
      if (res.ok) {
        showMessage("Research publication deleted.");
        fetchResearch();
      } else {
        showMessage("Failed to delete publication.", "error");
      }
    } catch {
      showMessage("Error connecting to server.", "error");
    }
  };

  const filtered = research.filter(pub =>
    pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pub.cve_id && pub.cve_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Terminal size={24} style={{ color: "var(--accent-blue)" }} /> Research Hub
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>Publish whitepapers, vulnerability writeups, and security advisories</p>
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
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Publications ({filtered.length})</h2>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text" placeholder="Search publications..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "0.5rem 0.5rem 0.5rem 2.25rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.85rem", width: "220px" }}
              />
            </div>
          </div>

          {fetching ? (
            <p style={{ color: "var(--text-muted)", padding: "3rem 0", textAlign: "center" }}>Loading publications...</p>
          ) : filtered.length === 0 ? (
            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "4rem 2rem", textAlign: "center" }}>
              <Terminal size={40} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
              <p style={{ color: "var(--text-secondary)" }}>No publications found.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filtered.map((pub) => (
                <div key={pub.id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
                        <span style={{ fontSize: "0.7rem", background: "rgba(139, 92, 246, 0.1)", color: "var(--accent-violet)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>{pub.type.toUpperCase()}</span>
                        {pub.cve_id && (
                          <span style={{ fontSize: "0.7rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>{pub.cve_id}</span>
                        )}
                        <span style={{ fontSize: "0.7rem", background: pub.status === "published" ? "rgba(16, 185, 129, 0.1)" : "rgba(148, 163, 184, 0.1)", color: pub.status === "published" ? "var(--accent-emerald)" : "var(--text-muted)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>{pub.status.toUpperCase()}</span>
                      </div>
                      <h4 style={{ fontWeight: 700, fontSize: "1rem" }}>{pub.title}</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.15rem" }}>{pub.abstract || "No abstract provided."}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem", fontFamily: "monospace" }}>Slug: {pub.slug}</p>
                    </div>
                    <button onClick={() => handleDelete(pub.id)} style={{ color: "#ef4444", padding: "0.4rem", background: "transparent", border: "none", cursor: "pointer", marginLeft: "1rem" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.75rem", height: "fit-content" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={18} /> Add Publication
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Title *</label>
              <input type="text" required value={researchForm.title} onChange={(e) => setResearchForm({ ...researchForm, title: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Slug *</label>
              <input type="text" required value={researchForm.slug} placeholder="e.g. cve-2026-auth-bypass" onChange={(e) => setResearchForm({ ...researchForm, slug: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Type *</label>
              <select value={researchForm.type} onChange={(e) => setResearchForm({ ...researchForm, type: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white", fontSize: "0.9rem" }}>
                <option value="whitepaper">Whitepaper</option>
                <option value="advisory">Security Advisory</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>CVE ID (Optional)</label>
              <input type="text" value={researchForm.cve_id} placeholder="e.g. CVE-2026-10291" onChange={(e) => setResearchForm({ ...researchForm, cve_id: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Abstract *</label>
              <textarea required value={researchForm.abstract} rows={5} onChange={(e) => setResearchForm({ ...researchForm, abstract: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontFamily: "inherit", fontSize: "0.9rem", resize: "vertical" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Publishing Status</label>
              <select value={researchForm.status} onChange={(e) => setResearchForm({ ...researchForm, status: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white", fontSize: "0.9rem" }}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <button type="submit" className="btn btn-accent" style={{ width: "100%", marginTop: "0.5rem" }}>
              Add Publication
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
