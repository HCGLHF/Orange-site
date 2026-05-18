# Next

## Done

- Created the initial project memory files required before future development: `CONTEXT.md`, `docs/architecture.md`, `docs/risks.md`, `docs/next.md`, and `docs/adr/`.
- Recorded the project memory and architecture self-check rule as an ADR.

## Learned

- The repository previously had implementation plans/specs under `docs/superpowers/`, but did not yet have root-level project memory files or architecture decision records.
- The current architecture separates public catalog/GEO content from inquiry CRM handling; this boundary should be protected.

## Risks

- Future changes may accidentally mix unrelated GEO experiments into the O'range Textile public site unless each task states the project goal and affected boundary first.
- Public crawl surfaces are sensitive to domain, language, and structured-data drift.

## Next

- Audit current source against `docs/architecture.md` and record any architecture drift found.
- Add a lightweight pre-push checklist for crawler surfaces: sitemap, robots, llms.txt, category pages, and English-only source scan.
- Review whether inquiry CRM failures need clearer user-facing fallback behavior.
