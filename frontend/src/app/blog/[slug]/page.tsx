"use client";

import { useEffect, useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, ArrowLeft, Loader, ShieldAlert } from "lucide-react";

export default function BlogPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/v1/blog/${slug}`);
        if (!response.ok) {
          throw new Error("Article not found.");
        }
        setPost(await response.json());
      } catch (err: any) {
        setError(err.message || "Failed to load article.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "8rem 0" }}>
        <Loader className="animate-spin text-accent" style={{ color: "var(--accent-blue)" }} size={32} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ padding: "6rem 0", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: "32rem" }}>
          <ShieldAlert size={48} style={{ color: "#ef4444", margin: "0 auto 1.5rem auto" }} />
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>Article Not Found</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            The requested publication does not exist or has been archived.
          </p>
          <button className="btn btn-primary" onClick={() => router.push("/blog")}>
            <ArrowLeft size={16} />
            <span>Back to Intelligence Blog</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "4rem 0 6rem 0" }}>
      <div className="container" style={{ maxWidth: "46rem" }}>
        
        {/* Back Link */}
        <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.95rem", fontWeight: 600, marginBottom: "3rem" }}>
          <ArrowLeft size={16} />
          <span>Back to Articles</span>
        </Link>

        {/* Article Header */}
        <header style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Calendar size={14} />
              {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span>&bull;</span>
            <span style={{ textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", color: "var(--accent-violet)" }}>
              Analysis
            </span>
          </div>

          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: "1.5rem" }}>
            {post.title}
          </h1>

          {post.excerpt && (
            <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", lineHeight: 1.5, borderLeft: "4px solid var(--accent-blue)", paddingLeft: "1rem", fontStyle: "italic" }}>
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Content Body */}
        <div style={{
          background: "white",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "3rem",
          boxShadow: "var(--shadow-sm)",
          lineHeight: 1.8,
          fontSize: "1.05rem",
          color: "var(--text-primary)"
        }}>
          {/* Output content paragraphs */}
          {post.content ? (
            post.content.split("\n\n").map((para: string, idx: number) => (
              <p key={idx} style={{ marginBottom: "1.5rem" }}>
                {para}
              </p>
            ))
          ) : (
            <p style={{ color: "var(--text-muted)" }}>Empty article content.</p>
          )}
        </div>

      </div>
    </div>
  );
}
