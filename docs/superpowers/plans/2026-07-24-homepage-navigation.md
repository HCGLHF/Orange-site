# Homepage Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive buyer-journey header with curated Products and Resources menus, a visible O'range Textile wordmark, accessible desktop and mobile interactions, and an unchanged high-value inquiry path.

**Architecture:** Store every navigation label, route, ordering rule, and route-family matcher in `lib/navigation.ts`. Keep desktop dropdown behaviour and mobile drawer behaviour in separate client components, while `Navbar.tsx` owns shared header state, scroll styling, pathname, cart count, and composition. Extend the existing production HTML audit so all 29 public pages prove that the approved navigation destinations are present without changing page SEO.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Lucide React, Node's built-in test runner, existing production SEO audit

---

## File Map

### Create

- `lib/navigation.ts` — typed buyer-journey navigation configuration, inquiry destination, discovery hrefs, and active-route resolver.
- `components/ui/DesktopNavigation.tsx` — desktop direct links, accessible dropdown triggers, outside dismissal, `Escape` handling, and focus return.
- `components/ui/MobileNavigationDrawer.tsx` — mobile drawer, accordions, focus trap, body scroll lock, backdrop dismissal, and route-change cleanup.
- `tests/navigation.test.mjs` — configuration, route coverage, active-state, component wiring, and accessibility-contract regression tests.

### Modify

- `components/ui/Navbar.tsx` — replace the current pill navigation and mobile icon row with the approved brand, desktop composition, mobile trigger, compact quote action, cart, and drawer.
- `components/AppShell.tsx` — reduce the mobile header spacer from two rows to the new single-row header.
- `lib/i18n.ts` — change the existing inquiry CTA label to `Request a quote`.
- `tests/landing-pages.test.mjs` — read landing-route coverage from the shared navigation configuration instead of expecting routes to remain hard-coded in `Navbar.tsx`.
- `tests/site-seo-integration.test.mjs` — require the production validator to inspect the approved navigation destinations.
- `scripts/validate-production-seo.mjs` — verify navigation hrefs in the final HTML of every public page and include the result in the production audit report.

### Preserve

- `components/ui/BottomNav.tsx` — retain `Home`, `Fabrics`, `Inquiry`, and `Contact` without destination or interaction changes.
- `lib/seo/site-seo.ts` — retain the 29-page keyword, metadata, H1, and sitemap registry unchanged.
- All application routes, canonical URLs, structured data, and redirects.

## Task 1: Establish the Typed Navigation Contract

**Files:**

- Create: `tests/navigation.test.mjs`
- Create: `lib/navigation.ts`
- Modify: `tests/landing-pages.test.mjs`
- Test: `tests/navigation.test.mjs`
- Test: `tests/landing-pages.test.mjs`

- [ ] **Step 1: Write the failing navigation configuration tests**

Create `tests/navigation.test.mjs` with:

```js
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

const navigationUrl = new URL("../lib/navigation.ts", import.meta.url);

const loadNavigation = async () => {
  assert.ok(existsSync(navigationUrl), "lib/navigation.ts must exist");
  return import(navigationUrl.href);
};

test("buyer-journey navigation exposes the approved groups and order", async () => {
  const { PRIMARY_NAVIGATION } = await loadNavigation();

  assert.deepEqual(
    PRIMARY_NAVIGATION.map((section) => section.id),
    ["products", "custom-development", "resources", "about"]
  );

  const products = PRIMARY_NAVIGATION.find(
    (section) => section.id === "products"
  );
  const resources = PRIMARY_NAVIGATION.find(
    (section) => section.id === "resources"
  );

  assert.equal(products.kind, "group");
  assert.deepEqual(
    products.items.map((item) => [item.label, item.href]),
    [
      ["Ready Stock", "/ready-stock-knit-fabrics"],
      ["Finished Knit Fabrics", "/fabrics"],
      ["Double-Knit Manufacturing", "/finished-double-knit-fabrics"],
      ["Interlock Fabric", "/fabrics/interlock-fabric"],
      ["Ponte Roma Fabric", "/fabrics/ponte-roma-fabric"],
      ["Rib Knit Fabric", "/fabrics/rib-knit-fabric"],
      ["View All Fabrics", "/fabrics"],
    ]
  );

  assert.equal(resources.kind, "group");
  assert.deepEqual(
    resources.items.map((item) => [item.label, item.href]),
    [
      [
        "What Is Double Knit Fabric?",
        "/blog/what-is-double-knit-fabric",
      ],
      ["What Is Interlock Fabric?", "/blog/what-is-interlock-fabric"],
      ["What Is Ponte Fabric?", "/blog/what-is-ponte-fabric"],
      ["View All Buyer Guides", "/blog"],
    ]
  );
});

test("every navigation destination resolves to a registered public page", async () => {
  const { NAVIGATION_DISCOVERY_HREFS } = await loadNavigation();
  const { getAllPublicPageSeo } = await import("../lib/seo/site-seo.ts");
  const publicPaths = new Set(getAllPublicPageSeo().map((page) => page.path));

  for (const href of NAVIGATION_DISCOVERY_HREFS) {
    const pathname = href.split("#")[0];
    assert.ok(publicPaths.has(pathname), `${href} must resolve publicly`);
  }
});

test("only the documented catalogue destination is duplicated", async () => {
  const { PRIMARY_NAVIGATION } = await loadNavigation();
  const hrefs = PRIMARY_NAVIGATION.flatMap((section) =>
    section.kind === "group" ? section.items.map((item) => item.href) : [section.href]
  );
  const duplicates = [...new Set(hrefs.filter(
    (href, index) => hrefs.indexOf(href) !== index
  ))];

  assert.deepEqual(duplicates, ["/fabrics"]);
  assert.equal(
    hrefs.filter((href) => href === "/fabrics").length,
    2
  );
});

test("active navigation follows the approved route families", async () => {
  const { getActiveNavigationId } = await loadNavigation();

  assert.equal(getActiveNavigationId("/"), "home");
  assert.equal(getActiveNavigationId("/fabrics"), "products");
  assert.equal(
    getActiveNavigationId("/fabrics/interlock-fabric"),
    "products"
  );
  assert.equal(
    getActiveNavigationId("/ready-stock-knit-fabrics"),
    "products"
  );
  assert.equal(
    getActiveNavigationId("/finished-double-knit-fabrics"),
    "products"
  );
  assert.equal(
    getActiveNavigationId("/custom-knit-fabric-development"),
    "custom-development"
  );
  assert.equal(getActiveNavigationId("/blog"), "resources");
  assert.equal(
    getActiveNavigationId("/blog/what-is-double-knit-fabric"),
    "resources"
  );
  assert.equal(getActiveNavigationId("/about"), "about");
  assert.equal(getActiveNavigationId("/unknown"), null);
});
```

- [ ] **Step 2: Move the landing-route source assertion to the shared configuration**

In `tests/landing-pages.test.mjs`, replace the `navbar` source read in `primary buyer navigation and discovery files expose all landing routes` with:

```js
  const navigation = await readFile(
    new URL("../lib/navigation.ts", import.meta.url),
    "utf8"
  );
```

Then replace:

```js
    assert.match(navbar, new RegExp(route));
```

with:

```js
    assert.match(navigation, new RegExp(route));
```

Replace:

```js
  assert.doesNotMatch(navbar, /navBadge24h/);
```

with:

```js
  assert.doesNotMatch(navigation, /navBadge24h/);
```

- [ ] **Step 3: Run the focused tests and verify the expected failure**

Run:

```powershell
node --test tests/navigation.test.mjs tests/landing-pages.test.mjs
```

Expected: FAIL because `lib/navigation.ts` does not exist.

- [ ] **Step 4: Implement the complete navigation configuration**

Create `lib/navigation.ts`:

```ts
export const INQUIRY_HREF = "/fabrics#inquiry-form";

export type NavigationGroupId = "products" | "resources";
export type NavigationTopLevelId =
  | NavigationGroupId
  | "custom-development"
  | "about";
export type ActiveNavigationId = NavigationTopLevelId | "home" | null;

export type NavigationLink = {
  id: string;
  label: string;
  href: string;
};

export type NavigationGroup = {
  kind: "group";
  id: NavigationGroupId;
  label: string;
  items: readonly NavigationLink[];
};

export type NavigationDirectLink = {
  kind: "link";
  id: Exclude<NavigationTopLevelId, NavigationGroupId>;
  label: string;
  href: string;
};

export type NavigationSection = NavigationGroup | NavigationDirectLink;

export const PRIMARY_NAVIGATION = [
  {
    kind: "group",
    id: "products",
    label: "Products",
    items: [
      {
        id: "ready-stock",
        label: "Ready Stock",
        href: "/ready-stock-knit-fabrics",
      },
      {
        id: "finished-knit-fabrics",
        label: "Finished Knit Fabrics",
        href: "/fabrics",
      },
      {
        id: "double-knit-manufacturing",
        label: "Double-Knit Manufacturing",
        href: "/finished-double-knit-fabrics",
      },
      {
        id: "interlock-fabric",
        label: "Interlock Fabric",
        href: "/fabrics/interlock-fabric",
      },
      {
        id: "ponte-roma-fabric",
        label: "Ponte Roma Fabric",
        href: "/fabrics/ponte-roma-fabric",
      },
      {
        id: "rib-knit-fabric",
        label: "Rib Knit Fabric",
        href: "/fabrics/rib-knit-fabric",
      },
      {
        id: "view-all-fabrics",
        label: "View All Fabrics",
        href: "/fabrics",
      },
    ],
  },
  {
    kind: "link",
    id: "custom-development",
    label: "Custom Development",
    href: "/custom-knit-fabric-development",
  },
  {
    kind: "group",
    id: "resources",
    label: "Resources",
    items: [
      {
        id: "double-knit-guide",
        label: "What Is Double Knit Fabric?",
        href: "/blog/what-is-double-knit-fabric",
      },
      {
        id: "interlock-guide",
        label: "What Is Interlock Fabric?",
        href: "/blog/what-is-interlock-fabric",
      },
      {
        id: "ponte-guide",
        label: "What Is Ponte Fabric?",
        href: "/blog/what-is-ponte-fabric",
      },
      {
        id: "view-all-guides",
        label: "View All Buyer Guides",
        href: "/blog",
      },
    ],
  },
  {
    kind: "link",
    id: "about",
    label: "About",
    href: "/about",
  },
] as const satisfies readonly NavigationSection[];

const configuredHrefs = PRIMARY_NAVIGATION.flatMap((section) =>
  section.kind === "group"
    ? section.items.map((item) => item.href)
    : [section.href]
);

export const NAVIGATION_DISCOVERY_HREFS = [
  ...new Set([...configuredHrefs, INQUIRY_HREF]),
];

export function getActiveNavigationId(
  pathname: string
): ActiveNavigationId {
  if (pathname === "/") return "home";
  if (
    pathname === "/fabrics" ||
    pathname.startsWith("/fabrics/") ||
    pathname === "/ready-stock-knit-fabrics" ||
    pathname === "/finished-double-knit-fabrics"
  ) {
    return "products";
  }
  if (pathname === "/custom-knit-fabric-development") {
    return "custom-development";
  }
  if (pathname === "/blog" || pathname.startsWith("/blog/")) {
    return "resources";
  }
  if (pathname === "/about") return "about";
  return null;
}
```

- [ ] **Step 5: Run the focused tests and verify they pass**

Run:

```powershell
node --test tests/navigation.test.mjs tests/landing-pages.test.mjs
```

Expected: PASS for all navigation and landing-page tests.

- [ ] **Step 6: Commit the navigation contract**

```powershell
git add -- lib/navigation.ts tests/navigation.test.mjs tests/landing-pages.test.mjs
git commit -m "test: define global navigation contract"
```

## Task 2: Build the Accessible Desktop Navigation

**Files:**

- Modify: `tests/navigation.test.mjs`
- Create: `components/ui/DesktopNavigation.tsx`
- Test: `tests/navigation.test.mjs`

- [ ] **Step 1: Add the failing desktop interaction contract test**

Append to `tests/navigation.test.mjs`:

```js
test("desktop navigation uses shared data and accessible menu controls", async () => {
  const source = await readFile(
    new URL("../components/ui/DesktopNavigation.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /PRIMARY_NAVIGATION/);
  assert.match(source, /getActiveNavigationId/);
  assert.match(source, /aria-haspopup="menu"/);
  assert.match(source, /aria-expanded=/);
  assert.match(source, /aria-controls=/);
  assert.match(source, /role="menu"/);
  assert.match(source, /role="menuitem"/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /pointerdown/);
  assert.match(source, /focusin/);
  assert.match(source, /\.focus\(\)/);
  assert.doesNotMatch(source, /const\s+navItems\s*=/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```powershell
node --test tests/navigation.test.mjs
```

Expected: FAIL because `components/ui/DesktopNavigation.tsx` does not exist.

- [ ] **Step 3: Implement the desktop dropdown component**

Create `components/ui/DesktopNavigation.tsx`:

```tsx
"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  PRIMARY_NAVIGATION,
  getActiveNavigationId,
  type NavigationGroupId,
} from "@/lib/navigation";

type DesktopNavigationProps = {
  pathname: string;
};

export function DesktopNavigation({
  pathname,
}: DesktopNavigationProps) {
  const [openGroup, setOpenGroup] =
    useState<NavigationGroupId | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<
    Partial<Record<NavigationGroupId, HTMLButtonElement | null>>
  >({});
  const activeId = getActiveNavigationId(pathname);

  useEffect(() => {
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    if (!openGroup) return;

    const closeFromOutside = (event: Event) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpenGroup(null);
      }
    };
    const closeFromEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const trigger = triggerRefs.current[openGroup];
      setOpenGroup(null);
      trigger?.focus();
    };

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("focusin", closeFromOutside);
    document.addEventListener("keydown", closeFromEscape);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("focusin", closeFromOutside);
      document.removeEventListener("keydown", closeFromEscape);
    };
  }, [openGroup]);

  return (
    <div
      ref={rootRef}
      className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex"
      aria-label="Buyer navigation"
    >
      {PRIMARY_NAVIGATION.map((section) => {
        const active = activeId === section.id;

        if (section.kind === "link") {
          return (
            <Link
              key={section.id}
              href={section.href}
              aria-current={active ? "page" : undefined}
              className={`relative rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 ${
                active
                  ? "bg-brand-soft text-brand-charcoal after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand-orange"
                  : "text-brand-charcoal/70 hover:bg-brand-cream hover:text-brand-charcoal"
              }`}
            >
              {section.label}
            </Link>
          );
        }

        const expanded = openGroup === section.id;
        const panelId = `desktop-${section.id}-menu`;

        return (
          <div key={section.id} className="relative">
            <button
              ref={(node) => {
                triggerRefs.current[section.id] = node;
              }}
              type="button"
              aria-haspopup="menu"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() =>
                setOpenGroup((current) =>
                  current === section.id ? null : section.id
                )
              }
              className={`relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 ${
                active
                  ? "bg-brand-soft text-brand-charcoal after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand-orange"
                  : "text-brand-charcoal/70 hover:bg-brand-cream hover:text-brand-charcoal"
              }`}
            >
              {section.label}
              <ChevronDown
                className={`h-4 w-4 transition-transform motion-reduce:transition-none ${
                  expanded ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>

            <div
              id={panelId}
              role="menu"
              aria-hidden={!expanded}
              className={`absolute left-0 top-[calc(100%+0.75rem)] w-72 rounded-2xl border border-brand-charcoal/10 bg-white p-2 shadow-xl shadow-brand-charcoal/10 transition motion-reduce:transition-none ${
                expanded
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-1 pointer-events-none opacity-0"
              }`}
            >
              {section.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  role="menuitem"
                  tabIndex={expanded ? 0 : -1}
                  onClick={() => setOpenGroup(null)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-brand-charcoal/75 transition hover:bg-brand-cream hover:text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
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
```

- [ ] **Step 4: Run the focused tests**

Run:

```powershell
node --test tests/navigation.test.mjs
npm.cmd run typecheck
```

Expected: navigation tests PASS and TypeScript exits with code 0.

- [ ] **Step 5: Commit the desktop component**

```powershell
git add -- components/ui/DesktopNavigation.tsx tests/navigation.test.mjs
git commit -m "feat: add accessible desktop navigation"
```

## Task 3: Build the Accessible Mobile Drawer

**Files:**

- Modify: `tests/navigation.test.mjs`
- Create: `components/ui/MobileNavigationDrawer.tsx`
- Test: `tests/navigation.test.mjs`

- [ ] **Step 1: Add the failing mobile interaction contract test**

Append to `tests/navigation.test.mjs`:

```js
test("mobile drawer shares navigation data and owns focus cleanup", async () => {
  const source = await readFile(
    new URL("../components/ui/MobileNavigationDrawer.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /PRIMARY_NAVIGATION/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /event\.key === "Tab"/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /document\.body\.style\.overflow\s*=\s*"hidden"/);
  assert.match(source, /previousOverflow/);
  assert.match(source, /triggerRef\.current\?\.focus\(\)/);
  assert.match(source, /Products/);
  assert.match(source, /Resources/);
  assert.match(source, /pb-28/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```powershell
node --test tests/navigation.test.mjs
```

Expected: FAIL because `components/ui/MobileNavigationDrawer.tsx` does not exist.

- [ ] **Step 3: Implement the mobile drawer**

Create `components/ui/MobileNavigationDrawer.tsx`:

```tsx
"use client";

import Link from "next/link";
import { ChevronDown, ShoppingCart, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  INQUIRY_HREF,
  PRIMARY_NAVIGATION,
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

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileNavigationDrawer({
  open,
  onClose,
  pathname,
  totalCount,
  triggerRef,
}: MobileNavigationDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousPath = useRef(pathname);
  const [expandedGroups, setExpandedGroups] = useState<
    Record<NavigationGroupId, boolean>
  >({ products: true, resources: false });
  const activeId = getActiveNavigationId(pathname);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      onClose();
    }
  }, [onClose, pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        window.requestAnimationFrame(() => triggerRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = [
        ...(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
      ].filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open, triggerRef]);

  if (!open) return null;

  const closeAndReturnFocus = () => {
    onClose();
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <div
      className="fixed inset-0 z-[60] xl:hidden"
      onMouseDown={(event) => {
        if (
          event.target instanceof Node &&
          !panelRef.current?.contains(event.target)
        ) {
          closeAndReturnFocus();
        }
      }}
    >
      <div className="absolute inset-0 bg-brand-charcoal/35 backdrop-blur-sm" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className="absolute inset-y-0 left-0 z-10 flex w-[min(90vw,24rem)] flex-col overflow-y-auto bg-white px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-brand-charcoal/10 pb-4">
          <p className="text-base font-bold text-brand-charcoal">
            O&apos;range Textile
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={closeAndReturnFocus}
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-full text-brand-charcoal transition hover:bg-brand-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 py-4">
          {PRIMARY_NAVIGATION.map((section) => {
            const active = activeId === section.id;

            if (section.kind === "link") {
              return (
                <Link
                  key={section.id}
                  href={section.href}
                  aria-current={active ? "page" : undefined}
                  onClick={onClose}
                  className={`my-1 flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange ${
                    active
                      ? "border-l-4 border-brand-orange bg-brand-soft text-brand-charcoal"
                      : "text-brand-charcoal/75 hover:bg-brand-cream"
                  }`}
                >
                  {section.label}
                </Link>
              );
            }

            const expanded = expandedGroups[section.id];
            const panelId = `mobile-${section.id}-menu`;

            return (
              <div key={section.id} className="my-1">
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() =>
                    setExpandedGroups((current) => ({
                      ...current,
                      [section.id]: !current[section.id],
                    }))
                  }
                  className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange ${
                    active
                      ? "border-l-4 border-brand-orange bg-brand-soft text-brand-charcoal"
                      : "text-brand-charcoal/75 hover:bg-brand-cream"
                  }`}
                >
                  {section.label}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform motion-reduce:transition-none ${
                      expanded ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
                <div id={panelId} hidden={!expanded} className="ml-3 border-l border-brand-charcoal/10 py-1 pl-3">
                  {section.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onClose}
                      className="flex min-h-11 items-center rounded-lg px-3 text-sm text-brand-charcoal/70 hover:bg-brand-cream hover:text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3 border-t border-brand-charcoal/10 pt-4">
          <Link
            href={INQUIRY_HREF}
            onClick={onClose}
            className="flex min-h-11 items-center justify-between rounded-xl border border-brand-charcoal/10 px-4 text-sm font-semibold text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" aria-hidden />
              Inquiry cart
            </span>
            {totalCount > 0 ? (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand-charcoal">
                {totalCount}
              </span>
            ) : null}
          </Link>
          <Link
            href={INQUIRY_HREF}
            onClick={onClose}
            className="flex min-h-11 items-center justify-center rounded-xl bg-brand-orange px-4 text-sm font-bold text-white shadow-lg shadow-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
          >
            Request a Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the focused tests and type checker**

Run:

```powershell
node --test tests/navigation.test.mjs
npm.cmd run typecheck
```

Expected: navigation tests PASS and TypeScript exits with code 0.

- [ ] **Step 5: Commit the mobile drawer**

```powershell
git add -- components/ui/MobileNavigationDrawer.tsx tests/navigation.test.mjs
git commit -m "feat: add mobile navigation drawer"
```

## Task 4: Integrate the New Global Header

**Files:**

- Modify: `tests/navigation.test.mjs`
- Modify: `components/ui/Navbar.tsx`
- Modify: `components/AppShell.tsx`
- Modify: `lib/i18n.ts`
- Test: `tests/navigation.test.mjs`
- Test: `tests/landing-pages.test.mjs`

- [ ] **Step 1: Add the failing global-header integration test**

Append to `tests/navigation.test.mjs`:

```js
test("global header composes the approved desktop and mobile journeys", async () => {
  const navbar = await readFile(
    new URL("../components/ui/Navbar.tsx", import.meta.url),
    "utf8"
  );
  const shell = await readFile(
    new URL("../components/AppShell.tsx", import.meta.url),
    "utf8"
  );
  const i18n = await readFile(
    new URL("../lib/i18n.ts", import.meta.url),
    "utf8"
  );

  assert.match(navbar, /DesktopNavigation/);
  assert.match(navbar, /MobileNavigationDrawer/);
  assert.match(navbar, /O&apos;range Textile/);
  assert.match(navbar, /aria-label="Open menu"/);
  assert.match(navbar, /INQUIRY_HREF/);
  assert.match(navbar, /ShoppingCart/);
  assert.doesNotMatch(navbar, /Layers3|Package|Ruler/);
  assert.doesNotMatch(navbar, /const\s+navItems\s*=/);
  assert.match(shell, /className="h-16 shrink-0"/);
  assert.doesNotMatch(shell, /h-\[7\.5rem\]/);
  assert.match(i18n, /navCtaInquiry:\s*"Request a quote"/);
});
```

- [ ] **Step 2: Run the integration test and verify it fails**

Run:

```powershell
node --test tests/navigation.test.mjs
```

Expected: FAIL because `Navbar.tsx`, `AppShell.tsx`, and `lib/i18n.ts` still contain the old two-row navigation.

- [ ] **Step 3: Replace `Navbar.tsx` with the new global composition**

Replace `components/ui/Navbar.tsx` with:

```tsx
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
import { ArrowRight, Menu, ShoppingCart } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { useInquiryCart } from "@/components/InquiryCartProvider";
import { OrangeMark } from "@/components/OrangeMark";
import { DesktopNavigation } from "@/components/ui/DesktopNavigation";
import { MobileNavigationDrawer } from "@/components/ui/MobileNavigationDrawer";
import {
  INQUIRY_HREF,
  getActiveNavigationId,
} from "@/lib/navigation";

function BrandLink({ pathname }: { pathname: string }) {
  const isHome = getActiveNavigationId(pathname) === "home";

  return (
    <Link
      href="/"
      aria-label="O'range Textile home"
      aria-current={isHome ? "page" : undefined}
      className="group flex min-w-0 items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-soft bg-white shadow-sm transition-transform group-hover:scale-105 motion-reduce:transition-none">
        <OrangeMark className="h-8 w-8" aria-hidden />
      </span>
      <span className="truncate text-sm font-bold tracking-tight text-brand-charcoal sm:text-base">
        O&apos;range Textile
      </span>
    </Link>
  );
}

function NavbarContent() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { totalCount } = useInquiryCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 motion-reduce:transition-none ${
          isScrolled
            ? "bg-white/90 shadow-lg shadow-gray-200/20 backdrop-blur-xl"
            : "border-b border-gray-100 bg-white"
        }`}
        aria-label={t("navAria")}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-navigation-drawer"
            onClick={() => setDrawerOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brand-charcoal transition hover:bg-brand-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange xl:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>

          <BrandLink pathname={pathname} />
          <DesktopNavigation pathname={pathname} />

          <div className="ml-auto hidden shrink-0 items-center gap-2 xl:flex">
            <Link
              href={INQUIRY_HREF}
              className="group relative flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
              aria-label={t("navCartAria")}
            >
              <ShoppingCart
                className="h-5 w-5 transition-transform group-hover:scale-110 motion-reduce:transition-none"
                aria-hidden
              />
              {totalCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange px-1 text-xs font-bold text-white shadow-sm">
                  {totalCount}
                </span>
              ) : null}
            </Link>
            <Link
              href={INQUIRY_HREF}
              className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-orange px-5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
            >
              {t("navCtaInquiry")}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
                aria-hidden
              />
            </Link>
          </div>

          <Link
            href={INQUIRY_HREF}
            className="ml-auto inline-flex min-h-11 shrink-0 items-center rounded-full bg-brand-orange px-3 text-xs font-bold text-white shadow-md shadow-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 sm:px-4 sm:text-sm xl:hidden"
          >
            Quote
          </Link>
        </div>
      </nav>

      <div id="mobile-navigation-drawer">
        <MobileNavigationDrawer
          open={drawerOpen}
          onClose={closeDrawer}
          pathname={pathname}
          totalCount={totalCount}
          triggerRef={menuButtonRef}
        />
      </div>
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
```

- [ ] **Step 4: Reduce the application header spacer to one row**

In `components/AppShell.tsx`, replace:

```tsx
      <div className="h-[7.5rem] shrink-0 sm:h-16" aria-hidden />
```

with:

```tsx
      <div className="h-16 shrink-0" aria-hidden />
```

- [ ] **Step 5: Align the existing translated CTA label**

In `lib/i18n.ts`, replace:

```ts
  navCtaInquiry: "Request samples",
```

with:

```ts
  navCtaInquiry: "Request a quote",
```

Because `zh` and `en` both currently use `englishMessages`, this single source update keeps the existing locale architecture consistent.

- [ ] **Step 6: Run focused and full static tests**

Run:

```powershell
node --test tests/navigation.test.mjs tests/landing-pages.test.mjs
npm.cmd test
npm.cmd run lint
npm.cmd run typecheck
```

Expected:

- navigation and landing-page tests PASS;
- the complete Node test suite has zero failures;
- lint exits with code 0;
- TypeScript exits with code 0.

- [ ] **Step 7: Commit the integrated header**

```powershell
git add -- components/ui/Navbar.tsx components/AppShell.tsx lib/i18n.ts tests/navigation.test.mjs
git commit -m "feat: integrate buyer-journey site header"
```

## Task 5: Extend Final-HTML Navigation Verification

**Files:**

- Modify: `tests/site-seo-integration.test.mjs`
- Modify: `scripts/validate-production-seo.mjs`
- Test: `tests/site-seo-integration.test.mjs`

- [ ] **Step 1: Add the failing production-audit wiring test**

In the existing `production SEO audit is an automated package workflow` test in `tests/site-seo-integration.test.mjs`, add:

```js
  assert.match(validator, /NAVIGATION_DISCOVERY_HREFS/);
  assert.match(validator, /navigationLinksPresent/);
  assert.match(validator, /missing navigation links/);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```powershell
node --test tests/site-seo-integration.test.mjs
```

Expected: FAIL because the production validator does not yet inspect navigation links.

- [ ] **Step 3: Import the approved navigation destinations**

At the top of `scripts/validate-production-seo.mjs`, after the SEO import, add:

```js
import { NAVIGATION_DISCOVERY_HREFS } from "../lib/navigation.ts";
```

- [ ] **Step 4: Collect and verify navigation links for every page**

Inside the page loop, immediately after:

```js
    const imageTags = collectTags(html, "img");
```

add:

```js
    const anchorHrefs = collectTags(html, "a")
      .map((tag) => getAttribute(tag, "href"))
      .filter((href) => href !== null);
    const missingNavigationLinks = NAVIGATION_DISCOVERY_HREFS.filter(
      (href) => !anchorHrefs.includes(href)
    );
    const navigationLinksPresent = missingNavigationLinks.length === 0;
```

Immediately after the image-alt failure check, add:

```js
    if (!navigationLinksPresent) {
      failures.push(
        `missing navigation links: ${missingNavigationLinks.join(", ")}`
      );
    }
```

In the successful `pageResults.push` object, immediately after `imageAltResult`, add:

```js
      navigationLinksPresent,
      missingNavigationLinks,
```

In the inaccessible `pageResults.push` object, immediately after `imageAltResult`, add:

```js
      navigationLinksPresent: false,
      missingNavigationLinks: [...NAVIGATION_DISCOVERY_HREFS],
```

- [ ] **Step 5: Run the focused test**

Run:

```powershell
node --test tests/site-seo-integration.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit the validator and regression test**

```powershell
git add -- scripts/validate-production-seo.mjs tests/site-seo-integration.test.mjs
git commit -m "test: verify navigation in production HTML"
```

- [ ] **Step 7: Build and run the complete production HTML audit**

Run:

```powershell
npm.cmd run build
npm.cmd run test:seo:production
```

Expected:

```text
Total: 29
Checked: 29
Passed: 29
Failed: 0
Unchecked: 0
Inaccessible: 0
```

Open `reports/seo/production-html-audit.json` and confirm every page contains:

```json
{
  "navigationLinksPresent": true,
  "missingNavigationLinks": []
}
```

- [ ] **Step 8: Commit the production audit evidence**

```powershell
git add -- reports/seo/production-html-audit.json
git commit -m "test: record navigation production audit"
```

## Task 6: Verify Real Browser Behaviour and Responsive Layout

**Files:**

- Modify only if verification reveals a defect:
  - `components/ui/Navbar.tsx`
  - `components/ui/DesktopNavigation.tsx`
  - `components/ui/MobileNavigationDrawer.tsx`
  - `components/AppShell.tsx`
  - `tests/navigation.test.mjs`
- Test: production server and browser

- [ ] **Step 1: Start the already-built production site**

Run in a persistent terminal:

```powershell
npm.cmd run start -- -p 3211
```

Expected:

```text
Ready
```

Use `http://127.0.0.1:3211` for every browser check so verification observes production output rather than development-only behaviour.

- [ ] **Step 2: Verify desktop navigation at 1440 by 900**

Open `/` at 1440 × 900 and verify:

- Orange mark and `O'range Textile` are visible;
- `Products`, `Custom Development`, `Resources`, and `About` fit on one row;
- inquiry cart and `Request a quote` remain visible;
- Products opens seven approved entries;
- Resources opens four approved entries;
- opening Resources closes Products;
- clicking outside closes the open menu;
- focus indicators are visible;
- `Escape` closes the menu and returns focus to its trigger;
- no dropdown is clipped by the viewport;
- the browser console has no navigation-related error.

Expected: all checks pass.

- [ ] **Step 3: Verify the breakpoint at 1024 and 768 widths**

Open `/fabrics/interlock-fabric` at 1024 × 900 and `/blog/what-is-double-knit-fabric` at 768 × 900.

Verify:

- the hamburger pattern is used whenever the desktop labels cannot fit;
- the mobile header remains one row;
- no control overlaps the wordmark or Quote action;
- Products is visibly active on the fabric page;
- Resources is visibly active on the guide page;
- page content starts below the 64 px fixed header.

Expected: all checks pass.

- [ ] **Step 4: Verify the mobile drawer at 390 by 844**

Open `/` at 390 × 844 and verify:

- the header shows hamburger, Orange mark, `O'range Textile`, and `Quote`;
- the old three product icons and second full-width header CTA are absent;
- opening the drawer moves focus to Close;
- Products is expanded and Resources is collapsed initially;
- both accordions toggle using keyboard input;
- Tab and Shift+Tab remain inside the drawer;
- background scrolling is locked while the drawer is open;
- `Escape`, backdrop, close button, and a selected route each close the drawer;
- focus returns to the hamburger after non-route dismissal;
- the full-width drawer CTA remains above the fixed `BottomNav`;
- `BottomNav` still exposes Home, Fabrics, Inquiry, and Contact.

Expected: all checks pass.

- [ ] **Step 5: Verify inquiry and cart continuity**

On `/fabrics`, add a fabric to the inquiry cart, reopen the navigation, and verify:

- the desktop cart badge or mobile drawer count reports the selected-item count;
- the cart control reaches `/fabrics#inquiry-form`;
- `Quote` and `Request a quote` reach `/fabrics#inquiry-form`;
- a zero-count state renders no empty badge.

Expected: all checks pass.

- [ ] **Step 6: Add a regression test before correcting any discovered defect**

If a defect is found, first add the smallest failing assertion to `tests/navigation.test.mjs`, then run:

```powershell
node --test tests/navigation.test.mjs
```

Expected: FAIL for the observed defect.

Apply the smallest fix in the responsible component, then rerun:

```powershell
node --test tests/navigation.test.mjs
npm.cmd run lint
npm.cmd run typecheck
```

Expected: all commands pass.

- [ ] **Step 7: Commit browser-verification fixes only when files changed**

```powershell
git add -- components/ui/Navbar.tsx components/ui/DesktopNavigation.tsx components/ui/MobileNavigationDrawer.tsx components/AppShell.tsx tests/navigation.test.mjs
git diff --cached --quiet
```

If the second command reports staged changes, commit:

```powershell
git commit -m "fix: resolve responsive navigation findings"
```

If it reports no staged changes, do not create an empty commit.

## Task 7: Run the Final Regression Gate and Prepare the Push

**Files:**

- Verify: all files changed by Tasks 1–6
- Preserve: `docs/superpowers/plans/2026-07-19-vercel-domain-migration.md`
- Preserve: `tmp/`

- [ ] **Step 1: Confirm the change set is scoped**

Run:

```powershell
git status --short
git diff --stat b2ec54b..HEAD
git diff --check b2ec54b..HEAD
```

Expected:

- only the planned navigation, test, audit, and generated audit-report files are committed;
- the pre-existing untracked domain-migration plan and `tmp/` remain unmodified and uncommitted;
- `git diff --check` emits no whitespace error.

- [ ] **Step 2: Run the complete automated gate from the final source state**

Run:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run test:seo:production
```

Expected:

- lint exits with code 0;
- TypeScript exits with code 0;
- all Node tests pass;
- production build succeeds;
- production audit reports 29 total, 29 checked, 29 passed, 0 failed, 0 unchecked, and 0 inaccessible.

- [ ] **Step 3: Review the final production audit evidence**

Run:

```powershell
node -e "const r=require('./reports/seo/production-html-audit.json'); console.log(r.summary); console.log(r.pages.every(p=>p.navigationLinksPresent && p.missingNavigationLinks.length===0));"
```

Expected:

```text
{
  total: 29,
  checked: 29,
  passed: 29,
  failed: 0,
  unchecked: 0,
  inaccessible: 0
}
true
```

- [ ] **Step 4: Perform the required implementation review**

Use the `requesting-code-review` skill against the complete navigation change set. Resolve every correctness, accessibility, SEO, and responsive-layout finding before continuing. For each accepted finding, add a failing regression test first, apply the fix, and rerun the complete automated gate.

Expected: no unresolved high- or medium-severity finding.

- [ ] **Step 5: Commit the refreshed audit report when verification changed it**

Run:

```powershell
git add -- reports/seo/production-html-audit.json
git diff --cached --quiet
```

If the second command reports staged changes, commit:

```powershell
git commit -m "test: finalize navigation production audit"
```

If it reports no staged changes, do not create an empty commit.

- [ ] **Step 6: Record the final commit and push only the verified state**

Run:

```powershell
git log --oneline -6
git status --short
git push origin main
```

Expected:

- the navigation commits appear after design commit `b2ec54b`;
- only the two preserved pre-existing untracked paths remain in `git status`;
- `origin/main` advances to the final verified commit.

## Completion Evidence

The implementation is complete only when the handoff reports all of the following:

- exact final commit hash pushed to `origin/main`;
- changed-file list;
- desktop and mobile browser verification results;
- Products and Resources menu interaction results;
- focus trap, `Escape`, outside dismissal, focus return, and body-scroll-lock results;
- inquiry cart and quotation-route results;
- lint result;
- TypeScript result;
- complete Node test count and result;
- production build result;
- production SEO audit result showing 29/29 PASS;
- confirmation that all approved navigation destinations appear in every page's final HTML;
- confirmation that every public page still has exactly one H1;
- confirmation that no title, description, canonical, sitemap, image-alt, or indexability regression was introduced;
- explicit list of any unfinished item and its reason, or `None`.
