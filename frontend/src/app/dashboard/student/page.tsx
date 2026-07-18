"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Award, CheckCircle, Clock, ExternalLink, Shield, Cpu, Terminal, Share2, Compass, Activity, Server, ArrowRight, BookOpenText, GraduationCap, HelpCircle } from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [stats, setStats] = useState({ enrolled_courses: 0, completed_courses: 0, certificates_earned: 0 });
  const [activeCourses, setActiveCourses] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { "Authorization": `Bearer ${token}` };

        // Fetch student dashboard overview
        const statsRes = await fetch("/api/v1/dashboard/student/overview", { headers });
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }

        // Fetch active enrollments
        const enrollRes = await fetch("/api/v1/enrollments/me", { headers });
        if (enrollRes.ok) {
          setActiveCourses(await enrollRes.json());
        }

        // Fetch certificates
        const certRes = await fetch("/api/v1/certificates/me", { headers });
        if (certRes.ok) {
          setCertificates(await certRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [user, token, loading, router]);

  if (loading || fetching) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "75vh", backgroundColor: "var(--bg-primary)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid rgba(14, 165, 233, 0.15)", borderTopColor: "var(--accent-blue)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
          <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Loading Academic Workspace...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const getCourseImage = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("hack") || t.includes("penetration") || t.includes("security") || t.includes("defense")) {
      return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600";
    }
    if (t.includes("ai") || t.includes("intelligence") || t.includes("machine") || t.includes("neural") || t.includes("model")) {
      return "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=600";
    }
    return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600";
  };

  return (
    <div style={{ minHeight: "95vh" }}>
      {/* Styles for dynamic interactions and glassmorphism elements */}
      <style>{`
        .academic-header {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2.5rem 2rem;
          margin-bottom: 2.5rem;
          box-shadow: var(--shadow-sm);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          position: relative;
          overflow: hidden;
        }
        .academic-header::after {
          content: "";
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 300px;
          background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.02));
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .academic-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 2rem 1.5rem;
          }
        }
        .stat-badge-grid {
          display: flex;
          gap: 1.5rem;
        }
        @media (max-width: 480px) {
          .stat-badge-grid {
            flex-direction: column;
            width: 100%;
          }
        }
        .stat-badge-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: 160px;
        }
        .icon-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(14, 165, 233, 0.08);
          color: var(--accent-blue);
        }
        .lms-grid-container {
          display: grid;
          grid-template-columns: 2.3fr 1fr;
          gap: 2.5rem;
        }
        @media (max-width: 1024px) {
          .lms-grid-container {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }
        .course-card-premium {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-sm);
        }
        .course-card-premium:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md), 0 10px 20px rgba(0, 0, 0, 0.02);
          border-color: var(--accent-blue);
        }
        @media (max-width: 640px) {
          .course-card-premium {
            flex-direction: column;
          }
          .cover-aside {
            width: 100% !important;
            height: 160px;
          }
        }
        .cover-aside {
          width: 210px;
          position: relative;
          overflow: hidden;
          background: #0f172a;
          flex-shrink: 0;
        }
        .cover-aside img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.85;
          transition: transform 0.4s ease;
        }
        .course-card-premium:hover .cover-aside img {
          transform: scale(1.05);
        }
        .course-details-pane {
          padding: 1.75rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .curriculum-progress-track {
          height: 6px;
          background: var(--border-color);
          border-radius: 10px;
          overflow: hidden;
          margin: 0.5rem 0 1.25rem 0;
        }
        .curriculum-progress-fill {
          height: 100%;
          border-radius: 10px;
        }
        .btn-academic-primary {
          background: var(--text-primary);
          color: white;
          padding: 0.55rem 1.25rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s ease;
        }
        .btn-academic-primary:hover {
          background: #1e293b;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.12);
        }
        .academic-cert-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .academic-cert-card:hover {
          border-color: var(--accent-violet);
          box-shadow: var(--shadow-md);
        }
        .sidebar-widget {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          margin-top: 1.5rem;
        }
      `}</style>

      <div className="container">
        
        {/* Academic Student Header Dashboard */}
        <div className="academic-header">
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--accent-blue)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.35rem" }}>
              Academy Student Hub
            </span>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              Welcome back, {user?.full_name}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
              Track your syllabus modules, review earned credentials, and resume active courses.
            </p>
          </div>

          {/* Quick Metrics Badge List */}
          <div className="stat-badge-grid">
            <div className="stat-badge-card">
              <div className="icon-circle" style={{ color: "var(--accent-blue)", background: "rgba(14, 165, 233, 0.08)" }}>
                <BookOpenText size={18} />
              </div>
              <div>
                <span style={{ display: "block", fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{stats.enrolled_courses}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Enrolled</span>
              </div>
            </div>

            <div className="stat-badge-card">
              <div className="icon-circle" style={{ color: "var(--accent-emerald)", background: "rgba(16, 185, 129, 0.08)" }}>
                <CheckCircle size={18} />
              </div>
              <div>
                <span style={{ display: "block", fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{stats.completed_courses}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Layout Grid */}
        <div className="lms-grid-container">
          
          {/* Main Area: Enrolled Pathways */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <GraduationCap size={22} style={{ color: "var(--accent-blue)" }} /> Enrolled Course Pathways
              </h2>
              <Link href="/academy" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-blue)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                Explore Curriculum <ArrowRight size={14} />
              </Link>
            </div>

            {activeCourses.length === 0 ? (
              <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "4rem 2rem", textAlign: "center" }}>
                <BookOpenText size={40} style={{ color: "var(--text-muted)", opacity: 0.4, marginBottom: "1rem" }} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>No Enrolled Courses Found</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                  Begin your specialized cybersecurity or AI engineering pathway by enrolling in our courses.
                </p>
                <Link href="/academy" className="btn btn-primary" style={{ padding: "0.6rem 1.5rem" }}>
                  Browse Course Catalog
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {activeCourses.map((enrollment) => {
                  const coverUrl = getCourseImage(enrollment.course?.title || "");
                  return (
                    <div key={enrollment.id} className="course-card-premium">
                      <div className="cover-aside">
                        <img src={coverUrl} alt="Course cover" />
                        <div style={{ position: "absolute", top: "12px", left: "12px" }}>
                          <span style={{ fontSize: "0.65rem", background: enrollment.status === "active" ? "var(--accent-blue)" : "var(--accent-emerald)", color: "white", padding: "0.25rem 0.6rem", borderRadius: "20px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {enrollment.status === "active" ? "In Progress" : "Completed"}
                          </span>
                        </div>
                      </div>

                      <div className="course-details-pane">
                        <div>
                          <span style={{ fontSize: "0.7rem", color: "var(--accent-blue)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
                            {enrollment.course?.level || "Specialized"} Course Track
                          </span>
                          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.25rem" }}>
                            {enrollment.course?.title || "Specialized Training"}
                          </h3>
                          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.35rem", lineHeight: 1.5 }}>
                            {enrollment.course?.short_description || "Comprehensive modular learning path designed to elevate professional capabilities and practical engineering skills."}
                          </p>
                        </div>

                        <div style={{ marginTop: "1.5rem" }}>
                          {/* Syllabus progress status indicator */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Syllabus Progress</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: 700 }}>
                              {enrollment.status === "completed" ? "100% Completed" : "In Progress"}
                            </span>
                          </div>
                          
                          <div className="curriculum-progress-track">
                            <div
                              className="curriculum-progress-fill"
                              style={{
                                width: enrollment.status === "completed" ? "100%" : "35%",
                                background: enrollment.status === "completed" ? "linear-gradient(to right, var(--accent-emerald), #059669)" : "linear-gradient(to right, var(--accent-blue), #60a5fa)"
                              }}
                            ></div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              Registered: {new Date(enrollment.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                            <Link href={`/learn/${enrollment.id}`} className="btn-academic-primary">
                              Resume Lectures <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Area: Achievements & Support */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <Award size={20} style={{ color: "var(--accent-violet)" }} />
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>My Achievements</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {certificates.length === 0 ? (
                <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "3rem 1.5rem", textAlign: "center" }}>
                  <Award size={36} style={{ color: "var(--text-muted)", opacity: 0.35, marginBottom: "0.75rem" }} />
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                    Your graduation certificates will render here automatically upon course pathway completion.
                  </p>
                </div>
              ) : (
                certificates.map((cert) => {
                  const verifyUrl = typeof window !== "undefined"
                    ? `${window.location.origin}/verify/${cert.verification_id}`
                    : "";
                  const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME` +
                    `&name=${encodeURIComponent(cert.course?.title || "Specialized Tech Certificate")}` +
                    `&organizationName=${encodeURIComponent("Academy")}` +
                    `&certUrl=${encodeURIComponent(verifyUrl)}` +
                    `&certId=${encodeURIComponent(cert.verification_id)}`;

                  return (
                    <div key={cert.id} className="academic-cert-card">
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(139, 92, 246, 0.08)", color: "var(--accent-violet)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                          <Award size={18} style={{ margin: "auto" }} />
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.4 }}>
                            {cert.course?.title}
                          </h4>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.15rem" }}>
                            Graduation: {new Date(cert.issued_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <a
                          href={cert.pdf_url}
                          download={`certificate-${cert.verification_id || 'completion'}.pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: "rgba(139, 92, 246, 0.06)",
                            color: "var(--accent-violet)",
                            padding: "0.5rem 0.9rem",
                            borderRadius: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.35rem",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            textDecoration: "none",
                            border: "1px solid rgba(139, 92, 246, 0.12)",
                            transition: "all 0.2s ease",
                            flex: 1
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--accent-violet)";
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(139, 92, 246, 0.06)";
                            e.currentTarget.style.color = "var(--accent-violet)";
                          }}
                        >
                          <ExternalLink size={12} /> PDF Copy
                        </a>

                        <a
                          href={linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: "rgba(10, 102, 194, 0.06)",
                            color: "#0a66c2",
                            padding: "0.5rem 0.9rem",
                            borderRadius: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.35rem",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            textDecoration: "none",
                            border: "1px solid rgba(10, 102, 194, 0.12)",
                            transition: "all 0.2s ease",
                            flex: 1
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#0a66c2";
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(10, 102, 194, 0.06)";
                            e.currentTarget.style.color = "#0a66c2";
                          }}
                        >
                          <Share2 size={12} /> Add to Profile
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Links / Support Desk */}
            <div className="sidebar-widget">
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <HelpCircle size={16} style={{ color: "var(--accent-blue)" }} /> Student Resources
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
                <li>
                  <Link href="/contact" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Technical Support Desk</span>
                    <ArrowRight size={12} style={{ opacity: 0.6 }} />
                  </Link>
                </li>
                <li>
                  <Link href="/academy" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Syllabus Catalog & Advising</span>
                    <ArrowRight size={12} style={{ opacity: 0.6 }} />
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
