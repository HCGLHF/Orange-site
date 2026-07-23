# Orange Catalog Content Cluster Design

## Goal

Turn the owner-confirmed 104-product knit catalog into a publishable English buyer-education cluster for Orange Textiles. The cluster must improve search coverage and AI answer extraction without creating thin product-code pages or repeating generic textile copy.

## Approved Structure

Use the existing `FinishedFabricPage` registry and dynamic blog route. Add six indexable articles:

1. `/blog/air-layer-knit-fabric-sourcing-guide`
2. `/blog/how-to-source-wool-blend-knit-fabric`
3. `/blog/jacquard-knit-fabric-weight-and-width-guide`
4. `/blog/brushed-and-pile-knit-fabric-finishes`
5. `/blog/how-to-write-a-knit-fabric-rfq`
6. `/blog/knit-fabric-sourcing-questions`

The sixth route is the central short-answer Q&A hub. Each of the other five articles also carries three to five page-specific FAQs through the existing visible FAQ component and FAQ schema.

## Content Positioning

The articles answer sourcing decisions using current catalog evidence:

- Air-layer: composition, stretch, 260-300 GSM examples, 160 cm width examples, drape and sample checks.
- Wool blends: melange air-layer, acrylic-wool, cashmere-like, cashmere blend, lyocell-acetate-wool and when buyers should compare hand feel, fibre disclosure and care performance.
- Jacquard: 240-280 GSM examples, 160-165 cm width examples, pattern structure, usable width and approval checks.
- Brushed and pile finishes: raised pile, acetate brushed/directional pile, melton-like surfaces, nap direction, shedding and lot consistency.
- RFQ: article code, composition, GSM, usable width, colour, finish, testing, quantity, destination and sample approval.
- Q&A hub: concise direct answers grouped around supplier capability, specification reading, product families, sampling, RFQ and commercial confirmation.

Every page must include an answer-first opening, at least three substantive sections, a measurable checklist or table, at least three FAQs, and at least five contextual internal links.

## Evidence Boundary

All 104 catalog products and their stated specifications are owner-confirmed as valid website content. The content may name verified article codes, composition, GSM and width. It must not invent price, exact stock quantity, MOQ, fixed sample policy or guaranteed lead time. Those commercial fields remain inquiry-led.

The internal source PDF must not be offered as a download while it still contains source-brand and draft labelling. Content will be adapted into Orange Textiles pages.

## Visual Direction

Create five new landscape WebP hero images, one for each buyer guide. Images should show inspectable textile swatches, fabric structure, measurement tools or sample-approval context. They must avoid fake logos, labels, certificates, machinery claims, text overlays and unverified product-code markings. The Q&A hub may use the existing sample-inspection image.

## Internal Linking

- Blog index automatically exposes every new article.
- Air-layer guide links to the air-layer category, finished-fabric hub, catalogue, RFQ guide and Q&A hub.
- Wool and jacquard guides link to their relevant category pages, catalogue, sample inquiry and Q&A hub.
- Brushed/pile guide links to wool-blend, catalogue, RFQ and Q&A routes.
- RFQ guide links to catalogue, ready-stock route, custom development, sample inquiry and Q&A hub.
- Q&A hub links to all five new guides plus the primary catalogue and inquiry routes.

Relevant existing category pages receive selected links to the new guides through their existing related-link definitions. No global navigation or layout changes are required.

## Discovery and Schema

The existing sitemap and `llms.txt` derive from the content registry, so the six pages will enter both automatically. The existing article metadata, Open Graph, breadcrumbs and FAQ schema remain the implementation path. No Product, Offer, AggregateRating or Review schema is added.

## Testing

Extend the content tests before adding production content. Tests must fail until all six routes exist and then enforce:

- unique titles and descriptions;
- title length at most 65 characters;
- description length between 120 and 165 characters;
- answer-first opening;
- at least three sections;
- at least three FAQs;
- at least five internal links;
- at least 650 content words;
- expected article-code/specification evidence;
- no unverified commercial promises;
- existence of every new visual asset.

Run `npm test`, `npm run lint`, `npm run build`, `git diff --check`, a changed-file sensitive-pattern scan and desktop/mobile browser checks before committing.
