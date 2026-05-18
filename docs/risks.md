# Risks

## Current Risks

- Domain and sitemap correctness remain high-impact for indexing; production URLs must stay aligned with Vercel/domain settings.
- Public content can drift into mixed brand or language content if new sections are added without reviewing the English-only overseas-market constraint.
- Inquiry handling still touches an external CRM integration; failures there should not block crawlable public pages.
- The homepage can become too dense if every GEO experiment is added directly to the main flow instead of using focused category or article pages.
- Local generated folders such as `.next`, `out`, and `dist` can obscure source scans if not separated from committed source review.

## Architecture Drift Signals

- A component imports Notion, filesystem, or persistence logic directly.
- A single module starts owning unrelated catalog, inquiry, SEO/GEO, and UI concerns.
- New public pages require runtime external data to render meaningful content.
- Chinese copy or filenames appear in committed public site source.
- Temporary crawler or deployment fixes are added without notes in `docs/next.md`.

## Watch List

- Keep `llms.txt`, `robots.txt`, and `sitemap.xml` synchronized with actual production pages.
- Keep public category pages fact-dense and stable for AI retrieval.
- Revisit inquiry CRM error handling before increasing paid or production traffic.
