import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers & Open Positions — Academy Bangladesh",
  description: "Work with elite OSCP security researchers and Next.js developers in Dhaka. View current openings in offensive security and software engineering.",
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
