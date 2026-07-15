"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { HelpCircle, Search } from "lucide-react";

export default function AdminTicketsPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketReplyBody, setTicketReplyBody] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/v1/tickets", { headers });
      if (res.ok) {
        setTickets(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSelectTicket = (ticket: any) => {
    setSelectedTicket(ticket);
  };

  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyBody.trim()) return;
    try {
      const res = await fetch(`/api/v1/tickets/${selectedTicket.id}/replies`, {
        method: "POST",
        headers,
        body: JSON.stringify({ body: ticketReplyBody })
      });
      if (res.ok) {
        showMessage("Reply posted successfully!");
        setTicketReplyBody("");
        // Reload all tickets, and update selected ticket view
        const ticketsRes = await fetch("/api/v1/tickets", { headers });
        if (ticketsRes.ok) {
          const freshTickets = await ticketsRes.json();
          setTickets(freshTickets);
          const updated = freshTickets.find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      } else {
        showMessage("Failed to post reply.", "error");
      }
    } catch {
      showMessage("Error posting reply.", "error");
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string, priority: string) => {
    try {
      const res = await fetch(`/api/v1/tickets/${ticketId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status, priority })
      });
      if (res.ok) {
        showMessage("Ticket status updated.");
        // Reload tickets
        const ticketsRes = await fetch("/api/v1/tickets", { headers });
        if (ticketsRes.ok) {
          const freshTickets = await ticketsRes.json();
          setTickets(freshTickets);
          const updated = freshTickets.find((t: any) => t.id === ticketId);
          if (updated) setSelectedTicket(updated);
        }
      } else {
        showMessage("Failed to update status.", "error");
      }
    } catch {
      showMessage("Error updating ticket.", "error");
    }
  };

  const filtered = tickets.filter(t =>
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <HelpCircle size={24} style={{ color: "var(--accent-blue)" }} /> Support Desk
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>Interact with students and clients seeking help, and manage ticket overrides</p>
      </div>

      {message && (
        <div style={{
          background: message.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
          color: message.type === "success" ? "var(--accent-emerald)" : "#ef4444",
          padding: "0.85rem 1rem", borderRadius: "8px",
          border: `1px solid ${message.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
          marginBottom: "1.5rem", fontWeight: 600, fontSize: "0.9rem"
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "2.5rem" }} className="responsive-grid-split">
        {/* Ticket List */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Active Tickets ({filtered.length})</h2>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text" placeholder="Search tickets..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "0.5rem 0.5rem 0.5rem 2.25rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.85rem", width: "200px" }}
              />
            </div>
          </div>

          {fetching ? (
            <p style={{ color: "var(--text-muted)", padding: "3rem 0", textAlign: "center" }}>Loading tickets...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "3rem 0" }}>No tickets found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filtered.map((t) => (
                <div 
                  key={t.id} 
                  onClick={() => handleSelectTicket(t)}
                  style={{ 
                    background: "white", 
                    border: selectedTicket?.id === t.id ? "2px solid var(--accent-blue)" : "1px solid var(--border-color)", 
                    borderRadius: "12px", 
                    padding: "1.25rem", 
                    cursor: "pointer" 
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.7rem", background: t.status === "open" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", color: t.status === "open" ? "#ef4444" : "var(--accent-emerald)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                      {t.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Priority: {t.priority}
                    </span>
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: "1rem", marginTop: "0.4rem" }}>{t.subject}</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.2rem" }}>Updated: {new Date(t.updated_at || t.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Ticket */}
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1.25rem" }}>Ticket Console</h2>
          {!selectedTicket ? (
            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "4rem 2rem", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Select a support ticket from the list to view conversations and post updates.</p>
            </div>
          ) : (
            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "1.1rem" }}>{selectedTicket.subject}</h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>Ticket ID: {selectedTicket.id}</p>
                </div>
                <div>
                  <select 
                    value={selectedTicket.status} 
                    onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value, selectedTicket.priority)}
                    style={{ padding: "0.3rem", border: "1px solid var(--border-color)", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600, background: "white" }}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Conversation thread */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "300px", overflowY: "auto", marginBottom: "1.25rem", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem" }}>
                {selectedTicket.replies.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>No replies in this thread yet.</p>
                ) : (
                  selectedTicket.replies.map((reply: any) => (
                    <div key={reply.id} style={{ alignSelf: reply.is_staff_reply ? "flex-end" : "flex-start", background: reply.is_staff_reply ? "rgba(14, 165, 233, 0.08)" : "var(--bg-secondary)", padding: "0.65rem 0.85rem", borderRadius: "8px", maxWidth: "80%" }}>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                        {reply.is_staff_reply ? "Staff Agent Override" : "User Client"} &bull; {new Date(reply.created_at).toLocaleTimeString()}
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{reply.body}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleReplyTicket}>
                <textarea 
                  required
                  placeholder="Type response message..."
                  rows={3}
                  value={ticketReplyBody}
                  onChange={(e) => setTicketReplyBody(e.target.value)}
                  style={{ width: "100%", padding: "0.55rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontFamily: "inherit", fontSize: "0.9rem" }}
                />
                <button type="submit" className="btn btn-accent" style={{ width: "100%", marginTop: "0.75rem" }}>
                  Send Response
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
