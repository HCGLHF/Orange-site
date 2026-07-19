# O'range Textile Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the inventory navigation state and add four distinct, manually editable buyer-facing landing pages without merging into `main` before review.

**Architecture:** Keep the existing catalog and inquiry systems. Move stock-state resolution into a pure helper, centralize manually authored landing copy in one typed registry, and compose four pages from a small set of landing components while preserving page-specific reading order.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Node test runner, Lucide icons, existing inquiry providers.

---

## File Structure

- Create `content/landing-pages.ts`: private editor notes plus public copy for four landing pages.
- Create `lib/landing-page-content.ts`: types and a getter that strips editor-only fields.
- Create `lib/landing-page-schema.ts`: visible-content-aligned schema builders.
- Create `lib/fabric-filter-state.ts`: pure stock-query resolver.
- Create `components/landing/LandingHero.tsx`: full-width image-led hero.
- Create `components/landing/LandingProofStrip.tsx`: verified proof facts.
- Create `components/landing/LandingRouteChooser.tsx`: homepage buyer-intent routing.
- Create `components/landing/LandingCtaBand.tsx`: sample and RFQ actions.
- Create `components/landing/ReadyStockLanding.tsx`: availability content plus catalog.
- Create `components/landing/CustomDevelopmentLanding.tsx`: brief and process page.
- Create `app/ready-stock-knit-fabrics/page.tsx`: ready-stock route and metadata.
- Create `app/custom-knit-fabric-development/page.tsx`: custom-development route and metadata.
- Modify `components/FabricFilter.tsx`: reset from URL and accept a route default.
- Modify `components/FabricsCatalog.tsx`: pass the route default and show stable results.
- Modify `components/FabricsPageIntro.tsx`: visible state-specific heading and summary.
- Modify `components/geo/GeoHomePage.tsx`: human-first homepage order.
- Modify `components/finished-fabric/FinishedFabricPage.tsx`: image-led hub hero only.
- Modify `app/sitemap.ts` and `app/llms.txt/route.ts`: publish discovery routes.
- Create `tests/landing-pages.test.mjs`: regression and content-boundary gates.

### Task 1: Reproduce And Fix Inventory State

**Files:**
- Create: `lib/fabric-filter-state.ts`
- Modify: `components/FabricFilter.tsx`
- Modify: `components/FabricsCatalog.tsx`
- Modify: `components/FabricsPageIntro.tsx`
- Test: `tests/landing-pages.test.mjs`

- [ ] **Step 1: Write the failing stock-state test**

```js
test("stock navigation resolves every URL state including all fabrics", async () => {
  const { resolveStockFilter } = await import("../lib/fabric-filter-state.ts");
  assert.equal(resolveStockFilter("in-stock", "all"), "in-stock");
  assert.equal(resolveStockFilter("preorder", "all"), "preorder");
  assert.equal(resolveStockFilter(null, "all"), "all");
  assert.equal(resolveStockFilter("unsupported", "all"), "all");
  assert.equal(resolveStockFilter(null, "in-stock"), "in-stock");
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm.cmd test`

Expected: FAIL because `lib/fabric-filter-state.ts` does not exist.

- [ ] **Step 3: Implement the pure resolver**

```ts
export type StockFilter = "all" | "in-stock" | "preorder" | "out-of-stock";

const supported = new Set<StockFilter>([
  "all",
  "in-stock",
  "preorder",
  "out-of-stock",
]);

export function resolveStockFilter(
  raw: string | null,
  fallback: StockFilter = "all"
): StockFilter {
  if (!raw || !supported.has(raw as StockFilter)) return fallback;
  return raw as StockFilter;
}
```

- [ ] **Step 4: Make the component URL-driven**

Add `defaultStock?: StockFilter` to `FabricsCatalog` and `FabricFilter`. In `FabricFilter`, replace the conditional query effect with:

```ts
useEffect(() => {
  const stock = resolveStockFilter(searchParams.get("stock"), defaultStock);
  setActiveFilters((previous) =>
    previous.stock === stock ? previous : { ...previous, stock }
  );
}, [defaultStock, searchParams]);
```

Use the same resolver in `FabricsPageIntro` to render unique copy for stock, preorder, and all states.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `npm.cmd test`

Expected: all tests pass.

### Task 2: Add The Manual Content Registry

**Files:**
- Create: `content/landing-pages.ts`
- Create: `lib/landing-page-content.ts`
- Test: `tests/landing-pages.test.mjs`

- [ ] **Step 1: Write the failing registry tests**

```js
test("landing registry exposes four unique buyer purposes", async () => {
  const { getPublicLandingPage, landingPageKeys } = await import(
    "../lib/landing-page-content.ts"
  );
  assert.deepEqual(landingPageKeys, [
    "home",
    "readyStock",
    "finishedDoubleKnit",
    "customDevelopment",
  ]);
  const pages = landingPageKeys.map(getPublicLandingPage);
  assert.equal(new Set(pages.map((page) => page.headline)).size, 4);
  assert.equal(new Set(pages.map((page) => page.purpose)).size, 4);
  assert.ok(pages.every((page) => !("editorNotes" in page)));
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm.cmd test`

Expected: FAIL because the registry modules do not exist.

- [ ] **Step 3: Define private and public content types**

```ts
export type LandingPageKey =
  | "home"
  | "readyStock"
  | "finishedDoubleKnit"
  | "customDevelopment";

export type LandingPageRecord = {
  purpose: string;
  eyebrow: string;
  headline: string;
  summary: string;
  heroImage: { src: string; alt: string };
  proofPoints: Array<{ label: string; value: string; enabled: boolean }>;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  editorNotes: string[];
};

export type PublicLandingPage = Omit<LandingPageRecord, "editorNotes">;
```

- [ ] **Step 4: Populate evidence-bounded initial content**

Use current production facts for the public values. Keep manual guidance inside `editorNotes`. Return public copies with destructuring:

```ts
export function getPublicLandingPage(key: LandingPageKey): PublicLandingPage {
  const { editorNotes: _editorNotes, ...publicContent } = landingPages[key];
  return publicContent;
}
```

- [ ] **Step 5: Run tests and verify GREEN**

Run: `npm.cmd test`

Expected: registry tests pass and editor notes are absent from public records.

### Task 3: Build Shared Landing Components And Homepage

**Files:**
- Create: `components/landing/LandingHero.tsx`
- Create: `components/landing/LandingProofStrip.tsx`
- Create: `components/landing/LandingRouteChooser.tsx`
- Create: `components/landing/LandingCtaBand.tsx`
- Modify: `components/geo/GeoHomePage.tsx`
- Test: `tests/landing-pages.test.mjs`

- [ ] **Step 1: Write failing source-contract tests**

```js
test("homepage uses human-first landing components", () => {
  const source = readFileSync(path.join(root, "components/geo/GeoHomePage.tsx"), "utf8");
  assert.match(source, /LandingHero/);
  assert.match(source, /LandingProofStrip/);
  assert.match(source, /LandingRouteChooser/);
  assert.match(source, /LandingCtaBand/);
  assert.doesNotMatch(source, /Entity facts for AI search/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm.cmd test`

Expected: FAIL because the components are not used.

- [ ] **Step 3: Implement the components**

`LandingHero` renders a full-width background image with readable overlay, H1, summary, and two CTAs. `LandingProofStrip` renders only enabled proof points. `LandingRouteChooser` links to the three non-home landing routes. `LandingCtaBand` wires the sample action to `SampleRequestCta` and the RFQ action to `/fabrics#inquiry-form`.

- [ ] **Step 4: Refactor the homepage order**

Use `getPublicLandingPage("home")`, then render hero, proof, route chooser, selected capability evidence, finished-fabric categories, current fabrics, FAQ, and CTA. Retain existing structured data and contact components, but remove visible machine-oriented labels such as `Entity facts for AI search`.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `npm.cmd test`

Expected: all homepage contract tests pass.

### Task 4: Add Ready-stock And Custom-development Routes

**Files:**
- Create: `components/landing/ReadyStockLanding.tsx`
- Create: `components/landing/CustomDevelopmentLanding.tsx`
- Create: `app/ready-stock-knit-fabrics/page.tsx`
- Create: `app/custom-knit-fabric-development/page.tsx`
- Create: `lib/landing-page-schema.ts`
- Test: `tests/landing-pages.test.mjs`

- [ ] **Step 1: Write failing route tests**

```js
test("buyer landing routes exist and reuse inquiry behavior", () => {
  for (const route of [
    "app/ready-stock-knit-fabrics/page.tsx",
    "app/custom-knit-fabric-development/page.tsx",
  ]) {
    assert.ok(existsSync(path.join(root, route)), `${route} must exist`);
  }
  const ready = readFileSync(
    path.join(root, "components/landing/ReadyStockLanding.tsx"),
    "utf8"
  );
  assert.match(ready, /defaultStock="in-stock"/);
  const custom = readFileSync(
    path.join(root, "components/landing/CustomDevelopmentLanding.tsx"),
    "utf8"
  );
  assert.match(custom, /SampleRequestCta/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm.cmd test`

Expected: FAIL because the new routes do not exist.

- [ ] **Step 3: Implement the ready-stock page**

Compose the manual hero, proof strip, current stock note, `FabricsCatalog` with `defaultStock="in-stock"`, buyer checklist, FAQ, and CTA. Use an empty-catalog fallback rather than a guaranteed dispatch claim.

- [ ] **Step 4: Implement the custom-development page**

Compose the manual hero, required input checklist, four-step process, capability boundaries, FAQ, and existing sample/RFQ actions. Build Service, FAQ, and breadcrumb schema from visible content only.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `npm.cmd test`

Expected: new route tests pass.

### Task 5: Refine The Finished-fabric Hub And Discovery

**Files:**
- Modify: `components/finished-fabric/FinishedFabricPage.tsx`
- Modify: `app/sitemap.ts`
- Modify: `app/llms.txt/route.ts`
- Test: `tests/landing-pages.test.mjs`

- [ ] **Step 1: Write failing discovery tests**

```js
test("landing routes are discoverable", () => {
  const sitemap = readFileSync(path.join(root, "app/sitemap.ts"), "utf8");
  const llms = readFileSync(path.join(root, "app/llms.txt/route.ts"), "utf8");
  for (const route of ["/ready-stock-knit-fabrics", "/custom-knit-fabric-development"]) {
    assert.match(sitemap, new RegExp(route.replaceAll("/", "\\/")));
    assert.match(llms, new RegExp(route.replaceAll("/", "\\/")));
  }
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm.cmd test`

Expected: FAIL because the new routes are absent.

- [ ] **Step 3: Give the hub an image-led landing header**

When `page.kind === "hub"`, render `LandingHero` and a proof strip before the existing selection sections. Product and article pages keep their current detail header.

- [ ] **Step 4: Add discovery entries**

Add both routes to sitemap with weekly change frequency and include them under `Primary pages` in llms.txt. Keep canonical URLs on their page metadata.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `npm.cmd test`

Expected: all discovery and existing finished-fabric tests pass.

### Task 6: Verify The Test Branch And Prepare Preview

**Files:**
- Modify only files required by failures found during verification.

- [ ] **Step 1: Run full local validation**

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
git diff --check
```

Expected: zero test failures, zero lint errors, successful production build, and no whitespace errors.

- [ ] **Step 2: Run sensitive-information scan**

Search tracked changes for password, token, cookie, session, private-key, Semrush, and Firecrawl patterns. Expected: zero credential findings.

- [ ] **Step 3: Run browser QA**

Verify desktop and mobile screenshots for `/`, `/ready-stock-knit-fabrics`, `/finished-double-knit-fabrics`, and `/custom-knit-fabric-development`. Click all three inventory links and confirm the title, active state, and result set change correctly.

- [ ] **Step 4: Commit implementation**

```powershell
git add -- app components content lib tests
git commit -m "Add editable Orange landing pages"
```

- [ ] **Step 5: Push only the test branch**

```powershell
git push -u fork codex/orange-landing-pages
```

Expected: the branch is available for preview; `main` remains unchanged.

- [ ] **Step 6: Open a non-draft cross-repository PR without merging**

Target `HCGLHF/Orange-site:main` from `junhao59-rgb:codex/orange-landing-pages`. The PR description must state that landing-page content still requires owner review and manual enrichment before merge.
