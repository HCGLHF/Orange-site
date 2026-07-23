"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  getActiveNavigationId,
  PRIMARY_NAVIGATION,
  type NavigationGroupId,
} from "@/lib/navigation";

type DesktopNavigationProps = {
  pathname: string;
};

export function DesktopNavigation({
  pathname,
}: DesktopNavigationProps) {
  const [openGroup, setOpenGroup] = useState<NavigationGroupId | null>(
    null
  );
  const navigationRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<
    Partial<Record<NavigationGroupId, HTMLButtonElement>>
  >({});
  const activeNavigationId = getActiveNavigationId(pathname);

  useEffect(() => {
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    if (openGroup === null) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const trigger = triggerRefs.current[openGroup];
        setOpenGroup(null);
        trigger?.focus();
      }
    };

    const handleOutsideInteraction = (event: Event) => {
      if (
        event.target instanceof Node &&
        !navigationRef.current?.contains(event.target)
      ) {
        setOpenGroup(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("pointerdown", handleOutsideInteraction);
    document.addEventListener("focusin", handleOutsideInteraction);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener(
        "pointerdown",
        handleOutsideInteraction
      );
      document.removeEventListener("focusin", handleOutsideInteraction);
    };
  }, [openGroup]);

  return (
    <div
      ref={navigationRef}
      className="hidden items-center gap-1 xl:flex"
    >
      {PRIMARY_NAVIGATION.map((section) => {
        const isActive = activeNavigationId === section.id;

        if (section.kind === "link") {
          return (
            <Link
              key={section.id}
              href={section.href}
              aria-current={isActive ? "page" : undefined}
              className="group relative inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-brand-charcoal/75 outline-none transition-colors hover:bg-brand-soft/70 hover:text-brand-charcoal focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              {section.label}
              <span
                className={`pointer-events-none absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-brand-orange transition-opacity motion-reduce:transition-none ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden="true"
              />
            </Link>
          );
        }

        const isOpen = openGroup === section.id;
        const panelId = `desktop-navigation-${section.id}-menu`;

        return (
          <div key={section.id} className="relative">
            <button
              ref={(node) => {
                if (node) triggerRefs.current[section.id] = node;
              }}
              type="button"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() =>
                setOpenGroup((current) =>
                  current === section.id ? null : section.id
                )
              }
              className="group relative inline-flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-brand-charcoal/75 outline-none transition-colors hover:bg-brand-soft/70 hover:text-brand-charcoal focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              {section.label}
              <ChevronDown
                className={`h-4 w-4 transition-transform motion-reduce:transition-none ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
              <span
                className={`pointer-events-none absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-brand-orange transition-opacity motion-reduce:transition-none ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden="true"
              />
            </button>

            <div
              id={panelId}
              role="menu"
              aria-hidden={!isOpen}
              className={`absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-brand-charcoal/10 bg-white p-2 shadow-xl shadow-brand-charcoal/10 transition duration-150 motion-reduce:transition-none ${
                isOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible pointer-events-none -translate-y-1 opacity-0"
              }`}
            >
              {section.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  role="menuitem"
                  tabIndex={isOpen ? 0 : -1}
                  onClick={() => setOpenGroup(null)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-brand-charcoal/80 outline-none transition-colors hover:bg-brand-soft hover:text-brand-charcoal focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-inset motion-reduce:transition-none"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
