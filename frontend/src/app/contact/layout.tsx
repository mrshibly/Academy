import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Academy Bangladesh",
  description: "Connect with our cybersecurity operations desk or custom AI developers in Dhaka. Send general inquiries or support tickets.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
