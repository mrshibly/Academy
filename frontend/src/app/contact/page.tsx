"use client";

import { useState } from "react";
import { Send, CheckCircle2, Building, Mail, Phone, MapPin, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message })
      });

      if (!response.ok) {
        throw new Error("Unable to submit contact message. Please try again later.");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container" style={{ maxWidth: "56rem" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{
            display: "inline-block",
            background: "rgba(13, 148, 136, 0.08)",
            color: "var(--accent-teal)",
            padding: "0.35rem 1rem",
            borderRadius: "9999px",
            fontSize: "0.8rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "1rem"
          }}>
            Get In Touch
          </span>
          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Contact Our Office</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem" }}>
            Reach out to our solution engineers, security consultants, or support desk.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "4rem" }}>
          {/* Left Column — Form */}
          <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2.5rem", boxShadow: "var(--shadow-sm)" }}>
            {success ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <CheckCircle2 size={56} style={{ color: "var(--accent-emerald)", margin: "0 auto 1.5rem auto" }} />
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Message Transmitted</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
                  Thank you for reaching out. A representative from our security or AI operations team will contact you shortly.
                </p>
                <button className="btn btn-outline" onClick={() => setSuccess(false)}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {error && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "0.75rem", borderRadius: "6px", fontSize: "0.85rem" }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Full Name *</label>
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid var(--border-color)", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Email Address *</label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid var(--border-color)", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Subject *</label>
                  <input required type="text" value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid var(--border-color)", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Message Body *</label>
                  <textarea required value={message} rows={5} onChange={(e) => setMessage(e.target.value)} style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid var(--border-color)", outline: "none", fontFamily: "sans-serif" }} />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>
                  <Send size={16} />
                  <span>{loading ? "Transmitting..." : "Send Message"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column — Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", justifyContent: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Building size={20} style={{ color: "var(--accent-teal)" }} />
                Corporate HQ
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                Silicon Valley Office Plaza<br />
                Suite 400, Palo Alto, CA 94301<br />
                United States
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Mail size={20} style={{ color: "var(--accent-blue)" }} />
                Direct Channels
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                <li>General: <strong style={{ color: "var(--text-primary)" }}>info@academy.dev</strong></li>
                <li>Support Desk: <strong style={{ color: "var(--text-primary)" }}>support@academy.dev</strong></li>
                <li>Corporate L&D: <strong style={{ color: "var(--text-primary)" }}>training@academy.dev</strong></li>
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Phone size={20} style={{ color: "var(--accent-violet)" }} />
                Phone Support
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                +1 (555) 019-2831<br />
                Mon – Fri, 9:00 AM – 5:00 PM PST
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
