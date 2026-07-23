"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { useInquiryCart } from "@/components/InquiryCartProvider";
import { OrangeMark } from "@/components/OrangeMark";
import { DesktopNavigation } from "@/components/ui/DesktopNavigation";
import { MobileNavigationDrawer } from "@/components/ui/MobileNavigationDrawer";
import { INQUIRY_HREF } from "@/lib/navigation";

function NavbarContent() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { totalCount } = useInquiryCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const brandLinkRef = useRef<HTMLAnchorElement>(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        data-global-navigation="true"
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 motion-reduce:transition-none ${
          isScrolled
            ? "bg-white/80 shadow-lg shadow-gray-200/20 backdrop-blur-xl"
            : "border-b border-gray-100 bg-white"
        }`}
        aria-label={t("navAria")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-2 xl:gap-4">
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls={
                drawerOpen ? "mobile-navigation-drawer" : undefined
              }
              onClick={() => setDrawerOpen(true)}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-brand-charcoal outline-none transition-colors hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 motion-reduce:transition-none xl:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <Link
              ref={brandLinkRef}
              href="/"
              title={t("heroTitle")}
              aria-label={`${t("heroTitle")} · ${t("navHome")}`}
              aria-current={pathname === "/" ? "page" : undefined}
              className="group flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg pr-1 text-brand-charcoal outline-none transition-colors hover:text-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 motion-reduce:transition-none xl:flex-none"
            >
              <OrangeMark className="h-8 w-8 shrink-0" />
              <span className="truncate text-base font-bold tracking-tight sm:text-lg">
                O&apos;range Textile
              </span>
            </Link>

            <DesktopNavigation pathname={pathname} />

            <div className="hidden shrink-0 items-center gap-2 xl:flex">
              <Link
                href={INQUIRY_HREF}
                aria-label={`Inquiry cart: ${totalCount} ${
                  totalCount === 1 ? "item" : "items"
                }`}
                className="group relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-brand-charcoal/70 outline-none transition-colors hover:bg-brand-soft hover:text-brand-charcoal focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <ShoppingCart
                  className="h-5 w-5 transition-transform group-hover:scale-110 motion-reduce:transition-none"
                  aria-hidden="true"
                />
                {totalCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange px-1 text-xs font-bold text-white shadow-sm">
                    {totalCount}
                  </span>
                ) : null}
              </Link>

              <Link
                href={INQUIRY_HREF}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-orange px-5 py-2 text-sm font-bold text-white shadow-md shadow-orange-200 outline-none transition-colors hover:bg-orange-600 focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                {t("navCtaInquiry")}
              </Link>
            </div>

            <Link
              href={INQUIRY_HREF}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-brand-orange px-3 py-2 text-sm font-bold text-white outline-none transition-colors hover:bg-orange-600 focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 motion-reduce:transition-none xl:hidden"
            >
              Quote
            </Link>
          </div>
        </div>
      </nav>

      <MobileNavigationDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        pathname={pathname}
        totalCount={totalCount}
        triggerRef={menuButtonRef}
        desktopFallbackRef={brandLinkRef}
      />
    </>
  );
}

export function Navbar() {
  return (
    <Suspense
      fallback={
        <nav
          className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-gray-100 bg-white"
          aria-hidden
        />
      }
    >
      <NavbarContent />
    </Suspense>
  );
}
