# Full-Site SEO Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give all 22 public HTML pages one authoritative keyword, metadata, H1, canonical, sitemap, and rendered-HTML validation system for global English-speaking B2B buyers, with the United States and Australia as priority markets.

**Architecture:** Add a pure `lib/seo/site-seo.ts` registry for public-page ownership and a focused `lib/seo/metadata.ts` Next.js adapter. Static and dynamic routes look up the same page record for metadata and H1, while sitemap generation and the production crawler use the complete registry. Existing product evidence, body copy, schema, and inquiry boundaries remain intact.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript 5, Node test runner, Node fetch/HTML parsing by deterministic regular expressions over server-rendered markup.

---

## File Structure

- Create `lib/seo/site-seo.ts`: pure public-page registry, types, lookup helpers, site origin, and brand constants.
- Create `lib/seo/metadata.ts`: convert a registry record into absolute Next.js Metadata with aligned Open Graph and Twitter fields.
- Create `tests/site-seo-registry.test.mjs`: validate inventory, keyword ownership, titles, descriptions, H1 values, dates, and sitemap fields.
- Create `tests/site-seo-integration.test.mjs`: ensure every route uses the shared metadata and H1 system.
- Create `scripts/validate-production-seo.mjs`: crawl built HTML and emit per-URL PASS/FAIL evidence.
- Create `scripts/run-production-seo-audit.mjs`: start the production server, wait for readiness, run the crawler, and stop the server.
- Create `reports/seo/.gitkeep`: retain the generated-report directory.
- Modify `app/layout.tsx`: keep only global metadata base and organization-level settings; remove title templating and page canonical fallback.
- Modify all public `app/**/page.tsx` routes: use the shared metadata adapter and registry H1.
- Modify `components/landing/LandingHero.tsx`: accept the registry H1 instead of using landing-page headline as H1.
- Modify `components/geo/GeoHomePage.tsx`, `components/landing/ReadyStockLanding.tsx`, `components/landing/CustomDevelopmentLanding.tsx`, `components/FabricsPageIntro.tsx`, and `components/finished-fabric/FinishedFabricPage.tsx`: pass or render the registry H1.
- Modify `lib/finished-fabric-content.ts` and `content/finished-fabrics.json`: remove page-level SEO fields from the detailed content registry.
- Modify `lib/finished-fabric-schema.ts`: consume the registry H1 and description without removing existing schema types.
- Modify `lib/public-catalog.ts`: remove the legacy category `metaDescription` field so categories cannot own a second metadata source.
- Modify `lib/geo-content.ts`: use shared site and brand constants.
- Modify `app/sitemap.ts`: derive the 22-page sitemap from the SEO registry and use stable update dates.
- Modify `app/llms.txt/route.ts`: derive public-page names and descriptions from the same registry.
- Modify `package.json`: add typecheck and production SEO audit scripts.
- Modify `docs/next.md`: record implementation results, evidence, risks, and next actions.

## Task 1: Establish The Failing SEO Registry Contract

**Files:**

- Create: `tests/site-seo-registry.test.mjs`
- Test: `tests/site-seo-registry.test.mjs`

- [ ] **Step 1: Write the registry contract test**

Create the test with these checks:

```js
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

const moduleUrl = new URL("../lib/seo/site-seo.ts", import.meta.url);
const loadSeo = async () => {
  assert.ok(existsSync(moduleUrl), "lib/seo/site-seo.ts must exist");
  return import(moduleUrl.href);
};

const allowedIntents = new Set([
  "informational",
  "commercial",
  "transactional",
  "navigational",
]);
const allowedPageTypes = new Set(["homepage", "service", "guide", "blog"]);
const allowedChangeFrequencies = new Set(["daily", "weekly", "monthly"]);

const includesFolded = (text, keyword) =>
  text.toLocaleLowerCase("en-US").includes(
    keyword.toLocaleLowerCase("en-US")
  );

test("SEO registry owns exactly 22 normalized public pages", async () => {
  const { getAllPublicPageSeo } = await loadSeo();
  const pages = getAllPublicPageSeo();
  assert.equal(pages.length, 22);
  assert.equal(new Set(pages.map((page) => page.path)).size, pages.length);
  for (const page of pages) {
    assert.match(page.path, /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/);
  }
});

test("every public page has one unique keyword assignment", async () => {
  const { getAllPublicPageSeo } = await loadSeo();
  const pages = getAllPublicPageSeo();
  assert.equal(
    new Set(pages.map((page) => page.primaryKeyword.toLocaleLowerCase("en-US")))
      .size,
    pages.length
  );

  for (const page of pages) {
    assert.ok(page.primaryKeyword.trim(), `${page.path} primary keyword`);
    assert.ok(
      page.secondaryKeywords.length >= 2 &&
        page.secondaryKeywords.length <= 5,
      `${page.path} secondary keyword count`
    );
    assert.ok(allowedIntents.has(page.searchIntent), `${page.path} intent`);
    assert.ok(page.topicCluster.trim(), `${page.path} topic cluster`);
    assert.ok(
      allowedPageTypes.has(page.targetPageType),
      `${page.path} page type`
    );
  }
});

test("titles satisfy prefix, length, uniqueness, and brand rules", async () => {
  const { SEO_BRAND_NAME, getAllPublicPageSeo } = await loadSeo();
  const pages = getAllPublicPageSeo();
  assert.equal(new Set(pages.map((page) => page.metaTitle)).size, pages.length);

  for (const page of pages) {
    assert.ok(
      page.metaTitle
        .toLocaleLowerCase("en-US")
        .startsWith(page.primaryKeyword.toLocaleLowerCase("en-US")),
      `${page.path} title must start with its primary keyword`
    );
    assert.ok(page.metaTitle.length <= 70, `${page.path} title length`);
    assert.ok(
      page.metaTitle.split(SEO_BRAND_NAME).length - 1 <= 1,
      `${page.path} brand count`
    );
  }
});

test("descriptions and H1 values contain the complete primary keyword", async () => {
  const { getAllPublicPageSeo } = await loadSeo();
  const pages = getAllPublicPageSeo();
  assert.equal(
    new Set(pages.map((page) => page.metaDescription)).size,
    pages.length
  );

  for (const page of pages) {
    assert.ok(
      page.metaDescription.length >= 160 &&
        page.metaDescription.length <= 300,
      `${page.path} description length ${page.metaDescription.length}`
    );
    assert.ok(
      includesFolded(page.metaDescription, page.primaryKeyword),
      `${page.path} description keyword`
    );
    assert.ok(
      includesFolded(page.h1, page.primaryKeyword),
      `${page.path} H1 keyword`
    );
  }
});

test("crawl fields use the production origin and stable valid values", async () => {
  const { SEO_SITE_ORIGIN, getAllPublicPageSeo } = await loadSeo();
  const pages = getAllPublicPageSeo();
  assert.equal(SEO_SITE_ORIGIN, "https://orangetextiles.com");

  for (const page of pages) {
    assert.match(page.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(
      new Date(`${page.updatedAt}T00:00:00.000Z`).toISOString().slice(0, 10),
      page.updatedAt
    );
    assert.ok(allowedChangeFrequencies.has(page.changeFrequency));
    assert.ok(page.priority >= 0 && page.priority <= 1);
  }
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```powershell
node --test tests/site-seo-registry.test.mjs
```

Expected: FAIL with the assertion `lib/seo/site-seo.ts must exist`.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add tests/site-seo-registry.test.mjs
git commit -m "test: define full-site SEO registry contract"
```

## Task 2: Implement The Unified 22-Page SEO Registry

**Files:**

- Create: `lib/seo/site-seo.ts`
- Test: `tests/site-seo-registry.test.mjs`

- [ ] **Step 1: Create the registry types, constants, records, and lookups**

Implement:

```ts
export const SEO_BRAND_NAME = "O'range Textile";
export const SEO_SITE_ORIGIN = "https://orangetextiles.com";

export type SearchIntent =
  | "informational"
  | "commercial"
  | "transactional"
  | "navigational";

export type SeoPageType = "homepage" | "service" | "guide" | "blog";

export type PublicPageSeo = {
  path: string;
  primaryKeyword: string;
  secondaryKeywords: readonly string[];
  searchIntent: SearchIntent;
  topicCluster: string;
  targetPageType: SeoPageType;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  updatedAt: string;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
};

const publicPageSeo = [
  {
    path: "/",
    primaryKeyword: "double knit fabric",
    secondaryKeywords: [
      "double knit fabric supplier",
      "knitted fabric manufacturer",
      "knit fabric supplier",
      "double knit fabric USA",
      "double knit fabric Australia",
    ],
    searchIntent: "commercial",
    topicCluster: "core-category",
    targetPageType: "homepage",
    metaTitle:
      "Double Knit Fabric for Global Apparel Brands | O'range Textile",
    metaDescription:
      "Double knit fabric sourcing for global apparel brands, including buyers in the United States and Australia. Compare finished constructions, documented specifications, sample routes and supplier capabilities before sending an RFQ to O'range Textile.",
    h1: "Double Knit Fabric for Global Apparel Sourcing",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/fabrics",
    primaryKeyword: "finished knit fabrics",
    secondaryKeywords: [
      "knit fabric supplier",
      "wholesale knit fabric",
      "finished fabric supplier",
      "knitted fabric manufacturer",
    ],
    searchIntent: "commercial",
    topicCluster: "commercial-catalogue",
    targetPageType: "service",
    metaTitle:
      "Finished Knit Fabrics for B2B Sourcing | O'range Textile",
    metaDescription:
      "Finished knit fabrics for global B2B apparel sourcing teams. Review 104 documented articles across 11 series, compare composition, GSM and usable width, then request samples and confirm colour, finish, quantity and commercial terms.",
    h1: "Finished Knit Fabrics for Apparel Buyers",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/ready-stock-knit-fabrics",
    primaryKeyword: "ready-stock knit fabrics",
    secondaryKeywords: [
      "wholesale knit fabric",
      "ready stock fabric supplier",
      "fabric stock for apparel brands",
    ],
    searchIntent: "transactional",
    topicCluster: "commercial-stock",
    targetPageType: "service",
    metaTitle:
      "Ready-Stock Knit Fabrics for Buyers | O'range Textile",
    metaDescription:
      "Ready-stock knit fabrics for global B2B buyers seeking documented article references. Review composition, GSM and usable width, shortlist a fabric, then confirm current colour, usable quantity, finish, sample route and commercial terms.",
    h1: "Ready-Stock Knit Fabrics for B2B Buyers",
    updatedAt: "2026-07-23",
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    path: "/finished-double-knit-fabrics",
    primaryKeyword: "double knit fabric manufacturer",
    secondaryKeywords: [
      "double knit fabric supplier",
      "knitted fabric manufacturer",
      "China double knit manufacturer",
    ],
    searchIntent: "transactional",
    topicCluster: "commercial-manufacturer",
    targetPageType: "service",
    metaTitle:
      "Double Knit Fabric Manufacturer in China | O'range Textile",
    metaDescription:
      "Double knit fabric manufacturer support for global apparel brands, US buyers and Australian sourcing teams. Compare interlock, Ponte Roma, scuba, jacquard and wool-blend directions, then request samples and a specification-based quotation.",
    h1: "Double Knit Fabric Manufacturer for Apparel Brands",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.95,
  },
  {
    path: "/custom-knit-fabric-development",
    primaryKeyword: "custom knit fabric development",
    secondaryKeywords: [
      "custom knit fabric supplier",
      "knit fabric development service",
      "custom fabric sampling",
    ],
    searchIntent: "transactional",
    topicCluster: "commercial-development",
    targetPageType: "service",
    metaTitle: "Custom Knit Fabric Development | O'range Textile",
    metaDescription:
      "Custom knit fabric development for global apparel brands with a reference garment, swatch or technical brief. Define construction, composition, GSM, width, colour, finish and tests, then send the requirement for sample-route and quotation review.",
    h1: "Custom Knit Fabric Development for Apparel Programs",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/fabrics/cotton-jersey",
    primaryKeyword: "cotton jersey fabric",
    secondaryKeywords: [
      "cotton jersey fabric supplier",
      "cotton jersey fabric manufacturer",
      "jersey fabric for T-shirts",
    ],
    searchIntent: "commercial",
    topicCluster: "product-jersey",
    targetPageType: "service",
    metaTitle: "Cotton Jersey Fabric Supplier | O'range Textile",
    metaDescription:
      "Cotton jersey fabric sourcing for global apparel brands developing T-shirts, base layers and private-label basics. Review yarn, GSM, usable width, drape and dimensional checks, then send a sample reference or specification for confirmation.",
    h1: "Cotton Jersey Fabric for T-Shirts and Basics",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/fabrics/cotton-spandex-jersey",
    primaryKeyword: "cotton spandex jersey fabric",
    secondaryKeywords: [
      "cotton spandex jersey fabric supplier",
      "stretch cotton knit fabric",
      "95 cotton 5 spandex jersey",
    ],
    searchIntent: "commercial",
    topicCluster: "product-jersey",
    targetPageType: "service",
    metaTitle:
      "Cotton Spandex Jersey Fabric Supplier | O'range Textile",
    metaDescription:
      "Cotton spandex jersey fabric for fitted T-shirts, childrenswear, loungewear and active-inspired apparel. Compare stretch, recovery, opacity, GSM and relaxed width, then provide the garment brief and testing needs for sample review.",
    h1: "Cotton Spandex Jersey Fabric for Stretch Apparel",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/fabrics/fleece-french-terry",
    primaryKeyword: "french terry fabric",
    secondaryKeywords: [
      "French terry fabric supplier",
      "hoodie fabric manufacturer",
      "sweatshirt knit fabric",
    ],
    searchIntent: "commercial",
    topicCluster: "product-terry",
    targetPageType: "service",
    metaTitle: "French Terry Fabric Supplier | O'range Textile",
    metaDescription:
      "French terry fabric sourcing for hoodies, sweatshirts, streetwear and loungewear programs. Compare loop-back and brushed directions, GSM, width, shrinkage and surface durability, then send the garment specification for sample confirmation.",
    h1: "French Terry Fabric for Hoodies and Sweatshirts",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/fabrics/scuba-air-layer",
    primaryKeyword: "air-layer fabric",
    secondaryKeywords: [
      "air-layer knit fabric",
      "air-layer fabric supplier",
      "structured knit fabric",
    ],
    searchIntent: "commercial",
    topicCluster: "product-structured-knit",
    targetPageType: "service",
    metaTitle: "Air-Layer Fabric Supplier | O'range Textile",
    metaDescription:
      "Air-layer fabric sourcing for structured hoodies, jackets and shape-retaining apparel. Review construction identity, thickness, compression, GSM, usable width and recovery, then select a documented article or send a reference garment for sampling.",
    h1: "Air-Layer Fabric for Structured Apparel",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/fabrics/interlock-fabric",
    primaryKeyword: "interlock fabric",
    secondaryKeywords: [
      "interlock fabric supplier",
      "interlock fabric manufacturer",
      "double knit interlock fabric",
    ],
    searchIntent: "commercial",
    topicCluster: "product-double-knit",
    targetPageType: "service",
    metaTitle: "Interlock Fabric Manufacturer | O'range Textile",
    metaDescription:
      "Interlock fabric development for global apparel brands seeking a smooth double-knit face, stability and coverage. Compare composition, GSM, usable width, stretch and recovery, then request the closest finished sample and a specification-based quotation.",
    h1: "Interlock Fabric for Stable Apparel Construction",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/fabrics/ponte-roma-fabric",
    primaryKeyword: "ponte roma fabric",
    secondaryKeywords: [
      "Ponte Roma fabric supplier",
      "Ponte knit fabric",
      "Ponte fabric manufacturer",
    ],
    searchIntent: "commercial",
    topicCluster: "product-double-knit",
    targetPageType: "service",
    metaTitle: "Ponte Roma Fabric Manufacturer | O'range Textile",
    metaDescription:
      "Ponte Roma fabric sourcing for dresses, trousers, skirts and structured knitwear. Review body, drape, recovery, surface, composition, GSM and usable width, then request a finished sample and confirm colour, testing and commercial terms.",
    h1: "Ponte Roma Fabric for Structured Knitwear",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/fabrics/scuba-air-layer-fabric",
    primaryKeyword: "scuba knit fabric",
    secondaryKeywords: [
      "scuba knit fabric supplier",
      "scuba fabric manufacturer",
      "structured double knit fabric",
    ],
    searchIntent: "commercial",
    topicCluster: "product-structured-knit",
    targetPageType: "service",
    metaTitle: "Scuba Knit Fabric Supplier | O'range Textile",
    metaDescription:
      "Scuba knit fabric sourcing for apparel programs that need clean structure, resilient body and shape retention. Compare the documented air-layer and double-knit directions, then approve thickness, stretch, finish and garment behaviour on a sample.",
    h1: "Scuba Knit Fabric for Shape-Retaining Apparel",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/fabrics/jacquard-knit-fabric",
    primaryKeyword: "jacquard knit fabric",
    secondaryKeywords: [
      "jacquard knit fabric supplier",
      "knit jacquard manufacturer",
      "patterned knit fabric",
    ],
    searchIntent: "commercial",
    topicCluster: "product-jacquard",
    targetPageType: "service",
    metaTitle: "Jacquard Knit Fabric Manufacturer | O'range Textile",
    metaDescription:
      "Jacquard knit fabric development for patterned apparel, panels and statement garments. Compare motif scale, face and reverse, composition, GSM, usable width and finishing, then send the design direction for finished-sample and quotation review.",
    h1: "Jacquard Knit Fabric for Patterned Apparel",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/fabrics/wool-blend-knit-fabric",
    primaryKeyword: "wool blend knit fabric",
    secondaryKeywords: [
      "wool blend fabric supplier",
      "wool knit fabric manufacturer",
      "cashmere-feel knit fabric",
    ],
    searchIntent: "commercial",
    topicCluster: "product-wool-blend",
    targetPageType: "service",
    metaTitle: "Wool Blend Knit Fabric Supplier | O'range Textile",
    metaDescription:
      "Wool blend knit fabric sourcing for warm, structured and soft-hand apparel programs. Review the documented fibre blend, article, GSM, usable width and surface direction, then approve hand feel, colour, finish and performance on the offered sample.",
    h1: "Wool Blend Knit Fabric for Warm Apparel",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/fabrics/rib-knit-fabric",
    primaryKeyword: "rib knit fabric",
    secondaryKeywords: [
      "rib knit fabric supplier",
      "rib fabric manufacturer",
      "ribbing fabric for apparel",
    ],
    searchIntent: "commercial",
    topicCluster: "product-rib",
    targetPageType: "service",
    metaTitle: "Rib Knit Fabric Manufacturer | O'range Textile",
    metaDescription:
      "Rib knit fabric development for fitted garments, collars, cuffs, waistbands and coordinated trims. Compare rib geometry, stretch, recovery, GSM, usable width and colour matching, then send the body-fabric and garment requirements for sampling.",
    h1: "Rib Knit Fabric for Apparel and Trims",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/blog",
    primaryKeyword: "knit fabric buyer guides",
    secondaryKeywords: [
      "fabric sourcing guide",
      "knit fabric guide",
      "apparel textile sourcing",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education",
    targetPageType: "guide",
    metaTitle: "Knit Fabric Buyer Guides | O'range Textile",
    metaDescription:
      "Knit fabric buyer guides for global apparel sourcing teams comparing double knit, interlock, Ponte Roma, scuba, rib and jacquard constructions. Use the practical checks to prepare a sample brief, evaluate evidence and continue to the relevant supplier page.",
    h1: "Knit Fabric Buyer Guides for Sourcing Teams",
    updatedAt: "2026-07-23",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  {
    path: "/blog/what-is-double-knit-fabric",
    primaryKeyword: "what is double knit fabric",
    secondaryKeywords: [
      "double knit fabric meaning",
      "double knit construction",
      "double knit fabric uses",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education-double-knit",
    targetPageType: "blog",
    metaTitle:
      "What Is Double Knit Fabric? Buyer Guide | O'range Textile",
    metaDescription:
      "What is double knit fabric, and how should an apparel buyer evaluate it? Learn how two needle systems create a stable knit family, compare common constructions and uses, then review composition, GSM, width, stretch, recovery and the finished sample before sourcing.",
    h1: "What Is Double Knit Fabric? A Buyer Guide",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/what-is-interlock-fabric",
    primaryKeyword: "what is interlock fabric",
    secondaryKeywords: [
      "interlock knit construction",
      "interlock vs jersey fabric",
      "interlock fabric uses",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education-double-knit",
    targetPageType: "blog",
    metaTitle:
      "What Is Interlock Fabric? Buyer Guide | O'range Textile",
    metaDescription:
      "What is interlock fabric, and when does it suit an apparel program? Understand its double-knit construction, smooth faces, stability and typical uses, then compare composition, GSM, width, stretch, recovery and sample performance before choosing a supplier route.",
    h1: "What Is Interlock Fabric? A Buyer Guide",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/what-is-ponte-fabric",
    primaryKeyword: "what is ponte fabric",
    secondaryKeywords: [
      "Ponte Roma fabric meaning",
      "Ponte knit construction",
      "Ponte fabric uses",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education-double-knit",
    targetPageType: "blog",
    metaTitle: "What Is Ponte Fabric? Buyer Guide | O'range Textile",
    metaDescription:
      "What is Ponte fabric, and why is it used for structured knitwear? Review Ponte Roma body, drape, stretch, recovery and garment applications, then compare composition, GSM, usable width, surface and finished-sample behaviour before sourcing.",
    h1: "What Is Ponte Fabric? A Buyer Guide",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/what-is-scuba-knit-fabric",
    primaryKeyword: "what is scuba knit fabric",
    secondaryKeywords: [
      "scuba fabric meaning",
      "scuba knit construction",
      "scuba vs neoprene fabric",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education-structured-knit",
    targetPageType: "blog",
    metaTitle:
      "What Is Scuba Knit Fabric? Buyer Guide | O'range Textile",
    metaDescription:
      "What is scuba knit fabric, and how does it differ from neoprene or air-layer naming? Review structure, thickness, compression, recovery and apparel uses, then confirm the exact construction, composition, GSM, width and finished-sample behaviour.",
    h1: "What Is Scuba Knit Fabric? A Buyer Guide",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/what-is-rib-knit-fabric",
    primaryKeyword: "what is rib knit fabric",
    secondaryKeywords: [
      "rib knit construction",
      "rib fabric stretch",
      "rib knit fabric uses",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-education-rib",
    targetPageType: "blog",
    metaTitle:
      "What Is Rib Knit Fabric? Buyer Guide | O'range Textile",
    metaDescription:
      "What is rib knit fabric, and why does its alternating knit-and-purl geometry affect stretch and recovery? Review common apparel and trim uses, then compare rib ratio, composition, GSM, usable width, colour matching and finished-sample performance.",
    h1: "What Is Rib Knit Fabric? A Buyer Guide",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/blog/jacquard-knit-vs-woven-jacquard",
    primaryKeyword: "jacquard knit vs woven jacquard",
    secondaryKeywords: [
      "knitted jacquard vs woven jacquard",
      "jacquard fabric comparison",
      "knit vs woven jacquard",
    ],
    searchIntent: "informational",
    topicCluster: "buyer-comparison-jacquard",
    targetPageType: "blog",
    metaTitle:
      "Jacquard Knit vs Woven Jacquard: Buyer Guide | O'range Textile",
    metaDescription:
      "Jacquard knit vs woven jacquard compares two pattern-forming routes with different stretch, structure, edge behaviour and apparel uses. Learn what buyers should inspect on the face and reverse, then confirm composition, weight, width, motif scale and finish.",
    h1: "Jacquard Knit vs Woven Jacquard for Apparel Buyers",
    updatedAt: "2026-07-23",
    changeFrequency: "monthly",
    priority: 0.7,
  },
] as const satisfies readonly PublicPageSeo[];

const pageSeoByPath = new Map(publicPageSeo.map((page) => [page.path, page]));

export function getAllPublicPageSeo(): readonly PublicPageSeo[] {
  return publicPageSeo;
}

export function getPublicPageSeo(path: string): PublicPageSeo {
  const page = pageSeoByPath.get(path);
  if (!page) {
    throw new Error(`Missing public SEO record for ${path}`);
  }
  return page;
}

export function toCanonicalUrl(path: string): string {
  return new URL(path, `${SEO_SITE_ORIGIN}/`).toString();
}
```

- [ ] **Step 2: Run the registry contract and verify GREEN**

Run:

```powershell
node --test tests/site-seo-registry.test.mjs
```

Expected: 5 tests pass, 0 fail. If a description or title length fails, edit the copy while preserving the complete primary keyword and evidence boundary.

- [ ] **Step 3: Run the existing suite**

Run:

```powershell
npm test
```

Expected: all existing tests plus the 5 registry tests pass.

- [ ] **Step 4: Commit the registry**

```powershell
git add lib/seo/site-seo.ts
git commit -m "feat: add unified public-page SEO registry"
```

## Task 3: Make Every Route Use One Metadata Adapter

**Files:**

- Create: `tests/site-seo-integration.test.mjs`
- Create: `lib/seo/metadata.ts`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/fabrics/page.tsx`
- Modify: `app/ready-stock-knit-fabrics/page.tsx`
- Modify: `app/finished-double-knit-fabrics/page.tsx`
- Modify: `app/custom-knit-fabric-development/page.tsx`
- Modify: `app/fabrics/[slug]/page.tsx`
- Modify: `app/blog/page.tsx`
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `lib/geo-content.ts`
- Test: `tests/site-seo-integration.test.mjs`

- [ ] **Step 1: Write the failing shared-metadata integration test**

Create a source-integration test that reads the route files and asserts:

```js
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = async (relativePath) => {
  const url = new URL(`../${relativePath}`, import.meta.url);
  assert.ok(existsSync(url), `${relativePath} must exist`);
  return readFile(url, "utf8");
};

const staticRoutes = [
  "app/page.tsx",
  "app/fabrics/page.tsx",
  "app/ready-stock-knit-fabrics/page.tsx",
  "app/finished-double-knit-fabrics/page.tsx",
  "app/custom-knit-fabric-development/page.tsx",
  "app/blog/page.tsx",
];

test("all static pages use createPageMetadata", async () => {
  for (const route of staticRoutes) {
    const source = await readSource(route);
    assert.match(source, /createPageMetadata/);
    assert.doesNotMatch(source, /export const metadata:\s*Metadata\s*=\s*\{/);
  }
});

test("dynamic routes resolve shared metadata by final path", async () => {
  for (const route of [
    "app/fabrics/[slug]/page.tsx",
    "app/blog/[slug]/page.tsx",
  ]) {
    const source = await readSource(route);
    assert.match(source, /createPageMetadata/);
    assert.match(source, /getPublicPageSeo/);
  }
});

test("root layout cannot append a duplicate brand or root canonical", async () => {
  const source = await readSource("app/layout.tsx");
  assert.doesNotMatch(source, /template:\s*["'`]%s/);
  assert.doesNotMatch(source, /canonical:\s*["'`]\/["'`]/);
});

test("metadata adapter aligns descriptions and uses absolute titles", async () => {
  const source = await readSource("lib/seo/metadata.ts");
  assert.match(source, /title:\s*\{\s*absolute:\s*page\.metaTitle/);
  assert.match(source, /description:\s*page\.metaDescription/);
  assert.match(source, /const openGraph[\s\S]+description:\s*page\.metaDescription/);
  assert.match(source, /openGraph,/);
  assert.match(source, /twitter:[\s\S]+description:\s*page\.metaDescription/);
  assert.match(source, /canonical:\s*page\.path/);
});
```

- [ ] **Step 2: Run the integration test and verify RED**

Run:

```powershell
node --test tests/site-seo-integration.test.mjs
```

Expected: FAIL because `lib/seo/metadata.ts` and route integrations do not exist.

- [ ] **Step 3: Implement the metadata adapter**

Create:

```ts
import type { Metadata } from "next";
import {
  SEO_BRAND_NAME,
  getPublicPageSeo,
  toCanonicalUrl,
  type PublicPageSeo,
} from "@/lib/seo/site-seo";

type MetadataOptions = {
  type?: "website" | "article";
  image?: {
    src: string;
    alt: string;
  };
  publishedTime?: string;
  modifiedTime?: string;
};

export function createPageMetadata(
  pageOrPath: PublicPageSeo | string,
  options: MetadataOptions = {}
): Metadata {
  const page =
    typeof pageOrPath === "string"
      ? getPublicPageSeo(pageOrPath)
      : pageOrPath;
  const canonical = toCanonicalUrl(page.path);
  const images = options.image
    ? [{ url: options.image.src, alt: options.image.alt }]
    : undefined;
  const openGraph =
    options.type === "article"
      ? {
          title: page.metaTitle,
          description: page.metaDescription,
          url: canonical,
          siteName: SEO_BRAND_NAME,
          locale: "en_US",
          type: "article" as const,
          publishedTime: options.publishedTime,
          modifiedTime: options.modifiedTime ?? page.updatedAt,
          images,
        }
      : {
          title: page.metaTitle,
          description: page.metaDescription,
          url: canonical,
          siteName: SEO_BRAND_NAME,
          locale: "en_US",
          type: "website" as const,
          images,
        };

  return {
    title: { absolute: page.metaTitle },
    description: page.metaDescription,
    alternates: { canonical: page.path },
    robots: { index: true, follow: true },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
      images: options.image ? [options.image.src] : undefined,
    },
  };
}
```

- [ ] **Step 4: Integrate static routes**

For each static route:

```ts
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublicPageSeo } from "@/lib/seo/site-seo";

const seo = getPublicPageSeo("/exact-route");
export const metadata = createPageMetadata(seo);
```

For routes with hero images, call:

```ts
export const metadata = createPageMetadata(seo, {
  image: { src: page.heroImage.src, alt: page.heroImage.alt },
});
```

Use the finished-content hero for `/finished-double-knit-fabrics` and `/blog`.

- [ ] **Step 5: Integrate dynamic routes**

Resolve the path before content lookup:

```ts
const path = `/fabrics/${params.slug}`;
const page = getFinishedFabricPage(path);
const seo = getPublicPageSeo(path);

return createPageMetadata(seo, {
  type: page?.kind === "article" ? "article" : "website",
  image: page ? { src: page.hero.src, alt: page.hero.alt } : undefined,
  publishedTime: page?.published,
  modifiedTime: page?.updated ?? seo.updatedAt,
});
```

Retain the existing not-found behavior by checking that the resolved content/category exists before calling `getPublicPageSeo`.

- [ ] **Step 6: Simplify root metadata and share site constants**

Keep `metadataBase` and site-level defaults in `app/layout.tsx`, but remove the title template, page description, root canonical, and page-specific Open Graph block. Import `SEO_SITE_ORIGIN` for `metadataBase`.

Update `lib/geo-content.ts`:

```ts
import {
  SEO_BRAND_NAME,
  SEO_SITE_ORIGIN,
} from "@/lib/seo/site-seo";

export const siteUrl = SEO_SITE_ORIGIN;

export const companyProfile = {
  brandName: SEO_BRAND_NAME,
  // preserve every existing company field
} as const;
```

- [ ] **Step 7: Run integration and full tests**

Run:

```powershell
node --test tests/site-seo-integration.test.mjs
npm test
```

Expected: all tests pass.

- [ ] **Step 8: Commit the metadata integration**

```powershell
git add lib/seo/metadata.ts lib/geo-content.ts app/layout.tsx app/page.tsx app/fabrics/page.tsx app/ready-stock-knit-fabrics/page.tsx app/finished-double-knit-fabrics/page.tsx app/custom-knit-fabric-development/page.tsx app/fabrics/[slug]/page.tsx app/blog/page.tsx app/blog/[slug]/page.tsx tests/site-seo-integration.test.mjs
git commit -m "feat: unify metadata across public routes"
```

## Task 4: Make The Registry The Only H1 And Page-SEO Source

**Files:**

- Modify: `tests/site-seo-integration.test.mjs`
- Modify: `components/landing/LandingHero.tsx`
- Modify: `components/geo/GeoHomePage.tsx`
- Modify: `components/landing/ReadyStockLanding.tsx`
- Modify: `components/landing/CustomDevelopmentLanding.tsx`
- Modify: `components/FabricsPageIntro.tsx`
- Modify: `components/finished-fabric/FinishedFabricPage.tsx`
- Modify: `app/fabrics/page.tsx`
- Modify: `app/fabrics/[slug]/page.tsx`
- Modify: `app/finished-double-knit-fabrics/page.tsx`
- Modify: `app/blog/page.tsx`
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `app/llms.txt/route.ts`
- Modify: `lib/finished-fabric-content.ts`
- Modify: `lib/finished-fabric-schema.ts`
- Modify: `lib/public-catalog.ts`
- Modify: `content/finished-fabrics.json`
- Test: `tests/site-seo-integration.test.mjs`

- [ ] **Step 1: Extend the integration test and verify RED**

Add:

```js
test("shared H1 components accept the SEO registry value", async () => {
  const landingHero = await readSource("components/landing/LandingHero.tsx");
  const fabricsIntro = await readSource("components/FabricsPageIntro.tsx");
  const finishedPage = await readSource(
    "components/finished-fabric/FinishedFabricPage.tsx"
  );

  assert.match(landingHero, /h1:\s*string/);
  assert.match(landingHero, /\{h1\}/);
  assert.match(fabricsIntro, /h1:\s*string/);
  assert.match(fabricsIntro, /\{h1\}/);
  assert.match(finishedPage, /seo:\s*PublicPageSeo/);
  assert.match(finishedPage, /\{seo\.h1\}/);
});

test("finished content no longer owns metadata or H1 fields", async () => {
  const content = JSON.parse(
    await readSource("content/finished-fabrics.json")
  );
  for (const page of content) {
    assert.equal("title" in page, false, `${page.url} title`);
    assert.equal("description" in page, false, `${page.url} description`);
    assert.equal("h1" in page, false, `${page.url} h1`);
    assert.equal("primaryKeyword" in page, false, `${page.url} keyword`);
  }
});

test("legacy categories no longer own a second meta description", async () => {
  const source = await readSource("lib/public-catalog.ts");
  assert.doesNotMatch(source, /metaDescription:/);
  assert.doesNotMatch(source, /metaDescription:\s*string/);
});

test("schema and llms discovery consume the SEO registry", async () => {
  const schema = await readSource("lib/finished-fabric-schema.ts");
  const llms = await readSource("app/llms.txt/route.ts");
  assert.match(schema, /seo:\s*PublicPageSeo/);
  assert.match(schema, /seo\.h1/);
  assert.match(schema, /seo\.metaDescription/);
  assert.match(llms, /getAllPublicPageSeo/);
  assert.match(llms, /page\.h1/);
  assert.match(llms, /page\.metaDescription/);
});
```

Run:

```powershell
node --test tests/site-seo-integration.test.mjs
```

Expected: FAIL because shared components still render legacy page headlines and content JSON still owns SEO fields.

- [ ] **Step 2: Pass the registry H1 through landing components**

Change `LandingHero`:

```ts
export function LandingHero({
  page,
  h1,
}: {
  page: PublicLandingPage;
  h1: string;
}) {
  // render {h1} inside the existing single <h1>
}
```

In homepage, ready-stock, custom-development, and finished-hub consumers, resolve the matching SEO record and pass `h1={seo.h1}`.

- [ ] **Step 3: Pass the registry H1 through catalogue and category pages**

Change `FabricsPageIntro` to accept `{ h1: string }` and render `{h1}` in its existing H1.

In `/fabrics`, call:

```tsx
<FabricsPageIntro h1={seo.h1} />
```

In the legacy category branch, render:

```tsx
<h1 className="...">{seo.h1}</h1>
```

- [ ] **Step 4: Pass the full SEO record to finished product and blog pages**

Change:

```ts
export function FinishedFabricPage({
  page,
  seo,
}: {
  page: FinishedFabricPageData;
  seo: PublicPageSeo;
}) {
```

Use `seo.h1` for the single H1. For blog-index cards and product links that previously used `article.h1`, `article.description`, or `page.h1`, look up the linked route and use its registry `h1` and `metaDescription`.

- [ ] **Step 5: Remove SEO fields from detailed content**

Update the `FinishedFabricPage` type to remove:

```ts
title: string;
description: string;
h1: string;
primaryKeyword?: string;
```

Remove those four properties from every record in `content/finished-fabrics.json`. Preserve `opening`, hero data, breadcrumbs, product data, dates, sections, FAQs, related links, and evidence boundaries.

Update existing content tests so title/description/H1 uniqueness is validated by `tests/site-seo-registry.test.mjs`, while content-depth and evidence-boundary checks remain in `tests/finished-fabric-content.test.mjs`.

Remove `metaDescription` from the `FabricCategory` type and the four legacy category records in `lib/public-catalog.ts`. In `app/fabrics/[slug]/page.tsx`, use `seo.metaDescription` for CollectionPage description fields.

Change the finished-fabric schema API to:

```ts
export function buildFinishedFabricSchema(
  page: FinishedFabricPage,
  seo: PublicPageSeo
) {
```

Replace every former `page.h1` and `page.description` schema reference with `seo.h1` and `seo.metaDescription`. Preserve the existing CollectionPage, WebPage, Article, FAQPage, BreadcrumbList, Thing, and organization evidence logic.

Update `app/llms.txt/route.ts` to map `getAllPublicPageSeo()` and emit each registry `h1`, `metaDescription`, and canonical URL. Keep company contact and evidence-boundary text already present in the route.

- [ ] **Step 6: Run focused and full tests**

Run:

```powershell
node --test tests/site-seo-integration.test.mjs tests/finished-fabric-content.test.mjs tests/semrush-foundation.test.mjs
npm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit the H1 and content-source migration**

```powershell
git add components/landing/LandingHero.tsx components/geo/GeoHomePage.tsx components/landing/ReadyStockLanding.tsx components/landing/CustomDevelopmentLanding.tsx components/FabricsPageIntro.tsx components/finished-fabric/FinishedFabricPage.tsx app/fabrics/page.tsx app/fabrics/[slug]/page.tsx app/finished-double-knit-fabrics/page.tsx app/blog/page.tsx app/blog/[slug]/page.tsx app/llms.txt/route.ts lib/finished-fabric-content.ts lib/finished-fabric-schema.ts lib/public-catalog.ts content/finished-fabrics.json tests/site-seo-integration.test.mjs tests/finished-fabric-content.test.mjs tests/semrush-foundation.test.mjs
git commit -m "refactor: source public H1 values from SEO registry"
```

## Task 5: Generate Sitemap From The Canonical Public Inventory

**Files:**

- Modify: `tests/site-seo-integration.test.mjs`
- Modify: `app/sitemap.ts`
- Test: `tests/site-seo-integration.test.mjs`

- [ ] **Step 1: Add the failing sitemap integration test**

```js
test("sitemap comes only from the unified public inventory", async () => {
  const source = await readSource("app/sitemap.ts");
  assert.match(source, /getAllPublicPageSeo/);
  assert.match(source, /page\.updatedAt/);
  assert.doesNotMatch(source, /new Date\(\)/);
  assert.doesNotMatch(source, /getFinishedFabricPages|getPublicFabricCategories/);
});
```

Run:

```powershell
node --test tests/site-seo-integration.test.mjs
```

Expected: FAIL because sitemap still merges multiple route sources and uses the current build time.

- [ ] **Step 2: Replace sitemap assembly**

Implement:

```ts
import type { MetadataRoute } from "next";
import {
  getAllPublicPageSeo,
  toCanonicalUrl,
} from "@/lib/seo/site-seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return getAllPublicPageSeo().map((page) => ({
    url: toCanonicalUrl(page.path),
    lastModified: new Date(`${page.updatedAt}T00:00:00.000Z`),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
```

- [ ] **Step 3: Run focused and full tests**

Run:

```powershell
node --test tests/site-seo-integration.test.mjs
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit the sitemap migration**

```powershell
git add app/sitemap.ts tests/site-seo-integration.test.mjs
git commit -m "fix: generate sitemap from canonical SEO inventory"
```

## Task 6: Add Production HTML Crawler And Report

**Files:**

- Create: `scripts/validate-production-seo.mjs`
- Create: `scripts/run-production-seo-audit.mjs`
- Create: `reports/seo/.gitkeep`
- Modify: `package.json`
- Modify: `tests/site-seo-integration.test.mjs`
- Test: `tests/site-seo-integration.test.mjs`

- [ ] **Step 1: Add failing script-presence and package-script checks**

```js
test("production SEO audit is an automated package workflow", async () => {
  const packageJson = JSON.parse(await readSource("package.json"));
  const validator = await readSource("scripts/validate-production-seo.mjs");
  const runner = await readSource("scripts/run-production-seo-audit.mjs");

  assert.equal(packageJson.scripts.typecheck, "tsc --noEmit");
  assert.equal(
    packageJson.scripts["test:seo:production"],
    "node scripts/run-production-seo-audit.mjs"
  );
  assert.match(validator, /Googlebot/);
  assert.match(validator, /sitemap\.xml/);
  assert.match(validator, /robots\.txt/);
  assert.match(validator, /reports\/seo\/production-html-audit\.json/);
  assert.match(runner, /node_modules.*next.*dist.*bin.*next/s);
  assert.match(runner, /"start"/);
});
```

Run:

```powershell
node --test tests/site-seo-integration.test.mjs
```

Expected: FAIL because the scripts and package entries do not exist.

- [ ] **Step 2: Implement the crawler**

Create `scripts/validate-production-seo.mjs`:

```js
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEO_SITE_ORIGIN,
  getAllPublicPageSeo,
  toCanonicalUrl,
} from "../lib/seo/site-seo.ts";

const baseUrl = (
  process.env.SEO_AUDIT_BASE_URL || SEO_SITE_ORIGIN
).replace(/\/$/, "");
const googlebot =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const reportUrl = new URL(
  "../reports/seo/production-html-audit.json",
  import.meta.url
);

function decodeHtml(value = "") {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"',
  };
  return value.replace(
    /&(#x[0-9a-f]+|#\d+|amp|apos|gt|lt|quot);/gi,
    (_, entity) => {
      if (entity[0] === "#") {
        const hex = entity[1]?.toLowerCase() === "x";
        const value = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
        return Number.isFinite(value) ? String.fromCodePoint(value) : _;
      }
      return named[entity.toLowerCase()] ?? _;
    }
  );
}

function getAttribute(tag, name) {
  const match = tag.match(
    new RegExp(
      `(?:^|\\s)${name}\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))`,
      "i"
    )
  );
  if (!match) return null;
  return decodeHtml(match[1] ?? match[2] ?? match[3] ?? "");
}

function cleanText(value = "") {
  return decodeHtml(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function collectTags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

function collectElementText(html, name) {
  return [
    ...html.matchAll(
      new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, "gi")
    ),
  ].map((match) => cleanText(match[1]));
}

function findMetaValues(html, attribute, expected) {
  return collectTags(html, "meta")
    .filter(
      (tag) =>
        getAttribute(tag, attribute)?.toLocaleLowerCase("en-US") ===
        expected.toLocaleLowerCase("en-US")
    )
    .map((tag) => getAttribute(tag, "content") ?? "");
}

function findCanonicalValues(html) {
  return collectTags(html, "link")
    .filter((tag) =>
      (getAttribute(tag, "rel") ?? "")
        .toLocaleLowerCase("en-US")
        .split(/\s+/)
        .includes("canonical")
    )
    .map((tag) => getAttribute(tag, "href") ?? "");
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

const expectedPages = getAllPublicPageSeo();
const expectedCanonicalUrls = expectedPages.map((page) =>
  toCanonicalUrl(page.path)
);
const requestHeaders = { "user-agent": googlebot };

const robotsResponse = await fetch(`${baseUrl}/robots.txt`, {
  headers: requestHeaders,
  redirect: "manual",
});
const robotsText = await robotsResponse.text();
const allowsGooglebot =
  robotsResponse.status === 200 &&
  !/user-agent:\s*googlebot[\s\S]*?disallow:\s*\/\s*(?:\r?\n|$)/i.test(
    robotsText
  );

const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`, {
  headers: requestHeaders,
  redirect: "manual",
});
const sitemapText = await sitemapResponse.text();
const sitemapUrls = [
  ...sitemapText.matchAll(/<loc>([\s\S]*?)<\/loc>/gi),
].map((match) => decodeHtml(match[1].trim()));
const sitemapMatchesRegistry =
  JSON.stringify(sorted(sitemapUrls)) ===
  JSON.stringify(sorted(expectedCanonicalUrls));

const pageResults = [];

for (const page of expectedPages) {
  const failures = [];
  const expectedCanonical = toCanonicalUrl(page.path);
  const requestUrl = `${baseUrl}${page.path === "/" ? "" : page.path}`;

  try {
    const response = await fetch(requestUrl, {
      headers: requestHeaders,
      redirect: "manual",
    });
    const html = await response.text();
    const titles = collectElementText(html, "title");
    const descriptions = findMetaValues(html, "name", "description");
    const ogDescriptions = findMetaValues(
      html,
      "property",
      "og:description"
    );
    const twitterDescriptions = findMetaValues(
      html,
      "name",
      "twitter:description"
    );
    const canonicalValues = findCanonicalValues(html);
    const h1Values = collectElementText(html, "h1");
    const imageTags = collectTags(html, "img");
    const imagesMissingAlt = imageTags.filter(
      (tag) => getAttribute(tag, "alt") === null
    );
    const robotsValues = findMetaValues(html, "name", "robots");
    const noindex = robotsValues.some((value) => /\bnoindex\b/i.test(value));
    const sitemapPresent = sitemapUrls.includes(expectedCanonical);

    if (response.status !== 200) failures.push(`HTTP ${response.status}`);
    if (titles.length !== 1) failures.push(`title count ${titles.length}`);
    if (titles[0] !== page.metaTitle) failures.push("title mismatch");
    if (descriptions.length !== 1) {
      failures.push(`description count ${descriptions.length}`);
    }
    if (descriptions[0] !== page.metaDescription) {
      failures.push("description mismatch");
    }
    if (
      ogDescriptions.length !== 1 ||
      ogDescriptions[0] !== page.metaDescription
    ) {
      failures.push("Open Graph description mismatch");
    }
    if (
      twitterDescriptions.length !== 1 ||
      twitterDescriptions[0] !== page.metaDescription
    ) {
      failures.push("Twitter description mismatch");
    }
    if (h1Values.length !== 1) failures.push(`H1 count ${h1Values.length}`);
    if (h1Values[0] !== page.h1) failures.push("H1 mismatch");
    if (canonicalValues.length !== 1) {
      failures.push(`canonical count ${canonicalValues.length}`);
    }
    if (canonicalValues[0] !== expectedCanonical) {
      failures.push("canonical mismatch");
    }
    if (imagesMissingAlt.length > 0) {
      failures.push(`${imagesMissingAlt.length} images missing ALT`);
    }
    if (noindex) failures.push("unexpected noindex");
    if (!sitemapPresent) failures.push("missing from sitemap");
    if (!allowsGooglebot) failures.push("Googlebot blocked by robots.txt");

    pageResults.push({
      url: expectedCanonical,
      path: page.path,
      primaryKeyword: page.primaryKeyword,
      searchIntent: page.searchIntent,
      title: titles[0] ?? "",
      metaDescription: descriptions[0] ?? "",
      h1: h1Values[0] ?? "",
      h1Count: h1Values.length,
      imageCount: imageTags.length,
      imageAltResult:
        imagesMissingAlt.length === 0
          ? "PASS"
          : `FAIL: ${imagesMissingAlt.length} missing`,
      canonical: canonicalValues[0] ?? "",
      statusCode: response.status,
      sitemapPresent,
      noindex,
      inaccessible: false,
      result: failures.length === 0 ? "PASS" : "FAIL",
      failures,
    });
  } catch (error) {
    pageResults.push({
      url: expectedCanonical,
      path: page.path,
      primaryKeyword: page.primaryKeyword,
      searchIntent: page.searchIntent,
      title: "",
      metaDescription: "",
      h1: "",
      h1Count: 0,
      imageCount: 0,
      imageAltResult: "FAIL: inaccessible",
      canonical: "",
      statusCode: null,
      sitemapPresent: sitemapUrls.includes(expectedCanonical),
      noindex: false,
      inaccessible: true,
      result: "FAIL",
      failures: [
        error instanceof Error ? error.message : String(error),
      ],
    });
  }
}

const inaccessible = pageResults.filter((page) => page.inaccessible).length;
const passed = pageResults.filter((page) => page.result === "PASS").length;
const failed = pageResults.filter((page) => page.result === "FAIL").length;
const checked = pageResults.length - inaccessible;
const unchecked = expectedPages.length - pageResults.length;
const globalFailures = [];

if (robotsResponse.status !== 200) {
  globalFailures.push(`robots.txt HTTP ${robotsResponse.status}`);
}
if (!allowsGooglebot) globalFailures.push("robots.txt blocks Googlebot");
if (sitemapResponse.status !== 200) {
  globalFailures.push(`sitemap.xml HTTP ${sitemapResponse.status}`);
}
if (!sitemapMatchesRegistry) {
  globalFailures.push("sitemap URL set does not match the SEO registry");
}

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  productionOrigin: SEO_SITE_ORIGIN,
  summary: {
    total: expectedPages.length,
    checked,
    passed,
    failed,
    unchecked,
    inaccessible,
  },
  robots: {
    status: robotsResponse.status,
    allowsGooglebot,
    sitemap: `${SEO_SITE_ORIGIN}/sitemap.xml`,
  },
  sitemap: {
    status: sitemapResponse.status,
    urlCount: sitemapUrls.length,
    matchesRegistry: sitemapMatchesRegistry,
  },
  globalFailures,
  pages: pageResults,
};

const reportPath = fileURLToPath(reportUrl);
await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`Total: ${report.summary.total}`);
console.log(`Checked: ${report.summary.checked}`);
console.log(`Passed: ${report.summary.passed}`);
console.log(`Failed: ${report.summary.failed}`);
console.log(`Unchecked: ${report.summary.unchecked}`);
console.log(`Inaccessible: ${report.summary.inaccessible}`);

for (const page of pageResults.filter((item) => item.result === "FAIL")) {
  console.error(`${page.path}: ${page.failures.join("; ")}`);
}
for (const failure of globalFailures) console.error(failure);

if (
  globalFailures.length > 0 ||
  failed > 0 ||
  unchecked > 0 ||
  inaccessible > 0
) {
  process.exitCode = 1;
}
```

- [ ] **Step 3: Implement the production-server runner**

Create `scripts/run-production-seo-audit.mjs`:

```js
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const port = process.env.SEO_AUDIT_PORT || "3210";
const baseUrl = `http://127.0.0.1:${port}`;
const nextCli = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);
const validator = fileURLToPath(
  new URL("./validate-production-seo.mjs", import.meta.url)
);

if (!existsSync(nextCli)) {
  throw new Error(`Next.js CLI not found at ${nextCli}`);
}

const server = spawn(process.execPath, [nextCli, "start", "-p", port], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ["ignore", "pipe", "pipe"],
});

server.stdout.on("data", (chunk) => process.stdout.write(chunk));
server.stderr.on("data", (chunk) => process.stderr.write(chunk));

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Next.js exited early with code ${server.exitCode}`);
    }
    try {
      const response = await fetch(baseUrl, { redirect: "manual" });
      if (response.status > 0) return;
    } catch {
      // The server socket is not ready yet.
    }
    await delay(250);
  }
  throw new Error(`Next.js did not become ready at ${baseUrl}`);
}

async function runValidator() {
  const child = spawn(process.execPath, [validator], {
    cwd: process.cwd(),
    env: { ...process.env, SEO_AUDIT_BASE_URL: baseUrl },
    stdio: "inherit",
  });
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
}

async function stopServer() {
  if (server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    delay(5_000),
  ]);
  if (server.exitCode === null) server.kill("SIGKILL");
}

let exitCode = 1;
try {
  await waitForServer();
  exitCode = await runValidator();
} finally {
  await stopServer();
}

process.exitCode = exitCode;
```

- [ ] **Step 4: Add package scripts**

```json
{
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "typecheck": "tsc --noEmit",
    "test:seo:production": "node scripts/run-production-seo-audit.mjs"
  }
}
```

Keep all existing scripts.

- [ ] **Step 5: Run source tests**

Run:

```powershell
node --test tests/site-seo-integration.test.mjs
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit the crawler**

```powershell
git add scripts/validate-production-seo.mjs scripts/run-production-seo-audit.mjs reports/seo/.gitkeep package.json tests/site-seo-integration.test.mjs
git commit -m "test: add production HTML SEO crawler"
```

## Task 7: Run Full Build Verification And Fix Rendered Failures Test-First

**Files:**

- Modify only files identified by fresh lint, typecheck, build, or rendered-crawl evidence.
- Test: relevant existing test plus the rendered crawler.

- [ ] **Step 1: Run lint**

```powershell
npm run lint
```

Expected: exit 0. Record existing warnings separately; fix any new warning introduced by this change.

- [ ] **Step 2: Run TypeScript**

```powershell
npm run typecheck
```

Expected: exit 0 with no TypeScript errors.

- [ ] **Step 3: Run the full source test suite**

```powershell
npm test
```

Expected: all tests pass, 0 fail.

- [ ] **Step 4: Run the production build**

```powershell
npm run build
```

Expected: exit 0 and all 22 public pages emitted as static output or static dynamic parameters.

- [ ] **Step 5: Run the production HTML audit**

```powershell
npm run test:seo:production
```

Expected:

```text
Total: 22
Checked: 22
Passed: 22
Failed: 0
Unchecked: 0
Inaccessible: 0
```

- [ ] **Step 6: Handle any failure with a focused RED-GREEN cycle**

For each failure:

1. add or tighten a source test that reproduces the failure;
2. run the focused test and confirm it fails for the reported reason;
3. apply the smallest implementation change;
4. rerun the focused test;
5. rebuild if final HTML is affected;
6. rerun the complete production audit.

Do not weaken title, description, H1, canonical, sitemap, robots, status, or ALT assertions to make a failing page pass.

- [ ] **Step 7: Commit verified rendered fixes only when evidence requires them**

The expected path is that no additional code changes are required after the first complete audit. If Step 6 identifies a real rendered failure, add a new exact file list and staging command to this plan before changing code, complete the focused RED-GREEN cycle, and commit that evidence-backed fix separately. Skip this step when the first full production audit passes.

## Task 8: Record Final Evidence And Project Memory

**Files:**

- Modify: `docs/next.md`
- Generated: `reports/seo/production-html-audit.json`
- Test: full verification sequence

- [ ] **Step 1: Update project memory**

Add:

```md
## Done

- Added a 22-page unified SEO registry and one metadata/H1/canonical/sitemap source.
- Added source validation and a production HTML crawler covering every sitemap page.

## Learned

- The current production deployment can lag the local main branch, so local build acceptance and live-domain deployment verification must be reported separately.
- Existing finished-fabric content had a primary-keyword conflict between the jacquard product page and the jacquard comparison guide.

## Risks

- Google Search Console reindex requests and live-domain verification remain external deployment steps.
- Page update dates must change only after material content changes.

## Next

- Deploy the verified commit.
- Request GSC reindexing for the homepage, manufacturer hub, catalogue, ready-stock, custom-development, Interlock, Ponte Roma, and Jacquard product pages.
- Re-run the production crawler against the deployed domain and monitor US/Australia rankings.
```

Merge this information into the existing `Done`, `Learned`, `Risks`, and `Next` sections rather than duplicating headings.

- [ ] **Step 2: Run fresh final verification**

Run all commands again in this order:

```powershell
git diff --check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:seo:production
git status --short
```

Expected:

- `git diff --check`: no whitespace errors.
- lint: exit 0.
- typecheck: exit 0.
- tests: 0 failures.
- build: exit 0.
- rendered audit: 22 checked, 22 passed, 0 failed, 0 unchecked, 0 inaccessible.
- status: only intentional task files plus the pre-existing untracked `docs/superpowers/plans/2026-07-19-vercel-domain-migration.md`.

- [ ] **Step 3: Commit project memory and the generated audit**

```powershell
git add docs/next.md reports/seo/production-html-audit.json
git commit -m "docs: record full-site SEO validation"
```

- [ ] **Step 4: Prepare the user-facing delivery**

Use the generated report and fresh command output to provide:

1. all 22 keyword-map rows;
2. all 22 URL verification rows;
3. conflict reassignments, including the jacquard comparison primary keyword;
4. exact changed files;
5. before/after metadata architecture;
6. test, lint, typecheck, build, and crawler results;
7. GSC high-priority URLs;
8. sitemap-discovery URLs;
9. incomplete items and external reasons;
10. explicit answers to every mandatory confirmation question.

Do not claim the live deployment has passed until the same crawler is run against `https://orangetextiles.com` after deployment.
