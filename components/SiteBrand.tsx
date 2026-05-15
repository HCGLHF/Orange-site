"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { OrangeMark } from "@/components/OrangeMark";

export function SiteBrand() {
  const { t } = useLocale();

  return (
    <Link
      href="/"
      title={t("heroTitle")}
      aria-label={`${t("heroTitle")} | ${t("navHome")}`}
      className="fixed left-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-soft bg-white/95 shadow-sm backdrop-blur transition-transform hover:scale-105 hover:bg-brand-soft active:scale-95 md:left-6 md:top-6 md:h-12 md:w-12"
    >
      <OrangeMark className="h-8 w-8 md:h-9 md:w-9" />
    </Link>
  );
}
