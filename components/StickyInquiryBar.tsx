"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  Package,
  ShoppingCart,
  X,
} from "lucide-react";
import { useInquiryCart } from "@/components/InquiryCartProvider";
import { dispatchOpenBatchInquiry } from "@/lib/inquiry-events";

export default function StickyInquiryBar() {
  const { items, totalCount, removeItem } = useInquiryCart();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (totalCount === 0) {
        setIsVisible(false);
        return;
      }
      setIsVisible(window.scrollY > 300);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [totalCount]);

  const openPanel = () => {
    setIsAnimating(true);
    setIsExpanded(true);
  };

  const closePanel = () => {
    setIsExpanded(false);
    window.setTimeout(() => setIsAnimating(false), 300);
  };

  const goToInquiryForm = () => {
    const anchor = document.getElementById("inquiry-form");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => dispatchOpenBatchInquiry(), 380);
    } else {
      dispatchOpenBatchInquiry();
    }
    closePanel();
  };

  if (totalCount === 0) return null;

  return (
    <>
      <div
        className={`fixed right-6 z-50 transition-all duration-500 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6 ${
          isVisible
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-20 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={openPanel}
          className="group flex items-center gap-3 rounded-full bg-brand-charcoal py-3 pl-5 pr-4 text-white shadow-2xl shadow-brand-charcoal/30 transition-all duration-300 hover:scale-105 hover:shadow-brand-charcoal/50"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" aria-hidden />
            <span className="absolute -right-2 -top-2 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-brand-orange text-xs font-bold text-white">
              {totalCount}
            </span>
          </div>

          <div className="flex flex-col items-start">
            <span className="text-xs text-white/60">已选面料</span>
            <span className="text-sm font-semibold">
              {totalCount} 款待询价
            </span>
          </div>

          <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange transition-colors group-hover:bg-brand-orange/90">
            <ArrowRight className="h-4 w-4" aria-hidden />
          </div>
        </button>
      </div>

      {isAnimating && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <button
            type="button"
            className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}
            aria-label="关闭面板"
            onClick={closePanel}
          />

          <div
            className={`relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
              isExpanded ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft">
                  <Package className="h-5 w-5 text-brand-orange" aria-hidden />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">询价清单</h3>
                  <p className="text-sm text-gray-500">
                    {totalCount} 款面料待提交
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closePanel}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
                aria-label="关闭"
              >
                <X className="h-5 w-5 text-gray-500" aria-hidden />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="group flex gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-brand-orange/30"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-semibold text-gray-900">
                      {item.name}
                    </h4>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {item.composition}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      <span>{item.weight}g/m²</span>
                      <span>·</span>
                      <span
                        className={
                          item.stockStatus === "现货"
                            ? "font-medium text-emerald-600"
                            : "text-amber-600"
                        }
                      >
                        {item.stockStatus}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    aria-label="移除此款"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 bg-white p-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">共 {totalCount} 款面料</span>
                <span className="text-xs text-gray-400">预计 24h 内回复</span>
              </div>

              <button
                type="button"
                onClick={goToInquiryForm}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange py-4 font-semibold text-white shadow-lg shadow-brand-orange/25 transition-colors hover:bg-brand-orange/90"
              >
                <span>立即填写询价单</span>
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>

              <button
                type="button"
                onClick={closePanel}
                className="w-full py-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
              >
                继续选购面料
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
