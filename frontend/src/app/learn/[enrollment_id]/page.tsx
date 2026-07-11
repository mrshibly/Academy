"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, CheckSquare, Square, ChevronRight, ArrowLeft, PlayCircle, FileText } from "lucide-react";

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const { token, loading } = useAuth();
  
  const enrollmentId = params?.enrollment_id as string;
  const [courseTitle, setCourseTitle] = useState("Curriculum");
  const [modules, setModules] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [fetching, setFetching] = useState(true);

  // Mock static course structure for lab flow
  const mockCourseData = {
    title: "Ethical Hacking & Penetration Testing",
    modules: [
      {
        title: "Module 1: Introduction to Offensive Security",
        lessons: [
          { id: "les-1", title: "Course Overview & Lab Setup", type: "video", content: "Welcome! In this lesson, we will go over the requirements for the sandbox labs. Make sure to download Kali Linux or install it in a local virtual machine." },
          { id: "les-2", title: "Ethical Disclosure Guidelines", type: "document", content: "Ethical hacking requires strict adherence to legal authorization models. Do not scan targets without written permission (Rules of Engagement)." }
        ]
      },
      {
        title: "Module 2: Network Reconnaissance",
        lessons: [
          { id: "les-3", title: "Active Recon: Port Scanning with Nmap", type: "video", content: "Learn Nmap scan configurations, default script usage (-sC), service version inspection (-sV), and TCP SYN scanning strategies." },
          { id: "les-4", title: "Puzzling Firewalls & Evasion", type: "document", content: "Firewalls block raw connection checks. Examine fragmentation and decoys techniques to bypass basic filtering." }
        ]
      }
    ]
  };

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        // Load initial mock details
        setCourseTitle(mockCourseData.title);
        setModules(mockCourseData.modules);
        setActiveLesson(mockCourseData.modules[0].lessons[0]);
        setFetching(false);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, [token, loading, router]);

  const handleToggleComplete = async (lessonId: string) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      // Call progress endpoint in backend
      const res = await fetch(`/api/v1/enrollments/${enrollmentId}/progress`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          lesson_id: lessonId,
          status: "completed"
        })
      });

      if (res.ok) {
        setCompletedLessonIds((prev) => {
          const next = new Set(prev);
          if (next.has(lessonId)) {
            next.delete(lessonId);
          } else {
            next.add(lessonId);
          }
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || fetching) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "8rem 0" }}>
        <p style={{ color: "var(--text-secondary)" }}>Initializing LMS player...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 4.5rem)", background: "#f8fafc" }}>
      
      {/* Left panel: Lesson Menu Sidebar */}
      <div style={{ width: "22rem", borderRight: "1px solid var(--border-color)", background: "white", display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => router.push("/dashboard/student")} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "var(--text-secondary)" }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "16rem" }}>{courseTitle}</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>LMS Interactive Sandbox</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 0" }}>
          {modules.map((mod, modIdx) => (
            <div key={modIdx} style={{ marginBottom: "1.5rem" }}>
              <div style={{ padding: "0.5rem 1.25rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.025em" }}>
                {mod.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", marginTop: "0.5rem" }}>
                {mod.lessons.map((les: any) => {
                  const isActive = activeLesson?.id === les.id;
                  const isDone = completedLessonIds.has(les.id);
                  return (
                    <button
                      key={les.id}
                      onClick={() => setActiveLesson(les)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.75rem 1.25rem",
                        width: "100%",
                        border: "none",
                        background: isActive ? "rgba(14, 165, 233, 0.05)" : "transparent",
                        borderLeft: isActive ? "3px solid var(--accent-blue)" : "3px solid transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        color: isActive ? "var(--accent-blue)" : "var(--text-primary)",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "85%" }}>
                        {les.type === "video" ? <PlayCircle size={16} /> : <FileText size={16} />}
                        <span style={{ fontSize: "0.875rem", fontWeight: isActive ? 600 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {les.title}
                        </span>
                      </div>
                      <span onClick={(e) => { e.stopPropagation(); handleToggleComplete(les.id); }} style={{ color: isDone ? "var(--accent-emerald)" : "var(--text-muted)" }}>
                        {isDone ? <CheckSquare size={16} /> : <Square size={16} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel: Main Lesson Content Area */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {activeLesson ? (
          <div style={{ padding: "3rem", maxWidth: "45rem", margin: "0 auto", width: "100%" }}>
            
            <div style={{ marginBottom: "2rem" }}>
              <span style={{ fontSize: "0.75rem", background: "rgba(14, 165, 233, 0.1)", color: "var(--accent-blue)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: 700, textTransform: "uppercase" }}>
                Active Lesson
              </span>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.5rem" }}>{activeLesson.title}</h1>
            </div>

            {/* Video Player Placeholder or Document view */}
            {activeLesson.type === "video" ? (
              <div style={{ width: "100%", height: "24rem", borderRadius: "var(--radius-md)", background: "#0f172a", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "2.5rem", boxShadow: "var(--shadow-md)" }}>
                <PlayCircle size={64} style={{ color: "var(--accent-blue)", opacity: 0.9 }} />
                <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>Render Secure Video Player</span>
              </div>
            ) : (
              <div style={{ width: "100%", height: "8rem", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "white", marginBottom: "2.5rem" }}>
                <FileText size={32} style={{ color: "var(--accent-teal)" }} />
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>Interactive Practice Lab Document</span>
              </div>
            )}

            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2rem", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "0.75rem" }}>Lesson Overview</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.975rem", lineHeight: 1.6 }}>
                {activeLesson.content}
              </p>
            </div>

            <div style={{ marginTop: "3rem", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => handleToggleComplete(activeLesson.id)}
                className="btn btn-primary"
                style={{
                  backgroundColor: completedLessonIds.has(activeLesson.id) ? "var(--accent-emerald)" : "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <CheckSquare size={18} />
                <span>
                  {completedLessonIds.has(activeLesson.id) ? "Completed" : "Mark as Complete & Next"}
                </span>
              </button>
            </div>

          </div>
        ) : (
          <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
            <p>Select a lesson from the menu sidebar to begin learning.</p>
          </div>
        )}
      </div>

    </div>
  );
}
