"use client";

import { usePathname } from "next/navigation";

export default function ConditionalWrapper({
  navbar,
  footer,
  children,
}: {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    // Dashboard routes use their own layout (sidebar) — no public navbar/footer
    return <>{children}</>;
  }

  return (
    <>
      {navbar}
      <main style={{ minHeight: "calc(100vh - 4.5rem - 12rem)" }}>{children}</main>
      {footer}
    </>
  );
}
