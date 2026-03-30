"use client";

import Link from "next/link";
import { useState } from "react";
import type { ComponentType } from "react";
import { Heart, Home, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const tabs: Tab[] = [
  { id: "home", label: "首页", href: "#home", icon: Home },
  { id: "explore", label: "探索", href: "#fabrics", icon: Search },
  { id: "favorite", label: "收藏", href: "#story", icon: Heart },
  { id: "profile", label: "我的", href: "#contact", icon: User },
];

export function BottomNav() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-white shadow-lg md:hidden">
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <li key={tab.id}>
              <Link
                href={tab.href}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center justify-center gap-1 py-2 text-xs text-brand-charcoal/70"
              >
                <span
                  className={cn(
                    "absolute inset-x-4 top-0 h-0.5 rounded-full bg-transparent transition-colors",
                    isActive && "bg-brand-orange"
                  )}
                />
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-brand-orange" : "text-brand-charcoal/70"
                  )}
                />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
