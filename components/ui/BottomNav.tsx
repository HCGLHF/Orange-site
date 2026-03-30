"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Home, Layers3, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/LocaleProvider";
import { useInquiry } from "@/components/InquiryProvider";

type TabId = "home" | "fabrics" | "inquiry" | "contact";

type Tab = {
  id: TabId;
  href?: string;
  icon: ComponentType<{ className?: string }>;
  action?: "inquiry";
};

const tabDefs: Tab[] = [
  { id: "home", href: "#home", icon: Home },
  { id: "fabrics", href: "#fabrics", icon: Layers3 },
  { id: "inquiry", icon: MessageCircle, action: "inquiry" },
  { id: "contact", href: "#contact", icon: Phone },
];

function hashToTab(hash: string): TabId | null {
  if (hash === "#home" || hash === "" || hash === "#") return "home";
  if (hash === "#fabrics") return "fabrics";
  if (hash === "#contact") return "contact";
  return null;
}

export function BottomNav() {
  const { openInquiry } = useInquiry();
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<TabId>("home");

  const labels = useMemo(
    () => ({
      home: t("navHome"),
      fabrics: t("navFabrics"),
      inquiry: t("navInquiry"),
      contact: t("navContact"),
    }),
    [t]
  );

  useEffect(() => {
    const syncFromHash = () => {
      const tab = hashToTab(window.location.hash);
      if (tab) setActiveTab(tab);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)] shadow-lg md:hidden"
      aria-label={t("navAria")}
    >
      <ul className="grid grid-cols-4">
        {tabDefs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const label = labels[tab.id];

          if (tab.action === "inquiry") {
            return (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("inquiry");
                    openInquiry();
                  }}
                  className="flex w-full flex-col items-center justify-center gap-1 py-3 text-xs text-brand-charcoal/70"
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-brand-orange" : "text-brand-charcoal/70"
                    )}
                    aria-hidden
                  />
                  <span>{label}</span>
                </button>
              </li>
            );
          }

          return (
            <li key={tab.id}>
              <Link
                href={tab.href!}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center gap-1 py-3 text-xs text-brand-charcoal/70"
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-brand-orange" : "text-brand-charcoal/70"
                  )}
                  aria-hidden
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
