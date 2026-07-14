"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Award, CheckCircle, Clock, ExternalLink, Shield, Cpu, Terminal } from "lucide-react";

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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid rgba(16, 185, 129, 0.15)", borderTopColor: "var(--accent-emerald)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
          <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Loading workspace secure nodes...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Curated cover images for standard cyber/dev training tracks
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
    <div style={{ padding: "2.5rem 0", minHeight: "90vh", backgroundColor: "var(--bg-secondary)" }}>
      {/* Dynamic Keyframes & Hover CSS Presets */}
      <style>{`
        .glass-hero {
          position: relative;
          background-image: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.88)), url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1600');
          background-size: cover;
          background-position: center;
          border-radius: var(--radius-lg);
          padding: 3rem;
          color: white;
          margin-bottom: 2.5rem;
          box-shadow: var(--shadow-lg), 0 10px 30px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .glass-hero::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: 
            linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .stat-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-sm);
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md), 0 12px 20px rgba(0, 0, 0, 0.03);
          border-color: #cbd5e1;
        }
        .course-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.75rem;
        }
        .course-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .course-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md), 0 10px 20px rgba(0, 0, 0, 0.03);
          border-color: var(--accent-blue);
        }
        .course-cover-container {
          width: 220px;
          position: relative;
          background-color: #0f172a;
          flex-shrink: 0;
        }
        .course-cover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.85;
          transition: all 0.5s ease;
        }
        .course-card:hover .course-cover-image {
          transform: scale(1.05);
          opacity: 1;
        }
        .course-content {
          padding: 1.75rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .btn-resume {
          background: var(--text-primary);
          color: white;
          padding: 0.6rem 1.25rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }
        .btn-resume:hover {
          background: #1e293b;
          transform: translateX(3px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        }
        .certificate-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }
        .certificate-card:hover {
          border-color: var(--accent-violet);
          box-shadow: var(--shadow-md);
        }
        @media (max-width: 768px) {
          .course-card {
            flex-direction: column;
          }
          .course-cover-container {
            width: 100%;
            height: 140px;
          }
        }
      `}</style>

      <div className="container">
        
        {/* Futuristic Glassmorphic Hero Banner */}
        <div className="glass-hero">
          <div style={{ position: "relative", zIndex: 2, maxWidth: "35rem" }}>
            <span style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#10b981", padding: "0.3rem 0.75rem", borderRadius: "30px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Secure Sandbox Environment Active
            </span>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginTop: "1rem", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              Welcome back, <span style={{ background: "linear-gradient(to right, #10b981, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{user?.full_name}</span> ⚡
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "0.975rem", marginTop: "0.75rem", lineHeight: 1.6 }}>
              Continue your structured educational roadmap, check completed modules, and download cryptographically verified completion certificates.
            </p>
          </div>
        </div>

        {/* Floating Glassmorphic Stats Row */}
        <div className="stats-grid">
          <div className="stat-card" style={{ borderLeft: "4px solid var(--accent-blue)" }}>
            <div style={{ padding: "0.6rem", background: "rgba(16, 185, 129, 0.08)", borderRadius: "8px", color: "var(--accent-blue)" }}>
              <BookOpen size={24} />
            </div>
            <div>
              <span style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", display: "block", lineHeight: 1.1 }}>{stats.enrolled_courses}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>Active Tracks</span>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: "4px solid var(--accent-emerald)" }}>
            <div style={{ padding: "0.6rem", background: "rgba(16, 185, 129, 0.08)", borderRadius: "8px", color: "var(--accent-emerald)" }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <span style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", display: "block", lineHeight: 1.1 }}>{stats.completed_courses}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>Completed Tracks</span>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: "4px solid var(--accent-violet)" }}>
            <div style={{ padding: "0.6rem", background: "rgba(139, 92, 246, 0.08)", borderRadius: "8px", color: "var(--accent-violet)" }}>
              <Award size={24} />
            </div>
            <div>
              <span style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", display: "block", lineHeight: 1.1 }}>{stats.certificates_earned}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>Certificates Earned</span>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2.5rem" }} className="responsive-dashboard-columns">
          
          {/* Enrolled Training Tracks List */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Terminal size={20} style={{ color: "var(--accent-blue)" }} /> Specialized Roadmaps
              </h2>
              <Link href="/academy" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-blue)", textDecoration: "none" }}>
                Explore Catalog &rarr;
              </Link>
            </div>

            {activeCourses.length === 0 ? (
              <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "4rem 2rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>You are not enrolled in any training tracks yet.</p>
                <Link href="/academy" className="btn btn-primary">
                  Browse Catalog
                </Link>
              </div>
            ) : (
              <div className="course-grid">
                {activeCourses.map((enrollment) => {
                  const coverUrl = getCourseImage(enrollment.course?.title || "");
                  return (
                    <div key={enrollment.id} className="course-card">
                      <div className="course-cover-container">
                        <img src={coverUrl} alt="Course cover" className="course-cover-image" />
                        <div style={{ position: "absolute", top: "12px", left: "12px" }}>
                          <span style={{ fontSize: "0.65rem", background: enrollment.status === "active" ? "#3b82f6" : "#10b981", color: "white", padding: "0.25rem 0.6rem", borderRadius: "20px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {enrollment.status === "active" ? "In Progress" : "Completed"}
                          </span>
                        </div>
                      </div>

                      <div className="course-content">
                        <div>
                          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>
                            {enrollment.course?.title || "Specialized Tech Training"}
                          </h3>
                          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.3rem" }}>
                            Registered on {new Date(enrollment.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div style={{ marginTop: "1.5rem" }}>
                          {/* Course Progress Indicators */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Syllabus Completion</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: 700 }}>
                              {enrollment.status === "completed" ? "100%" : "In Progress"}
                            </span>
                          </div>
                          <div style={{ width: "100%", height: "6px", backgroundColor: "var(--border-color)", borderRadius: "10px", overflow: "hidden", marginBottom: "1.5rem" }}>
                            <div style={{ width: enrollment.status === "completed" ? "100%" : "35%", height: "100%", background: enrollment.status === "completed" ? "linear-gradient(to right, #10b981, #059669)" : "linear-gradient(to right, #3b82f6, #60a5fa)", borderRadius: "10px", boxShadow: "0 0 8px rgba(59, 130, 246, 0.3)" }}></div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Link href={`/learn/${enrollment.id}`} className="btn-resume">
                              Resume Learning
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

          {/* Premium Certificate Ledgers */}
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Award size={20} style={{ color: "var(--accent-violet)" }} /> Secure Credentials
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {certificates.length === 0 ? (
                <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "3rem 1.5rem", textAlign: "center" }}>
                  <Award size={36} style={{ color: "var(--text-muted)", opacity: 0.4, marginBottom: "0.75rem" }} />
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                    Your cryptographically signed certificates will render here automatically upon finishing a syllabus.
                  </p>
                </div>
              ) : (
                certificates.map((cert) => (
                  <div key={cert.id} className="certificate-card">
                    <div style={{ maxWidth: "70%" }}>
                      <h4 style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {cert.course?.title}
                      </h4>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>
                        Issued: {new Date(cert.issued_at).toLocaleDateString()}
                      </span>
                    </div>
                    <a
                      href={cert.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "rgba(139, 92, 246, 0.08)",
                        color: "var(--accent-violet)",
                        padding: "0.45rem 0.9rem",
                        borderRadius: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        textDecoration: "none",
                        border: "1px solid rgba(139, 92, 246, 0.15)",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--accent-violet)";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(139, 92, 246, 0.08)";
                        e.currentTarget.style.color = "var(--accent-violet)";
                      }}
                    >
                      <ExternalLink size={12} /> PDF
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
