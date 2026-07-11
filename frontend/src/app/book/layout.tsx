import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule a Security or AI Consultation — Academy Bangladesh",
  description: "Book a 30-minute discovery call with a senior solutions consultant to discuss security pentests or custom LLM integrations.",
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
