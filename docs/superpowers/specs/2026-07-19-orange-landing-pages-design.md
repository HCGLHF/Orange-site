# O'range Textile Landing Pages Design

Date: 2026-07-19

## Context

The current desktop navigation exposes three inventory links: `In-stock fabrics`, `Preorder fabrics`, and `All knit fabrics`. All three intentionally reuse `/fabrics`, with the stock state encoded in the query string. The catalog filter only applies a query value when one exists, so removing `stock` does not explicitly reset the mounted filter to `all`. This can make the three links appear to produce the same result or leave the previous result active.

The site also needs a small set of human-facing landing pages. These pages must help an overseas apparel buyer understand the factory, available finished fabrics, purchasing routes, and next action within seconds. Their central value proposition and evidence cannot be generated mechanically. The code therefore needs a clear manual content entry point while preserving safe defaults and hiding incomplete sections.

## Goals

1. Make the three inventory links produce explicit, testable catalog states.
2. Give each inventory state a distinct visible heading and result summary without duplicating the entire catalog page.
3. Establish four landing pages with different buyer purposes and reading sequences.
4. Centralize manually authored landing-page copy, evidence, and editor guidance.
5. Preserve the existing catalog, inquiry cart, primary visual system, legacy product routes, and published finished-fabric content.
6. Keep unsupported claims, internal notes, and empty content blocks off the public site.

## Non-goals

- No CMS, authentication, admin dashboard, or database-backed content editor.
- No automatic generation of factory advantages, customer cases, certifications, capacity, MOQ, or lead-time claims.
- No replacement of the existing product catalog or inquiry workflow.
- No broad navigation redesign.
- No changes to DNS, hosting, analytics, or production permissions.

## Confirmed Landing Pages

### 1. Homepage: `/`

Purpose: establish trust and route visitors by purchasing intent.

Reading order:

1. Full-width image-led hero with factory identity, product category, and two actions.
2. Compact proof strip for verified location, product range, equipment evidence, and export support.
3. Three buyer routes: ready stock, finished double-knit fabrics, and custom development.
4. A small set of manually verified advantages.
5. Selected finished-fabric categories and current product examples.
6. Sample and RFQ conversion band.

The homepage must not lead with SEO explanations or a long generic company introduction.

### 2. Ready-stock landing page: `/ready-stock-knit-fabrics`

Purpose: answer what is available now and help buyers move directly to a sample or RFQ.

Reading order:

1. Availability-led hero with a manually maintained status statement and update date.
2. Stock summary and purchasing boundary notes.
3. Existing catalog filters and product cards, locked initially to `in-stock`.
4. Buyer checklist for composition, weight, width, colour, quantity, and application.
5. Sample and RFQ actions.
6. Short availability FAQ.

The page must not imply that every displayed product has a guaranteed 24-hour dispatch unless that claim is explicitly enabled in the manual content registry.

### 3. Finished double-knit landing page: `/finished-double-knit-fabrics`

Purpose: help buyers select among finished double-knit directions.

Reading order:

1. Product-category hero with a real finished-fabric image.
2. Product matrix for interlock, Ponte Roma, scuba/air-layer, jacquard, wool-blend, and rib.
3. Selection logic based on structure, stretch, warmth, hand feel, and surface effect.
4. Machine and construction evidence within the supplied evidence boundary.
5. Links to product detail pages.
6. Sample brief guidance and conversion band.

The existing page remains the canonical URL. Its information order will be improved without deleting its published content.

### 4. Custom development landing page: `/custom-knit-fabric-development`

Purpose: collect a usable development brief from buyers who do not have a matching stock SKU.

Reading order:

1. Brief-led hero explaining when custom development is appropriate.
2. Required buyer inputs: composition, weight, width, colour, hand feel, application, reference, and target quantity.
3. Four-step process: brief, recommendation, sample, confirmation.
4. Capability and decision boundaries.
5. Structured RFQ action using the existing inquiry system.
6. Process FAQ.

The page must distinguish confirmed capabilities from details that require factory review.

## Inventory Navigation Fix

The existing routes remain:

- `In-stock fabrics` → `/fabrics?stock=in-stock`
- `Preorder fabrics` → `/fabrics?stock=preorder`
- `All knit fabrics` → `/fabrics`

The catalog filter becomes fully URL-driven:

- `stock=in-stock` sets `stock` to `in-stock`.
- `stock=preorder` sets `stock` to `preorder`.
- Missing or unsupported `stock` explicitly sets `stock` to `all`.
- A query change always updates the mounted filter state.

The catalog intro and result summary reflect the active state so that buyers can immediately see whether they are browsing stock, preorder, or all fabrics. The catalog remains one reusable page rather than three duplicated product listings.

## Manual Content Entry Point

Create `content/landing-pages.ts` as the single editing surface. It exports typed records for `home`, `readyStock`, `finishedDoubleKnit`, and `customDevelopment`.

Each record supports:

- `eyebrow`
- `headline`
- `summary`
- primary and secondary CTA labels and URLs
- verified proof points
- advantage blocks
- evidence blocks
- buyer checklist
- FAQ entries
- `editorNotes`
- an explicit publication flag for optional sections

`editorNotes` are never passed to rendering components or structured data. Optional sections render only when enabled and when all required public fields are populated. Initial public copy is limited to facts already present on the production site or supplied factory evidence.

## Component Boundaries

- `LandingHero`: image-led first viewport, headline, summary, and two actions.
- `LandingProofStrip`: short verified facts only.
- `LandingRouteChooser`: three purchasing-intent routes used on the homepage.
- `LandingEvidenceSection`: manually authored evidence with source labels kept internal.
- `LandingCtaBand`: sample and RFQ actions wired to existing inquiry behavior.
- `ReadyStockLanding`: composes availability content with the existing catalog.
- `CustomDevelopmentLanding`: composes brief guidance and inquiry actions.

These components accept public content values rather than importing the entire registry. This prevents editor notes from reaching the client bundle or HTML.

## Visual Direction

The site keeps its current orange, charcoal, cream, green, and blue vocabulary. Landing pages use an industrial editorial direction:

- real factory, machine, fabric-surface, or apparel imagery;
- full-width image-led heroes rather than split marketing cards;
- restrained rectangular panels with radii no larger than the existing system;
- full-width content bands and uncluttered evidence tables;
- compact headings inside catalog and form surfaces;
- visible next-section content in the first viewport;
- no decorative gradient orbs, nested cards, or invented certification badges.

The four pages share typography and controls but not the same module order.

## Metadata And Structured Data

- Every landing page receives a unique title, description, canonical URL, H1, and direct answer.
- The homepage keeps Organization and WebSite context.
- Ready stock uses CollectionPage/ItemList semantics only for real product URLs.
- Finished double-knit keeps Product/CollectionPage, FAQ, and breadcrumb data aligned with visible content.
- Custom development uses Service, FAQ, and breadcrumb data aligned with visible content.
- New routes are added to `sitemap.xml` and `llms.txt`.
- No unpublished editor note or unverified claim enters JSON-LD.

## Error And Empty States

- Missing optional content hides the entire optional section.
- Missing hero imagery falls back to an existing approved fabric image without showing an empty placeholder.
- An empty stock catalog shows the existing contact-based fallback and never claims current availability.
- Unsupported stock query values resolve to the all-fabrics state.

## Testing Strategy

Tests are written before implementation and must cover:

1. Query removal resets the catalog stock filter to `all`.
2. Each top navigation link has the expected URL and visible active state.
3. The four landing-page records have unique purpose, title, description, H1, and CTA routing.
4. `editorNotes` do not appear in rendered output or schema.
5. Optional incomplete sections are hidden.
6. New routes appear in sitemap and llms.txt.
7. Sample and RFQ actions use the existing inquiry behavior.
8. Existing fabric routes and finished-fabric tests continue to pass.

Final validation includes `npm test`, `npm run lint`, `npm run build`, sensitive-information scanning, and Playwright screenshots for desktop and mobile. The inventory links must be clicked in-browser to verify the original defect is resolved.

## Release Flow

Implementation will stay on `codex/orange-landing-pages`. After local verification, the branch will be pushed to the user fork and opened as a cross-repository PR into `HCGLHF/Orange-site:main`. Semrush testing starts only after the PR is merged and the production deployment is live.
