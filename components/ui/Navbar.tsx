"use client";

import Link from "next/link";
import { Home, Layers3, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/LocaleProvider";
import { useInquiry } from "@/components/InquiryProvider";

export function Navbar() {
  const { openInquiry } = useInquiry();
  const { t } = useLocale();

  return (
    <nav
      className="fixed left-1/2 top-6 z-50 hidden -translate-x-1/2 rounded-full border border-brand-soft bg-white/95 p-2 shadow-sm backdrop-blur md:block"
      aria-label={t("navAria")}
    >
      <ul className="flex items-center gap-1">
        <li>
          <Link
            href="#home"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-brand-charcoal transition-colors hover:bg-brand-soft"
          >
            <Home className="h-4 w-4" aria-hidden />
            {t("navHome")}
          </Link>
        </li>
        <li>
          <Link
            href="#fabrics"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-brand-charcoal transition-colors hover:bg-brand-soft"
          >
            <Layers3 className="h-4 w-4" aria-hidden />
            {t("navFabrics")}
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={openInquiry}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm text-brand-charcoal transition-colors hover:bg-brand-soft"
            )}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {t("navInquiry")}
          </button>
        </li>
        <li>
          <Link
            href="#contact"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-brand-charcoal transition-colors hover:bg-brand-soft"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {t("navContact")}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
