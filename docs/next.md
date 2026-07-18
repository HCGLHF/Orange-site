# Next

## Done

- Created the initial project memory files required before future development: `CONTEXT.md`, `docs/architecture.md`, `docs/risks.md`, `docs/next.md`, and `docs/adr/`.
- Recorded the project memory and architecture self-check rule as an ADR.
- Added a native finished-fabric content registry with 14 crawlable hub, product, blog-index, and buyer-guide routes.
- Connected finished-fabric sample and RFQ calls to the existing inquiry modal and added the new product directions to its selector.
- Added finished-fabric discovery to `/fabrics`, `sitemap.xml`, and `llms.txt` without changing the primary navigation structure.
- Added generated finished-fabric imagery, evidence-bounded Product/Article/FAQ/Breadcrumb schema, and Node-based content quality tests.

## Learned

- The repository previously had implementation plans/specs under `docs/superpowers/`, but did not yet have root-level project memory files or architecture decision records.
- The current architecture separates public catalog/GEO content from inquiry CRM handling; this boundary should be protected.
- The existing inquiry modal was reusable, but its fabric selector was a separate legacy list and had to be extended explicitly for new commercial routes.
- The checked-in lockfile was out of sync with its optional `@emnapi` dependency graph; regenerating it was required before `npm ci` could be reliable.

## Risks

- Future changes may accidentally mix unrelated GEO experiments into the O'range Textile public site unless each task states the project goal and affected boundary first.
- Public crawl surfaces are sensitive to domain, language, and structured-data drift.
- The existing `components/ui/FabricCard.tsx` still raises a non-blocking Next.js `<img>` lint warning.
- A clean install reports 39 dependency vulnerabilities and flags Next.js 14.2.33 for a published security update; handle the framework/dependency upgrade in a separate tested change.
- Article-level composition, GSM, usable width, finish, MOQ, lead time, tests, and availability must continue to be confirmed in quotations and labeled samples.

## Next

- Merge `test/orange-finished-fabric-seo` after review and verify the production deployment.
- Run Semrush Site Audit and keyword/content checks against the deployed Orange Textiles domain.
- Compare Semrush findings with the new low-difficulty finished-fabric keyword cluster before the next content iteration.
- Review whether inquiry CRM failures need clearer user-facing fallback behavior.
