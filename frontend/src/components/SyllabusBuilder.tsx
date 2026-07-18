"use client";

import { useEffect, useState } from "react";
import { Plus, X, List, Layers, PlusCircle, Check, Loader, Video, FileText, AlertCircle, Edit2, Trash, Save } from "lucide-react";

interface SyllabusBuilderProps {
  courseId: string;
  courseSlug: string;
  token: string;
  onClose: () => void;
}

export default function SyllabusBuilder({ courseId, courseSlug, token, onClose }: SyllabusBuilderProps) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  // Forms states
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);

  const [activeModuleForLesson, setActiveModuleForLesson] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState("text");
  const [newLessonBody, setNewLessonBody] = useState("");
  const [newLessonUrl, setNewLessonUrl] = useState("");

  // Inline editing states
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");

  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLessonForm, setEditingLessonForm] = useState({ title: "", content_type: "text", content_body: "", content_url: "" });

  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/courses/${courseSlug}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
      } else {
        setActionError("Failed to fetch course details.");
      }
    } catch {
      setActionError("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [courseSlug]);

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    setSavingStatus("Adding module...");
    try {
      const order = (course?.modules?.length || 0) + 1;
      const res = await fetch(`/api/v1/courses/${courseId}/modules`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title: newModuleTitle, order })
      });

      if (res.ok) {
        setNewModuleTitle("");
        setAddingModule(false);
        await fetchCourseDetails();
      } else {
        setActionError("Failed to add module.");
      }
    } catch {
      setActionError("Network error adding module.");
    } finally {
      setSavingStatus(null);
    }
  };

  const handleRenameModule = async (moduleId: string) => {
    if (!editingModuleTitle.trim()) return;
    setSavingStatus("Renaming module...");
    try {
      const res = await fetch(`/api/v1/courses/modules/${moduleId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ title: editingModuleTitle })
      });
      if (res.ok) {
        setEditingModuleId(null);
        await fetchCourseDetails();
      } else {
        setActionError("Failed to rename module.");
      }
    } catch {
      setActionError("Network error renaming module.");
    } finally {
      setSavingStatus(null);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module and all its lectures?")) return;
    setSavingStatus("Deleting module...");
    try {
      const res = await fetch(`/api/v1/courses/modules/${moduleId}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) {
        await fetchCourseDetails();
      } else {
        setActionError("Failed to delete module.");
      }
    } catch {
      setActionError("Network error deleting module.");
    } finally {
      setSavingStatus(null);
    }
  };

  const handleAddLesson = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

    setSavingStatus("Adding lecture...");
    const module = course?.modules?.find((m: any) => m.id === moduleId);
    const order = (module?.lessons?.length || 0) + 1;

    try {
      const res = await fetch(`/api/v1/courses/modules/${moduleId}/lessons`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: newLessonTitle,
          order,
          content_type: lessonType,
          content_body: newLessonBody || null,
          content_url: newLessonUrl || null,
          is_free_preview: false
        })
      });

      if (res.ok) {
        setNewLessonTitle("");
        setNewLessonBody("");
        setNewLessonUrl("");
        setActiveModuleForLesson(null);
        await fetchCourseDetails();
      } else {
        setActionError("Failed to add lesson.");
      }
    } catch {
      setActionError("Network error adding lesson.");
    } finally {
      setSavingStatus(null);
    }
  };

  const handleUpdateLesson = async (lessonId: string) => {
    if (!editingLessonForm.title.trim()) return;
    setSavingStatus("Saving lecture...");
    try {
      const res = await fetch(`/api/v1/courses/lessons/${lessonId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          title: editingLessonForm.title,
          content_type: editingLessonForm.content_type,
          content_body: editingLessonForm.content_body || null,
          content_url: editingLessonForm.content_url || null
        })
      });
      if (res.ok) {
        setEditingLessonId(null);
        await fetchCourseDetails();
      } else {
        setActionError("Failed to update lecture.");
      }
    } catch {
      setActionError("Network error updating lecture.");
    } finally {
      setSavingStatus(null);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lecture?")) return;
    setSavingStatus("Deleting lecture...");
    try {
      const res = await fetch(`/api/v1/courses/lessons/${lessonId}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) {
        await fetchCourseDetails();
      } else {
        setActionError("Failed to delete lecture.");
      }
    } catch {
      setActionError("Network error deleting lecture.");
    } finally {
      setSavingStatus(null);
    }
  };

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)", zIndex: 1000, animation: "fadeIn 0.2s ease"
        }}
      />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "34rem", maxWidth: "100vw",
        background: "var(--card-bg)", boxShadow: "-4px 0 30px rgba(0,0,0,0.15)",
        zIndex: 1001, display: "flex", flexDirection: "column",
        borderLeft: "1px solid var(--border-color)", animation: "slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
      {/* Drawer Header */}
      <div style={{
        padding: "1.5rem", borderBottom: "1px solid var(--border-color)",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--accent-violet)", fontWeight: 600, textTransform: "uppercase" }}>Curriculum Architecture</span>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginTop: "0.15rem", color: "var(--text-primary)" }}>Syllabus Outline Builder</h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {savingStatus && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              <Loader size={12} className="animate-spin" />
              <span>{savingStatus}</span>
            </div>
          )}
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0.4rem", borderRadius: "50%", transition: "background 0.2s"
          }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-primary)"}
             onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Drawer Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {actionError && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)",
            padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", display: "flex", gap: "0.5rem"
          }}>
            <AlertCircle size={16} />
            <span>{actionError}</span>
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4rem 0", gap: "1rem" }}>
            <Loader className="animate-spin" style={{ color: "var(--accent-violet)" }} size={28} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Retrieving course curriculum structure...</p>
          </div>
        ) : (
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
              Course: <span style={{ color: "var(--text-primary)" }}>{course?.title}</span>
            </h4>
            <hr style={{ border: 0, borderTop: "1px solid var(--border-color)", marginBottom: "1.5rem" }} />

            {/* Modules Loop */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {course?.modules?.length === 0 ? (
                <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem 0", fontSize: "0.9rem" }}>
                  No modules added to this syllabus yet. Use the tool below to add your first module.
                </p>
              ) : (
                course.modules.sort((a: any, b: any) => a.order - b.order).map((module: any) => (
                  <div key={module.id} style={{
                    background: "var(--bg-primary)", borderRadius: "10px",
                    border: "1px solid var(--border-color)", padding: "1.25rem"
                  }}>
                    {/* Module Title Row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                      {editingModuleId === module.id ? (
                        <div style={{ display: "flex", gap: "0.5rem", flex: 1, marginRight: "1rem" }}>
                          <input
                            type="text"
                            value={editingModuleTitle}
                            onChange={(e) => setEditingModuleTitle(e.target.value)}
                            style={{
                              flex: 1,
                              padding: "0.3rem 0.5rem",
                              border: "1px solid var(--border-color)",
                              borderRadius: "6px",
                              fontSize: "0.85rem",
                              background: "var(--card-bg)",
                              color: "var(--text-primary)"
                            }}
                          />
                          <button onClick={() => handleRenameModule(module.id)} style={{ background: "var(--accent-violet)", color: "white", border: "none", padding: "0.3rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                            Save
                          </button>
                          <button onClick={() => setEditingModuleId(null)} style={{ background: "none", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.3rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Layers size={16} style={{ color: "var(--accent-violet)" }} />
                          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>{module.title}</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>(Order {module.order})</span>
                        </div>
                      )}
                      
                      {editingModuleId !== module.id && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <button onClick={() => { setEditingModuleId(module.id); setEditingModuleTitle(module.title); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0.25rem", borderRadius: "4px" }}>
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDeleteModule(module.id)} style={{ background: "none", border: "none", color: "rgba(239, 68, 68, 0.7)", cursor: "pointer", padding: "0.25rem", borderRadius: "4px" }}>
                            <Trash size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Lessons list inside module */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingLeft: "1.25rem", borderLeft: "2px solid var(--border-color)", marginBottom: "0.75rem" }}>
                      {module.lessons?.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", padding: "0.25rem 0" }}>No lectures in this module.</p>
                      ) : (
                        module.lessons.sort((a: any, b: any) => a.order - b.order).map((lesson: any) => (
                          <div key={lesson.id} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {editingLessonId === lesson.id ? (
                              <div style={{
                                padding: "0.75rem", background: "var(--card-bg)",
                                borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "0.75rem"
                              }}>
                                <input
                                  type="text" required placeholder="Lecture Title..."
                                  value={editingLessonForm.title} onChange={(e) => setEditingLessonForm({ ...editingLessonForm, title: e.target.value })}
                                  style={{ width: "100%", padding: "0.4rem 0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.85rem", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                                />
                                <textarea
                                  placeholder="Lecture Description / Markdown Content..."
                                  rows={3}
                                  value={editingLessonForm.content_body} onChange={(e) => setEditingLessonForm({ ...editingLessonForm, content_body: e.target.value })}
                                  style={{ width: "100%", padding: "0.4rem 0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.85rem", resize: "vertical", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                                />
                                <input
                                  type="text" placeholder="Video / Resource URL (Optional)..."
                                  value={editingLessonForm.content_url} onChange={(e) => setEditingLessonForm({ ...editingLessonForm, content_url: e.target.value })}
                                  style={{ width: "100%", padding: "0.4rem 0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.85rem", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                                />
                                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Type:</label>
                                  <select value={editingLessonForm.content_type} onChange={(e) => setEditingLessonForm({ ...editingLessonForm, content_type: e.target.value })} style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
                                    <option value="text">Document (Text/Labs)</option>
                                    <option value="video">Video Lecture</option>
                                  </select>
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                  <button onClick={() => handleUpdateLesson(lesson.id)} style={{ background: "var(--accent-violet)", color: "white", border: "none", padding: "0.3rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                                    Save
                                  </button>
                                  <button type="button" onClick={() => setEditingLessonId(null)} style={{ background: "none", border: "1px solid var(--border-color)", color: "var(--text-primary)", padding: "0.3rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                background: "var(--card-bg)", padding: "0.5rem 0.75rem", borderRadius: "6px",
                                border: "1px solid var(--border-color)", fontSize: "0.85rem"
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  {lesson.content_type === "video" ? (
                                    <span style={{ display: "flex", alignItems: "center", background: "rgba(59, 130, 246, 0.1)", color: "var(--accent-blue)", padding: "0.25rem", borderRadius: "4px" }}>
                                      <Video size={12} />
                                    </span>
                                  ) : (
                                    <span style={{ display: "flex", alignItems: "center", background: "rgba(139, 92, 246, 0.1)", color: "var(--accent-violet)", padding: "0.25rem", borderRadius: "4px" }}>
                                      <FileText size={12} />
                                    </span>
                                  )}
                                  <span style={{ color: "var(--text-primary)" }}>{lesson.title}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginRight: "0.25rem" }}>L{lesson.order}</span>
                                  <button onClick={() => {
                                    setEditingLessonId(lesson.id);
                                    setEditingLessonForm({
                                      title: lesson.title,
                                      content_type: lesson.content_type,
                                      content_body: lesson.content_body || "",
                                      content_url: lesson.content_url || ""
                                    });
                                  }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0.25rem" }}>
                                    <Edit2 size={11} />
                                  </button>
                                  <button onClick={() => handleDeleteLesson(lesson.id)} style={{ background: "none", border: "none", color: "rgba(239, 68, 68, 0.7)", cursor: "pointer", padding: "0.25rem" }}>
                                    <Trash size={11} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Lesson Form */}
                    {activeModuleForLesson === module.id ? (
                      <form onSubmit={(e) => handleAddLesson(e, module.id)} style={{
                        marginTop: "0.5rem", padding: "0.75rem", background: "var(--card-bg)",
                        borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "0.75rem"
                      }}>
                        <input
                          type="text" required placeholder="Lecture Title..."
                          value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)}
                          style={{ width: "100%", padding: "0.4rem 0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.85rem", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                        />
                        <textarea
                          placeholder="Lecture Description / Markdown Content..."
                          rows={3}
                          value={newLessonBody} onChange={(e) => setNewLessonBody(e.target.value)}
                          style={{ width: "100%", padding: "0.4rem 0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.85rem", resize: "vertical", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                        />
                        <input
                          type="text" placeholder="Video / Resource URL (Optional)..."
                          value={newLessonUrl} onChange={(e) => setNewLessonUrl(e.target.value)}
                          style={{ width: "100%", padding: "0.4rem 0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.85rem", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                        />
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            Type:
                          </label>
                          <select value={lessonType} onChange={(e) => setLessonType(e.target.value)} style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
                            <option value="text">Document (Text/Labs)</option>
                            <option value="video">Video Lecture</option>
                          </select>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button type="submit" style={{
                            background: "var(--accent-violet)", color: "white", border: "none",
                            padding: "0.3rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer"
                          }}>
                            Add Lecture
                          </button>
                          <button type="button" onClick={() => setActiveModuleForLesson(null)} style={{
                            background: "none", border: "1px solid var(--border-color)", color: "var(--text-primary)",
                            padding: "0.3rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer"
                          }}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button onClick={() => { setActiveModuleForLesson(module.id); setNewLessonTitle(""); }} style={{
                        background: "none", border: "none", cursor: "pointer", display: "flex",
                        alignItems: "center", gap: "0.25rem", color: "var(--accent-violet)",
                        fontSize: "0.8rem", fontWeight: 600, marginTop: "0.5rem"
                      }}>
                        <PlusCircle size={14} /> Add Lecture
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Module Input Drawer Footer */}
      <div style={{
        padding: "1.5rem", borderTop: "1px solid var(--border-color)",
        background: "var(--bg-primary)"
      }}>
        {addingModule ? (
          <form onSubmit={handleAddModule} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>New Module Title</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text" required placeholder="e.g. Scanning & Enumeration"
                value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)}
                style={{ flex: 1, padding: "0.5rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem", background: "var(--card-bg)", color: "var(--text-primary)" }}
              />
              <button type="submit" style={{
                background: "var(--accent-violet)", color: "white", border: "none",
                padding: "0.5rem 1rem", borderRadius: "6px", fontWeight: 600, cursor: "pointer"
              }}>
                Add
              </button>
              <button type="button" onClick={() => setAddingModule(false)} style={{
                background: "none", border: "1px solid var(--border-color)", color: "var(--text-primary)",
                padding: "0.5rem", borderRadius: "6px", cursor: "pointer"
              }}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setAddingModule(true)} style={{
            width: "100%", padding: "0.65rem", background: "var(--accent-violet)",
            color: "white", border: "none", borderRadius: "8px", fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
          }}>
            <Plus size={18} /> Add Module Section
          </button>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
    </>
  );
}
