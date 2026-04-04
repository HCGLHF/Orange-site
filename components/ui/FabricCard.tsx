"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Download,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  XCircle,
} from "lucide-react";
import type { Fabric } from "@/lib/data";
import { useLocale } from "@/components/LocaleProvider";
import { getFabricCopy } from "@/lib/i18n";
import { useInquiryCart } from "@/components/InquiryCartProvider";
import { useInquiry } from "@/components/InquiryProvider";

type FabricCardProps = {
  fabric: Fabric;
};

/** 键名须与 Notion「状态」选项一致：「预定」不是「预订」。 */
const STOCK_CONFIG = {
  "现货": {
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    icon: CheckCircle2,
    labelZh: "现货速发",
    labelEn: "In-stock",
    etaZh: "24小时内发货",
    etaEn: "Ships in 24h",
    pulse: true,
  },
  "预定": {
    color: "bg-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    icon: Clock,
    labelZh: "预定生产",
    labelEn: "Made to order",
    etaZh: "7-15天交货",
    etaEn: "7-15 days lead time",
    pulse: false,
  },
  "缺货": {
    color: "bg-rose-500",
    bgColor: "bg-rose-50",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
    icon: XCircle,
    labelZh: "暂时缺货",
    labelEn: "Out of stock",
    etaZh: "可咨询补货时间",
    etaEn: "Ask for restock ETA",
    pulse: false,
  },
  "停产": {
    color: "bg-gray-500",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
    icon: AlertCircle,
    labelZh: "已停产",
    labelEn: "Discontinued",
    etaZh: "可咨询替代面料",
    etaEn: "Ask for alternatives",
    pulse: false,
  },
} as const;

function resolveStockKey(
  raw: string | undefined
): keyof typeof STOCK_CONFIG {
  const s = raw?.trim() ?? "现货";
  if (s === "预订") return "预定";
  if (s in STOCK_CONFIG) return s as keyof typeof STOCK_CONFIG;
  return "现货";
}

export function FabricCard({ fabric }: FabricCardProps) {
  const { locale, t } = useLocale();
  const { openInquiry } = useInquiry();
  const { isSelected, addItem, removeItem } = useInquiryCart();
  const copy = useMemo(() => getFabricCopy(fabric, locale), [fabric, locale]);
  const [isHovered, setIsHovered] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseMq = window.matchMedia("(pointer: coarse)");
    const sync = () => {
      setPrefersReducedMotion(reduceMq.matches);
      setCoarsePointer(coarseMq.matches);
    };
    sync();
    reduceMq.addEventListener("change", sync);
    coarseMq.addEventListener("change", sync);
    return () => {
      reduceMq.removeEventListener("change", sync);
      coarseMq.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    console.log("FabricCard 数据:", fabric);
  }, [fabric]);

  if (!fabric?.name?.trim()) {
    return (
      <article className="rounded-2xl border-2 border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        {t("fabricCardLoading")}
      </article>
    );
  }

  const stockKey = resolveStockKey(fabric.stockStatus);
  const config = STOCK_CONFIG[stockKey] ?? STOCK_CONFIG["现货"];
  const Icon = config.icon;
  const selected = isSelected(fabric.id);
  const coverFromImages = fabric.images?.[0]?.trim();
  const coverFromTexture = fabric.textureImage?.trim();
  const showRasterCover = Boolean(coverFromImages || coverFromTexture);
  const craftStoryText = fabric.craftStory?.trim() ?? "";
  const hasStory = craftStoryText.length > 10;
  const showFlip = hasStory && !prefersReducedMotion;

  const toggleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selected) {
      removeItem(fabric.id);
    } else {
      addItem(fabric);
    }
  };

  const handleDownloadPDF = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGenerating(true);
    try {
      const { generateFabricPDF } = await import("@/lib/fabric-pdf");
      await generateFabricPDF({
        id: fabric.id,
        name: copy.name,
        composition: copy.composition,
        weight: fabric.weight,
        width: fabric.width,
        description: copy.description || undefined,
        stockStatus: fabric.stockStatus?.trim() || "现货",
        images:
          fabric.images && fabric.images.length > 0
            ? fabric.images.filter((u) => u?.trim())
            : fabric.textureImage?.trim()
              ? [fabric.textureImage.trim()]
              : [],
      });
    } catch (error) {
      console.error("PDF 生成失败:", error);
      alert(t("fabricPdfError"));
    } finally {
      setIsGenerating(false);
    }
  };

  const openInquiryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openInquiry();
  };

  const imageHoverFlipHandlers =
    showFlip && !coarsePointer
      ? {
          onMouseEnter: () => setIsFlipped(true),
          onMouseLeave: () => setIsFlipped(false),
        }
      : {};

  const craftChip = showFlip ? (
    coarsePointer ? (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsFlipped(true);
        }}
        className="absolute bottom-3 left-3 z-[15] flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/70"
      >
        <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
        {t("fabricCraftStoryOpen")}
      </button>
    ) : (
      <div className="pointer-events-none absolute bottom-3 left-3 z-[15] flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
        <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
        {t("fabricCraftStoryHoverHint")}
      </div>
    )
  ) : null;

  const imageSection = (
    <div
      className="relative aspect-[4/3] shrink-0 overflow-hidden bg-gray-100"
      {...imageHoverFlipHandlers}
    >
      {showRasterCover ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- fabric.images?.[0] 优先，否则 textureImage */}
          <img
            src={coverFromImages || coverFromTexture}
            alt={copy.name || t("fabricAltTexture")}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </>
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 [font-family:system-ui,-apple-system,'PingFang_SC','Hiragino_Sans_GB','Microsoft_YaHei',sans-serif]"
          aria-hidden
        >
          <span className="mb-2 text-6xl font-bold text-orange-300">
            {fabric.name.trim().charAt(0) || "—"}
          </span>
          <span className="text-xs text-orange-400">
            {fabric.name.trim().length > 4
              ? `${fabric.name.trim().slice(0, 4)}...`
              : fabric.name.trim() || "—"}
          </span>
        </div>
      )}

      {craftChip}

      <button
        type="button"
        onClick={toggleCart}
        aria-label={t("fabricInquiryCartToggleAria")}
        aria-pressed={selected}
        className={`absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
          selected
            ? "scale-110 border-brand-orange bg-brand-orange text-white shadow-lg"
            : "border-gray-200 bg-white/90 text-gray-400 hover:bg-white hover:text-brand-orange"
        }`}
      >
        <Check
          className={`h-5 w-5 ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}
          aria-hidden
        />
      </button>

      <div
        className={`absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-sm ${config.color}`}
      >
        <Icon className="h-3.5 w-3.5 opacity-90" aria-hidden />
        <span>{locale === "en" ? config.labelEn : config.labelZh}</span>
        {config.pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${config.color} animate-ping`}
            style={{ zIndex: -1 }}
          />
        )}
      </div>

      {selected && (
        <div className="absolute inset-0 z-[5] flex items-center justify-center bg-brand-orange/10">
          <div className="flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white shadow-md">
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            {t("fabricInquiryCartOverlay")}
          </div>
        </div>
      )}

      <div
        className={`absolute inset-0 z-[4] flex items-center justify-center bg-black/40 transition-opacity duration-300 ${
          isHovered && !selected && !isFlipped ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="rounded-full bg-white px-6 py-2 text-sm font-medium text-gray-900">
          {locale === "en" ? "View Details" : "查看详情"}
        </span>
      </div>
    </div>
  );

  const bodySection = (
    <div className="flex min-h-0 flex-1 flex-col p-5">
      <h3 className="mb-1 truncate text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-orange">
        {copy.name}
      </h3>
      <p className="mb-3 truncate text-sm text-gray-600">{copy.composition}</p>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span
          className={`rounded-md px-2 py-1 font-medium ${config.bgColor} ${config.textColor}`}
        >
          {locale === "en" ? (
            <span>{fabric.weight || 0} g/m²</span>
          ) : (
            <span>{fabric.weight || 0}g/m²</span>
          )}
        </span>
        <span>
          {locale === "en" ? (
            <span>Width {fabric.width || 0} cm</span>
          ) : (
            <span>门幅 {fabric.width || 0}cm</span>
          )}
        </span>
        <span className="text-gray-400">·</span>
        <span>{locale === "en" ? "Knit" : "针织"}</span>
      </div>

      {fabric.scenarios && fabric.scenarios.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {fabric.scenarios.slice(0, 2).map((s, i) => (
            <span
              key={`${s}-${i}`}
              className="rounded bg-orange-50 px-2 py-0.5 text-xs text-orange-600"
            >
              {s}
            </span>
          ))}
          {fabric.scenarios.length > 2 && (
            <span className="px-1 text-xs text-gray-400">
              +{fabric.scenarios.length - 2}
            </span>
          )}
        </div>
      )}

      <p className={`mb-4 text-xs font-medium ${config.textColor}`}>
        {locale === "en" ? config.etaEn : config.etaZh}
      </p>

      {hasStory && prefersReducedMotion && (
        <details className="mb-4 rounded-xl border border-brand-soft bg-brand-cream/50 p-3 text-left">
          <summary className="cursor-pointer text-sm font-semibold text-brand-charcoal">
            {t("fabricCraftStorySummary")}
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-brand-charcoal/80">
            {craftStoryText}
          </p>
        </details>
      )}

      <div className="mt-auto flex gap-2">
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          title={t("fabricPdfTitle")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-brand-orange/40 hover:text-brand-orange disabled:opacity-50"
        >
          {!isGenerating && <Download className="h-4 w-4 shrink-0" aria-hidden />}
          {isGenerating ? t("fabricPdfGenerating") : t("fabricPdfCard")}
        </button>
        <button
          type="button"
          onClick={toggleCart}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${
            selected
              ? "border border-brand-orange/30 bg-brand-orange/10 text-brand-orange"
              : "bg-brand-orange text-white hover:opacity-90"
          }`}
        >
          <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />
          {selected ? t("fabricInquiryCartAdded") : t("fabricInquiryCartAdd")}
        </button>
      </div>

      <button
        type="button"
        onClick={openInquiryClick}
        className="mt-3 w-full text-center text-xs font-medium text-brand-orange underline-offset-2 hover:underline"
      >
        {t("fabricInquiryCta")}
      </button>
    </div>
  );

  const stockAccent =
    stockKey === "现货" ? (
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
    ) : null;

  const frontFace = (
    <div
      className={`absolute inset-0 flex h-full min-h-[480px] flex-col overflow-hidden rounded-2xl border-2 bg-white backface-hidden ${
        selected ? "border-brand-orange shadow-lg" : "border-gray-200"
      }`}
    >
      {imageSection}
      {bodySection}
      {stockAccent}
    </div>
  );

  const backFace = (
    <div
      className="absolute inset-0 flex h-full min-h-[480px] flex-col justify-between overflow-hidden rounded-2xl border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white backface-hidden rotate-y-180"
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 shrink-0 text-brand-orange" aria-hidden />
          <span className="text-sm font-medium text-brand-orange">
            {t("fabricCraftStoryTitle")}
          </span>
        </div>
        <h4 className="mb-3 text-xl font-bold">{copy.name}</h4>
        <p className="mb-4 text-sm leading-relaxed text-gray-300">{craftStoryText}</p>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 text-emerald-400" aria-hidden>
              ✓
            </span>
            <span className="text-gray-300">
              {locale === "en" ? config.etaEn : config.etaZh}
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 text-emerald-400" aria-hidden>
              ✓
            </span>
            <span className="text-gray-300">{t("fabricCraftBulletSample")}</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsFlipped(false);
        }}
        className="mt-4 flex w-full items-center justify-center gap-1 text-xs text-gray-400 transition-colors hover:text-white"
      >
        <RotateCcw className="h-3 w-3 shrink-0" aria-hidden />
        {t("fabricCraftStoryBack")}
      </button>
    </div>
  );

  if (showFlip) {
    return (
      <article
        className="group relative min-h-[480px] perspective-1000 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`relative min-h-[480px] w-full transform-gpu transition-transform duration-500 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {frontFace}
          {backFace}
        </div>
      </article>
    );
  }

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        selected ? "border-brand-orange shadow-lg" : "border-gray-200"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {imageSection}
      {bodySection}
      {stockAccent}
    </article>
  );
}
