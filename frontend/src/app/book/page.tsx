"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Video, User, Mail, Phone, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";

interface SlotData {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

function getNextWeekdays(count: number): { label: string; value: string }[] {
  const days: { label: string; value: string }[] = [];
  const now = new Date();
  let d = new Date(now);
  // Start from tomorrow
  d.setDate(d.getDate() + 1);

  while (days.length < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      days.push({ label, value: iso });
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

const SERVICE_TYPES = [
  "Security Consultation",
  "AI & LLM Development",
  "Penetration Testing",
  "Corporate Training",
  "Cloud Security Audit",
  "Other"
];

const FALLBACK_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM"
];

export default function BookPage() {
  const dates = getNextWeekdays(5);
  const [selectedDate, setSelectedDate] = useState(dates[0]?.value || "");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API slots state
  const [apiSlots, setApiSlots] = useState<SlotData[]>([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);

  // Fetch available time slots from the API
  useEffect(() => {
    fetch("/api/v1/bookings/slots")
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch slots");
      })
      .then((data: SlotData[]) => {
        setApiSlots(data);
        setSlotsLoaded(true);
      })
      .catch(() => {
        setSlotsLoaded(true); // Use fallback slots
      });
  }, []);

  // Determine which slots to show for the selected date
  const slotsForDate = apiSlots.filter(s => s.date === selectedDate && s.is_available);
  const useApiSlots = slotsLoaded && apiSlots.length > 0;

  const displaySlots = useApiSlots
    ? slotsForDate.map(s => ({
        label: formatTime(s.start_time) + " – " + formatTime(s.end_time),
        id: s.id,
      }))
    : FALLBACK_SLOTS.map(s => ({ label: s, id: null as string | null }));

  function formatTime(t: string): string {
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${suffix}`;
  }

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setError(null);

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name,
        email,
        phone: phone || null,
        service_type: serviceType,
        notes: notes || null,
      };

      // If we matched an API slot, include the time_slot_id
      if (selectedSlotId) {
        payload.time_slot_id = selectedSlotId;
      }

      const response = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || body.error?.message || "Unable to register consultation slot.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error scheduling appointment. Please try another slot.";
      setError(msg);
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
                <button className="btn btn-outline" onClick={() => { setSuccess(false); setError(null); }}>
                  Book another slot
                </button>
              </div>
            ) : (
              <form onSubmit={handleBook}>
                {/* Error Banner */}
                {error && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.75rem 1rem", marginBottom: "1.5rem",
                    background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "8px", color: "#ef4444", fontSize: "0.85rem", fontWeight: 500
                  }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {/* 1. Date Picker */}
                <h4 style={{ fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Calendar size={18} /> Select Date
                </h4>
                <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem", marginBottom: "2rem" }}>
                  {dates.map((date) => (
                    <button
                      key={date.value}
                      type="button"
                      onClick={() => { setSelectedDate(date.value); setSelectedSlot(null); setSelectedSlotId(null); }}
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.75rem", marginBottom: "2rem" }}>
                  {displaySlots.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", gridColumn: "1 / -1" }}>No available slots for this date.</p>
                  ) : displaySlots.map((slot) => (
                    <button
                      key={slot.label}
                      type="button"
                      onClick={() => { setSelectedSlot(slot.label); setSelectedSlotId(slot.id); }}
                      style={{
                        padding: "0.6rem 0.5rem",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: selectedSlot === slot.label ? "var(--accent-blue)" : "var(--border-color)",
                        background: selectedSlot === slot.label ? "rgba(14, 165, 233, 0.05)" : "white",
                        color: selectedSlot === slot.label ? "var(--accent-blue)" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontWeight: selectedSlot === slot.label ? 600 : 500,
                        fontSize: "0.85rem",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {slot.label}
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
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Service Type</label>
                      <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid var(--border-color)", marginTop: "0.25rem", outline: "none", background: "white", fontFamily: "inherit", fontSize: "0.9rem" }}>
                        {SERVICE_TYPES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
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
