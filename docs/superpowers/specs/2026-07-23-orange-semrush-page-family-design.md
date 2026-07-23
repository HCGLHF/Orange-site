# Orange Semrush Page-Family Optimization Design

## Objective

Reduce the current Semrush AI Search and warning signals without weakening
the site's verified content boundary or changing navigation and visual design.
The implementation must preserve zero errors and a Site Health score of at
least 99%.

## Current Evidence

The 2026-07-23 saved audit crawled 32 pages and reported:

- Site Health: 99%
- Errors: 0
- Warnings: 28
- AI Search Health: 99%
- AI Search issues: 3
- Low text/HTML ratio pages: 28
- Sitemap orphan pages: 1

The three AI Search issues are pages with only one inbound internal link:

- `/blog/brushed-and-pile-knit-fabric-finishes`
- `/blog/how-to-source-wool-blend-knit-fabric`
- `/blog/jacquard-knit-fabric-weight-and-width-guide`

All 28 indexable HTML pages are in the low text/HTML ratio bucket. The six
newly published buyer guides expanded that bucket from 22 to 28, which makes
this a page-family and rendering-density issue rather than a missing paragraph
on one isolated URL.

## Approved Approach

Use a bounded three-part change.

### 1. Repair the Content Graph

Each flagged guide will receive at least two additional inbound links from
pages with a matching buyer intent:

- The wool-blend product route will link to both the wool-blend sourcing guide
  and the brushed/pile finish guide.
- The jacquard product route will link to the jacquard weight and width guide.
- The finished double-knit hub will link to the three specialist guides as
  next-step research routes.

These links will live in the existing `relatedLinks` content data and render
inside the page body. The global navigation will not change. Labels and
descriptions will state why the destination is useful instead of repeating
keyword-only anchors.

### 2. Normalize the Root URL

The canonical URL helper will return `https://orangetextiles.com/` for the
homepage. The sitemap and page metadata already use the same helper, so this
single normalization point will align both outputs.

An automated test will verify:

- the root canonical includes the trailing slash;
- the homepage sitemap entry uses that same URL;
- non-root canonical URLs remain unchanged.

This tests the leading explanation for the reported sitemap orphan signal:
Semrush may be separating the no-slash root value from the crawlable slash
variant. A post-deploy audit will determine whether the warning is removed.

### 3. Run a Buyer-Guide Density Experiment

The experiment is limited to the six catalogue-derived buyer guides:

- air-layer sourcing;
- wool-blend sourcing;
- jacquard weight and width;
- brushed and pile finishes;
- knit fabric RFQ;
- sourcing questions.

Each guide will gain a page-specific evidence snapshot and buyer decision
block. The text must use facts already present in the catalogue and existing
content registry. No unverified stock, lead-time, MOQ, certification, fibre,
or performance claim may be introduced.

The component will render these blocks with semantic headings, paragraphs, and
compact lists. It will avoid a card for every sentence. Existing page
structure, brand styling, navigation, CTA flow, schema, and URL paths remain
unchanged.

This is an experiment, not a promise that all 28 low-ratio warnings will
disappear in one audit. The expected signal is a reduction among the six guide
URLs without increasing errors or content duplication. A successful result
can then be extended to other page families.

## Data and Rendering Boundaries

`content/finished-fabrics.json` remains the source for page-specific copy and
internal routes. The content model will gain a small optional evidence field
used only where a guide has verifiable source material.

`lib/finished-fabric-content.ts` will validate and expose the field through the
existing page type. `components/finished-fabric/FinishedFabricPage.tsx` will
render it only when present.

The SEO registry in `lib/seo/site-seo.ts` remains the source for title,
description, H1, canonical, intent, and keyword assignment. No duplicate SEO
registry will be introduced.

## Tests

Tests will be written before production changes and observed failing for the
missing behavior.

1. Content graph test:
   - each of the three flagged guides has at least three inbound links in the
     content registry, including the existing blog-index entry;
   - links come from contextually related product or hub pages.
2. Canonical test:
   - the root canonical and sitemap root URL are the same slash-terminated URL;
   - non-root paths remain canonicalized normally.
3. Guide density test:
   - each of the six guides has a unique evidence snapshot;
   - the snapshot contains a heading, original explanatory copy, and at least
     two evidence or decision items;
   - no forbidden commercial or material claims are introduced.
4. Full verification:
   - `npm.cmd test`
   - `npm.cmd run lint`
   - `npm.cmd run typecheck`
   - `npm.cmd run build`
   - the production SEO audit against a local production build
   - sensitive-information scan

## Release and Measurement

Changes continue on `codex/orange-semrush-foundation`. After local
verification, the branch is pushed and a pull request is opened against
`HCGLHF/Orange-site:main`.

After merge and production deployment:

- rerun Semrush Site Audit;
- require Errors to remain 0;
- require Site Health to remain at least 99%;
- target AI Search issues from 3 to 0;
- target the sitemap orphan warning from 1 to 0;
- compare the six guide URLs in the low text/HTML ratio list;
- record both improvements and regressions in the Orange Semrush report and
  company memory.

If the guide-family ratio does not improve, do not add more generic copy.
Inspect rendered HTML and Semrush page details, then compare one alternative
template-level reduction before broadening the change.
