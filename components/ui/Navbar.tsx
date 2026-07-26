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
        className={`gn ${
          isScrolled
            ? "gn-scrolled"
            : "gn-base"
        }`}
        aria-label={t("navAria")}
      >
        <div className="gn-inner">
          <div className="gn-row">
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls={
                drawerOpen ? "mobile-navigation-drawer" : undefined
              }
              onClick={() => setDrawerOpen(true)}
              className="gn-menu"
            >
              <Menu className="gn-icon" aria-hidden="true" />
            </button>

            <Link
              ref={brandLinkRef}
              href="/"
              title={t("heroTitle")}
              aria-label={`${t("heroTitle")} · ${t("navHome")}`}
              aria-current={pathname === "/" ? "page" : undefined}
              className="gn-brand"
            >
              <OrangeMark className="gn-mark" />
              <span className="gn-name">
                O&apos;range Textile
              </span>
            </Link>

            <DesktopNavigation pathname={pathname} />

            <div className="gn-actions">
              <Link
                href={INQUIRY_HREF}
                aria-label={`Inquiry cart: ${totalCount} ${
                  totalCount === 1 ? "item" : "items"
                }`}
                className="gn-cart"
              >
                <ShoppingCart
                  className="gn-cart-icon"
                  aria-hidden="true"
                />
                {totalCount > 0 ? (
                  <span className="gn-count">
                    {totalCount}
                  </span>
                ) : null}
              </Link>

              <Link
                href={INQUIRY_HREF}
                className="gn-cta"
              >
                {t("navCtaInquiry")}
              </Link>
            </div>

            <Link
              href={INQUIRY_HREF}
              className="gn-quote"
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
          className="gn-fallback"
          aria-hidden
        />
      }
    >
      <NavbarContent />
    </Suspense>
  );
}
