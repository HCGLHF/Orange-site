"use client";

import Link from "next/link";
import { Home, Layers3, BookOpenText, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "#home", label: "首页", icon: Home },
  { href: "#fabrics", label: "面料", icon: Layers3 },
  { href: "#story", label: "品牌", icon: BookOpenText },
  { href: "#contact", label: "联系", icon: Phone },
];

export function Navbar() {
  return (
    <>
      <nav className="fixed inset-x-4 bottom-4 z-50 rounded-full border border-brand-soft bg-white/95 p-2 shadow-md backdrop-blur md:hidden">
        <ul className="grid grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className="flex flex-col items-center justify-center rounded-full py-2 text-[11px] text-brand-charcoal transition-colors hover:bg-brand-soft"
                >
                  <Icon className="mb-1 h-4 w-4" />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav className="fixed left-1/2 top-6 z-50 hidden -translate-x-1/2 rounded-full border border-brand-soft bg-white/95 p-2 shadow-sm backdrop-blur md:block">
        <ul className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm text-brand-charcoal transition-colors hover:bg-brand-soft"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
