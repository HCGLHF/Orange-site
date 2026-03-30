"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Fabric } from "@/lib/data";
import { useLocale } from "@/components/LocaleProvider";
import { getFabricCopy } from "@/lib/i18n";

type FabricCardProps = {
  fabric: Fabric;
};

export function FabricCard({ fabric }: FabricCardProps) {
  const { locale, t } = useLocale();
  const copy = useMemo(() => getFabricCopy(fabric, locale), [fabric, locale]);
  const [showScene, setShowScene] = useState(false);

  const activeSrc = useMemo(
    () => (showScene ? fabric.sceneImage : fabric.textureImage),
    [fabric.sceneImage, fabric.textureImage, showScene]
  );

  return (
    <article className="flex h-[420px] min-w-[280px] flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="relative flex h-[70%] w-full flex-col bg-gray-100 p-3">
        <div className="group/image relative min-h-0 flex-1 overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-100">
          <Image
            src={activeSrc}
            alt={showScene ? t("fabricAltScene") : t("fabricAltTexture")}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 280px, 320px"
            unoptimized
          />

          <span className="absolute right-2 top-2 z-30 rounded-full border border-gray-200 bg-white/95 px-2.5 py-1 text-xs font-medium text-brand-charcoal shadow-sm">
            {t("fabricShooting")}
          </span>

          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/0 px-4">
            <p className="max-w-[90%] rounded-md bg-white/75 px-3 py-2 text-center text-sm font-medium text-brand-charcoal shadow-sm backdrop-blur-[2px]">
              {t("fabricPlaceholderHint")}
            </p>
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-brand-charcoal/0 opacity-0 transition-all duration-300 group-hover/image:bg-brand-charcoal/55 group-hover/image:opacity-100"
            aria-hidden
          >
            <p className="px-4 text-center text-sm font-medium text-white">
              {t("fabricDetailsHover")}
            </p>
            <ul className="mt-3 max-w-[90%] space-y-1 text-center text-xs text-white/90">
              <li>{copy.composition}</li>
              <li>
                {fabric.weight}gsm · {fabric.width}cm
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-3 flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setShowScene((v) => !v)}
            className="flex-1 rounded-full border border-brand-orange px-3 py-2 text-xs font-medium text-brand-orange transition-colors hover:bg-brand-soft"
          >
            {showScene ? t("fabricToggleTexture") : t("fabricToggleScene")}
          </button>
        </div>

        <div className="mt-2 shrink-0">
          <button
            type="button"
            className="w-full rounded-full bg-brand-orange px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-soft hover:text-brand-charcoal"
          >
            {t("fabricSwatchCta")}
          </button>
        </div>
      </div>

      <div className="flex h-[30%] flex-col justify-between p-4">
        <div>
          <h3 className="text-base font-semibold text-brand-charcoal">{copy.name}</h3>
          <p className="text-xs text-brand-charcoal/70">{copy.composition}</p>
        </div>
        <p className="text-xs text-brand-charcoal/80">{copy.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {copy.tags.map((tag, i) => (
            <span
              key={`${fabric.id}-${i}`}
              className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] text-brand-charcoal/80"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
