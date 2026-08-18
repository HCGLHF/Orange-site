# Orange Knit-First Homepage Implementation Plan

> **Execution note:** Implement this plan on `codex/orange-knit-home-priority`, based on the current `origin/main`. Preserve woven content and inquiry capability while removing woven products from homepage promotion and homepage SEO positioning.

**Goal:** Make Orange Textiles' homepage and core SEO positioning explicitly knit-first while adding a reliable construction taxonomy that can distinguish knit and woven products.

**Architecture:** Add an explicit `construction` field to the shared `Fabric` model and every catalogue record. Keep the full public catalogue available, but provide pure construction-aware selection helpers so homepage recommendations cannot accidentally include woven records. Update only homepage routes, homepage copy, and homepage SEO; preserve existing woven comparison content, URLs, and inquiry copy.

**Tech Stack:** Next.js, React, TypeScript, JSON content registries, Node test runner.

---

## Task 1: Lock the fabric construction contract

**Files:**
- Modify: `tests/finished-fabric-content.test.mjs`
- Modify: `lib/data.ts`
- Modify: `lib/public-catalog.ts`
- Modify: `content/finished-fabric-catalogue.json`

1. Add failing tests that require every catalogue record to declare `construction` as `knit` or `woven`.
2. Add a failing test for a pure `selectRepresentativeFabricsByConstruction` helper using a mixed knit/woven fixture.
3. Run the targeted test and confirm it fails for the missing field/helper.
4. Add `FabricConstruction = "knit" | "woven"` and require `construction` on `Fabric`.
5. Mark all 104 supplied finished-fabric records as `construction: "knit"` because the source catalogue contains knit products only.
6. Implement the construction-aware representative selector and a knit-only homepage selector.
7. Re-run the targeted test and confirm it passes.

## Task 2: Make homepage promotion knit-only

**Files:**
- Modify: `tests/landing-pages.test.mjs`
- Modify: `app/page.tsx`
- Modify: `components/geo/GeoHomePage.tsx`

1. Add failing assertions that homepage route cards contain no woven promotion and point buyers to knit catalogue/development routes.
2. Add a failing assertion that homepage featured products are selected through the knit-only helper.
3. Run the targeted tests and confirm failure.
4. Pass `getHomepageFeaturedFabrics()` to the homepage.
5. Replace the woven buyer route with a double-knit and specialty-knit route.
6. Remove woven promotion from the selected-article introduction while leaving private woven inquiry support elsewhere unchanged.
7. Re-run the targeted tests and confirm they pass.

## Task 3: Align homepage visible content and SEO

**Files:**
- Modify: `tests/landing-pages.test.mjs`
- Modify: `tests/site-seo-registry.test.mjs`
- Modify: `content/landing-pages.ts`
- Modify: `lib/seo/site-seo.ts`

1. Add failing tests requiring knit-first homepage purpose, summary, proof, keyword map, title, description, and H1.
2. Assert homepage SEO does not include `finished woven fabric supplier`.
3. Run the targeted tests and confirm failure.
4. Rewrite homepage public copy around finished knit fabric supply and development.
5. Change homepage primary keyword to `finished knit fabric supplier` and use knit-led secondary keywords.
6. Keep the homepage keyword unique and preserve existing URL/canonical behavior.
7. Re-run the targeted tests and confirm they pass.

## Task 4: Protect woven capability from accidental removal

**Files:**
- Modify: `tests/landing-pages.test.mjs`
- Modify: `tests/site-seo-registry.test.mjs`

1. Add assertions that `/blog/jacquard-knit-vs-woven-jacquard` remains registered.
2. Add assertions that woven inquiry language remains available outside homepage promotion.
3. Confirm no public URL is removed and no redirect is introduced.

## Task 5: Full verification

1. Run `npm test`.
2. Run `npm run test:components`.
3. Run `npm run typecheck`.
4. Run `npm run lint`.
5. Run `npm run build`.
6. Scan the tracked diff for credentials and unrelated files.
7. Review the final diff, commit only the scoped changes, and report the branch and commit for review.
