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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2.5rem" }}>
            {courses.map((course) => {
              return (
                <div key={course.id} className="card hover-lift" style={{ background: "white", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                    <div style={{
                      width: "2.75rem",
                      height: "2.75rem",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(14, 165, 233, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-blue)"
                    }}>
                      <Cpu size={22} />
                    </div>
                    <span style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-color)",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      textTransform: "capitalize"
                    }}>
                      {course.level}
                    </span>
                  </div>

                  <span style={{ fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                    Practitioner Track
                  </span>

                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
                    {course.title}
                  </h3>

                  <p style={{ color: "var(--text-secondary)", fontSize: "0.925rem", lineHeight: 1.5, marginBottom: "1.5rem", flex: "1" }}>
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
                    <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
                      ৳{course.price} BDT
                    </span>
                  </div>

                  <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
                    <Link href={`/checkout?course=${course.id}`} className="btn btn-accent" style={{ fontSize: "0.85rem", padding: "0.6rem" }}>
                      Buy Course Track
                    </Link>
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
