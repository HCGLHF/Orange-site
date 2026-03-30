"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { Fabric } from "@/lib/data";

type FabricCardProps = {
  fabric: Fabric;
};

export function FabricCard({ fabric }: FabricCardProps) {
  const [showSceneImage, setShowSceneImage] = useState(false);

  const activeImage = useMemo(
    () => (showSceneImage ? fabric.sceneImage : fabric.textureImage),
    [fabric.sceneImage, fabric.textureImage, showSceneImage]
  );

  return (
    <article className="group flex h-[420px] min-w-[280px] flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="relative h-[70%] w-full overflow-hidden">
        <Image
          src={activeImage}
          alt={fabric.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 280px, 320px"
          unoptimized
        />
      </div>

      <div className="flex h-[30%] flex-col justify-between p-4">
        <div>
          <h3 className="text-base font-semibold text-brand-charcoal">{fabric.name}</h3>
          <p className="text-xs text-brand-charcoal/70">{fabric.composition}</p>
        </div>

        <p className="text-xs text-brand-charcoal/80">{fabric.description}</p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-brand-charcoal/70">
            <span>{fabric.weight}gsm</span>
            <span>{fabric.width}cm</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSceneImage((prev) => !prev)}
            className="rounded-full border border-brand-orange px-3 py-1 text-xs text-brand-orange transition-colors hover:bg-brand-soft"
          >
            {showSceneImage ? "查看面料纹理" : "查看成衣效果"}
          </button>
        </div>
      </div>
    </article>
  );
}
