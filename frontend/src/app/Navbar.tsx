"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Shield, PhoneCall, User, LogOut, Layout, Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click (VIS-5)
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.roles.includes("admin")) return "/dashboard/admin";
    if (user.roles.includes("instructor")) return "/dashboard/instructor";
    if (user.roles.includes("corporate_client")) return "/dashboard/client";
    return "/dashboard/student";
  };

  const getInitials = () => {
    if (!user || !user.full_name) return "U";
    return user.full_name
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="header">
      <div className="container nav" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "4.5rem", position: "relative" }}>
        
        {/* Brand Logo */}
        <Link href="/" className="logo" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, fontSize: "1.25rem", color: "var(--text-primary)" }}>
          <Shield className="text-accent" style={{ color: "var(--accent-blue)" }} size={28} />
          <span>Academy<span style={{ color: "var(--accent-blue)" }}>.</span></span>
        </Link>
        
        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links & Buttons */}
        <nav 
          style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}
          className={`nav-menu ${mobileMenuOpen ? "open" : ""}`}
        >
          <ul className="nav-links" style={{ display: "flex", gap: "2rem", listStyle: "none" }}>
            <li><Link href="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
            <li><Link href="/services" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Services</Link></li>
            <li><Link href="/academy" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Academy</Link></li>
            <li><Link href="/research" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Research</Link></li>
            <li><Link href="/careers" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Careers</Link></li>
            <li><Link href="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About</Link></li>
            <li><Link href="/blog" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Blog</Link></li>
          </ul>
          
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }} className="nav-actions">
            <Link href="/book" className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }} onClick={() => setMobileMenuOpen(false)}>
              <PhoneCall size={16} />
              <span>Consultation</span>
            </Link>

            {user ? (
              <div style={{ position: "relative" }} ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "50%",
                    background: "var(--accent-blue)",
                    color: "white",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(14, 165, 233, 0.15)"
                  }}
                >
                  {getInitials()}
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: "absolute",
                    right: 0,
                    top: "3rem",
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                    width: "200px",
                    padding: "0.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    zIndex: 100
                  }}>
                    <div style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--border-color)", marginBottom: "0.25rem" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.full_name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.email}
                      </div>
                    </div>
                    
                    <Link 
                      href={getDashboardLink()} 
                      onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        color: "var(--text-secondary)",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        textDecoration: "none"
                      }}
                      className="dropdown-item"
                    >
                      <Layout size={16} />
                      <span>Workspace</span>
                    </Link>

                    <button 
                      onClick={() => { logout(); setDropdownOpen(false); setMobileMenuOpen(false); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        color: "#ef4444",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        background: "none",
                        border: "none",
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer"
                      }}
                      className="dropdown-item"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }} onClick={() => setMobileMenuOpen(false)}>
                <User size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
