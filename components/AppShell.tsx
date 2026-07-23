import type { ReactNode } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { SiteFooter } from "@/components/ui/SiteFooter";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="h-16 shrink-0" aria-hidden />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
