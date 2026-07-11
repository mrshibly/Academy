import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vulnerability Advisories & Research Publications — Academy Bangladesh",
  description: "Read security advisories, whitepapers, CVE writeups, and technical disclosures authored by our research department in Dhaka.",
};

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
