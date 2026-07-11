"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Users, Settings, Award, Layers, Loader, CheckCircle } from "lucide-react";

export default function InstructorDashboard() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  
  const [data, setData] = useState<any>({ total_courses: 0, courses: [] });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user || (!user.roles.includes("instructor") && !user.roles.includes("admin"))) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { "Authorization": `Bearer ${token}` };
        const res = await fetch("/api/v1/dashboard/instructor/overview", { headers });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Error fetching instructor data:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [user, token, loading, router]);

  if (loading || fetching) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "8rem 0" }}>
        <Loader className="animate-spin text-accent" style={{ color: "var(--accent-blue)" }} size={32} />
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem 0", minHeight: "80vh" }}>
      <div className="container">
        
        {/* Banner */}
        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2.5rem", marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-violet)" }}>
            <Award size={20} />
            <span style={{ fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Instructor Workspace</span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem" }}>Welcome, {user?.full_name}</h1>
          <p style={{ color: "var(--text-secondary)" }}>Manage your course curricula, syllabus lectures, and view student progress stats.</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "3rem" }}>
          {/* Stats overview */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.75rem" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Courses Published</span>
              <h3 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.25rem" }}>{data.total_courses}</h3>
            </div>
            
            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.75rem" }}>
              <h4 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem" }}>Academic Guidelines</h4>
              <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                <li>Course drafts must be approved by security admins before going live.</li>
                <li>Ensure all code snippets compile and lab challenges are functional.</li>
                <li>Support ticket requests must be answered within 24 hours.</li>
              </ul>
            </div>
          </div>

          {/* Course list */}
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BookOpen size={22} style={{ color: "var(--accent-violet)" }} />
              Direct Curricula Under Direction
            </h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {data.courses.length === 0 ? (
                <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "4rem 2rem", textAlign: "center" }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>No active courses assigned to you.</p>
                </div>
              ) : (
                data.courses.map((course: any) => (
                  <div key={course.course_id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", background: "rgba(139, 92, 246, 0.1)", color: "var(--accent-violet)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                          Status: {course.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 style={{ fontWeight: 700, fontSize: "1.15rem", marginTop: "0.5rem" }}>{course.title}</h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                        Enrolled Students: <strong style={{ color: "var(--text-primary)" }}>{course.enrolled_students} Practitioners</strong>
                      </p>
                    </div>
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
