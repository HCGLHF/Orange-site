# Orange Catalog Content Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish five catalog-evidence buyer guides and one GEO-oriented knit-fabric Q&A hub using Orange Textiles' existing content registry.

**Architecture:** Add six `article` records to `content/finished-fabrics.json`, reuse the dynamic `/blog/[slug]` route and `FinishedFabricPage`, and add contextual links from relevant category definitions. New tests define the route, evidence, FAQ, internal-link and image requirements before content is written.

**Tech Stack:** Next.js 14, TypeScript, JSON content registry, Node test runner, Next Image, WebP assets.

---

### Task 1: Add Failing Content-Cluster Tests

**Files:**
- Modify: `tests/finished-fabric-content.test.mjs`

- [ ] **Step 1: Add the six expected routes**

Add these exact routes to `requiredRoutes`:

```js
"/blog/air-layer-knit-fabric-sourcing-guide",
"/blog/how-to-source-wool-blend-knit-fabric",
"/blog/jacquard-knit-fabric-weight-and-width-guide",
"/blog/brushed-and-pile-knit-fabric-finishes",
"/blog/how-to-write-a-knit-fabric-rfq",
"/blog/knit-fabric-sourcing-questions",
```

- [ ] **Step 2: Add catalog-evidence assertions**

Require the new page group to contain `GD2515`, `GD2672`, `GD2579`, `GD2683`, `260 GSM`, `300 GSM`, `160 cm`, `160-165 cm`, and the phrases `usable width`, `sample approval`, and `commercial confirmation`.

- [ ] **Step 3: Add visual-asset assertions**

Require these files:

```text
air-layer-material-study.webp
wool-blend-material-study.webp
jacquard-knit-material-study.webp
brushed-pile-knit-finishes.webp
knit-fabric-rfq-specification.webp
```

- [ ] **Step 4: Run the test and verify RED**

Run:

```powershell
npm test -- tests/finished-fabric-content.test.mjs
```

Expected: FAIL because the six routes and five visual assets do not exist.

### Task 2: Create Publication Visuals

**Files:**
- Create: `public/images/finished-fabrics/air-layer-material-study.webp`
- Create: `public/images/finished-fabrics/wool-blend-material-study.webp`
- Create: `public/images/finished-fabrics/jacquard-knit-material-study.webp`
- Create: `public/images/finished-fabrics/brushed-pile-knit-finishes.webp`
- Create: `public/images/finished-fabrics/knit-fabric-rfq-specification.webp`

- [ ] **Step 1: Generate five 16:9 textile sourcing images**

Use realistic textile photography with inspectable swatches, neutral daylight, no text overlay, no logos, no certificates and no product-code labels.

- [ ] **Step 2: Convert and optimize**

Save each asset as WebP at approximately 1600 by 900 pixels and keep each file reasonably compressed for web delivery.

- [ ] **Step 3: Inspect all five assets**

Confirm that fabric detail is visible, compositions are not visually misrepresented, no text artifacts appear, and each topic has a distinct scene.

### Task 3: Add the Six Publishable Articles

**Files:**
- Modify: `content/finished-fabrics.json`

- [ ] **Step 1: Add five buyer guides**

Add article records for air-layer sourcing, wool-blend sourcing, jacquard specification, brushed/pile finishes and RFQ preparation. Each record uses the existing `FinishedFabricPage` shape and must contain:

```text
kind: article
unique url/title/description/h1/opening
published and updated dates
reviewer
three or more substantive sections
three or more page-specific FAQs
five or more contextual relatedLinks
an inquiry-led evidenceBoundary
```

- [ ] **Step 2: Add the short-answer Q&A hub**

Create `/blog/knit-fabric-sourcing-questions` with grouped sections for supplier capability, specifications, product families, samples, RFQ and commercial confirmation. Keep each FAQ answer direct and concise while the total page content remains above the existing 650-word quality floor.

- [ ] **Step 3: Preserve evidence boundaries**

Do not add fixed price, exact stock quantity, guaranteed MOQ, guaranteed sample timing or guaranteed lead time. Use `confirm by inquiry` where a commercial variable is absent from the approved catalog.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run:

```powershell
npm test -- tests/finished-fabric-content.test.mjs
```

Expected: PASS.

### Task 4: Add Contextual Category Links

**Files:**
- Modify: `lib/public-catalog.ts`

- [ ] **Step 1: Link relevant category pages**

Add page-specific related links:

```text
scuba-air-layer-fabric -> air-layer sourcing guide
jacquard-knit-fabric -> jacquard specification guide
wool-blend-knit-fabric -> wool-blend sourcing guide
interlock/rib/ponte routes -> RFQ guide or Q&A hub where contextually useful
```

- [ ] **Step 2: Add a regression assertion**

Update `tests/semrush-foundation.test.mjs` so the expected new article URLs must appear in `lib/public-catalog.ts`.

- [ ] **Step 3: Run tests**

Run:

```powershell
npm test
```

Expected: all tests PASS.

### Task 5: Verify Build, Content and Safety

**Files:**
- Verify all changed files

- [ ] **Step 1: Run lint**

```powershell
npm run lint
```

Expected: exit code 0, with no new warnings.

- [ ] **Step 2: Run production build**

```powershell
npm run build
```

Expected: exit code 0 and all six new static blog routes listed.

- [ ] **Step 3: Run repository checks**

```powershell
git diff --check
```

Expected: no output.

- [ ] **Step 4: Scan changed files**

Scan for credentials, API keys, tokens, cookies, sessions, private keys and accidental local paths. Expected sensitive-data matches: 0.

- [ ] **Step 5: Browser QA**

Open the blog index, all six new routes, one relevant category page and the inquiry modal at desktop and mobile widths. Confirm no overlap, broken links, missing images, console errors or horizontal overflow.

### Task 6: Record and Publish the Test Branch

**Files:**
- Modify: `E:\geo\company-memory\index.md`
- Modify: `E:\geo\company-memory\wiki\current-priorities.md`
- Create: `E:\geo\outputs\orangetextiles-seo\catalog-content-cluster-implementation-2026-07-23.md`

- [ ] **Step 1: Record implementation and verification**

Document routes, catalog evidence used, test/build results, publication boundaries and the expected Semrush comparison.

- [ ] **Step 2: Commit**

```powershell
git add docs tests content lib public/images/finished-fabrics
git commit -m "Add catalog-driven knit fabric content cluster"
```

- [ ] **Step 3: Push the fixed branch**

```powershell
git push fork codex/orange-semrush-foundation
```

- [ ] **Step 4: Open or update the pull request**

Use base `HCGLHF/Orange-site:main` and compare `junhao59-rgb/Orange-site:codex/orange-semrush-foundation`. Do not merge until the owner reviews the content and visuals.
