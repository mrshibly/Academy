import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intelligence Blog — Cybersecurity Disclosures & AI insights",
  description: "Stay updated with research deep dives, vulnerability disclosures, secure software tutorials, and threat intel updates from Academy Bangladesh.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
