"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/ui/Navbar";

/** 顶栏 + 占位 + 主内容区（须在 InquiryCartProvider 内） */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {/* Navbar 桌面约 4rem；小屏含底部 CTA 更高 */}
      <div className="h-[7.5rem] shrink-0 sm:h-16" aria-hidden />
      <main>{children}</main>
    </>
  );
}
