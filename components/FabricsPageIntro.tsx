"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { resolveStockFilter } from "@/lib/fabric-filter-state";

function FabricsPageIntroContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const stock = resolveStockFilter(searchParams.get("stock"));

  const copy =
    stock === "in-stock"
      ? {
          title: "In-stock knit fabrics",
          subtitle:
            "Browse fabrics currently listed as in stock. Confirm colour, quantity, finish and dispatch timing in the current quotation.",
        }
      : stock === "preorder"
        ? {
            title: "Preorder and made-to-order knit fabrics",
            subtitle:
              "Browse fabrics developed or produced against an order brief. Sampling, colour, quantity, specification and timing require confirmation.",
          }
        : {
            title: t("fabricsLibraryTitle"),
            subtitle: t("fabricsLibrarySubtitle"),
          };

  return (
    <>
      <h1 className="text-3xl font-bold text-brand-charcoal">{copy.title}</h1>
      <p className="mt-2 max-w-3xl text-brand-charcoal/70">{copy.subtitle}</p>
    </>
  );
}

export function FabricsPageIntro() {
  return (
    <Suspense fallback={<div className="h-16 animate-pulse bg-brand-soft/30" aria-hidden />}>
      <FabricsPageIntroContent />
    </Suspense>
  );
}
