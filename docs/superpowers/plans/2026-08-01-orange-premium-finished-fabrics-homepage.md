# O'range Premium Finished Fabrics Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the O'range homepage around premium finished knit and woven fabrics while preserving dedicated product-page keyword ownership and the existing UI.

**Architecture:** Keep the unified SEO registry as the source of Title, Description and H1; keep `content/landing-pages.ts` as the source of visible landing content; and keep `lib/geo-content.ts` as the source of machine-readable company facts and schema. Update tests first so the new broad category ownership and evidence boundaries are enforced before production copy changes.

**Tech Stack:** Next.js 14, React, TypeScript, Node test runner, Tailwind CSS.

---

### Task 1: Lock The New Homepage Contract

**Files:**
- Modify: `tests/landing-pages.test.mjs`
- Modify: `tests/site-seo-registry.test.mjs`

- [ ] **Step 1: Replace the old double-knit-only expectations**

Assert that the homepage uses `finished fabric supplier`, renders the approved broad H1, includes both `finished knit` and `finished woven`, publishes the two approved philosophy sentences, and retains a contextual route to `/finished-double-knit-fabrics`.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `node --test tests/landing-pages.test.mjs tests/site-seo-registry.test.mjs`

Expected: FAIL because the current homepage still owns `double knit fabric` and lacks woven/philosophy content.

### Task 2: Update The Unified SEO Registry

**Files:**
- Modify: `lib/seo/site-seo.ts`

- [ ] **Step 1: Reassign homepage keyword ownership**

Set the homepage primary keyword to `finished fabric supplier`; use `Finished Fabric Supplier for Premium Global Apparel Sourcing` as H1; and write a unique title and 160-300 character description covering finished knit, finished woven, development, samples, and RFQ action.

- [ ] **Step 2: Preserve double-knit ownership**

Keep `/finished-double-knit-fabrics` as the dedicated double-knit commercial page and ensure no primary/secondary keyword collision is introduced.

### Task 3: Replace Visible Homepage Positioning

**Files:**
- Modify: `content/landing-pages.ts`
- Modify: `components/geo/GeoHomePage.tsx`

- [ ] **Step 1: Rewrite the hero content**

Replace the double-knit-only eyebrow, summary and alt text with premium finished knit-and-woven sourcing language grounded in the supplied catalogues.

- [ ] **Step 2: Add the approved philosophy**

Use the existing advantages/content section to render the approved two-sentence philosophy without changing the section layout.

- [ ] **Step 3: Rebuild the three buyer routes**

Expose finished knit fabrics, finished woven fabrics, and custom fabric development as distinct cards. Keep links on existing stable routes and retain a contextual link to the double-knit category.

- [ ] **Step 4: Generalize visible catalogue labels**

Replace homepage-only labels such as `Featured knit fabrics` where they incorrectly imply the company sells only knit fabrics. Do not rename dedicated knit catalogue pages.

### Task 4: Align Entity Facts And Structured Data

**Files:**
- Modify: `lib/geo-content.ts`
- Modify: `CONTEXT.md`

- [ ] **Step 1: Expand the public company profile**

Describe O'range as a premium finished knit and woven fabric sourcing and development business. Add verified high-level knit and woven families while keeping catalogue caveats.

- [ ] **Step 2: Update machine-readable descriptions**

Align website description, Organization `knowsAbout`, homepage ItemList naming, entity facts, and FAQ answers with the approved scope.

- [ ] **Step 3: Update project context**

Record the knit-and-woven business boundary so future work does not regress to knit-only positioning.

### Task 5: Verify And Prepare The Branch

**Files:**
- Verify: all changed files

- [ ] **Step 1: Run focused tests**

Run: `node --test tests/landing-pages.test.mjs tests/site-seo-registry.test.mjs`

Expected: PASS.

- [ ] **Step 2: Run the complete local suite**

Run: `npm.cmd test`

Expected: 0 failures.

- [ ] **Step 3: Run static and production checks**

Run: `npm.cmd run lint`, `npm.cmd run typecheck`, and `npm.cmd run build`.

Expected: each command exits 0.

- [ ] **Step 4: Scan for sensitive information**

Scan tracked changes for credentials, tokens, cookies, sessions, private keys, and the previously supplied Firecrawl key pattern.

Expected: 0 credible secret findings.

- [ ] **Step 5: Review the final diff and commit**

Confirm that navigation, layout, CSS, public URLs, and dedicated double-knit pages were not unintentionally changed. Commit the approved homepage repositioning to `codex/orange-premium-finished-fabrics`.
