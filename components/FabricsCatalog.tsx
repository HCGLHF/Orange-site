"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Fabric } from "@/lib/data";
import { useLocale } from "@/components/LocaleProvider";
import { FabricCard } from "@/components/ui/FabricCard";
import { FabricFilter } from "@/components/FabricFilter";
import { ScenarioNav } from "@/components/ScenarioNav";
import type { StockFilter } from "@/lib/fabric-filter-state";

export function FabricsCatalog({
  fabrics,
  totalFabricCount = fabrics.length,
  defaultStock = "all",
}: {
  fabrics: Fabric[];
  totalFabricCount?: number;
  defaultStock?: StockFilter;
}) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const filterUrlKey = searchParams.toString();
  const [catalogueFabrics, setCatalogueFabrics] = useState<Fabric[]>(fabrics);
  const [visible, setVisible] = useState<Fabric[]>(fabrics);
  const [filterKey, setFilterKey] = useState(0);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  useEffect(() => {
    if (catalogueFabrics.length >= totalFabricCount) return;

    const controller = new AbortController();

    async function loadCompleteCatalogue() {
      try {
        const response = await fetch("/api/fabrics", {
          signal: controller.signal,
        });
        if (!response.ok) return;

        const completeCatalogue = (await response.json()) as Fabric[];
        if (completeCatalogue.length > catalogueFabrics.length) {
          setCatalogueFabrics(completeCatalogue);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    void loadCompleteCatalogue();

    return () => controller.abort();
  }, [catalogueFabrics.length, totalFabricCount]);

  const allScenarios = useMemo(() => {
    const scenarioSet = new Set<string>();
    catalogueFabrics.forEach((fabric) => {
      fabric.scenarios?.forEach((s) => {
        const scenario = s.trim();
        if (scenario) scenarioSet.add(scenario);
      });
    });
    return Array.from(scenarioSet);
  }, [catalogueFabrics]);

  const fabricCountByScenario = useMemo(() => {
    const counts: Record<string, number> = {};
    catalogueFabrics.forEach((fabric) => {
      fabric.scenarios?.forEach((s) => {
        const key = s.trim();
        if (!key) return;
        counts[key] = (counts[key] ?? 0) + 1;
      });
    });
    return counts;
  }, [catalogueFabrics]);

  const fabricsForFilters = useMemo(() => {
    return catalogueFabrics.filter((f) => {
      if (!activeScenario) return true;
      return (
        f.scenarios?.some((s) => s.trim() === activeScenario) ?? false
      );
    });
  }, [catalogueFabrics, activeScenario]);

  const handleScenarioChange = useCallback((scenario: string | null) => {
    setActiveScenario(scenario);
  }, []);

  const onFilterChange = useCallback((next: Fabric[]) => {
    setVisible(next);
  }, []);

  const resetFilters = useCallback(() => {
    setActiveScenario(null);
    setFilterKey((k) => k + 1);
  }, []);

  return (
    <>
      {allScenarios.length > 0 ? (
        <div className="mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
          <ScenarioNav
            scenarios={allScenarios}
            activeScenario={activeScenario}
            onScenarioChange={handleScenarioChange}
            fabricCountByScenario={fabricCountByScenario}
            totalFabricCount={catalogueFabrics.length}
          />
        </div>
      ) : null}
      <FabricFilter
        key={`${filterKey}-${filterUrlKey}`}
        fabrics={fabricsForFilters}
        onFilterChange={onFilterChange}
        defaultStock={defaultStock}
      />
      {catalogueFabrics.length < totalFabricCount ? (
        <p className="mb-5 text-sm text-brand-charcoal/60" role="status">
          Loading the complete {totalFabricCount}-article catalogue...
        </p>
      ) : null}
      {visible.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((fabric) => (
            <FabricCard key={fabric.id} fabric={fabric} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg text-brand-charcoal/70">{t("filterNoMatch")}</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 rounded-full bg-brand-orange px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {t("filterClear")}
          </button>
        </div>
      )}
    </>
  );
}
