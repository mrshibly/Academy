"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FileText, Plus, Trash2, Edit3, Search } from "lucide-react";

export default function AdminBlogPage() {
  const { token } = useAuth();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [blogForm, setBlogForm] = useState({ title: "", slug: "", content: "", excerpt: "", status: "draft" });
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/v1/blog/managed?page=1&page_size=100", { headers });
      if (res.ok) {
        const body = await res.json();
        setBlogs(body.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? `/api/v1/blog/${editId}` : "/api/v1/blog";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers, body: JSON.stringify(blogForm) });
      if (res.ok) {
        showMessage(editId ? "Blog post updated successfully!" : "Blog post created successfully!");
        setBlogForm({ title: "", slug: "", content: "", excerpt: "", status: "draft" });
        setEditId(null);
        fetchBlogs();
      } else {
        const err = await res.json();
        showMessage(err.detail || "Operation failed.", "error");
      }
    } catch {
      showMessage("Error connecting to server.", "error");
    }
  };

  const handleEdit = (post: any) => {
    setEditId(post.id);
    setBlogForm({
      title: post.title,
      slug: post.slug,
      content: post.content || "",
      excerpt: post.excerpt || "",
      status: post.status
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const res = await fetch(`/api/v1/blog/${id}`, { method: "DELETE", headers });
      if (res.ok) {
        showMessage("Blog post deleted.");
        fetchBlogs();
      } else {
        showMessage("Failed to delete post.", "error");
      }
    } catch {
      showMessage("Error connecting to server.", "error");
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Approve and publish this blog post?")) return;
    try {
      const res = await fetch(`/api/v1/blog/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: "published" })
      });
      if (res.ok) {
        showMessage("Blog post published successfully!");
        fetchBlogs();
      } else {
        showMessage("Failed to publish blog post.", "error");
      }
    } catch {
      showMessage("Error connecting to server.", "error");
    }
  };

  const pendingCount = blogs.filter(b => b.status === "draft").length;

  const filtered = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.slug.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === "pending") return b.status === "draft";
    if (activeTab === "published") return b.status === "published";
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FileText size={24} style={{ color: "var(--accent-blue)" }} /> Blog Manager
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>Manage articles, news, and approve posts submitted by instructors</p>
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

      {/* Tab Selector */}
      <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid var(--border-color)", marginBottom: "2rem", paddingBottom: "0.25rem" }}>
        {[
          { id: "all", label: "All Articles", count: blogs.length },
          { id: "pending", label: "Pending Approval", count: pendingCount },
          { id: "published", label: "Published", count: blogs.filter(b => b.status === "published").length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none",
              border: "none",
              padding: "0.5rem 0.25rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: activeTab === tab.id ? "var(--accent-blue)" : "var(--text-secondary)",
              borderBottom: activeTab === tab.id ? "2px solid var(--accent-blue)" : "2px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginBottom: "-5px",
              transition: "all 0.15s"
            }}
          >
            <span>{tab.label}</span>
            <span style={{
              fontSize: "0.75rem",
              background: tab.id === "pending" && tab.count > 0 ? "#ef4444" : "var(--bg-secondary)",
              color: tab.id === "pending" && tab.count > 0 ? "white" : "var(--text-secondary)",
              padding: "0.1rem 0.4rem",
              borderRadius: "10px",
              fontWeight: 700
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "2.5rem" }}>
        {/* Listing */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Blog Articles ({filtered.length})</h2>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text" placeholder="Search articles..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "0.5rem 0.5rem 0.5rem 2.25rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.85rem", width: "220px" }}
              />
            </div>
          </div>

          {fetching ? (
            <p style={{ color: "var(--text-muted)", padding: "3rem 0", textAlign: "center" }}>Loading articles...</p>
          ) : filtered.length === 0 ? (
            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "4rem 2rem", textAlign: "center" }}>
              <FileText size={40} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
              <p style={{ color: "var(--text-secondary)" }}>No blog articles found.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filtered.map((post) => (
                <div key={post.id} style={{
                  background: "white", border: editId === post.id ? "2px solid var(--accent-blue)" : "1px solid var(--border-color)",
                  borderRadius: "12px", padding: "1.25rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
                        <span style={{ fontSize: "0.7rem", background: post.status === "published" ? "rgba(16, 185, 129, 0.1)" : "rgba(148, 163, 184, 0.1)", color: post.status === "published" ? "var(--accent-emerald)" : "var(--text-muted)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>{post.status.toUpperCase()}</span>
                      </div>
                      <h4 style={{ fontWeight: 700, fontSize: "1rem" }}>{post.title}</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.excerpt || "No summary provided."}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem", fontFamily: "monospace" }}>Slug: {post.slug}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0, marginLeft: "1rem" }}>
                      {post.status === "draft" && (
                        <button onClick={() => handleApprove(post.id)} style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", background: "var(--accent-emerald)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>
                          Approve
                        </button>
                      )}
                      <button onClick={() => handleEdit(post)} style={{ color: "var(--accent-blue)", padding: "0.4rem", background: "transparent", border: "none", cursor: "pointer", borderRadius: "6px" }} title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(post.id)} style={{ color: "#ef4444", padding: "0.4rem", background: "transparent", border: "none", cursor: "pointer", borderRadius: "6px" }} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.75rem", height: "fit-content", position: "sticky", top: "2rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={18} /> {editId ? "Edit Blog Article" : "Create Blog Article"}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Title *</label>
              <input type="text" required value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Slug *</label>
              <input type="text" required value={blogForm.slug} placeholder="e.g. secure-agent-architectures" onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Excerpt *</label>
              <input type="text" required value={blogForm.excerpt} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Content (Markdown) *</label>
              <textarea required value={blogForm.content} rows={6} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontFamily: "monospace", fontSize: "0.9rem", resize: "vertical" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Status</label>
              <select value={blogForm.status} onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white", fontSize: "0.9rem" }}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn btn-accent" style={{ flex: 1 }}>
                {editId ? "Update Article" : "Publish Article"}
              </button>
              {editId && (
                <button type="button" className="btn btn-outline" onClick={() => { setEditId(null); setBlogForm({ title: "", slug: "", content: "", excerpt: "", status: "draft" }); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
