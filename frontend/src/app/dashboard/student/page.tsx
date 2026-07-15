"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Award, CheckCircle, Clock, ExternalLink, Shield, Cpu, Terminal, Share2, Compass, Activity, Server } from "lucide-react";

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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", backgroundColor: "var(--bg-primary)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "45px", height: "45px", border: "3px solid rgba(14, 165, 233, 0.15)", borderTopColor: "var(--accent-blue)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
          <p style={{ color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.95rem" }}>Synchronizing secure sandbox parameters...</p>
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
    <div style={{ padding: "2.5rem 0", minHeight: "90vh", backgroundColor: "var(--bg-primary)" }}>
      {/* Styles for dynamic interactions and glassmorphism elements */}
      <style>{`
        .cyber-banner {
          position: relative;
          background-image: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(17, 24, 39, 0.9)), url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1600');
          background-size: cover;
          background-position: center;
          border-radius: var(--radius-lg);
          padding: 3rem 2.5rem;
          color: white;
          margin-bottom: 2.5rem;
          box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }
        .cyber-banner::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }
        .cyber-banner-grid {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
        }
        .pulse-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: var(--accent-emerald);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--accent-emerald);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .premium-stat-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.75rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-sm);
          position: relative;
          overflow: hidden;
        }
        .premium-stat-card::after {
          content: "";
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: transparent;
          transition: all 0.3s ease;
        }
        .premium-stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.04);
        }
        .stat-blue:hover::after { background: var(--accent-blue); }
        .stat-emerald:hover::after { background: var(--accent-emerald); }
        .stat-violet:hover::after { background: var(--accent-violet); }
        
        .glow-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 12px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .premium-stat-card:hover .glow-icon-box {
          transform: scale(1.1);
        }

        .lms-main-grid {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: 2.5rem;
        }
        @media (max-width: 1024px) {
          .lms-main-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }
        .blueprint-empty-card {
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-md);
          padding: 4rem 2rem;
          text-align: center;
          background: radial-gradient(rgba(14, 165, 233, 0.01) 1px, transparent 1px);
          background-size: 16px 16px;
          transition: all 0.3s ease;
        }
        .blueprint-empty-card:hover {
          border-color: var(--accent-blue);
          background-color: rgba(14, 165, 233, 0.015);
        }
        .lms-course-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-sm);
        }
        .lms-course-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.04);
          border-color: var(--accent-blue);
        }
        .lms-cover-wrapper {
          width: 200px;
          position: relative;
          background-color: #0f172a;
          flex-shrink: 0;
          overflow: hidden;
        }
        .lms-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.8;
          transition: all 0.4s ease;
        }
        .lms-course-card:hover .lms-cover-img {
          transform: scale(1.06);
          opacity: 1;
        }
        .lms-course-body {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .btn-resume-cyber {
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
        .btn-resume-cyber:hover {
          background: #1e293b;
          transform: translateX(4px);
        }
        .lms-cert-item {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .lms-cert-item:hover {
          transform: translateY(-2px);
          border-color: var(--accent-violet);
          box-shadow: 0 8px 16px rgba(139, 92, 246, 0.05);
        }
      `}</style>

      <div className="container">
        
        {/* Futuristic Cyber Hero Banner */}
        <div className="cyber-banner">
          <div className="cyber-banner-grid"></div>
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="pulse-dot"></span>
              <span style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "0.3rem 0.75rem", borderRadius: "30px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Secure Sandbox Environment Active
              </span>
            </div>
            
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginTop: "1rem", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              Welcome back, <span style={{ background: "linear-gradient(to right, var(--accent-blue), var(--accent-emerald))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{user?.full_name}</span>
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginTop: "0.5rem", lineHeight: 1.6, maxWidth: "38rem" }}>
              Access authorized labs, check validation credentials, and verify cryptographic graduation records inside your personalized developer learning space.
            </p>

            {/* Simulated hardware state string */}
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.75rem", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "1rem", fontSize: "0.75rem", fontFamily: "monospace", color: "#64748b" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><Server size={12} /> NODE: REGION-EAST-01</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><Activity size={12} /> CLEARANCE: LEVEL_1_STUDENT</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><Shield size={12} /> PROTECTION: ENABLED</span>
            </div>
          </div>
        </div>

        {/* Breathtaking Glowing Stats Cards */}
        <div className="stats-container">
          <div className="premium-stat-card stat-blue">
            <div className="glow-icon-box" style={{ background: "rgba(14, 165, 233, 0.08)", color: "var(--accent-blue)" }}>
              <BookOpen size={22} />
            </div>
            <div>
              <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", display: "block", lineHeight: 1.1 }}>{stats.enrolled_courses}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Tracks</span>
            </div>
          </div>

          <div className="premium-stat-card stat-emerald">
            <div className="glow-icon-box" style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--accent-emerald)" }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", display: "block", lineHeight: 1.1 }}>{stats.completed_courses}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Completed Tracks</span>
            </div>
          </div>

          <div className="premium-stat-card stat-violet">
            <div className="glow-icon-box" style={{ background: "rgba(139, 92, 246, 0.08)", color: "var(--accent-violet)" }}>
              <Award size={22} />
            </div>
            <div>
              <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", display: "block", lineHeight: 1.1 }}>{stats.certificates_earned}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Certificates Earned</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Roadmaps and Credentials */}
        <div className="lms-main-grid">
          
          {/* Specialized Roadmaps */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Terminal size={20} style={{ color: "var(--accent-blue)" }} /> Specialized Roadmaps
              </h2>
              <Link href="/academy" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-blue)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                Explore Catalog <Compass size={14} />
              </Link>
            </div>

            {activeCourses.length === 0 ? (
              <div className="blueprint-empty-card">
                <Compass size={40} style={{ color: "var(--text-muted)", opacity: 0.5, marginBottom: "1rem" }} />
                <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>You are not enrolled in any training tracks yet.</p>
                <Link href="/academy" className="btn btn-primary" style={{ padding: "0.6rem 1.5rem" }}>
                  Browse Course Catalog
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {activeCourses.map((enrollment) => {
                  const coverUrl = getCourseImage(enrollment.course?.title || "");
                  return (
                    <div key={enrollment.id} className="lms-course-card">
                      <div className="lms-cover-wrapper">
                        <img src={coverUrl} alt="Course cover" className="lms-cover-img" />
                        <div style={{ position: "absolute", top: "12px", left: "12px" }}>
                          <span style={{ fontSize: "0.65rem", background: enrollment.status === "active" ? "var(--accent-blue)" : "var(--accent-emerald)", color: "white", padding: "0.25rem 0.6rem", borderRadius: "20px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {enrollment.status === "active" ? "In Progress" : "Completed"}
                          </span>
                        </div>
                      </div>

                      <div className="lms-course-body">
                        <div>
                          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>
                            {enrollment.course?.title || "Specialized Tech Training"}
                          </h3>
                          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                            Enrolled on {new Date(enrollment.created_at).toLocaleDateString()}
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
                          <div style={{ width: "100%", height: "6px", backgroundColor: "var(--border-color)", borderRadius: "10px", overflow: "hidden", marginBottom: "1.25rem" }}>
                            <div style={{ width: enrollment.status === "completed" ? "100%" : "35%", height: "100%", background: enrollment.status === "completed" ? "linear-gradient(to right, var(--accent-emerald), #059669)" : "linear-gradient(to right, var(--accent-blue), #60a5fa)", borderRadius: "10px" }}></div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Link href={`/learn/${enrollment.id}`} className="btn-resume-cyber">
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

          {/* Secure Credentials */}
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Award size={20} style={{ color: "var(--accent-violet)" }} /> Secure Credentials
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {certificates.length === 0 ? (
                <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "3rem 1.5rem", textAlign: "center" }}>
                  <Award size={36} style={{ color: "var(--text-muted)", opacity: 0.35, marginBottom: "0.75rem" }} />
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                    Your cryptographically signed certificates will render here automatically upon finishing a syllabus.
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
                    <div key={cert.id} className="lms-cert-item">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                        <div>
                          <h4 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.25rem", lineHeight: 1.4 }}>
                            {cert.course?.title}
                          </h4>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                            Issued: {new Date(cert.issued_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Award size={20} style={{ color: "var(--accent-violet)", flexShrink: 0 }} />
                      </div>
                      
                      <div style={{ display: "flex", gap: "0.75rem", width: "100%", marginTop: "0.25rem" }}>
                        <a
                          href={cert.pdf_url}
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
                          <ExternalLink size={12} /> PDF
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
                          <Share2 size={12} /> Share
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
