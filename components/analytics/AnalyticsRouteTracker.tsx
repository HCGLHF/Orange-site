"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { pushPageView, sanitizePathname } from "@/lib/analytics/events";

export function AnalyticsRouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const pagePath = sanitizePathname(pathname);
    if (window.__orangeLastTrackedPath === pagePath) return;

    window.__orangeLastTrackedPath = pagePath;
    pushPageView(pagePath, window.location.href, document.referrer);
  }, [pathname]);

  return null;
}
