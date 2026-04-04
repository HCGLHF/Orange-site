"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowRight, Grid3X3, Package, Shirt, ShoppingCart } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { useInquiryCart } from "@/components/InquiryCartProvider";
import { OrangeMark } from "@/components/OrangeMark";

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const { totalCount } = useInquiryCart();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stockParam = searchParams.get("stock");
  const onFabrics = pathname === "/fabrics";

  const navItems = [
    {
      href: "/fabrics?stock=现货",
      label: t("navStockFast"),
      icon: Package,
      badge: t("navBadge24h"),
      color: "text-emerald-600",
      isActive: onFabrics && stockParam === "现货",
    },
    {
      href: "/fabrics?stock=预定",
      label: t("navStockPreorder"),
      icon: Shirt,
      color: "text-amber-600",
      isActive: onFabrics && stockParam === "预定",
    },
    {
      href: "/fabrics",
      label: t("navFabricsAll"),
      icon: Grid3X3,
      color: "text-gray-600",
      isActive: onFabrics && !stockParam,
    },
  ];

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/80 shadow-lg shadow-gray-200/20 backdrop-blur-xl"
          : "border-b border-gray-100 bg-white"
      }`}
      aria-label={t("navAria")}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            href="/"
            title={t("heroTitle")}
            aria-label={`${t("heroTitle")} · ${t("navHome")}`}
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-soft bg-white shadow-sm transition-transform hover:scale-105 hover:bg-brand-soft active:scale-95"
          >
            <OrangeMark className="h-8 w-8" aria-hidden />
          </Link>

          <div className="hidden min-w-0 flex-1 justify-center px-2 md:flex">
            <div className="flex items-center rounded-full border border-gray-200/50 bg-gray-100/80 p-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.isActive;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      active
                        ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                        : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? item.color : ""}`} aria-hidden />
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.badge ? (
                      <span className="ml-1 rounded-full bg-brand-orange px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex md:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full p-2 ${item.isActive ? "bg-brand-soft text-brand-orange" : "text-gray-500"}`}
                    aria-label={item.label}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </Link>
                );
              })}
            </div>

            <Link
              href="/fabrics#inquiry-form"
              className="group relative rounded-full p-2.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label={t("navCartAria")}
            >
              <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden />
              {totalCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-brand-orange text-xs font-bold text-white shadow-sm">
                  {totalCount}
                </span>
              ) : null}
            </Link>

            <Link
              href="/fabrics#inquiry-form"
              className="group relative hidden overflow-hidden rounded-full bg-gradient-to-r from-brand-orange via-brand-orange to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-300 active:translate-y-0 active:scale-95 sm:inline-flex sm:items-center sm:gap-2"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
              <span className="relative flex items-center gap-2">
                {t("navCtaInquiry")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          </div>
        </div>

        <Link
          href="/fabrics#inquiry-form"
          className="group relative mb-3 flex w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand-orange via-brand-orange to-orange-600 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-orange-200/50 transition active:scale-[0.99] sm:hidden"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
          <span className="relative mx-auto flex items-center justify-center gap-2">
            {t("navCtaInquiry")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </Link>
      </div>
    </nav>
  );
}

export function Navbar() {
  return (
    <Suspense
      fallback={
        <nav className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-gray-100 bg-white" aria-hidden />
      }
    >
      <NavbarContent />
    </Suspense>
  );
}
