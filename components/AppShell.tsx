"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/ui/Navbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="h-[7.5rem] shrink-0 sm:h-16" aria-hidden />
      <main>{children}</main>
    </>
  );
}
