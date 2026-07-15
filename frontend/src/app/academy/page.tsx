"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Cpu, Loader, ShieldAlert } from "lucide-react";

export default function AcademyPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/v1/courses?page=1&page_size=50");
        if (res.ok) {
          const body = await res.json();
          setCourses(body.items || []);
        }
      } catch (err) {
        console.error("Error loading courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{
            display: "inline-block",
            background: "rgba(14, 165, 233, 0.08)",
            color: "var(--accent-blue)",
            padding: "0.35rem 1rem",
            borderRadius: "9999px",
            fontSize: "0.8rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "1rem"
          }}>
            Academy Tracks
          </span>
          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Academy Catalog</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem", maxWidth: "35rem", margin: "0.5rem auto 0 auto" }}>
            Curated tracks designed to build qualified practitioners in artificial intelligence and offensive security.
          </p>
        </div>

        {/* Course Cards Grid */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <Loader className="animate-spin text-accent" style={{ color: "var(--accent-blue)" }} size={32} />
          </div>
        ) : courses.length === 0 ? (
          <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "4rem 2rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>No active courses currently listed in the catalog.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2.5rem" }}>
            {courses.map((course) => {
              const getCourseThumbnail = (title: string) => {
                const t = title.toLowerCase();
                if (t.includes("cyber") || t.includes("hack") || t.includes("security") || t.includes("pentest") || t.includes("defense")) {
                  return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80&auto=format&fit=crop";
                }
                if (t.includes("ai") || t.includes("llm") || t.includes("gpt") || t.includes("machine") || t.includes("model") || t.includes("intelligence")) {
                  return "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80&auto=format&fit=crop";
                }
                return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80&auto=format&fit=crop";
              };

              return (
                <div key={course.id} className="premium-card" style={{ height: "100%", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
                  <div style={{ height: "180px", overflow: "hidden", position: "relative" }}>
                    <img
                      src={getCourseThumbnail(course.title)}
                      alt={course.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border-color)",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      textTransform: "capitalize",
                      boxShadow: "var(--shadow-sm)"
                    }}>
                      {course.level}
                    </div>
                  </div>

                  <div style={{ padding: "1.75rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", color: "var(--accent-blue)", marginBottom: "0.5rem" }}>
                      Practitioner Track
                    </span>

                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-primary)", lineHeight: 1.3 }}>
                      {course.title}
                    </h3>

                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "1.5rem", flex: "1" }}>
                      {course.short_description}
                    </p>

                    <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "1rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Clock size={14} />
                          {course.duration_hours} hours
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <BookOpen size={14} />
                          Practice Labs
                        </span>
                      </div>
                      <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                        ৳{course.price} BDT
                      </span>
                    </div>

                    <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
                      <Link href={`/checkout?course=${course.id}`} className="btn btn-accent" style={{ fontSize: "0.85rem", padding: "0.6rem" }}>
                        Buy Course Track
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
