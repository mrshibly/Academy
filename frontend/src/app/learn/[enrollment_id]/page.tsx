"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, CheckSquare, Square, ChevronRight, ArrowLeft, PlayCircle, FileText, Award, HelpCircle } from "lucide-react";

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
  const [certificate, setCertificate] = useState<any | null>(null);

  // Quiz interactive states
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Reset quiz states when lesson changes
  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizPassed(false);
    setQuizScore(0);
  }, [activeLesson]);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        const res = await fetch(`/api/v1/enrollments/${enrollmentId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCourseTitle(data.course.title);
          
          // Sort modules and lessons by order
          const sortedModules = (data.course.modules || [])
            .sort((a: any, b: any) => a.order - b.order)
            .map((mod: any) => ({
              ...mod,
              lessons: (mod.lessons || []).sort((a: any, b: any) => a.order - b.order)
            }));
          
          setModules(sortedModules);
          setCompletedLessonIds(new Set(data.completed_lessons || []));
          setCertificate(data.certificate || null);
          
          if (sortedModules.length > 0 && sortedModules[0].lessons.length > 0) {
            setActiveLesson(sortedModules[0].lessons[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load enrollment data:", err);
      } finally {
        setFetching(false);
      }
    };

    loadData();
  }, [token, loading, router, enrollmentId]);

  const handleToggleComplete = async (lessonId: string) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      const isCompleted = completedLessonIds.has(lessonId);
      const nextStatus = isCompleted ? "not_started" : "completed";

      const res = await fetch(`/api/v1/enrollments/${enrollmentId}/progress`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          lesson_id: lessonId,
          status: nextStatus
        })
      });

      if (res.status === 401) {
        alert("Your session has expired. Please log in again.");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.detail || "Failed to update progress.");
        return;
      }

      setCompletedLessonIds((prev) => {
        const next = new Set(prev);
        if (next.has(lessonId)) {
          next.delete(lessonId);
        } else {
          next.add(lessonId);
        }
        
        // If this completion marks the entire syllabus finished, fetch the certificate!
        const total = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
        if (next.size === total && !isCompleted) {
          setTimeout(async () => {
            try {
              const freshRes = await fetch(`/api/v1/enrollments/${enrollmentId}`, {
                headers: { "Authorization": `Bearer ${token}` }
              });
              if (freshRes.ok) {
                const freshData = await freshRes.json();
                setCertificate(freshData.certificate || null);
              }
            } catch (e) {
              console.error("Failed to refetch certificate:", e);
            }
          }, 1500);
        }
        
        return next;
      });
    } catch (err) {
      console.error(err);
      alert("Network error updating progress.");
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
                        {(les.content_type || les.type) === "quiz" ? (
                          <HelpCircle size={16} style={{ color: "var(--accent-violet)" }} />
                        ) : (les.content_type || les.type) === "video" ? (
                          <PlayCircle size={16} />
                        ) : (
                          <FileText size={16} />
                        )}
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
        
        {/* Congratulations Graduation Card */}
        {totalLessons > 0 && completedLessonIds.size === totalLessons && (
          <div style={{
            background: "linear-gradient(135deg, var(--accent-blue), var(--accent-violet))",
            color: "white",
            padding: "2.5rem 3rem",
            margin: "2rem auto 0 auto",
            maxWidth: "45rem",
            width: "calc(100% - 6rem)",
            borderRadius: "12px",
            boxShadow: "var(--shadow-md)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            position: "relative",
            overflow: "hidden"
          }}>
            <div>
              <span style={{ fontSize: "0.7rem", background: "rgba(255,255,255,0.25)", color: "white", padding: "0.25rem 0.6rem", borderRadius: "20px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Course Completed!
              </span>
              <h2 style={{ fontSize: "1.85rem", fontWeight: 800, marginTop: "0.5rem" }}>Congratulations, Graduate! 🎓</h2>
              <p style={{ opacity: 0.9, fontSize: "0.95rem", marginTop: "0.35rem", lineHeight: 1.6 }}>
                You have successfully completed all syllabus lectures and passed the required certification exams. Your formal certificate of completion has been generated!
              </p>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                {certificate?.pdf_url ? (
                  <a
                    href={certificate.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: "white", color: "var(--accent-violet)", padding: "0.6rem 1.25rem",
                      borderRadius: "6px", fontSize: "0.9rem", fontWeight: 700,
                      textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                    }}
                  >
                    <Award size={18} /> Download Certificate PDF
                  </a>
                ) : (
                  <button
                    onClick={async () => {
                      const res = await fetch(`/api/v1/enrollments/${enrollmentId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data.certificate) {
                          setCertificate(data.certificate);
                        } else {
                          alert("Generating your certificate... please wait a few seconds and try again.");
                        }
                      }
                    }}
                    style={{
                      background: "white", color: "var(--accent-violet)", padding: "0.6rem 1.25rem",
                      border: "none", cursor: "pointer",
                      borderRadius: "6px", fontSize: "0.9rem", fontWeight: 700,
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                    }}
                  >
                    Retrieve Certificate
                  </button>
                )}
                {certificate?.verification_id && (
                  <a
                    href={`/verify/${certificate.verification_id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: "rgba(255,255,255,0.2)", color: "white", padding: "0.6rem 1.25rem",
                      borderRadius: "6px", fontSize: "0.9rem", fontWeight: 600,
                      textDecoration: "none", display: "inline-flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.3)"
                    }}
                  >
                    Verify Credential
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {activeLesson ? (
          <div style={{ padding: "3rem", maxWidth: "45rem", margin: "0 auto", width: "100%" }}>
            
            <div style={{ marginBottom: "2rem" }}>
              <span style={{ fontSize: "0.75rem", background: "rgba(14, 165, 233, 0.1)", color: "var(--accent-blue)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: 700, textTransform: "uppercase" }}>
                Active Lesson
              </span>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.5rem" }}>{activeLesson.title}</h1>
            </div>

            {/* Quiz Player view or Standard Player view */}
            {(activeLesson.content_type || activeLesson.type) === "quiz" ? (
              (() => {
                let quizQuestions: any[] = [];
                let parseError = false;
                try {
                  quizQuestions = JSON.parse(activeLesson.content_body || "[]");
                } catch (e) {
                  parseError = true;
                }

                const handleSubmitQuiz = () => {
                  if (quizQuestions.length === 0) return;
                  let correctCount = 0;
                  quizQuestions.forEach((q: any, idx: number) => {
                    if (quizAnswers[idx] === q.answer_index) {
                      correctCount++;
                    }
                  });
                  const score = Math.round((correctCount / quizQuestions.length) * 100);
                  setQuizScore(score);
                  setQuizSubmitted(true);
                  const passed = score >= 80;
                  setQuizPassed(passed);

                  if (passed) {
                    if (!completedLessonIds.has(activeLesson.id)) {
                      handleToggleComplete(activeLesson.id);
                    }
                  }
                };

                return (
                  <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2.5rem", boxShadow: "var(--shadow-sm)", marginBottom: "2rem" }}>
                    <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontWeight: 800, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Award style={{ color: "var(--accent-violet)" }} size={22} /> Certification Examination
                      </h3>
                      <span style={{ fontSize: "0.8rem", background: "rgba(124, 58, 237, 0.1)", color: "var(--accent-violet)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                        Passing Score: 80%
                      </span>
                    </div>

                    {parseError || quizQuestions.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-secondary)" }}>
                        <HelpCircle size={40} style={{ margin: "0 auto 1rem auto", color: "var(--text-muted)", opacity: 0.5 }} />
                        <p style={{ fontWeight: 600 }}>Practice exam questions are not configured yet.</p>
                        <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>Please contact the course instructor to publish the quiz content body.</p>
                      </div>
                    ) : (
                      <div>
                        {!quizSubmitted ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            {quizQuestions.map((q: any, qIdx: number) => (
                              <div key={qIdx} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <h4 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                                  {qIdx + 1}. {q.question}
                                </h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                  {q.options?.map((opt: string, oIdx: number) => {
                                    const isChecked = quizAnswers[qIdx] === oIdx;
                                    return (
                                      <label
                                        key={oIdx}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "0.75rem",
                                          padding: "0.75rem 1rem",
                                          border: isChecked ? "2px solid var(--accent-violet)" : "1px solid var(--border-color)",
                                          background: isChecked ? "rgba(124, 58, 237, 0.02)" : "transparent",
                                          borderRadius: "8px",
                                          cursor: "pointer",
                                          fontSize: "0.9rem",
                                          fontWeight: isChecked ? 600 : 500,
                                          transition: "all 0.1s ease"
                                        }}
                                      >
                                        <input
                                          type="radio"
                                          name={`question-${qIdx}`}
                                          checked={isChecked}
                                          onChange={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                          style={{ accentColor: "var(--accent-violet)" }}
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                            
                            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
                              <button
                                onClick={handleSubmitQuiz}
                                disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                                style={{
                                  background: Object.keys(quizAnswers).length < quizQuestions.length ? "var(--text-muted)" : "var(--accent-violet)",
                                  color: "white", border: "none", padding: "0.6rem 1.5rem", borderRadius: "6px",
                                  fontWeight: 700, cursor: Object.keys(quizAnswers).length < quizQuestions.length ? "not-allowed" : "pointer"
                                }}
                              >
                                Submit Examination
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                            <div style={{
                              width: "5rem", height: "5rem", borderRadius: "50%",
                              background: quizPassed ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                              color: quizPassed ? "var(--accent-emerald)" : "var(--accent-rose)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              margin: "0 auto 1.5rem auto"
                            }}>
                              <Award size={36} />
                            </div>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>
                              {quizPassed ? "Exam Passed! 🎉" : "Exam Failed"}
                            </h3>
                            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                              You scored **{quizScore}%** on this certification exam.
                            </p>
                            {quizPassed ? (
                              <div style={{ marginTop: "1.5rem" }}>
                                <p style={{ fontSize: "0.9rem", color: "var(--accent-emerald)", fontWeight: 600 }}>
                                  This quiz lesson has been marked as completed successfully!
                                </p>
                              </div>
                            ) : (
                              <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                  A minimum score of **80%** is required to pass.
                                </p>
                                <button
                                  onClick={() => {
                                    setQuizAnswers({});
                                    setQuizSubmitted(false);
                                    setQuizPassed(false);
                                    setQuizScore(0);
                                  }}
                                  style={{
                                    background: "none", border: "1px solid var(--border-color)",
                                    padding: "0.5rem 1.25rem", borderRadius: "6px",
                                    fontWeight: 600, cursor: "pointer", color: "var(--text-primary)"
                                  }}
                                >
                                  Retake Examination
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <>
                {/* Video Player Placeholder or Document view */}
                {(activeLesson.content_type || activeLesson.type) === "video" ? (
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
                    {activeLesson.content_body || activeLesson.content || "Welcome to this syllabus lecture. Please proceed with the curriculum outline and resources."}
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
              </>
            )}

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
