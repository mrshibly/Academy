"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Calendar, ArrowRight, Loader } from "lucide-react";

export default function BlogListingPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/v1/blog?page=1&page_size=20");
        if (response.ok) {
          const data = await response.json();
          setPosts(data.items || []);
        }
      } catch (err) {
        console.error("Error loading blog posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container" style={{ maxWidth: "56rem" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{
            display: "inline-block",
            background: "rgba(139, 92, 246, 0.08)",
            color: "var(--accent-violet)",
            padding: "0.35rem 1rem",
            borderRadius: "9999px",
            fontSize: "0.8rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "1rem"
          }}>
            Technical Articles
          </span>
          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Intelligence & Analysis</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem" }}>
            Disclosures, tutorials, and deep-dives authored by our consultants and core engineers.
          </p>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <Loader className="animate-spin text-accent" style={{ color: "var(--accent-blue)" }} size={32} />
          </div>
        ) : posts.length === 0 ? (
          <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "4rem 2rem", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>No blog publications released yet. Stay tuned!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {posts.map((post) => (
              <article key={post.id} style={{
                background: "white",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "2.5rem",
                boxShadow: "var(--shadow-sm)",
                transition: "var(--transition-all)"
              }} className="hover-lift">
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Calendar size={14} />
                    {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                  <span>&bull;</span>
                  <span style={{ textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", color: "var(--accent-violet)" }}>
                    AI & Cybersecurity
                  </span>
                </div>

                <h2 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
                  <Link href={`/blog/${post.slug}`} style={{ color: "inherit" }}>
                    {post.title}
                  </Link>
                </h2>

                <p style={{ color: "var(--text-secondary)", fontSize: "1.025rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                  {post.excerpt}
                </p>

                <Link href={`/blog/${post.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--accent-blue)", fontWeight: 600, fontSize: "0.95rem" }}>
                  <span>Read full analysis</span>
                  <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
