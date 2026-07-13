"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Search } from "lucide-react";

export default function AdminBookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const headers = { "Authorization": `Bearer ${token}` };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/v1/bookings", { headers });
      if (res.ok) {
        setBookings(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = bookings.filter(b =>
    b.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.client_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.company_name && b.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Calendar size={24} style={{ color: "var(--accent-blue)" }} /> Booking Manager
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>Monitor consultation slots and B2B corporate training meetings scheduled by visitors</p>
      </div>

      <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Upcoming Slots ({filtered.length})</h2>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text" placeholder="Search by name, email, or company..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "0.5rem 0.5rem 0.5rem 2.25rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.85rem", width: "280px" }}
            />
          </div>
        </div>

        {fetching ? (
          <p style={{ color: "var(--text-muted)", padding: "3rem 0", textAlign: "center" }}>Loading scheduled slots...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "3rem 0" }}>No bookings registered.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600 }}>
                  <th style={{ padding: "1rem" }}>Scheduled Time</th>
                  <th style={{ padding: "1rem" }}>Client Name</th>
                  <th style={{ padding: "1rem" }}>Email Address</th>
                  <th style={{ padding: "1rem" }}>Company/Org Name</th>
                  <th style={{ padding: "1rem" }}>Scope/Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "1rem", fontWeight: 600 }}>
                      {new Date(booking.scheduled_time).toLocaleString()}
                    </td>
                    <td style={{ padding: "1rem" }}>{booking.client_name}</td>
                    <td style={{ padding: "1rem", fontFamily: "monospace" }}>{booking.client_email}</td>
                    <td style={{ padding: "1rem" }}>{booking.company_name || "Self-employed"}</td>
                    <td style={{ padding: "1rem", whiteSpace: "pre-wrap" }}>{booking.notes || "No extra context."}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
