# Next

## Approved fabric collections integration — 2026-09-10

- **Done:** Integrated the user-approved collection preview at `/fabrics`. Products now exposes Air-Layer & Structured Knits (45), Soft-Touch & Wool-Blend Knits (42), Textured & Brushed Knits (17), and View All Fabrics. Added the scoped Geist catalogue, illustrative collection images, specification rows, URL-backed search/filters/pagination, selected states and reduced-motion-aware interactions. Existing product/category URLs and homepage remain available. Sourcing evidence is retained in an expandable reference section.
- **Inquiry:** Selections use the existing provider/cart and real batch inquiry interface. Source weight labels survive the cart and payload, including ranges and confirmation labels. The collection page uses inline selection review instead of the duplicate floating cart. No inquiry was sent during browser QA; API retry, privacy and delivery behavior were preserved.
- **Verified:** Local Node contracts: 169 passed. Component suite: 266 passed, including seven new collection interaction/SSR tests and four cart-weight cases. TypeScript and production build passed; the build emits 44 static outputs and reports 119 kB first-load JavaScript for `/fabrics`. Local production HTML/SEO audit checked all 35 registered pages with 35 passed, zero failed/inaccessible. Browser checks covered collection deep links, filtering, source labels, article-to-batch handoff, Escape/focus restoration and desktop/mobile presentation. Independent code/exposure review found no remaining blockers. Existing FabricCard image lint warning remains unrelated to this change.
- **Learned:** The full catalogue stays local and first-page article markup remains server-rendered while tiny query observers synchronize client state. The three groups cover all 104 articles/11 series; catalogue JSON is unchanged. The legacy SEO discovery list expected an inquiry anchor in navigation, although the header now uses dialog buttons; discovery now lists actual route links and inquiry behavior remains covered by interaction tests.
- **Release:** User explicitly instructed pushing the approved design. Isolated work was based on `60c5b20`; unrelated original-checkout edits and generated audit output are outside the release. GitHub `HCGLHF/Orange-site` main is connected to Vercel project `orange-site` in `alphax-advisory`, serving `orangetextiles.com` (verified through Git status and Vercel CLI). The old local `.vercel/project.json` points elsewhere and was not used for deployment.
- **Risks:** These are local pre-commit test results, not proof of production deployment, mailbox receipt or field performance. No stock or article-photography claims were introduced. Session-only cart state remains unchanged.
- **Next:** Push the verified commit to main and verify that Vercel production reports the same commit; inspect the public collection page after deployment. Obtain article-specific photographs before introducing article photo cards.

## Done

- Created the initial project memory files required before future development: `CONTEXT.md`, `docs/architecture.md`, `docs/risks.md`, `docs/next.md`, and `docs/adr/`.
- Recorded the project memory and architecture self-check rule as an ADR.
- Added a native finished-fabric content registry with 20 crawlable hub, product, blog-index, and buyer-guide routes.
- Connected finished-fabric sample and RFQ calls to the existing inquiry modal and added the new product directions to its selector.
- Added finished-fabric discovery to `/fabrics`, `sitemap.xml`, and `llms.txt` without changing the primary navigation structure.
- Added generated finished-fabric imagery, evidence-bounded Product/Article/FAQ/Breadcrumb schema, and Node-based content quality tests.
- Consolidated the 28 indexable public routes into one keyword and SEO registry covering metadata, H1, schema, sitemap, and `llms.txt`.
- Added six catalogue-backed sourcing guides covering air-layer, wool-blend, jacquard specifications, brushed finishes, RFQ preparation, and sourcing questions, supported by five dedicated WebP visuals.
- Added an automated production-HTML audit for HTTP status, robots, sitemap membership, title, description, Open Graph, Twitter, H1, image ALT, canonical, and noindex state.
- Verified the local production build on 2026-07-23: 28 checked, 28 passed, 0 failed, 0 unchecked, and 0 inaccessible.
- Hardened inquiry delivery so identical retries keep byte-identical Resend payloads and idempotency keys, while edited single or batch payloads rotate their submission IDs.
- Added a bounded, abortable Resend retry policy and a 32 KiB raw inquiry request-body limit for declared and streamed bodies.
- Made populated inquiry honeypots return a generic success without sending, and kept daily or monthly Resend quota exhaustion out of short-lived retry loops.
- Limited inquiry source attribution to URL origin and pathname, removed client identifiers from delivery-error logs, and made Resend rate-limit retries honor provider reset headers within a 13.5-second total budget.
- Added one-time cleanup for the legacy browser inquiry key, routed header and drawer cart controls into the live inquiry flow, and restricted source attribution to registered production pages.

## Learned

- The repository previously had implementation plans/specs under `docs/superpowers/`, but did not yet have root-level project memory files or architecture decision records.
- The current architecture separates public catalog/GEO content from inquiry CRM handling; this boundary should be protected.
- The existing inquiry modal was reusable, but its fabric selector was a separate legacy list and had to be extended explicitly for new commercial routes.
- The checked-in lockfile was out of sync with its optional `@emnapi` dependency graph; regenerating it was required before `npm ci` could be reliable.
- Next.js normalizes the homepage canonical to the origin without a trailing slash, so the registry and sitemap now use the same exact homepage URL.
- A nested Git worktree needs `"root": true` in `.eslintrc.json` to prevent Next.js ESLint from loading the parent checkout's duplicate plugin configuration.
- Resend requires byte-identical request payloads when an idempotency key is reused; client retry identity must therefore follow the complete normalized payload rather than only the form lifecycle.
- The installed Resend SDK forwards an abort signal at runtime even though its public email request-options type does not currently declare that extra `RequestInit` field.
- Resend reports per-second throttling and daily/monthly quota exhaustion as distinct named 429 errors; only the per-second rate limit is useful to retry inside one request.
- Resend SDK responses include rate-limit headers at runtime; retry code should prefer `retry-after`, then `ratelimit-reset`, while preserving the route's end-to-end deadline.
- Removing a browser-storage writer does not delete records created by older releases; a narrowly scoped migration is required when historical inquiry PII may remain.

## Risks

- Future changes may accidentally mix unrelated GEO experiments into the O'range Textile public site unless each task states the project goal and affected boundary first.
- Public crawl surfaces are sensitive to domain, language, and structured-data drift.
- The existing `components/ui/FabricCard.tsx` still raises a non-blocking Next.js `<img>` lint warning.
- A clean install reports 39 dependency vulnerabilities and flags Next.js 14.2.33 for a published security update; handle the framework/dependency upgrade in a separate tested change.
- Article-level composition, GSM, usable width, finish, MOQ, lead time, tests, and availability must continue to be confirmed in quotations and labeled samples.
- Keep the server-side inquiry send budget below the browser's 15-second deadline if retry counts, backoff, or per-attempt timeouts change.

## Next

- Deploy the merged 28-page catalogue and SEO update, then rerun the production-HTML audit against `https://orangetextiles.com`.
- Request GSC reindexing for the homepage, commercial hubs, and early-opportunity Interlock, Ponte Roma, and Jacquard pages; allow the remaining pages to be rediscovered through the updated sitemap.
- Run Semrush Site Audit and keyword/content checks against the deployed Orange Textiles domain, then compare results with the low-difficulty finished-fabric keyword cluster.
- Review whether inquiry CRM failures need clearer user-facing fallback behavior.
- Monitor production inquiry delivery for timeout, rate-limit, and idempotency failures after deployment without logging buyer PII or provider details.
