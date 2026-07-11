"use client";

import { useState } from "react";
import { Calendar, Clock, Video, User, Mail, Phone, ChevronRight, CheckCircle2 } from "lucide-react";

export default function BookPage() {
  const [selectedDate, setSelectedDate] = useState("2026-07-13");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const dates = [
    { label: "Mon, Jul 13", value: "2026-07-13" },
    { label: "Tue, Jul 14", value: "2026-07-14" },
    { label: "Wed, Jul 15", value: "2026-07-15" },
    { label: "Thu, Jul 16", value: "2026-07-16" },
    { label: "Fri, Jul 17", value: "2026-07-17" }
  ];

  const slots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM"
  ];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setLoading(true);
    // Simulate API booking call against backend router
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "4rem 0" }}>
      <div className="container" style={{ maxWidth: "55rem" }}>
        
        <div style={{ display: "flex", flexWrap: "wrap", background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
          
          {/* Left panel: Info */}
          <div style={{ flex: "1 1 300px", background: "var(--bg-secondary)", padding: "2.5rem", borderRight: "1px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 700, color: "var(--accent-blue)", letterSpacing: "0.05em" }}>Discovery</span>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.5rem 0 1rem 0" }}>Security & AI Consultation</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.5 }}>
              Meet with a senior solution engineer to discuss custom LLM application design, secure code integration, or corporate ethical hacking courses.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                <Clock size={16} style={{ color: "var(--accent-blue)" }} />
                <span>30 Minutes</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                <Video size={16} style={{ color: "var(--accent-blue)" }} />
                <span>Secure Google Meet link provided</span>
              </div>
            </div>
          </div>

          {/* Right panel: Calendar Scheduler */}
          <div style={{ flex: "1 1 400px", padding: "2.5rem" }}>
            
            {success ? (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <CheckCircle2 size={64} style={{ color: "var(--accent-emerald)", margin: "0 auto 1.5rem auto" }} />
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Consultation Scheduled!</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
                  A calendar invite and Google Meet link have been sent to <strong>{email}</strong>.
                </p>
                <button className="btn btn-outline" onClick={() => setSuccess(false)}>
                  Book another slot
                </button>
              </div>
            ) : (
              <form onSubmit={handleBook}>
                {/* 1. Date Picker */}
                <h4 style={{ fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Calendar size={18} /> Select Date
                </h4>
                <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem", marginBottom: "2rem" }}>
                  {dates.map((date) => (
                    <button
                      key={date.value}
                      type="button"
                      onClick={() => { setSelectedDate(date.value); setSelectedSlot(null); }}
                      style={{
                        padding: "0.6rem 0.8rem",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: selectedDate === date.value ? "var(--text-primary)" : "var(--border-color)",
                        background: selectedDate === date.value ? "var(--text-primary)" : "white",
                        color: selectedDate === date.value ? "white" : "var(--text-secondary)",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        fontWeight: selectedDate === date.value ? 600 : 500,
                        fontSize: "0.85rem",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>

                {/* 2. Slot Picker */}
                <h4 style={{ fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Clock size={18} /> Select Time
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.75rem", marginBottom: "2rem" }}>
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: "0.6rem 0.5rem",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: selectedSlot === slot ? "var(--accent-blue)" : "var(--border-color)",
                        background: selectedSlot === slot ? "rgba(14, 165, 233, 0.05)" : "white",
                        color: selectedSlot === slot ? "var(--accent-blue)" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: selectedSlot === slot ? 600 : 500,
                        fontSize: "0.85rem",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                {/* 3. Form */}
                {selectedSlot && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
                    <h4 style={{ fontWeight: 600 }}>Your Details</h4>
                    
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Name</label>
                        <input required type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "0.25rem", outline: "none" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Phone (Optional)</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "0.25rem", outline: "none" }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Email Address</label>
                      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "0.25rem", outline: "none" }} />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Consultation Details</label>
                      <textarea placeholder="Briefly describe your project or training needs..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "0.25rem", outline: "none", resize: "none", fontFamily: "inherit" }} />
                    </div>

                    <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                      {loading ? "Scheduling..." : "Schedule Call"}
                    </button>
                  </div>
                )}

              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
