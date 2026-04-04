"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/components/LocaleProvider";

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className="fixed right-4 top-[4.75rem] z-[60] flex items-center gap-0 rounded-full border border-brand-soft bg-white/95 p-1 text-xs font-medium shadow-sm backdrop-blur md:right-6 md:top-[4.75rem]"
      role="group"
      aria-label={t("langToggleAria")}
    >
      <button
        type="button"
        onClick={() => setLocale("zh")}
        className={cn(
          "rounded-full px-3 py-1.5 transition-colors",
          locale === "zh"
            ? "bg-brand-orange text-white"
            : "text-brand-charcoal/70 hover:bg-brand-soft"
        )}
      >
        {t("langZh")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-full px-3 py-1.5 transition-colors",
          locale === "en"
            ? "bg-brand-orange text-white"
            : "text-brand-charcoal/70 hover:bg-brand-soft"
        )}
      >
        {t("langEn")}
      </button>
    </div>
  );
}
