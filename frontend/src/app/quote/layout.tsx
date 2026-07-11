import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Custom Quote — Academy Bangladesh",
  description: "Request a proposal for active directory pentesting, ISO 27001 vulnerability assessments, or custom software development in Bangladesh.",
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
