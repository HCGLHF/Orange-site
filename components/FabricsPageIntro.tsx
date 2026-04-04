"use client";

import { useLocale } from "@/components/LocaleProvider";

export function FabricsPageIntro() {
  const { t } = useLocale();

  return (
    <>
      <h1 className="text-3xl font-bold text-brand-charcoal">{t("fabricsLibraryTitle")}</h1>
      <p className="mt-2 text-brand-charcoal/70">{t("fabricsLibrarySubtitle")}</p>
    </>
  );
}
