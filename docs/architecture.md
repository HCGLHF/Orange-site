# Architecture

## System Modules

- `app/`: Next.js App Router routes, metadata, sitemap, robots, API routes, and static page entry points.
- `components/`: UI components and page sections. Components should render data passed from page/data modules and avoid owning persistence or data-fetching policy.
- `lib/public-catalog.ts`: Local public fabric catalog and category data used by crawlable public pages.
- `lib/geo-content.ts`: Stable company facts, page copy, structured data inputs, and AI-search FAQ content.
- `lib/notion-inquiry-api.ts`: Inquiry CRM integration only. Notion may support internal inquiry capture, but public fabric rendering must not depend on it.
- `lib/inquiry-events.ts`: Inquiry event persistence/telemetry boundary.
- `public/`: Static assets.
- `docs/`: Project memory, architecture notes, risk log, next-step log, and ADRs.

## Responsibilities And Boundaries

- UI components render content and interactions; they should not directly decide data source strategy.
- Public catalog and GEO content modules own stable, crawlable public facts.
- API routes translate HTTP requests into module calls and should stay thin.
- Inquiry capture is separate from public catalog rendering.
- Structured data, sitemap, robots, and llms.txt must reflect production crawl intent.

## Data Flow

- Public pages: `app/*` -> `lib/public-catalog.ts` / `lib/geo-content.ts` -> `components/*`.
- Category pages: static params from public catalog -> category page metadata and body -> structured data.
- Fabric API: static public catalog -> JSON response.
- Inquiry API: request payload -> validation -> `lib/notion-inquiry-api.ts` and inquiry event handling.

## Dependency Direction

- `app/` may depend on `components/` and `lib/`.
- `components/` may depend on presentation helpers and stable content modules, but should not depend on route handlers.
- `lib/` should not depend on UI components.
- Inquiry integration should not be imported into public catalog or GEO content modules.

## Forbidden Boundary Crossings

- Do not make public fabric pages fetch from Notion at request time.
- Do not place business data parsing or persistence logic inside visual components.
- Do not create all-purpose service/helper/manager modules that combine UI, catalog, inquiry, and deployment concerns.
- Do not bypass existing data modules without recording the reason in `docs/next.md` or an ADR when the decision is durable.

## Development Self-Check

Before each change, answer:

- Which project goal does this serve?
- Which module boundaries does this affect?
- Does it violate any ADR?
- Is there a smaller, safer implementation?
- Does the change require a new ADR?
