"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Download,
  ShoppingCart,
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
  const alias: Record<string, keyof typeof STOCK_CONFIG> = {
    缺貨: "缺货",
    无货: "缺货",
    售完: "缺货",
    售罄: "缺货",
  };
  if (s in alias) return alias[s]!;
  const lower = s.toLowerCase();
  if (lower === "out of stock" || lower === "sold out") return "缺货";
  if (s in STOCK_CONFIG) return s as keyof typeof STOCK_CONFIG;
  return "现货";
}

export function FabricCard({ fabric }: FabricCardProps) {
  const { locale, t } = useLocale();
  const { openInquiry } = useInquiry();
  const { isSelected, addItem, removeItem } = useInquiryCart();
  const copy = useMemo(() => getFabricCopy(fabric, locale), [fabric, locale]);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const imageSection = (
    <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-gray-100">
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
          className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-3 [font-family:system-ui,-apple-system,'PingFang_SC','Hiragino_Sans_GB','Microsoft_YaHei',sans-serif]"
          aria-hidden
          suppressHydrationWarning
        >
          <span
            className="line-clamp-3 text-center text-base font-semibold leading-snug text-orange-500"
            suppressHydrationWarning
          >
            {fabric.name.trim() || "—"}
          </span>
        </div>
      )}

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
        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-brand-orange/10">
          <div className="flex items-center gap-2 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white shadow-md">
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            {t("fabricInquiryCartOverlay")}
          </div>
        </div>
      )}
    </div>
  );

  const bodySection = (
    <div className="flex flex-col p-5">
      <h3 className="mb-1 line-clamp-2 break-words text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-brand-orange">
        {copy.name}
      </h3>
      <p className="mb-3 line-clamp-3 break-words text-sm leading-relaxed text-gray-600">
        {copy.composition}
      </p>

      {copy.description?.trim() ? (
        <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-gray-500">
          {copy.description.trim()}
        </p>
      ) : null}

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
          {fabric.scenarios.map((s, i) => (
            <span
              key={`${s}-${i}`}
              className="rounded bg-orange-50 px-2 py-0.5 text-xs text-orange-600"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <p className={`mb-4 text-xs font-medium ${config.textColor}`}>
        {locale === "en" ? config.etaEn : config.etaZh}
      </p>

      <div className="flex gap-2">
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

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        selected ? "border-brand-orange shadow-lg" : "border-gray-200"
      }`}
    >
      {imageSection}
      {bodySection}
      {stockAccent}
    </article>
  );
}
