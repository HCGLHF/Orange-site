# Full-Site SEO Remediation Design

## Purpose

Make every indexable page on `https://orangetextiles.com` use one auditable SEO source of truth, with `double knit fabric` as the homepage topic, commercial manufacturer and supplier terms on commercial routes, product terms on fabric routes, and educational questions on buyer guides.

The site serves global English-speaking B2B buyers. The United States and Australia are priority commercial markets, but the site will not create duplicate country pages with the same intent. Existing public URLs remain unchanged.

## Project And Architecture Fit

This change serves the project goal of making O'range Textile understandable to overseas apparel buyers, search crawlers, and AI retrieval systems.

The affected boundaries are:

- `lib/`: owns the public SEO registry, keyword assignments, metadata generation, and public-route inventory.
- `app/`: consumes the registry for route metadata and sitemap generation.
- `components/`: renders the registry H1 where the current page body needs an SEO-controlled heading.
- `content/`: continues to own detailed product and guide copy; it does not become a second metadata system.
- `tests/`: validates both source configuration and rendered production HTML.

The design preserves the existing public-catalogue, GEO-content, inquiry, and structured-data boundaries. It does not require a new architecture decision record because it clarifies the existing `app -> lib -> components` dependency direction instead of changing it.

## Public Page Inventory

The target inventory contains 22 unique public HTML pages. API routes, `robots.txt`, `sitemap.xml`, `llms.txt`, static assets, redirect responses, 404 pages, and pages with an intentional `noindex` directive are not counted as public HTML pages.

| URL | Primary keyword | Intent | Cluster | Page type |
| --- | --- | --- | --- | --- |
| `/` | `double knit fabric` | commercial | core-category | homepage |
| `/fabrics` | `finished knit fabrics` | commercial | commercial-catalogue | service page |
| `/ready-stock-knit-fabrics` | `ready-stock knit fabrics` | transactional | commercial-stock | service page |
| `/finished-double-knit-fabrics` | `double knit fabric manufacturer` | transactional | commercial-manufacturer | service page |
| `/custom-knit-fabric-development` | `custom knit fabric development` | transactional | commercial-development | service page |
| `/fabrics/cotton-jersey` | `cotton jersey fabric` | commercial | product-jersey | service page |
| `/fabrics/cotton-spandex-jersey` | `cotton spandex jersey fabric` | commercial | product-jersey | service page |
| `/fabrics/fleece-french-terry` | `french terry fabric` | commercial | product-terry | service page |
| `/fabrics/scuba-air-layer` | `air-layer fabric` | commercial | product-structured-knit | service page |
| `/fabrics/interlock-fabric` | `interlock fabric` | commercial | product-double-knit | service page |
| `/fabrics/ponte-roma-fabric` | `ponte roma fabric` | commercial | product-double-knit | service page |
| `/fabrics/scuba-air-layer-fabric` | `scuba knit fabric` | commercial | product-structured-knit | service page |
| `/fabrics/jacquard-knit-fabric` | `jacquard knit fabric` | commercial | product-jacquard | service page |
| `/fabrics/wool-blend-knit-fabric` | `wool blend knit fabric` | commercial | product-wool-blend | service page |
| `/fabrics/rib-knit-fabric` | `rib knit fabric` | commercial | product-rib | service page |
| `/blog` | `knit fabric buyer guides` | informational | buyer-education | guide page |
| `/blog/what-is-double-knit-fabric` | `what is double knit fabric` | informational | buyer-education-double-knit | blog page |
| `/blog/what-is-interlock-fabric` | `what is interlock fabric` | informational | buyer-education-double-knit | blog page |
| `/blog/what-is-ponte-fabric` | `what is ponte fabric` | informational | buyer-education-double-knit | blog page |
| `/blog/what-is-scuba-knit-fabric` | `what is scuba knit fabric` | informational | buyer-education-structured-knit | blog page |
| `/blog/what-is-rib-knit-fabric` | `what is rib knit fabric` | informational | buyer-education-rib | blog page |
| `/blog/jacquard-knit-vs-woven-jacquard` | `jacquard knit vs woven jacquard` | informational | buyer-comparison-jacquard | blog page |

The exact primary keyword is unique across the inventory. Commercial phrases such as `double knit fabric supplier`, `knit fabric supplier`, `knitted fabric manufacturer`, `wholesale knit fabric`, and market modifiers for the United States and Australia are assigned as secondary keywords rather than creating competing primary pages.

## Unified SEO Registry

Create a focused registry under `lib/seo/` with one record for each public URL:

```ts
type SearchIntent =
  | "informational"
  | "commercial"
  | "transactional"
  | "navigational";

type SeoPageType =
  | "homepage"
  | "service"
  | "guide"
  | "blog";

type PublicPageSeo = {
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
```

The registry is the authoritative source for keyword ownership, final page title, description, H1, canonical path, sitemap membership, and crawl metadata. Detailed product evidence, body sections, FAQs, hero images, and existing schema remain in their current content modules.

Provide lookup and generation helpers:

- `getPublicPageSeo(path)` returns a validated page record.
- `getAllPublicPageSeo()` returns the complete ordered public inventory.
- `createPageMetadata(page, options)` returns Next.js `Metadata`.
- `createPageMetadata` uses an absolute title so the root layout cannot append the brand twice.
- Open Graph and Twitter title and description use the same final registry values.
- Canonical URLs resolve against the configured HTTPS production origin.
- Pages default to index and follow.

Dynamic product and blog routes look up the SEO record by the resolved path. Static routes do the same. Unknown dynamic routes continue to return 404.

## Metadata Rules

Every `metaTitle`:

- starts with the exact primary keyword, compared case-insensitively;
- is at most 70 JavaScript characters;
- is unique across the public inventory;
- contains `O'range Textile` at most once;
- uses an absolute Next.js title.

Every `metaDescription`:

- is unique;
- is 160–300 JavaScript characters;
- contains the exact primary keyword, compared case-insensitively;
- identifies the intended buyer, the page value, and an evidence-aligned next action;
- avoids unsupported rankings, availability, lead-time, MOQ, certification, and performance promises.

Descriptions are written for global English-speaking B2B buyers. United States and Australia terms appear only where they read naturally and do not make unverified service or availability claims.

## H1 And Body Integration

Every final HTML page contains exactly one visible `<h1>`. The H1 comes from the same registry record used for metadata and contains the exact primary keyword.

The implementation will pass the SEO H1 into existing page components or retrieve it in the route before rendering. Navigation, logo, inquiry modal, and shared layout components remain free of H1 elements. Existing H2/H3 hierarchy and body copy remain intact unless a small wording change is necessary to align the opening section with the assigned intent.

## Image ALT Policy

Every rendered `<img>` must contain an `alt` attribute:

- informative images describe the visible fabric, use, or inspection context;
- logo images use the brand name or a concise logo description;
- decorative images use `alt=""`;
- repeated cards retain distinct product-specific ALT text;
- keywords are used only when they naturally describe the image.

The source test scans React image usage for obvious omissions. The production crawler is authoritative: it inspects every rendered `<img>` across all 22 pages and fails if the `alt` attribute is absent.

## Canonical, Robots, Sitemap, And Last-Modified

Every public page must:

- return HTTP 200;
- contain exactly one canonical link;
- use `https://orangetextiles.com` plus the normalized page path;
- contain no `noindex`;
- remain allowed by `robots.txt`;
- appear exactly once in `sitemap.xml`;
- render title, description, H1, and canonical in the server-generated HTML.

The sitemap is generated from `getAllPublicPageSeo()`. It no longer assigns the current build time to every route. `updatedAt` values use the latest known content or code update associated with the page and only change when the page record is materially updated.

## Regression And Production Verification

Implementation follows test-driven development.

### Registry Validation

A new Node test fails before the registry exists, then validates:

- exactly 22 public page records;
- normalized, unique paths;
- non-empty and unique primary keywords;
- 2–5 secondary keywords per page;
- allowed intent and page-type values;
- title prefix, length, uniqueness, and brand count;
- description length, keyword inclusion, and uniqueness;
- H1 keyword inclusion;
- valid ISO update dates;
- sitemap-safe priorities and change frequencies.

### Source Integration Validation

Tests verify:

- every page route uses the shared metadata generator;
- dynamic routes resolve metadata by final path;
- sitemap consumes the unified inventory;
- the root layout does not apply a title template that can duplicate the brand;
- Open Graph and Twitter descriptions derive from the final SEO description;
- no public route maintains a conflicting standalone SEO object.

### Rendered HTML Validation

After a successful production build, start the production server on a local port and run a crawler that:

1. requests `/robots.txt` and `/sitemap.xml`;
2. extracts every same-origin HTML URL from the sitemap;
3. requires the URL set to equal the 22-page registry;
4. requests every page with a Googlebot user agent;
5. records HTTP status, title, meta description, H1 count and text, canonical links, robots directives, Open Graph and Twitter descriptions, and every image ALT;
6. writes one PASS or FAIL row per URL and a summary with checked, passed, failed, unchecked, and inaccessible counts.

The crawler fails the test command if any page violates a required rule. It also verifies that final HTML matches the registry rather than merely checking source files.

## Delivery Report

The final report will include:

- the complete 22-page keyword map;
- a row for every URL with primary keyword, intent, title, description, H1, ALT result, canonical, and PASS or FAIL;
- keyword conflicts found before implementation and their reassignment;
- changed files and before/after behavior;
- test, lint, TypeScript, production build, and rendered-crawl results;
- high-priority pages for manual Google Search Console reindex requests;
- lower-priority pages that can be rediscovered through the sitemap;
- unchecked or inaccessible pages with exact reasons;
- explicit answers to all seven completion questions in the request.

The local production build is the implementation acceptance environment. The currently deployed site is audited separately because deployment is outside this code-change scope and the live domain may still serve an older commit until the new code is deployed.
