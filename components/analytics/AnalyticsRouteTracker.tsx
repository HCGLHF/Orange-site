"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { pushPageView } from "@/lib/analytics/events";

export function AnalyticsRouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.__orangeLastTrackedPath === pathname) return;

    window.__orangeLastTrackedPath = pathname;
    pushPageView(pathname, window.location.href, document.referrer);
  }, [pathname]);

  return null;
}
