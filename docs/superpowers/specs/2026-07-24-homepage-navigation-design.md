# Homepage Navigation Design

**Date:** 2026-07-24  
**Status:** Approved for implementation planning  
**Site:** https://orangetextiles.com  
**Audience:** Global English-speaking B2B fabric buyers, with the United States and Australia as priority markets

## 1. Objective

Replace the crowded global header with a buyer-journey navigation that makes products, custom development, sourcing guides, company information, and quotation actions easy to find on every public page.

The navigation must improve buyer orientation and internal discovery without changing public URLs, duplicating SEO content, removing the existing mobile bottom navigation, or weakening the inquiry flow.

## 2. Selected Approach

The approved approach is a buyer-journey navigation:

- a branded home link;
- a curated `Products` menu;
- a direct `Custom Development` link;
- a curated `Resources` menu;
- a direct `About` link;
- an inquiry-cart control;
- a prominent `Request a Quote` call to action.

This approach was selected over:

- a flat navigation, which becomes crowded as the catalogue and guide clusters grow;
- a two-tier utility navigation, which consumes unnecessary vertical space and adds visual complexity.

The product and resource menus deliberately expose a curated set of high-value routes rather than reproducing the entire site map.

## 3. Information Architecture

### 3.1 Brand

The brand control uses the existing Orange mark with the wordmark `O'range Textile`. The complete control links to `/`.

The wordmark is visible on both desktop and mobile. It must remain legible without consuming the space needed for the primary buyer actions.

### 3.2 Products menu

The desktop `Products` dropdown and mobile `Products` accordion contain these routes in this order:

1. `Ready Stock` → `/ready-stock-knit-fabrics`
2. `Finished Knit Fabrics` → `/fabrics`
3. `Double-Knit Manufacturing` → `/finished-double-knit-fabrics`
4. `Interlock Fabric` → `/fabrics/interlock-fabric`
5. `Ponte Roma Fabric` → `/fabrics/ponte-roma-fabric`
6. `Rib Knit Fabric` → `/fabrics/rib-knit-fabric`
7. `View All Fabrics` → `/fabrics`

`Finished Knit Fabrics` and `View All Fabrics` intentionally share the catalogue destination but serve different menu roles. Automated duplicate-href checks must allow this documented exception while rejecting accidental duplicates elsewhere.

### 3.3 Resources menu

The desktop `Resources` dropdown and mobile `Resources` accordion contain these routes in this order:

1. `What Is Double Knit Fabric?` → `/blog/what-is-double-knit-fabric`
2. `What Is Interlock Fabric?` → `/blog/what-is-interlock-fabric`
3. `What Is Ponte Fabric?` → `/blog/what-is-ponte-fabric`
4. `View All Buyer Guides` → `/blog`

These guides were selected because they support the site's core double-knit topic and the lower-difficulty Interlock and Ponte Roma clusters.

### 3.4 Direct links and actions

- `Custom Development` → `/custom-knit-fabric-development`
- `About` → `/about`
- inquiry cart → `/fabrics#inquiry-form`
- `Request a Quote` → `/fabrics#inquiry-form`

The inquiry cart keeps its current item-count badge and accessible name. `Request a Quote` is the visually dominant header action.

## 4. Desktop Interaction

At the desktop breakpoint, the header is arranged in three zones:

1. brand at the left;
2. primary navigation in the centre;
3. inquiry cart and `Request a Quote` at the right.

`Products` and `Resources` use compact dropdown panels rather than full-width mega menus. Each trigger communicates its expanded state with `aria-expanded` and its popup relationship with appropriate accessible attributes.

Required interaction:

- a pointer or keyboard action opens the selected menu;
- opening one menu closes the other;
- `Escape` closes the open menu and returns focus to its trigger;
- clicking or focusing outside closes the menu;
- menu links have a visible focus indicator;
- selecting a route closes the menu;
- dropdown content remains within the viewport at supported desktop widths.

Hover may enhance pointer use, but the menus must not depend on hover alone.

The sticky-header treatment and existing scrolled visual state are preserved, with spacing and contrast adjusted for the new structure.

## 5. Mobile Interaction

Below the desktop breakpoint, the top bar contains:

1. a hamburger button;
2. the Orange mark and `O'range Textile` wordmark;
3. a compact quotation action.

The current row of individual product icons and the second full-width mobile inquiry button are removed from the top header. Their removal prevents duplication and restores content space.

The hamburger opens a side drawer with:

- `Products` accordion;
- direct `Custom Development` link;
- `Resources` accordion;
- direct `About` link;
- inquiry cart status;
- a full-width `Request a Quote` action.

Required drawer behaviour:

- focus moves into the drawer when it opens;
- keyboard focus is trapped within the open drawer;
- `Escape`, the close button, or the backdrop closes it;
- focus returns to the hamburger after closing;
- page scrolling is locked while open and restored on close;
- a route selection closes the drawer;
- route changes close stale navigation state;
- the drawer respects safe-area insets and does not hide actions behind the fixed bottom navigation.

The existing mobile `BottomNav` remains unchanged with `Home`, `Fabrics`, `Inquiry`, and `Contact`. The top drawer supplies site depth; the bottom navigation preserves high-frequency actions.

## 6. Active-State Rules

Exactly one top-level navigation group appears active for the current route:

- `Products` is active for `/fabrics`, `/ready-stock-knit-fabrics`, `/finished-double-knit-fabrics`, and all `/fabrics/*` routes;
- `Custom Development` is active only for `/custom-knit-fabric-development`;
- `Resources` is active for `/blog` and all `/blog/*` routes;
- `About` is active only for `/about`;
- the brand link represents `/`.

The active state must be visible without relying on colour alone and must not alter layout width.

## 7. Architecture and Data Flow

Navigation content lives in one typed configuration module at `lib/navigation.ts`.

The configuration defines:

- stable item and group identifiers;
- labels;
- destinations;
- optional short descriptions where the visual treatment needs them;
- top-level route-family matching rules;
- the documented `/fabrics` duplicate-destination exception.

Desktop navigation and the mobile drawer consume this shared configuration. They must not maintain separate hard-coded menu lists.

The existing `Navbar` remains the global entry point and owns:

- sticky-header presentation;
- current pathname;
- desktop/mobile composition;
- coordination of open state.

Focused components own one responsibility each:

- desktop navigation and dropdown interaction;
- mobile trigger and drawer interaction;
- shared navigation-link rendering where it meaningfully removes duplication.

The inquiry-cart provider remains the source of cart count. The locale provider continues to supply existing generic navigation and inquiry labels. New English buyer-facing labels may be added to the current locale data rather than embedded in multiple components.

No new runtime dependency is required. Existing React, Next.js, Tailwind CSS, Lucide icons, and utility conventions are sufficient.

## 8. SEO and Content Boundaries

- No public route is added, renamed, redirected, or removed.
- Existing page metadata, H1 values, canonical URLs, schema, sitemap records, and index directives are unchanged.
- Navigation links must be present in server-rendered or statically generated production HTML so crawlers can discover the destination routes without client interaction.
- Menu labels use natural buyer language and do not repeat keyword phrases merely for density.
- The navigation does not create a second page heading; logos, triggers, panels, and drawer titles must not render an `h1`.
- Decorative icons use `aria-hidden`; the brand link and icon-only controls receive explicit accessible names.

## 9. Responsive and Visual Requirements

The navigation retains the site's orange, charcoal, white, and soft-neutral visual system.

It must:

- fit without clipping at 1440 px, 1024 px, 768 px, and 390 px viewport widths;
- avoid overlap with page content, the sticky inquiry treatment, and mobile `BottomNav`;
- preserve a stable header height within each breakpoint;
- use restrained elevation, borders, and motion;
- respect reduced-motion preferences;
- maintain WCAG-appropriate text and focus contrast;
- keep touch targets at least 44 by 44 CSS pixels where practical.

The desktop breakpoint is chosen during implementation based on actual label fit, not assumed from the current `md` breakpoint. If the full desktop navigation does not fit comfortably, the mobile drawer pattern remains active until the next suitable breakpoint.

## 10. Failure and Edge-Case Handling

- JavaScript-disabled production HTML still exposes crawlable navigation links through server-rendered markup.
- A cart count of zero does not render an empty badge.
- Long translated labels wrap or truncate safely without overlapping adjacent controls.
- Repeated clicks on a menu trigger do not create stacked overlays.
- Closing the drawer always restores body scrolling, including component unmount and route change.
- Navigation controls remain operable when animations are disabled.
- Hash navigation to the inquiry form preserves the existing inquiry workflow.

## 11. Testing and Verification

Implementation starts with failing regression tests and then satisfies all of the following.

### 11.1 Configuration tests

- every configured destination is an approved public route or an approved inquiry hash destination;
- every item has a stable identifier, non-empty label, and destination;
- accidental duplicate labels and destinations fail validation;
- the documented `/fabrics` duplicate destination is the only permitted exception;
- Products and Resources contain the approved links in the approved order;
- desktop and mobile components import the same navigation configuration.

### 11.2 Component and interaction verification

- desktop Products and Resources menus open and close correctly;
- only one desktop menu can be open;
- keyboard focus, `Escape`, outside dismissal, and focus return behave as specified;
- the mobile drawer opens, traps focus, locks body scrolling, and closes through every supported path;
- the mobile drawer and fixed `BottomNav` do not overlap essential actions;
- the cart count and quotation destinations remain correct;
- active states match the route-family rules.

Where the existing unit-test stack cannot reliably exercise browser focus and layout behaviour, these checks are performed with browser automation against the production build rather than adding a new testing dependency solely for this feature.

### 11.3 Production verification

Run:

- lint;
- TypeScript checking;
- the complete automated test suite;
- the production build;
- the existing production HTML SEO audit for all 29 public pages.

Inspect rendered production pages at desktop, tablet, and mobile widths. Confirm that:

- all approved navigation links are present in final HTML;
- every public page still has exactly one `h1`;
- no metadata, canonical, sitemap, image-alt, or indexability regression is introduced;
- the header does not clip, overflow, or obscure page content;
- browser console output contains no navigation-related errors.

## 12. Delivery Scope

The implementation plan will cover:

- the typed navigation configuration;
- the redesigned global desktop header;
- the mobile hamburger drawer;
- accessible dropdown and drawer interactions;
- reuse of the existing inquiry-cart state;
- regression tests and production-browser verification;
- documentation of changed files and final validation results.

The work will not include:

- new public pages;
- URL migrations or redirects;
- a full-site visual redesign;
- changes to page SEO assignments or marketing copy;
- changes to the existing mobile bottom-navigation destinations;
- new third-party menu, animation, or accessibility libraries.
