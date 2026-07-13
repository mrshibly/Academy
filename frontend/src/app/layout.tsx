import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Shield } from "lucide-react";
import { AuthProvider } from "@/context/AuthContext";
import ConditionalWrapper from "./ConditionalWrapper";
import Navbar from "./Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Academy — AI Dev & Cybersecurity Platform",
  description: "Enterprise AI Development, Defensive & Offensive Cybersecurity Services, and Professional Practitioner Academy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          <ConditionalWrapper
            navbar={<Navbar />}
            footer={
              <footer style={{ backgroundColor: "#0f172a", color: "#f8fafc", padding: "4rem 0 2rem 0" }}>
                <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "3rem" }}>
                  <div>
                    <div className="logo" style={{ color: "#ffffff", marginBottom: "1rem" }}>
                      <Shield style={{ color: "var(--accent-blue)" }} size={24} />
                      <span>Academy.</span>
                    </div>
                    <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                      Leading security and artificial intelligence service provider & practitioner development training institute.
                    </p>
                  </div>
                  <div>
                    <h4 style={{ color: "#ffffff", fontSize: "1.05rem", fontWeight: 600, marginBottom: "1.25rem" }}>Services</h4>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", color: "#cbd5e1" }}>
                      <li><Link href="/services/ai-dev">AI Agent Architectures</Link></li>
                      <li><Link href="/services/pentesting">Offensive Penetration Testing</Link></li>
                      <li><Link href="/services/cloud-sec">Cloud Security</Link></li>
                      <li><Link href="/services/app-pentest">Web & Mobile Pentesting</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ color: "#ffffff", fontSize: "1.05rem", fontWeight: 600, marginBottom: "1.25rem" }}>Academy</h4>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", color: "#cbd5e1" }}>
                      <li><Link href="/academy">Cybersecurity Track</Link></li>
                      <li><Link href="/academy">AI & LLM Training</Link></li>
                      <li><Link href="/academy">Live bootcamps</Link></li>
                      <li><Link href="/academy">Certifications</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ color: "#ffffff", fontSize: "1.05rem", fontWeight: 600, marginBottom: "1.25rem" }}>Contact</h4>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", color: "#cbd5e1" }}>
                      <li>Email: info@academy.dev</li>
                      <li>Phone: +1 (555) 019-2831</li>
                      <li>Address: Silicon Valley, CA</li>
                    </ul>
                  </div>
                </div>
                <div className="container" style={{ borderTop: "1px solid #1e293b", marginTop: "3rem", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#94a3b8" }}>
                  <span>&copy; {new Date().getFullYear()} Academy Platform. All rights reserved.</span>
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    <Link href="/privacy">Privacy Policy</Link>
                    <Link href="/terms">Terms of Service</Link>
                  </div>
                </div>
              </footer>
            }
          >
            {children}
          </ConditionalWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
