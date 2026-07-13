"use client";

import { useEffect, useState } from "react";
import { Plus, X, List, Layers, PlusCircle, Check, Loader, Video, FileText } from "lucide-react";

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

  // Forms states
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);

  const [activeModuleForLesson, setActiveModuleForLesson] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState("text");

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
        fetchCourseDetails();
      } else {
        setActionError("Failed to add module.");
      }
    } catch {
      setActionError("Network error adding module.");
    }
  };

  const handleAddLesson = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

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
          is_free_preview: false
        })
      });

      if (res.ok) {
        setNewLessonTitle("");
        setActiveModuleForLesson(null);
        fetchCourseDetails();
      } else {
        setActionError("Failed to add lesson.");
      }
    } catch {
      setActionError("Network error adding lesson.");
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0, width: "32rem",
      background: "white", boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
      zIndex: 100, display: "flex", flexDirection: "column",
      borderLeft: "1px solid var(--border-color)", animation: "slideIn 0.2s ease-out"
    }}>
      {/* Drawer Header */}
      <div style={{
        padding: "1.5rem", borderBottom: "1px solid var(--border-color)",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--accent-violet)", fontWeight: 600, textTransform: "uppercase" }}>Curriculum Architecture</span>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginTop: "0.15rem" }}>Syllabus Outline Builder</h3>
        </div>
        <button onClick={onClose} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0.4rem", borderRadius: "50%", hover: { background: "var(--bg-secondary)" }
        }}>
          <X size={20} />
        </button>
      </div>

      {/* Drawer Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {actionError && (
          <div style={{
            background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca",
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
                    background: "var(--bg-secondary)", borderRadius: "10px",
                    border: "1px solid var(--border-color)", padding: "1rem"
                  }}>
                    {/* Module Title Row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <Layers size={16} style={{ color: "var(--accent-violet)" }} />
                      <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{module.title}</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>(Module {module.order})</span>
                    </div>

                    {/* Lessons list inside module */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingLeft: "1.25rem", borderLeft: "2px solid var(--border-color)", marginBottom: "0.75rem" }}>
                      {module.lessons?.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", padding: "0.25rem 0" }}>No lectures in this module.</p>
                      ) : (
                        module.lessons.sort((a: any, b: any) => a.order - b.order).map((lesson: any) => (
                          <div key={lesson.id} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            background: "white", padding: "0.45rem 0.75rem", borderRadius: "6px",
                            border: "1px solid var(--border-color)", fontSize: "0.85rem"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              {lesson.content_type === "video" ? <Video size={14} style={{ color: "var(--accent-blue)" }} /> : <FileText size={14} style={{ color: "var(--text-muted)" }} />}
                              <span>{lesson.title}</span>
                            </div>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>L{lesson.order}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Lesson Form */}
                    {activeModuleForLesson === module.id ? (
                      <form onSubmit={(e) => handleAddLesson(e, module.id)} style={{
                        marginTop: "0.5rem", padding: "0.75rem", background: "white",
                        borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "0.75rem"
                      }}>
                        <input
                          type="text" required placeholder="Lecture Title..."
                          value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)}
                          style={{ width: "100%", padding: "0.4rem 0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.85rem" }}
                        />
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                          <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            Type:
                          </label>
                          <select value={lessonType} onChange={(e) => setLessonType(e.target.value)} style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem", border: "1px solid var(--border-color)" }}>
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
                            background: "none", border: "1px solid var(--border-color)",
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
        background: "var(--bg-secondary)"
      }}>
        {addingModule ? (
          <form onSubmit={handleAddModule} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>New Module Title</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text" required placeholder="e.g. Scanning & Enumeration"
                value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)}
                style={{ flex: 1, padding: "0.5rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "0.9rem" }}
              />
              <button type="submit" style={{
                background: "var(--accent-violet)", color: "white", border: "none",
                padding: "0.5rem 1rem", borderRadius: "6px", fontWeight: 600, cursor: "pointer"
              }}>
                Add
              </button>
              <button type="button" onClick={() => setAddingModule(false)} style={{
                background: "white", border: "1px solid var(--border-color)",
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
  );
}
