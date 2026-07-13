"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Plus, Trash2, Edit3, Search } from "lucide-react";

export default function AdminCoursesPage() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: "", slug: "", description: "", short_description: "", price: 99.0, level: "beginner", duration_hours: 10
  });
  const [editId, setEditId] = useState<string | null>(null);

  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/v1/courses?page=1&page_size=100", { headers });
      if (res.ok) { const body = await res.json(); setCourses(body.items || []); }
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? `/api/v1/courses/${editId}` : "/api/v1/courses";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers, body: JSON.stringify(courseForm) });
      if (res.ok) {
        showMessage(editId ? "Course updated successfully!" : "Course created successfully!");
        setCourseForm({ title: "", slug: "", description: "", short_description: "", price: 99.0, level: "beginner", duration_hours: 10 });
        setEditId(null);
        fetchCourses();
      } else {
        const err = await res.json();
        showMessage(err.detail || "Operation failed.", "error");
      }
    } catch { showMessage("Error connecting to server.", "error"); }
  };

  const handleEdit = (course: any) => {
    setEditId(course.id);
    setCourseForm({
      title: course.title, slug: course.slug, description: course.description || "",
      short_description: course.short_description || "", price: course.price,
      level: course.level, duration_hours: course.duration_hours || 10
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`/api/v1/courses/${id}`, { method: "DELETE", headers });
      if (res.ok) { showMessage("Course deleted."); fetchCourses(); }
      else showMessage("Failed to delete course.", "error");
    } catch { showMessage("Error connecting to server.", "error"); }
  };

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BookOpen size={24} style={{ color: "var(--accent-blue)" }} /> Course Manager
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>Create, edit, and manage academy course catalog</p>
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
        {/* Course List */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Active Catalog ({filtered.length})</h2>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text" placeholder="Search courses..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "0.5rem 0.5rem 0.5rem 2.25rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.85rem", width: "220px" }}
              />
            </div>
          </div>

          {fetching ? (
            <p style={{ color: "var(--text-muted)", padding: "3rem 0", textAlign: "center" }}>Loading courses...</p>
          ) : filtered.length === 0 ? (
            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "4rem 2rem", textAlign: "center" }}>
              <BookOpen size={40} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
              <p style={{ color: "var(--text-secondary)" }}>No courses found.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filtered.map((course) => (
                <div key={course.id} style={{
                  background: "white", border: editId === course.id ? "2px solid var(--accent-blue)" : "1px solid var(--border-color)",
                  borderRadius: "12px", padding: "1.25rem", transition: "all 0.15s"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
                        <span style={{ fontSize: "0.7rem", background: "rgba(14, 165, 233, 0.1)", color: "var(--accent-blue)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>{course.level}</span>
                        <span style={{ fontSize: "0.7rem", background: course.status === "PUBLISHED" ? "rgba(16, 185, 129, 0.1)" : "rgba(234, 179, 8, 0.1)", color: course.status === "PUBLISHED" ? "var(--accent-emerald)" : "#ca8a04", padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>{course.status}</span>
                      </div>
                      <h4 style={{ fontWeight: 700, fontSize: "1rem" }}>{course.title}</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course.short_description || "No description"}</p>
                      <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)", marginTop: "0.4rem" }}>
                        ৳{course.price} BDT &bull; {course.duration_hours || 0}h
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0, marginLeft: "1rem" }}>
                      <button onClick={() => handleEdit(course)} style={{ color: "var(--accent-blue)", padding: "0.4rem", background: "transparent", border: "none", cursor: "pointer", borderRadius: "6px" }} title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(course.id)} style={{ color: "#ef4444", padding: "0.4rem", background: "transparent", border: "none", cursor: "pointer", borderRadius: "6px" }} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Form */}
        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.75rem", height: "fit-content", position: "sticky", top: "2rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={18} /> {editId ? "Edit Course" : "Create New Course"}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Course Title *</label>
              <input type="text" required value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>URL Slug *</label>
              <input type="text" required value={courseForm.slug} placeholder="e.g. offensive-security-basics" onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Short Summary *</label>
              <input type="text" required value={courseForm.short_description} onChange={(e) => setCourseForm({ ...courseForm, short_description: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Description</label>
              <textarea value={courseForm.description} rows={3} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontFamily: "inherit", fontSize: "0.9rem", resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Price (BDT) *</label>
                <input type="number" required value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Duration (Hrs) *</label>
                <input type="number" required value={courseForm.duration_hours} onChange={(e) => setCourseForm({ ...courseForm, duration_hours: parseFloat(e.target.value) })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", color: "var(--text-secondary)" }}>Level</label>
              <select value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })} style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white", fontSize: "0.9rem" }}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn btn-accent" style={{ flex: 1 }}>
                {editId ? "Update Course" : "Create Course"}
              </button>
              {editId && (
                <button type="button" className="btn btn-outline" onClick={() => { setEditId(null); setCourseForm({ title: "", slug: "", description: "", short_description: "", price: 99.0, level: "beginner", duration_hours: 10 }); }}>
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
