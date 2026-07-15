"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, Mail, Search } from "lucide-react";

export default function AdminContactsPage() {
  const { token } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [contactSearch, setContactSearch] = useState("");
  const [quoteSearch, setQuoteSearch] = useState("");

  const headers = { "Authorization": `Bearer ${token}` };

  const fetchContactsData = async () => {
    try {
      const contactsRes = await fetch("/api/v1/contacts", { headers });
      if (contactsRes.ok) setContacts(await contactsRes.json());

      const quotesRes = await fetch("/api/v1/contacts/quotes", { headers });
      if (quotesRes.ok) setQuotes(await quotesRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchContactsData();
  }, []);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.subject.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.message.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const filteredQuotes = quotes.filter(q =>
    q.name.toLowerCase().includes(quoteSearch.toLowerCase()) ||
    q.email.toLowerCase().includes(quoteSearch.toLowerCase()) ||
    q.service_type.toLowerCase().includes(quoteSearch.toLowerCase()) ||
    q.details.toLowerCase().includes(quoteSearch.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <MessageSquare size={24} style={{ color: "var(--accent-blue)" }} /> Operations Inbox
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>Review general contact queries and specialized B2B project quote requests</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" }} className="responsive-grid-split">
        {/* Contact submissions */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>General Submissions ({filteredContacts.length})</h2>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text" placeholder="Search inbox..."
                value={contactSearch} onChange={(e) => setContactSearch(e.target.value)}
                style={{ padding: "0.45rem 0.45rem 0.45rem 2.15rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.8rem", width: "180px" }}
              />
            </div>
          </div>

          {fetching ? (
            <p style={{ color: "var(--text-muted)", padding: "2rem 0", textAlign: "center" }}>Loading messages...</p>
          ) : filteredContacts.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem 0" }}>No messages received.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filteredContacts.map((c) => (
                <div key={c.id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{c.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{c.email}</span>
                  </div>
                  <h4 style={{ fontWeight: 600, fontSize: "0.95rem", marginTop: "0.4rem", color: "var(--accent-blue)" }}>{c.subject}</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.4rem", lineHeight: "1.4" }}>{c.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom B2B quote requests */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Quote Inquiries ({filteredQuotes.length})</h2>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text" placeholder="Search quotes..."
                value={quoteSearch} onChange={(e) => setQuoteSearch(e.target.value)}
                style={{ padding: "0.45rem 0.45rem 0.45rem 2.15rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.8rem", width: "180px" }}
              />
            </div>
          </div>

          {fetching ? (
            <p style={{ color: "var(--text-muted)", padding: "2rem 0", textAlign: "center" }}>Loading quotes...</p>
          ) : filteredQuotes.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem 0" }}>No quote requests found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filteredQuotes.map((q) => (
                <div key={q.id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{q.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{q.email}</span>
                  </div>
                  <div style={{ marginTop: "0.4rem" }}>
                    <span style={{ fontSize: "0.7rem", background: "rgba(139, 92, 246, 0.1)", color: "var(--accent-violet)", padding: "0.15rem 0.45rem", borderRadius: "4px", fontWeight: 600 }}>
                      Service: {q.service_type.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.5rem", lineHeight: "1.4" }}>
                    <strong>Scope Specs:</strong> {q.details}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
