# O'range Textile GEO-First Overseas Site Redesign

Date: 2026-05-15

## Goal

Rebuild the existing O'range Textile website into a pure-English overseas promotion site optimized for AI search crawlers and LLM answer engines. The primary audience is AI search systems and crawlers, with overseas apparel buyers as the human conversion audience.

The site should help crawlers confidently understand and summarize O'range Textile as a Chinese knit fabric manufacturer from Shaoxing Keqiao, focused on premium cotton, spandex, jersey, hoodie, and related knitted fabrics.

## Confirmed Decisions

- Language: English only.
- Primary positioning: Chinese knit fabric manufacturer.
- Product focus: cotton, spandex, jersey, hoodie knits, and related premium knitted fabrics.
- Primary conversion: request fabric samples.
- Secondary conversion: browse fabric library and send RFQ or bulk inquiry.
- Recommended architecture: Entity-first GEO hub, with selected catalog and buyer-journey sections below the fold.

## Non-Goals

- Do not build a multilingual site in this iteration.
- Do not redesign the site as a general fashion brand landing page.
- Do not replace the current Next.js framework.
- Do not remove the existing fabric library or inquiry flow unless a specific component becomes incompatible with the English-only crawler-first structure.

## Homepage Information Architecture

### 1. Hero

The hero must answer the crawler's main entity question immediately.

Proposed H1:

> Chinese Knit Fabric Manufacturer for Cotton, Spandex, Jersey and Hoodie Fabrics

The first paragraph should describe O'range Textile as a Shaoxing Keqiao-based knit fabric manufacturer supplying premium knitted fabrics for overseas apparel brands, sourcing teams, and private-label production.

Primary CTA: Request Fabric Samples

Secondary CTA: Browse Fabric Library

### 2. Entity Facts

Add a crawler-readable facts grid with stable labels and short factual values:

- Company: O'range Textile
- Legal name: Shaoxing Shicheng Textile Products Co., Ltd.
- Location: Shaoxing Keqiao, Zhejiang, China
- Industry: Knit fabric manufacturing and supply
- Main fabrics: cotton jersey, cotton spandex jersey, rib knit, fleece, terry, scuba / air-layer knits
- Applications: T-shirts, hoodies, sportswear, loungewear, children's wear, private-label apparel
- Sampling: sample requests available for overseas buyers
- MOQ: preserve the current 3000m reference unless the business team later changes it
- Export markets: Europe, the Americas, Middle East, Southeast Asia

### 3. Fabric Categories

Create a homepage category section that works as both human navigation and AI-readable product taxonomy:

- Cotton jersey fabrics
- Cotton spandex jersey fabrics
- Rib knit fabrics
- Fleece and French terry fabrics
- Scuba / air-layer knit fabrics
- Custom knitted fabrics

Each category should have a compact description and use-case examples.

### 4. Manufacturing Capabilities

Reframe the existing trust and factory sections into crawler-friendly capability statements:

- Shaoxing Keqiao textile cluster location
- 20,000 m2 production floor
- Fast sample response
- In-stock and custom fabric support
- Export communication and order support
- QC and certification readiness, including OEKO-TEX language only where accurate

### 5. Applications

Add an application section for long-tail AI search relevance:

- T-shirts
- Hoodies and sweatshirts
- Sportswear
- Loungewear
- Children's apparel
- Private-label apparel programs

Each application should connect fabric types to buyer needs.

### 6. Fabric Library Preview

Keep the fabric card system, but position it as supporting evidence for the manufacturer entity and product taxonomy. Show a limited preview on the homepage and link to the full fabric library.

Fabric cards should remain useful for buyers:

- Fabric name
- Composition
- Weight
- Width
- Tags or use cases
- Sample / inquiry action

### 7. FAQ for AI Search

Add a direct FAQ block with questions likely to appear in AI search and sourcing workflows:

- Is O'range Textile a knit fabric manufacturer?
- Where is O'range Textile located?
- What types of knit fabrics does O'range Textile supply?
- Can overseas buyers request fabric samples?
- What apparel applications are these fabrics used for?
- Does O'range Textile support custom knit fabric sourcing?
- How can buyers contact O'range Textile for an RFQ?

The answers should be concise, factual, and safe for AI answer engines to quote.

### 8. Contact and Sample Request

End the homepage with a clear sample request and contact section. The primary wording should be "Request Fabric Samples" rather than generic "Contact us." WhatsApp, email, and phone should remain available.

## GEO Optimization Framework

### Content Rules

- Put the primary entity definition in H1 and the first visible paragraph.
- Use complete, factual English sentences that can be extracted into AI summaries.
- Avoid mixed Chinese / English UI text on the public crawler-facing surface.
- Avoid slogan-only headings that do not identify the company or product category.
- Repeat core terms naturally across section headings and body copy: knit fabric manufacturer, cotton jersey, cotton spandex jersey, hoodie fabric, Shaoxing Keqiao.
- Use FAQ answers as direct answer blocks, not marketing copy.

### Structured Data

Add JSON-LD for:

- `Organization`
- `WebSite`
- `FAQPage`
- `ItemList` for fabric categories

Consider `Product` schema for individual fabric records after the fabric library copy and data model are fully English and stable.

### Crawl Infrastructure

Use Next.js metadata routes where possible:

- `app/robots.ts`
- `app/sitemap.ts`

Also update:

- `metadata.title`
- `metadata.description`
- Open Graph metadata
- Canonical URL, once the production domain is known
- `<html lang="en">`

## Technical Design

### Framework

Keep the existing Next.js 14 App Router project.

### Content Organization

Create a centralized content module such as `lib/geo-content.ts` to hold:

- Hero copy
- Entity facts
- Fabric categories
- Capability cards
- Application cards
- FAQ items
- Schema source data

This keeps crawler-facing copy easy to audit and reduces scattered hard-coded text.

### Component Boundaries

Recommended components:

- `GeoHero`
- `EntityFacts`
- `FabricCategories`
- `ManufacturingCapabilities`
- `ApplicationsGrid`
- `AiSearchFaq`
- `StructuredData`

The existing fabric library and inquiry components can be reused where practical, but homepage critical copy should not depend on client-side locale switching.

### Data Flow

- The homepage should render critical GEO content server-side or as static JSX so crawlers can see it without client interaction.
- Fabric preview can continue using the existing `resolveFabricsFromNotion()` data path.
- If Notion returns no fabrics, the page should still show the entity, category, capability, FAQ, and contact sections.
- Inquiry submission can continue through the existing inquiry flow.

### Language System

Remove or hide the language toggle on crawler-facing pages for this iteration. English copy becomes the canonical public content.

Existing locale infrastructure may remain internally if removing it would create unnecessary risk, but it should not create mixed-language visible content.

### Error Handling

- If the fabric source is empty or unavailable, show a clear English fallback message and keep the rest of the homepage intact.
- If inquiry submission fails, show the existing fallback path: direct email or WhatsApp.
- Schema generation should not depend on optional Notion data.

## Verification Plan

Run:

- `npm run build`
- TypeScript/build validation through the Next.js build
- Manual check of homepage HTML for English H1, entity facts, FAQ, and JSON-LD
- Check `/robots.txt`
- Check `/sitemap.xml`

If a dev server is started during implementation, verify the homepage and fabric library in a browser after changes.

## Deployment and Git

After implementation and verification:

- Commit the implementation changes intentionally.
- Set or update the Git remote to `https://github.com/HCGLHF/Orange-site.git` if needed.
- Push the completed branch to the GitHub repository requested by the user.

Existing uncommitted changes in the working tree must be preserved unless the user explicitly asks to discard them.
