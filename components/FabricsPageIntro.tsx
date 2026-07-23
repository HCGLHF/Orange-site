"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { resolveStockFilter } from "@/lib/fabric-filter-state";

function FabricsPageIntroContent({ h1 }: { h1: string }) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const stock = resolveStockFilter(searchParams.get("stock"));

  const copy =
    stock === "in-stock"
      ? {
          title: "Finished fabrics available for inquiry",
          subtitle:
            "Browse finished-fabric articles in the current sales catalogue. Confirm the exact colour, quantity, finish and commercial terms directly with the sourcing team.",
        }
      : stock === "preorder"
        ? {
            title: "Custom fabric and garment inquiry",
            subtitle:
              "Browse fabrics developed or produced against an order brief. Colour, quantity, specification and commercial terms require direct confirmation.",
          }
        : {
            title: t("fabricsLibraryTitle"),
            subtitle: t("fabricsLibrarySubtitle"),
          };

  return (
    <>
      <h1 className="text-3xl font-bold text-brand-charcoal">{h1}</h1>
      <p className="mt-2 max-w-3xl text-brand-charcoal/70">{copy.subtitle}</p>
    </>
  );
}

export function FabricsPageIntro({ h1 }: { h1: string }) {
  return (
    <Suspense fallback={<div className="h-16 animate-pulse bg-brand-soft/30" aria-hidden />}>
      <FabricsPageIntroContent h1={h1} />
    </Suspense>
  );
}
