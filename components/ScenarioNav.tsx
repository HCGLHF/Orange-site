"use client";

import { useMemo } from "react";
import { Circle, Sparkles } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/utils";
import {
  detectScenario,
  SCENARIO_COLOR_MAP,
  SCENARIO_ICON_MAP,
} from "@/lib/fabric-scenarios";

export type ScenarioNavProps = {
  scenarios: string[];
  activeScenario: string | null;
  onScenarioChange: (scenario: string | null) => void;
  fabricCountByScenario: Record<string, number>;
  totalFabricCount: number;
};

export function ScenarioNav({
  scenarios,
  activeScenario,
  onScenarioChange,
  fabricCountByScenario,
  totalFabricCount,
}: ScenarioNavProps) {
  const { t } = useLocale();

  const sortedScenarios = useMemo(
    () =>
      [...scenarios].sort(
        (a, b) =>
          (fabricCountByScenario[b] ?? 0) - (fabricCountByScenario[a] ?? 0)
      ),
    [scenarios, fabricCountByScenario]
  );

  return (
    <div className="sticky top-0 z-40 border-b border-gray-200 bg-white py-4 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto pb-2">
          <span className="mr-2 flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-semibold text-gray-700">
            <Sparkles className="h-4 w-4 text-brand-orange" aria-hidden />
            {t("scenarioNavLabel")}
          </span>

          <button
            type="button"
            onClick={() => onScenarioChange(null)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all",
              activeScenario === null
                ? "bg-brand-charcoal text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {t("scenarioNavAll")}
            <span className="ml-1 text-xs opacity-80">
              ({totalFabricCount})
            </span>
          </button>

          {sortedScenarios.map((scenarioName) => {
            const count = fabricCountByScenario[scenarioName] ?? 0;
            if (count === 0) return null;

            const { icon: iconKey, color } = detectScenario(scenarioName);
            const colorConfig = SCENARIO_COLOR_MAP[color] ?? SCENARIO_COLOR_MAP.slate;
            const IconComponent = SCENARIO_ICON_MAP[iconKey] ?? Circle;
            const isActive = activeScenario === scenarioName;

            return (
              <button
                key={scenarioName}
                type="button"
                onClick={() =>
                  onScenarioChange(isActive ? null : scenarioName)
                }
                className={cn(
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all",
                  isActive
                    ? `${colorConfig.active} scale-105 text-white`
                    : `${colorConfig.bg} ${colorConfig.text}`
                )}
              >
                <IconComponent className="h-4 w-4 shrink-0" aria-hidden />
                {scenarioName}
                <span className="ml-1 text-xs opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {activeScenario ? (
          <div className="animate-fade-in mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span>{t("scenarioNavFiltered")}</span>
            <span className="flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 font-medium text-brand-orange">
              {(() => {
                const { icon: iconKey } = detectScenario(activeScenario);
                const IconComponent = SCENARIO_ICON_MAP[iconKey] ?? Circle;
                return <IconComponent className="h-3 w-3 shrink-0" aria-hidden />;
              })()}
              {activeScenario}
            </span>
            <button
              type="button"
              onClick={() => onScenarioChange(null)}
              className="ml-1 text-xs text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline"
            >
              {t("scenarioNavClear")}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
