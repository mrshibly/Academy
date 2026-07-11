"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Award, CheckCircle, Clock, ExternalLink } from "lucide-react";

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
      <div style={{ display: "flex", justifyContent: "center", padding: "8rem 0" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem 0" }}>
      <div className="container">
        
        {/* Header banner */}
        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2.5rem", marginBottom: "3rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Welcome, {user?.full_name}</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Keep up the progress and acquire industry credentials
            </p>
          </div>
          <div style={{ display: "flex", gap: "2rem" }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-blue)" }}>{stats.enrolled_courses}</span>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Enrolled</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-emerald)" }}>{stats.completed_courses}</span>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Completed</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-violet)" }}>{stats.certificates_earned}</span>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Certificates</p>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "3rem", flexWrap: "wrap" }}>
          
          {/* Active Courses */}
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BookOpen size={22} style={{ color: "var(--accent-blue)" }} /> My Learning
            </h2>

            {activeCourses.length === 0 ? (
              <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "4rem 2rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>You are not enrolled in any training tracks yet.</p>
                <Link href="/academy" className="btn btn-primary">
                  Browse Catalog
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {activeCourses.map((enrollment) => (
                  <div key={enrollment.id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1.75rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "0.2rem 0.5rem", borderRadius: "4px", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {enrollment.status === "active" ? "In Progress" : "Completed"}
                      </span>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.5rem" }}>
                        {enrollment.course?.title || "Ethical Hacking & Penetration Testing"}
                      </h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                        Enrolled on {new Date(enrollment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Link href={`/learn/${enrollment.id}`} className="btn btn-accent" style={{ fontSize: "0.85rem" }}>
                        Resume Learning
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certificates panel */}
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Award size={22} style={{ color: "var(--accent-violet)" }} /> Certificates
            </h2>

            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {certificates.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "2rem 0" }}>
                  Certificates will appear here once you complete 100% of a course curriculum.
                </p>
              ) : (
                certificates.map((cert) => (
                  <div key={cert.id} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: "0.95rem" }}>{cert.course?.title}</h4>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Issued: {new Date(cert.issued_at).toLocaleDateString()}</span>
                    </div>
                    <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-blue)", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", fontWeight: 600 }}>
                      <ExternalLink size={14} /> PDF
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
