# Homepage Core and Priority Product Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore `double knit fabric` as the homepage category anchor and deepen the four existing priority product pages without creating new URLs or publishing unsupported product claims.

**Architecture:** Keep the unified SEO registry as the source of truth for Title, description and H1. Keep all existing URLs. Enrich the three legacy category pages through their existing `FabricCategory` model and renderer; enrich Interlock through its existing `FinishedFabricPage` record. Reuse shared company evidence and the existing inquiry modal rather than duplicating claims or building another form.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, JSON content registries, Node test runner, existing production SEO audit.

---

## Evidence and content boundaries

- Treat the supplied 49-page A-J catalogue as a historical/draft catalogue source: 104 products across 11 collections, with article-level composition, GSM and width where supplied.
- Do not claim that the catalogue contains a current French Terry, Cotton Jersey, Cotton Spandex Jersey or Interlock article unless an exact article-to-category mapping is separately verified.
- Use the catalogue to establish which fields buyers should confirm, not to invent product-specific ranges.
- Attribute machine evidence to the parent company through `lib/company-evidence.ts`; do not describe the machines as owned by O'range Textile.
- GRS scope documentation belongs to the parent company and does not prove shipment-level certification. Do not turn it into a universal product claim.
- Keep MOQ, lead time, stock, colour, test results and commercial terms as inquiry-specific fields.

## Files in scope

**Homepage**

- Modify: `lib/seo/site-seo.ts`
- Modify: `content/landing-pages.ts`
- Modify: `components/landing/LandingRouteChooser.tsx`
- Modify: `components/geo/GeoHomePage.tsx`
- Modify: `lib/geo-content.ts`
- Test: `tests/site-seo-registry.test.mjs`
- Test: `tests/landing-pages.test.mjs`

**Priority product pages**

- Modify: `lib/public-catalog.ts`
- Modify: `app/fabrics/[slug]/page.tsx`
- Modify: `content/finished-fabrics.json`
- Test: `tests/semrush-foundation.test.mjs`
- Test: `tests/finished-fabric-content.test.mjs`

**Verification**

- Run: `npm test`
- Run: `npm run build`
- Run: `npm run test:seo:production`

---

### Task 1: Lock the homepage keyword contract

**Files:**

- Modify: `tests/site-seo-registry.test.mjs`
- Modify: `tests/landing-pages.test.mjs`

- [ ] **Step 1: Replace the existing homepage keyword assertion with the approved contract**

```js
test("homepage owns the double knit fabric category anchor", async () => {
  const { getPublicPageSeo } = await loadSeo();
  const page = getPublicPageSeo("/");

  assert.equal(page.primaryKeyword, "double knit fabric");
  assert.ok(page.secondaryKeywords.includes("knit fabric supplier"));
  assert.equal(
    page.metaTitle,
    "Double Knit Fabric for Global Apparel Brands | O'range Textile"
  );
  assert.equal(page.h1, "Double Knit Fabric for Global Apparel Sourcing");
  assert.equal(page.searchIntent, "commercial");
  assert.equal(page.targetPageType, "homepage");
});
```

- [ ] **Step 2: Add homepage visible-content assertions**

Add assertions that the `home` record:

```js
assert.match(home.summary, /\bdouble knit fabric\b/i);
assert.match(home.heroImage.alt, /\bdouble knit fabric\b/i);
```

Also assert that the homepage source contains:

```js
assert.match(homePageSource, /double knit fabric sourcing route/i);
assert.match(homePageSource, /\/finished-double-knit-fabrics/);
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
node --test tests/site-seo-registry.test.mjs tests/landing-pages.test.mjs
```

Expected: FAIL because the homepage still assigns `knit fabric supplier` as the primary keyword and the hero/H2 do not contain the exact core phrase.

- [ ] **Step 4: Commit the failing contract**

```bash
git add tests/site-seo-registry.test.mjs tests/landing-pages.test.mjs
git commit -m "test: define double knit homepage contract"
```

---

### Task 2: Restore the homepage category anchor

**Files:**

- Modify: `lib/seo/site-seo.ts`
- Modify: `content/landing-pages.ts`
- Modify: `components/landing/LandingRouteChooser.tsx`
- Modify: `components/geo/GeoHomePage.tsx`
- Modify: `lib/geo-content.ts`

- [ ] **Step 1: Update the homepage SEO registry entry**

Use the approved values:

```ts
primaryKeyword: "double knit fabric",
secondaryKeywords: [
  "double knit fabric supplier",
  "knit fabric supplier",
  "finished knit fabric",
  "custom knit fabric",
  "wholesale knit fabric",
],
metaTitle: "Double Knit Fabric for Global Apparel Brands | O'range Textile",
metaDescription:
  "Double knit fabric sourcing for global apparel brands covering interlock, Ponte Roma, scuba, air-layer and jacquard directions. Compare documented specifications, samples and supplier capabilities, then send composition, GSM, usable width, finish, quantity and destination for an RFQ.",
h1: "Double Knit Fabric for Global Apparel Sourcing",
```

The description is 284 characters, contains the exact primary keyword and remains within the existing 160-300 character rule.

- [ ] **Step 2: Rewrite the first-screen summary without changing the hero layout**

Use:

```ts
summary:
  "Source double knit fabric through a documented finished-fabric route spanning interlock, Ponte Roma, scuba, air-layer, jacquard and other structured knit directions. Start from a catalogue article, reference sample or specification-led brief, then confirm composition, GSM, usable width, finish, colour, quantity and testing in the current quotation.",
```

- [ ] **Step 3: Correct the hero ALT to the exact natural phrase**

Use:

```ts
alt:
  "Finished double knit fabric rolls and swatches in front of circular knitting machines",
```

- [ ] **Step 4: Put the core phrase in one H2 and one existing internal link**

Change the route chooser H2 to:

```tsx
<h2>Choose a double knit fabric sourcing route</h2>
```

Change the existing `/finished-double-knit-fabrics` route-card title to:

```ts
title: "Double knit fabric manufacturing and finished-fabric directions",
```

Do not create another `double knit fabric` landing page.

- [ ] **Step 5: Align machine-readable site summaries**

Update `heroContent.description` in `lib/geo-content.ts` so the WebSite JSON-LD and `llms.txt` describe `double knit fabric` as the core sourcing theme while retaining the 104-article catalogue boundary.

Use:

```ts
description:
  "O'range Textile supports double knit fabric sourcing for global apparel programs through documented finished-fabric directions, article-level specifications, sample coordination and an inquiry route that can extend from greige fabric to finished garments.",
```

- [ ] **Step 6: Run homepage tests and verify GREEN**

Run:

```bash
node --test tests/site-seo-registry.test.mjs tests/landing-pages.test.mjs tests/site-seo-integration.test.mjs
```

Expected: PASS, including the shared Title-prefix, description-length, unique-primary-keyword and single-registry-H1 rules.

- [ ] **Step 7: Commit the homepage correction**

```bash
git add lib/seo/site-seo.ts content/landing-pages.ts components/landing/LandingRouteChooser.tsx components/geo/GeoHomePage.tsx lib/geo-content.ts tests/site-seo-registry.test.mjs tests/landing-pages.test.mjs
git commit -m "fix: restore double knit homepage focus"
```

---

### Task 3: Add evidence and direct inquiry support to legacy product pages

**Files:**

- Modify: `lib/public-catalog.ts`
- Modify: `app/fabrics/[slug]/page.tsx`
- Modify: `tests/semrush-foundation.test.mjs`

- [ ] **Step 1: Write failing legacy-page depth tests**

Test the three legacy slugs:

```js
const targetSlugs = [
  "fleece-french-terry",
  "cotton-jersey",
  "cotton-spandex-jersey",
];
```

For each category, assert:

```js
assert.ok(category.faq.length >= 5 && category.faq.length <= 8);

const specifications = category.specificationChecks
  .flatMap((item) => [item.label, item.detail])
  .join(" ");

for (const field of ["composition", "gsm", "width", "stretch", "finish"]) {
  assert.match(specifications, new RegExp(field, "i"));
}

assert.ok(category.evidence.capability.length >= 120);
assert.ok(category.evidence.qualitySteps.length >= 3);
assert.ok(category.evidence.boundary.length >= 120);
assert.ok(category.relatedLinks.some((link) => link.href.startsWith("/blog/")));
assert.ok(category.relatedLinks.some((link) => link.href.startsWith("/fabrics/")));
assert.ok(category.cta.label.length > 0);
```

Add a dangling-catalogue-ID guard:

```js
const publicIds = new Set(publicFabrics.map((fabric) => fabric.id));
for (const category of publicFabricCategories) {
  for (const id of category.relatedFabricIds) {
    assert.ok(publicIds.has(id), `${category.slug} references missing ${id}`);
  }
}
```

- [ ] **Step 2: Verify RED**

Run:

```bash
node --test tests/semrush-foundation.test.mjs
```

Expected: FAIL because the target legacy pages have two FAQs, no evidence/CTA fields, incomplete explicit specification labels and dangling product IDs.

- [ ] **Step 3: Extend the `FabricCategory` model**

Add:

```ts
evidence: {
  capability: string;
  qualitySteps: string[];
  boundary: string;
};
cta: {
  heading: string;
  body: string;
  label: string;
};
```

- [ ] **Step 4: Render a production-and-quality evidence section**

Import `companyRelationship`, `manufacturingScale` and `SampleRequestCta`. Render:

- the category-specific `capability`;
- an attributed parent-company sentence using `companyRelationship.parentCompany` and `manufacturingScale[0]`;
- the category's three or more `qualitySteps`;
- the category's evidence boundary.

Do not display a dedicated-machine count or category-specific capacity unless a source explicitly supports it.

- [ ] **Step 5: Render a direct CTA even when the batch cart is empty**

Before `FabricsInquiryAnchor`, add a CTA band containing:

```tsx
<SampleRequestCta label={category.cta.label} className="mt-6" />
<Link href="/custom-knit-fabric-development">
  Send a detailed development brief
</Link>
```

This is required because `InquiryBar` is hidden when no catalogue items are selected.

- [ ] **Step 6: Remove unsupported product-ID mappings**

Set the three target categories' `relatedFabricIds` to empty arrays unless an exact current catalogue mapping is verified. Preserve the existing public boundary message instead of inventing an article.

- [ ] **Step 7: Verify the infrastructure test is GREEN**

Run:

```bash
node --test tests/semrush-foundation.test.mjs
```

Expected: PASS.

- [ ] **Step 8: Commit the shared legacy-page support**

```bash
git add lib/public-catalog.ts app/fabrics/[slug]/page.tsx tests/semrush-foundation.test.mjs
git commit -m "feat: add procurement evidence and CTA support"
```

---

### Task 4: Deepen the French Terry page

**Files:**

- Modify: `lib/public-catalog.ts`
- Test: `tests/semrush-foundation.test.mjs`

- [ ] **Step 1: Add a failing French Terry content assertion**

Require the page to lead with French Terry rather than the combined Fleece label:

```js
assert.equal(category.shortName, "French terry");
assert.match(category.description, /^French terry fabric\b/i);
assert.ok(category.relatedLinks.some((link) =>
  link.href === "/fabrics/rib-knit-fabric"
));
```

- [ ] **Step 2: Verify RED**

Run:

```bash
node --test tests/semrush-foundation.test.mjs
```

Expected: FAIL because the current category is named `Fleece and French terry`.

- [ ] **Step 3: Refocus definition and apparel use**

Lead with loop-back French Terry, then explain brushed fleece only as a comparison. Retain hoodies, sweatshirts, joggers, casualwear and loungewear as applications.

- [ ] **Step 4: Publish six explicit procurement checks**

Use these labels:

```ts
[
  "Composition and yarn system",
  "GSM and seasonal weight",
  "Usable width and relaxation",
  "Stretch and recovery",
  "Loop-back structure and finish",
  "Shrinkage, pilling and colourfastness",
]
```

Each detail must tell the buyer what to state in the RFQ and what to verify on the finished sample; do not publish a universal GSM or width.

- [ ] **Step 5: Publish sample/custom and evidence routes**

Describe:

1. reference garment, face/reverse photographs or labeled swatch;
2. composition, GSM, usable width, colour, finish and quantity brief;
3. labeled sample and specification review;
4. sewing/wash/decoration checks;
5. approved version and current quotation.

Evidence must say the parent company provides documented circular-knitting context, while the exact French Terry article, finish and availability remain inquiry-specific.

- [ ] **Step 6: Expand to six procurement FAQs**

Keep the two existing questions and add:

1. `How is French terry different from brushed fleece?`
2. `What GSM and usable width should a hoodie buyer specify?`
3. `Which shrinkage and pilling checks matter for French terry?`
4. `Can buyers customize composition, colour and reverse finish?`

Answers must avoid fixed MOQ, lead time or stock claims.

- [ ] **Step 7: Add contextual product links and CTA**

Keep the three French Terry buyer-guide links. Add:

- `/fabrics/rib-knit-fabric` for cuffs, waistbands and trim coordination;
- `/fabrics/cotton-spandex-jersey` for a lighter stretch comparison.

CTA label:

```ts
"Request a French terry sample or quotation"
```

- [ ] **Step 8: Run the focused test and commit**

```bash
node --test tests/semrush-foundation.test.mjs
git add lib/public-catalog.ts tests/semrush-foundation.test.mjs
git commit -m "content: deepen French terry sourcing page"
```

---

### Task 5: Deepen the Cotton Jersey page

**Files:**

- Modify: `lib/public-catalog.ts`
- Test: `tests/semrush-foundation.test.mjs`

- [ ] **Step 1: Add a failing Cotton Jersey content assertion**

```js
assert.ok(category.relatedLinks.some((link) =>
  link.href === "/fabrics/cotton-spandex-jersey"
));
assert.ok(category.faq.some((item) =>
  /spirality|shrinkage/i.test(`${item.question} ${item.answer}`)
));
```

- [ ] **Step 2: Verify RED**

Run:

```bash
node --test tests/semrush-foundation.test.mjs
```

- [ ] **Step 3: Publish six explicit procurement checks**

Use:

```ts
[
  "Composition and yarn direction",
  "GSM and opacity",
  "Usable width",
  "Stretch and recovery",
  "Dyeing and surface finish",
  "Shrinkage, spirality, pilling and colourfastness",
]
```

Connect each field to T-shirts, base layers, loungewear and private-label basics.

- [ ] **Step 4: Strengthen sample/custom and production evidence**

Describe a route from reference swatch or benchmark garment to labeled sample, wash/spirality check, sewing trial, dated approval and current quotation.

State that the parent company's knitting record provides manufacturing context; do not claim that the draft 104-product catalogue includes a current Cotton Jersey article.

- [ ] **Step 5: Expand to six procurement FAQs**

Keep the two existing questions and add:

1. `How should buyers specify GSM and opacity for a cotton jersey T-shirt?`
2. `What is the difference between 100% cotton and cotton-rich jersey?`
3. `How should shrinkage and spirality be checked?`
4. `Can buyers request custom colour, finish and usable width?`

- [ ] **Step 6: Add product links and CTA**

Add:

- `/fabrics/cotton-spandex-jersey`;
- `/fabrics/interlock-fabric`;
- retain the existing relevant buyer guides.

CTA label:

```ts
"Request a cotton jersey sample or quotation"
```

- [ ] **Step 7: Run the focused test and commit**

```bash
node --test tests/semrush-foundation.test.mjs
git add lib/public-catalog.ts tests/semrush-foundation.test.mjs
git commit -m "content: deepen cotton jersey sourcing page"
```

---

### Task 6: Tighten the Interlock page

**Files:**

- Modify: `content/finished-fabrics.json`
- Modify: `tests/finished-fabric-content.test.mjs`

- [ ] **Step 1: Add failing Interlock-specific assertions**

```js
const interlock = pages.find(
  (page) => page.url === "/fabrics/interlock-fabric"
);

assert.ok(interlock.faq.length >= 5 && interlock.faq.length <= 8);
assert.ok(interlock.relatedLinks.some((link) =>
  link.href === "/fabrics/cotton-jersey"
));
assert.doesNotMatch(JSON.stringify(interlock), /\ba interlock\b/i);
```

Add an assertion that any `210-510 GSM` or `133-185 cm` statement contains `catalogue-wide` or an equivalent explicit qualifier.

- [ ] **Step 2: Verify RED**

Run:

```bash
node --test tests/finished-fabric-content.test.mjs
```

- [ ] **Step 3: Clarify specification evidence**

Keep the existing five content sections, but make the table explicitly cover:

- composition;
- GSM;
- usable width;
- stretch and recovery;
- face/reverse and finish;
- colour/testing;
- article code and sample version.

Change catalogue-wide ranges so no reader can interpret them as an Interlock specification. The article-specific values must remain quotation fields.

- [ ] **Step 4: Strengthen production and quality wording**

Retain the attributed parent-company double-knit machine context. Add a concise quality route covering labeled sample, specification match, face/reverse inspection, GSM/width measurement, stretch/recovery, sewing/care test and dated approval.

- [ ] **Step 5: Expand from four to six FAQs**

Add:

1. `How does interlock differ from cotton jersey and Ponte Roma?`
2. `Which GSM, usable width and recovery fields should an interlock RFQ include?`

Fix both `a interlock` instances to `an interlock`.

- [ ] **Step 6: Add cross-cluster links**

Keep the current Interlock guide, comparison article, Ponte and scuba links. Add:

- `/fabrics/cotton-jersey`;
- `/fabrics/cotton-spandex-jersey`.

The existing `SampleRequestCta` at the hero and final CTA already satisfies the direct inquiry requirement.

- [ ] **Step 7: Run the focused test and commit**

```bash
node --test tests/finished-fabric-content.test.mjs
git add content/finished-fabrics.json tests/finished-fabric-content.test.mjs
git commit -m "content: tighten interlock procurement evidence"
```

---

### Task 7: Deepen the Cotton Spandex Jersey page

**Files:**

- Modify: `lib/public-catalog.ts`
- Test: `tests/semrush-foundation.test.mjs`

- [ ] **Step 1: Add a failing Cotton Spandex Jersey assertion**

```js
assert.ok(category.relatedLinks.some((link) =>
  link.href === "/fabrics/cotton-jersey"
));
assert.ok(category.faq.some((item) =>
  /recovery/i.test(`${item.question} ${item.answer}`)
));
```

- [ ] **Step 2: Verify RED**

Run:

```bash
node --test tests/semrush-foundation.test.mjs
```

- [ ] **Step 3: Publish six explicit procurement checks**

Use:

```ts
[
  "Cotton and spandex composition",
  "GSM and opacity",
  "Usable width after relaxation",
  "Stretch direction and recovery",
  "Dyeing, heat history and finish",
  "Shrinkage, torque, pilling and colourfastness",
]
```

Tie these checks to fitted T-shirts, childrenswear, loungewear and sports-inspired apparel.

- [ ] **Step 4: Strengthen sample/custom and evidence routes**

Require a garment silhouette, stretch direction, target extension/recovery method, composition, GSM, width, colour, finish, wash route and destination. Describe labeled-sample approval, recovery testing after rest, sewing/wash validation and quotation confirmation.

Use only shared parent-company capability evidence. Do not infer an exact Cotton Spandex article from the draft catalogue.

- [ ] **Step 5: Expand to six procurement FAQs**

Keep the two existing questions and add:

1. `How should stretch direction and recovery be specified?`
2. `Does a 95/5 composition guarantee the same performance?`
3. `When should GSM and usable width be measured?`
4. `Can buyers request custom colour, finish and testing?`

- [ ] **Step 6: Add product links and CTA**

Add:

- `/fabrics/cotton-jersey`;
- `/fabrics/rib-knit-fabric`;
- retain Interlock and related buyer-guide links.

CTA label:

```ts
"Request a cotton spandex jersey sample or quotation"
```

- [ ] **Step 7: Run the focused test and commit**

```bash
node --test tests/semrush-foundation.test.mjs
git add lib/public-catalog.ts tests/semrush-foundation.test.mjs
git commit -m "content: deepen cotton spandex jersey page"
```

---

### Task 8: Validate the complete hierarchy and rendered pages

**Files:**

- Verify all modified files
- Do not create another landing page or change any canonical URL

- [ ] **Step 1: Run the complete test suite**

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 2: Run a production build**

```bash
npm run build
```

Expected: build succeeds. The pre-existing `<img>` performance warning in `FabricCard.tsx` may remain; no new warnings should be introduced.

- [ ] **Step 3: Run the rendered production SEO audit**

```bash
npm run test:seo:production
```

Expected:

- 33/33 public pages checked;
- 33/33 pass;
- homepage Title is exactly the approved Title;
- homepage has one H1 and it is exactly the approved H1;
- all rendered images have non-empty ALT;
- sitemap and canonical URLs are unchanged.

- [ ] **Step 4: Browser-check the five affected routes**

Check desktop and mobile widths:

```text
/
/fabrics/fleece-french-terry
/fabrics/cotton-jersey
/fabrics/interlock-fabric
/fabrics/cotton-spandex-jersey
```

Verify:

- no horizontal overflow;
- FAQ count is 5-8 per product page;
- specification content visibly covers composition, GSM, width, stretch and finish;
- each product page has a working sample/RFQ CTA;
- related links include at least one blog and one product page;
- evidence language attributes manufacturing facts to the parent company;
- catalogue-wide values cannot be mistaken for category-specific values.

- [ ] **Step 5: Final keyword-cannibalization check**

Confirm:

- `/` owns `double knit fabric`;
- `/finished-double-knit-fabrics` retains `double knit fabric manufacturer`;
- `knit fabric supplier` remains a homepage secondary keyword;
- no new URL owns `double knit fabric`;
- the four product pages retain their existing primary keywords.

- [ ] **Step 6: Commit final verification-only adjustments**

Only if verification required a scoped correction:

```bash
git add lib/seo/site-seo.ts content/landing-pages.ts components/landing/LandingRouteChooser.tsx components/geo/GeoHomePage.tsx lib/geo-content.ts lib/public-catalog.ts app/fabrics/[slug]/page.tsx content/finished-fabrics.json tests/site-seo-registry.test.mjs tests/landing-pages.test.mjs tests/semrush-foundation.test.mjs tests/finished-fabric-content.test.mjs
git commit -m "test: verify priority sourcing pages"
```
