"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Droplets, Scale } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { Fabric } from "@/lib/data";

type StockFilter = "all" | "现货" | "预定" | "缺货";
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

function normalizeStock(raw: string | undefined): string {
  const s = raw?.trim() || "现货";
  if (s === "预订") return "预定";
  return s;
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
      const c = fabric.composition;
      if (active.composition === "cotton" && !c.includes("棉")) return false;
      if (active.composition === "spandex" && !c.includes("氨纶")) return false;
      if (active.composition === "polyester" && !c.includes("涤")) return false;
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
    const s = searchParams.get("stock");
    if (s === "现货" || s === "预定" || s === "缺货") {
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
      现货: fabrics.filter((f) => normalizeStock(f.stockStatus) === "现货").length,
      预定: fabrics.filter((f) => normalizeStock(f.stockStatus) === "预定").length,
      缺货: fabrics.filter((f) => normalizeStock(f.stockStatus) === "缺货").length,
    }),
    [fabrics]
  );

  const hasActive = Object.values(activeFilters).some((v) => v !== "all");

  const summaryExtra = useMemo(() => {
    const bits: string[] = [];
    if (activeFilters.stock !== "all") {
      if (activeFilters.stock === "现货") bits.push(t("filterInStock"));
      else if (activeFilters.stock === "预定") bits.push(t("filterPreorder"));
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
    return bits.length ? ` · ${bits.join(" · ")}` : "";
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
              onClick={() => updateFilter("stock", "现货")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilters.stock === "现货"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              {t("filterInStock")} ({counts["现货"]})
            </button>
            <button
              type="button"
              onClick={() => updateFilter("stock", "预定")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilters.stock === "预定"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              {t("filterPreorder")} ({counts["预定"]})
            </button>
            <button
              type="button"
              onClick={() => updateFilter("stock", "缺货")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilters.stock === "缺货"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              {t("filterOutOfStock")} ({counts["缺货"]})
            </button>
          </div>
        </div>

        <div className="min-w-[200px] flex-1">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Droplets className="h-4 w-4 text-gray-500" aria-hidden />
            {t("filterComposition")}
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateFilter("composition", "all")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilters.composition === "all"
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t("filterAll")}
            </button>
            <button
              type="button"
              onClick={() => updateFilter("composition", "cotton")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilters.composition === "cotton"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {t("filterCotton")}
            </button>
            <button
              type="button"
              onClick={() => updateFilter("composition", "spandex")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilters.composition === "spandex"
                  ? "bg-purple-500 text-white shadow-md"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100"
              }`}
            >
              {t("filterSpandex")}
            </button>
            <button
              type="button"
              onClick={() => updateFilter("composition", "polyester")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilters.composition === "polyester"
                  ? "bg-indigo-500 text-white shadow-md"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              }`}
            >
              {t("filterPolyester")}
            </button>
          </div>
        </div>

        <div className="min-w-[200px] flex-1">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Scale className="h-4 w-4 text-gray-500" aria-hidden />
            {t("filterWeight")}
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateFilter("weight", "all")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilters.weight === "all"
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t("filterAll")}
            </button>
            <button
              type="button"
              onClick={() => updateFilter("weight", "light")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilters.weight === "light"
                  ? "bg-cyan-500 text-white shadow-md"
                  : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
              }`}
            >
              {t("filterLight")}
            </button>
            <button
              type="button"
              onClick={() => updateFilter("weight", "medium")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilters.weight === "medium"
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-orange-50 text-orange-700 hover:bg-orange-100"
              }`}
            >
              {t("filterMedium")}
            </button>
            <button
              type="button"
              onClick={() => updateFilter("weight", "heavy")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilters.weight === "heavy"
                  ? "bg-violet-500 text-white shadow-md"
                  : "bg-violet-50 text-violet-700 hover:bg-violet-100"
              }`}
            >
              {t("filterHeavy")}
            </button>
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
