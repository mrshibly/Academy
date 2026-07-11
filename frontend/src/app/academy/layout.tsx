import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academy Course Catalog — Cybersecurity & AI training in Bangladesh",
  description: "Browse professional courses in ethical hacking, penetration testing, and secure AI application development at Academy Bangladesh.",
};

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
