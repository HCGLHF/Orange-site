"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Fabric } from "@/lib/data";
import { useLocale } from "@/components/LocaleProvider";
import { FabricCard } from "@/components/ui/FabricCard";
import { FabricFilter } from "@/components/FabricFilter";
import { ScenarioNav } from "@/components/ScenarioNav";

export function FabricsCatalog({ fabrics }: { fabrics: Fabric[] }) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const filterUrlKey = searchParams.toString();
  const [visible, setVisible] = useState<Fabric[]>(fabrics);
  /** 递增以强制重挂 FabricFilter，等价于重置全部筛选（无需整页 reload） */
  const [filterKey, setFilterKey] = useState(0);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const allScenarios = useMemo(() => {
    const scenarioSet = new Set<string>();
    fabrics.forEach((fabric) => {
      fabric.scenarios?.forEach((s) => {
        const t = s.trim();
        if (t) scenarioSet.add(t);
      });
    });
    return Array.from(scenarioSet);
  }, [fabrics]);

  const fabricCountByScenario = useMemo(() => {
    const counts: Record<string, number> = {};
    fabrics.forEach((fabric) => {
      fabric.scenarios?.forEach((s) => {
        const key = s.trim();
        if (!key) return;
        counts[key] = (counts[key] ?? 0) + 1;
      });
    });
    return counts;
  }, [fabrics]);

  const fabricsForFilters = useMemo(() => {
    return fabrics.filter((f) => {
      if (!activeScenario) return true;
      // scenarios 可能为 undefined，勿直接 .includes
      return (
        f.scenarios?.some((s) => s.trim() === activeScenario) ?? false
      );
    });
  }, [fabrics, activeScenario]);

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
            totalFabricCount={fabrics.length}
          />
        </div>
      ) : null}
      <FabricFilter
        key={`${filterKey}-${filterUrlKey}`}
        fabrics={fabricsForFilters}
        onFilterChange={onFilterChange}
      />
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
