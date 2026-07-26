"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  getActiveNavigationId,
  getCurrentNavigationItemId,
  PRIMARY_NAVIGATION,
  type NavigationGroupId,
} from "@/lib/navigation";

type DesktopNavigationProps = {
  pathname: string;
};

type PendingMenuFocus = {
  groupId: NavigationGroupId;
  itemIndex: number;
};

export function DesktopNavigation({
  pathname,
}: DesktopNavigationProps) {
  const [openGroup, setOpenGroup] = useState<NavigationGroupId | null>(
    null
  );
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const navigationRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<
    Partial<Record<NavigationGroupId, HTMLButtonElement>>
  >({});
  const menuItemRefs = useRef<
    Partial<
      Record<NavigationGroupId, Array<HTMLAnchorElement | null>>
    >
  >({});
  const pendingFocusRef = useRef<PendingMenuFocus | null>(null);
  const activeNavigationId = getActiveNavigationId(pathname);
  const currentNavigationItemId =
    getCurrentNavigationItemId(pathname);

  const openMenu = (
    groupId: NavigationGroupId,
    itemIndex: number
  ) => {
    setActiveItemIndex(itemIndex);

    if (openGroup === groupId) {
      menuItemRefs.current[groupId]?.[itemIndex]?.focus();
      return;
    }

    pendingFocusRef.current = { groupId, itemIndex };
    setOpenGroup(groupId);
  };

  const handleTriggerClick = (groupId: NavigationGroupId) => {
    if (openGroup === groupId) {
      setOpenGroup(null);
      return;
    }

    openMenu(groupId, 0);
  };

  const handleTriggerKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    groupId: NavigationGroupId,
    itemCount: number
  ) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        handleTriggerClick(groupId);
        break;
      case "ArrowDown":
        event.preventDefault();
        openMenu(groupId, 0);
        break;
      case "ArrowUp":
        event.preventDefault();
        openMenu(groupId, itemCount - 1);
        break;
    }
  };

  const handleMenuItemKeyDown = (
    event: ReactKeyboardEvent<HTMLAnchorElement>,
    groupId: NavigationGroupId,
    itemIndex: number,
    itemCount: number
  ) => {
    if (event.key === "Tab") {
      setOpenGroup(null);
      return;
    }

    let nextItemIndex: number | null = null;

    switch (event.key) {
      case "ArrowDown":
        nextItemIndex = (itemIndex + 1) % itemCount;
        break;
      case "ArrowUp":
        nextItemIndex =
          (itemIndex - 1 + itemCount) % itemCount;
        break;
      case "Home":
        nextItemIndex = 0;
        break;
      case "End":
        nextItemIndex = itemCount - 1;
        break;
      case "Escape": {
        event.preventDefault();
        event.stopPropagation();
        const trigger = triggerRefs.current[groupId];
        setOpenGroup(null);
        trigger?.focus();
        return;
      }
      default:
        return;
    }

    event.preventDefault();
    setActiveItemIndex(nextItemIndex);
    menuItemRefs.current[groupId]?.[nextItemIndex]?.focus();
  };

  useEffect(() => {
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    const pendingFocus = pendingFocusRef.current;
    if (
      openGroup === null ||
      pendingFocus?.groupId !== openGroup ||
      pendingFocus.itemIndex !== activeItemIndex
    ) {
      return;
    }

    menuItemRefs.current[openGroup]?.[activeItemIndex]?.focus();
    pendingFocusRef.current = null;
  }, [activeItemIndex, openGroup]);

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
      className="dn"
    >
      {PRIMARY_NAVIGATION.map((section) => {
        const isActive = activeNavigationId === section.id;

        if (section.kind === "link") {
          return (
            <Link
              key={section.id}
              href={section.href}
              aria-current={isActive ? "page" : undefined}
              className="dn-link"
            >
              {section.label}
              <span
                className={`dn-line ${
                  isActive ? "dn-line-on" : "dn-line-off"
                }`}
                aria-hidden="true"
              />
            </Link>
          );
        }

        const isOpen = openGroup === section.id;
        const isCurrentSectionFallback =
          isActive && currentNavigationItemId === null;
        const triggerId = `desktop-navigation-${section.id}-trigger`;
        const panelId = `desktop-navigation-${section.id}-menu`;

        return (
          <div key={section.id} className="dn-group">
            <button
              id={triggerId}
              ref={(node) => {
                if (node) triggerRefs.current[section.id] = node;
              }}
              type="button"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-controls={panelId}
              aria-current={
                isCurrentSectionFallback ? "page" : undefined
              }
              onClick={() => handleTriggerClick(section.id)}
              onKeyDown={(event) =>
                handleTriggerKeyDown(
                  event,
                  section.id,
                  section.items.length
                )
              }
              className="dn-trigger"
            >
              {section.label}
              <ChevronDown
                className={`dn-chevron ${
                  isOpen ? "dn-chevron-open" : ""
                }`}
                aria-hidden="true"
              />
              <span
                className={`dn-line ${
                  isActive ? "dn-line-on" : "dn-line-off"
                }`}
                aria-hidden="true"
              />
            </button>

            <div
              id={panelId}
              role="menu"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
              className={`dn-panel ${
                isOpen
                  ? "dn-panel-open"
                  : "dn-panel-closed"
              }`}
            >
              {section.items.map((item, itemIndex) => {
                const isCurrentItem =
                  currentNavigationItemId === item.id;

                return (
                  <Link
                    key={item.id}
                    ref={(node) => {
                      const itemRefs =
                        menuItemRefs.current[section.id] ?? [];
                      itemRefs[itemIndex] = node;
                      menuItemRefs.current[section.id] = itemRefs;
                    }}
                    href={item.href}
                    aria-current={
                      isCurrentItem ? "page" : undefined
                    }
                    role="menuitem"
                    tabIndex={
                      isOpen && activeItemIndex === itemIndex ? 0 : -1
                    }
                    onClick={() => setOpenGroup(null)}
                    onKeyDown={(event) =>
                      handleMenuItemKeyDown(
                        event,
                        section.id,
                        itemIndex,
                        section.items.length
                      )
                    }
                    className={`dn-item ${
                      isCurrentItem
                        ? "dn-item-current"
                        : "dn-item-default"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
