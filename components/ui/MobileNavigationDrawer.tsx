"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, RefObject } from "react";
import Link from "next/link";
import { ChevronDown, ShoppingCart, X } from "lucide-react";
import {
  PRIMARY_NAVIGATION,
  INQUIRY_HREF,
  getActiveNavigationId,
  type NavigationGroupId,
} from "@/lib/navigation";

type MobileNavigationDrawerProps = {
  open: boolean;
  onClose: () => void;
  pathname: string;
  totalCount: number;
  triggerRef: RefObject<HTMLButtonElement>;
};

export function MobileNavigationDrawer({
  open,
  onClose,
  pathname,
  totalCount,
  triggerRef,
}: MobileNavigationDrawerProps) {
  const [expandedGroups, setExpandedGroups] = useState<
    Record<NavigationGroupId, boolean>
  >({
    products: true,
    resources: false,
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousPathRef = useRef(pathname);
  const activeNavigationId = getActiveNavigationId(pathname);

  const closeAndRestoreFocus = useCallback(() => {
    onClose();
    triggerRef.current?.focus();
  }, [onClose, triggerRef]);

  const onRouteSelect = () => {
    onClose();
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeAndRestoreFocus();
    }
  };

  useEffect(() => {
    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname;
      if (open) {
        onClose();
      }
    }
  }, [onClose, open, pathname]);

  useEffect(() => {
    if (!open) return;

    const desktopMediaQuery = window.matchMedia("(min-width: 1280px)");
    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        onClose();
      }
    };

    desktopMediaQuery.addEventListener("change", handleDesktopChange);
    if (desktopMediaQuery.matches) {
      onClose();
    }

    return () => {
      desktopMediaQuery.removeEventListener("change", handleDesktopChange);
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;

    const focusFrame = requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(focusFrame);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAndRestoreFocus();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter(
        (element) =>
          element.offsetParent !== null && !element.closest("[hidden]")
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable =
        focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === firstFocusable ||
          !panelRef.current?.contains(activeElement))
      ) {
        event.preventDefault();
        lastFocusable.focus();
        return;
      }

      if (
        !event.shiftKey &&
        (activeElement === lastFocusable ||
          !panelRef.current?.contains(activeElement))
      ) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeAndRestoreFocus, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-brand-charcoal/45 xl:hidden"
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-navigation-title"
        onClick={(event) => event.stopPropagation()}
        className="h-full w-[min(90vw,24rem)] max-w-sm overflow-y-auto bg-white pb-28 pt-[max(1rem,env(safe-area-inset-top))] shadow-2xl shadow-brand-charcoal/25"
      >
        <div className="flex items-center justify-between gap-4 border-b border-brand-charcoal/10 px-5 pb-4">
          <h2
            id="mobile-navigation-title"
            className="text-lg font-bold text-brand-charcoal"
          >
            O&apos;range Textile
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close navigation menu"
            onClick={closeAndRestoreFocus}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-brand-charcoal/70 outline-none transition-colors hover:bg-brand-soft hover:text-brand-charcoal focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile navigation" className="px-4 py-4">
          <div className="space-y-1">
            {PRIMARY_NAVIGATION.map((section) => {
              const isActive = activeNavigationId === section.id;

              if (section.kind === "link") {
                return (
                  <Link
                    key={section.id}
                    href={section.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={onRouteSelect}
                    className={`flex min-h-11 items-center rounded-r-lg border-l-4 px-3 py-2 text-base font-semibold outline-none transition-colors hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-inset motion-reduce:transition-none ${
                      isActive
                        ? "border-brand-orange bg-brand-soft text-brand-charcoal"
                        : "border-transparent text-brand-charcoal/80"
                    }`}
                  >
                    {section.label}
                  </Link>
                );
              }

              const isExpanded = expandedGroups[section.id];
              const triggerId = `mobile-navigation-${section.id}-trigger`;
              const panelId = `mobile-navigation-${section.id}-panel`;

              return (
                <div key={section.id}>
                  <button
                    id={triggerId}
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    onClick={() =>
                      setExpandedGroups((current) => ({
                        ...current,
                        [section.id]: !current[section.id],
                      }))
                    }
                    className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-r-lg border-l-4 px-3 py-2 text-left text-base font-semibold outline-none transition-colors hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-inset motion-reduce:transition-none ${
                      isActive
                        ? "border-brand-orange bg-brand-soft text-brand-charcoal"
                        : "border-transparent text-brand-charcoal/80"
                    }`}
                  >
                    {section.label}
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 transition-transform motion-reduce:transition-none ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    id={panelId}
                    aria-labelledby={triggerId}
                    hidden={!isExpanded}
                    className="ml-4 border-l border-brand-charcoal/10 pl-3"
                  >
                    {section.items.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={onRouteSelect}
                        className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium text-brand-charcoal/75 outline-none transition-colors hover:bg-brand-soft hover:text-brand-charcoal focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-inset motion-reduce:transition-none"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-3 border-t border-brand-charcoal/10 pt-5">
            <Link
              href={INQUIRY_HREF}
              onClick={onRouteSelect}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-base font-semibold text-brand-charcoal outline-none transition-colors hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-inset motion-reduce:transition-none"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              <span>Inquiry cart</span>
              {totalCount > 0 ? (
                <span className="ml-auto inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-brand-orange px-1.5 text-xs font-bold text-white">
                  {totalCount}
                </span>
              ) : null}
            </Link>
            <Link
              href={INQUIRY_HREF}
              onClick={onRouteSelect}
              className="flex min-h-11 w-full items-center justify-center rounded-lg bg-brand-orange px-4 py-3 text-center text-base font-bold text-white outline-none transition-colors hover:bg-orange-600 focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              Request a Quote
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
