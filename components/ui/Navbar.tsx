"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, ShoppingCart } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { useInquiryCart } from "@/components/InquiryCartProvider";
import { OrangeMark } from "@/components/OrangeMark";
import { RequestQuoteButton } from "@/components/RequestQuoteButton";
import { DesktopNavigation } from "@/components/ui/DesktopNavigation";
import { MobileNavigationDrawer } from "@/components/ui/MobileNavigationDrawer";

function NavigationSearchSync({ onChange }: { onChange: (search: string) => void }) {
  const search = useSearchParams().toString();
  useEffect(() => onChange(search), [onChange, search]);
  return null;
}

function NavbarContent() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
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
      {/* Query state may suspend during static rendering; keep the header crawlable. */}
      <Suspense fallback={null}>
        <NavigationSearchSync onChange={setSearch} />
      </Suspense>
      <nav
        data-global-navigation="true"
        className={`gn ${pathname === "/fabrics" ? "gn-collection" : ""} ${
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
              data-inquiry-fallback-opener="compact"
            >
              <Menu className="gn-icon" aria-hidden="true" />
            </button>

            <Link
              ref={brandLinkRef}
              href="/"
              prefetch={false}
              title={t("heroTitle")}
              aria-label={`${t("heroTitle")} · ${t("navHome")}`}
              aria-current={pathname === "/" ? "page" : undefined}
              className="gn-brand"
            >
              <OrangeMark className="gn-mark" />
              <span className="gn-name">
                O&apos;range<span className="gn-textile"> Textile</span>
              </span>
            </Link>

            <DesktopNavigation pathname={pathname} search={search} />

            <div className="gn-actions">
              <RequestQuoteButton
                aria-label={`${pathname === "/fabrics" ? "Sample selection" : "Inquiry cart"}: ${totalCount} ${
                  totalCount === 1 ? "item" : "items"
                }`}
                className="gn-cart"
                data-inquiry-fallback-opener="desktop"
              >
                {pathname === "/fabrics" ? <span>Sample selection</span> : <ShoppingCart
                  className="gn-cart-icon"
                  aria-hidden="true"
                />}
                {totalCount > 0 || pathname === "/fabrics" ? (
                  <span className="gn-count">
                    {totalCount}
                  </span>
                ) : null}
              </RequestQuoteButton>

              <RequestQuoteButton className="gn-cta">
                {t("navCtaInquiry")}
              </RequestQuoteButton>
            </div>

            <RequestQuoteButton className="gn-quote">
              {pathname === "/fabrics" ? <>Sample selection <span className="gn-collection-count">{totalCount}</span></> : "Quote"}
            </RequestQuoteButton>
          </div>
        </div>
      </nav>

      <MobileNavigationDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        pathname={pathname}
        search={search}
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
