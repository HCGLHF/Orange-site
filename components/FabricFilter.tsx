"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Droplets, Scale } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { Fabric } from "@/lib/data";

type StockFilter = "all" | "in-stock" | "preorder" | "out-of-stock";
type CompositionFilter = "all" | "cotton" | "spandex" | "polyester";
type WeightFilter = "all" | "light" | "medium" | "heavy";

type ActiveFilters = {
  stock: StockFilter;
  composition: CompositionFilter;
  weight: WeightFilter;
};

export type FabricFilterProps = {
  fabrics: Fabric[];
  onFilterChange: (filtered: Fabric[]) => void;
};

function normalizeStock(raw: string | undefined): StockFilter {
  const lower = (raw?.trim() || "In stock").toLowerCase();
  if (lower === "in-stock" || lower === "in stock") return "in-stock";
  if (lower === "preorder" || lower === "pre-order" || lower === "made to order") {
    return "preorder";
  }
  if (lower === "out-of-stock" || lower === "out of stock" || lower === "sold out") {
    return "out-of-stock";
  }
  return "in-stock";
}

function stockQueryToFilter(raw: string | null): StockFilter | null {
  if (!raw) return null;
  const normalized = normalizeStock(raw);
  return normalized === "all" ? null : normalized;
}

function getWeightCategory(weight: number): WeightFilter {
  if (weight < 180) return "light";
  if (weight <= 250) return "medium";
  return "heavy";
}

function applyFilters(fabrics: Fabric[], active: ActiveFilters): Fabric[] {
  return fabrics.filter((fabric) => {
    if (active.stock !== "all" && normalizeStock(fabric.stockStatus) !== active.stock) {
      return false;
    }

    if (active.composition !== "all") {
      const c = fabric.composition.toLowerCase();
      if (active.composition === "cotton" && !c.includes("cotton")) return false;
      if (active.composition === "spandex" && !c.includes("spandex")) return false;
      if (active.composition === "polyester" && !c.includes("polyester")) return false;
    }

    if (active.weight !== "all") {
      const cat = getWeightCategory(fabric.weight);
      if (cat !== active.weight) return false;
    }

    return true;
  });
}

const INITIAL: ActiveFilters = {
  stock: "all",
  composition: "all",
  weight: "all",
};

function FabricFilterInner({ fabrics, onFilterChange }: FabricFilterProps) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(INITIAL);

  useEffect(() => {
    const s = stockQueryToFilter(searchParams.get("stock"));
    if (s) {
      setActiveFilters((prev) =>
        prev.stock === s ? prev : { ...prev, stock: s }
      );
    }
  }, [searchParams]);

  const filteredFabrics = useMemo(
    () => applyFilters(fabrics, activeFilters),
    [fabrics, activeFilters]
  );

  useEffect(() => {
    onFilterChange(filteredFabrics);
  }, [filteredFabrics, onFilterChange]);

  const updateFilter = <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const counts = useMemo(
    () => ({
      "in-stock": fabrics.filter((f) => normalizeStock(f.stockStatus) === "in-stock").length,
      preorder: fabrics.filter((f) => normalizeStock(f.stockStatus) === "preorder").length,
      "out-of-stock": fabrics.filter((f) => normalizeStock(f.stockStatus) === "out-of-stock").length,
    }),
    [fabrics]
  );

  const hasActive = Object.values(activeFilters).some((v) => v !== "all");

  const summaryExtra = useMemo(() => {
    const bits: string[] = [];
    if (activeFilters.stock !== "all") {
      if (activeFilters.stock === "in-stock") bits.push(t("filterInStock"));
      else if (activeFilters.stock === "preorder") bits.push(t("filterPreorder"));
      else bits.push(t("filterOutOfStock"));
    }
    if (activeFilters.composition !== "all") {
      if (activeFilters.composition === "cotton") bits.push(t("filterCotton"));
      else if (activeFilters.composition === "spandex") bits.push(t("filterSpandex"));
      else bits.push(t("filterPolyester"));
    }
    if (activeFilters.weight !== "all") {
      if (activeFilters.weight === "light") bits.push(t("filterLight"));
      else if (activeFilters.weight === "medium") bits.push(t("filterMedium"));
      else bits.push(t("filterHeavy"));
    }
    return bits.length ? ` | ${bits.join(" | ")}` : "";
  }, [activeFilters, t]);

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("filterTitle")}</h2>
      <div className="flex flex-wrap items-start gap-6">
        <div className="min-w-[200px] flex-1">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CheckCircle2 className="h-4 w-4 text-gray-500" aria-hidden />
            {t("filterStockStatus")}
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateFilter("stock", "all")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilters.stock === "all"
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t("filterAll")} ({fabrics.length})
            </button>
            <button
              type="button"
              onClick={() => updateFilter("stock", "in-stock")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilters.stock === "in-stock"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              {t("filterInStock")} ({counts["in-stock"]})
            </button>
            <button
              type="button"
              onClick={() => updateFilter("stock", "preorder")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilters.stock === "preorder"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              {t("filterPreorder")} ({counts.preorder})
            </button>
            <button
              type="button"
              onClick={() => updateFilter("stock", "out-of-stock")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilters.stock === "out-of-stock"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              {t("filterOutOfStock")} ({counts["out-of-stock"]})
            </button>
          </div>
        </div>

        <div className="min-w-[200px] flex-1">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Droplets className="h-4 w-4 text-gray-500" aria-hidden />
            {t("filterComposition")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {(["all", "cotton", "spandex", "polyester"] as CompositionFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => updateFilter("composition", filter)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeFilters.composition === filter
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                {filter === "all"
                  ? t("filterAll")
                  : filter === "cotton"
                    ? t("filterCotton")
                    : filter === "spandex"
                      ? t("filterSpandex")
                      : t("filterPolyester")}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-[200px] flex-1">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Scale className="h-4 w-4 text-gray-500" aria-hidden />
            {t("filterWeight")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {(["all", "light", "medium", "heavy"] as WeightFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => updateFilter("weight", filter)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeFilters.weight === filter
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                }`}
              >
                {filter === "all"
                  ? t("filterAll")
                  : filter === "light"
                    ? t("filterLight")
                    : filter === "medium"
                      ? t("filterMedium")
                      : t("filterHeavy")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          {t("filterShowing")}{" "}
          <span className="font-bold text-gray-900">{filteredFabrics.length}</span>{" "}
          {t("filterFabrics")}
          {summaryExtra}
        </p>

        {hasActive && (
          <button
            type="button"
            onClick={() => setActiveFilters(INITIAL)}
            className="text-sm text-gray-500 underline transition-colors hover:text-gray-900"
          >
            {t("filterClear")}
          </button>
        )}
      </div>
    </div>
  );
}

export function FabricFilter(props: FabricFilterProps) {
  return (
    <Suspense
      fallback={
        <div
          className="mb-8 h-48 animate-pulse rounded-2xl border border-gray-200 bg-gray-50"
          aria-hidden
        />
      }
    >
      <FabricFilterInner {...props} />
    </Suspense>
  );
}
