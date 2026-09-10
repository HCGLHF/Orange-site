# Fabric Collections Release Implementation Plan

**Goal:** Ship the user-approved three-collection catalogue and restrained interactions through the existing production website.

**Architecture:** Keep the public catalogue as the source of article specifications. Add a typed collection presentation module and a React catalogue at the existing `/fabrics` URL. Reuse the existing inquiry/cart providers and stable product/guide routes; remove competing catalogue entry grids from the main discovery flow. Work in an isolated Git worktree so unrelated local edits cannot enter this release.

**Tech Stack:** Next.js 14, React 18, TypeScript, local catalogue JSON, existing Lucide icons, local Geist font, CSS and Web Animations.

## Architecture self-check
The change serves focused B2B fabric discovery. Affected boundaries are navigation, public catalogue presentation and the UI adapter to the existing inquiry cart. Data does not depend on UI or delivery. ADR 0001 is respected; no new persistence/provider or route removal is needed. A small presentation module is sufficient, so no new ADR is required.

## Tasks
- [x] Add `lib/fabric-collections.ts`: explicit three-group series mapping, collection definitions and pure filtering/measurement helpers. Consume the existing `Fabric` type; keep source JSON intact. Verify 104 unique records map to 45/42/17 and missing measurements retain confirmation labels.
- [x] Update `lib/navigation.ts` and navigation query handling: Products has Air-Layer & Structured Knits (`/fabrics?collection=structured`), Soft-Touch & Wool-Blend Knits (`/fabrics?collection=soft-touch`), Textured & Brushed Knits (`/fabrics?collection=textured`), and View All Fabrics (`/fabrics`). Preserve other public routes and keyboard behavior.
- [x] Add `components/collections/` for the approved introduction, three collection images, specification rows, search, series/material/weight filtering, eight-item pagination and native article dialog. Use the existing `useInquiryCart()` for selections and `RequestQuoteButton` for the actual inquiry flow. Add scoped styles and a reduced-motion-aware motion hook; preserve URL state and Back navigation.
- [x] Replace the competing grids on `app/fabrics/page.tsx` with the approved collection experience. Keep production metadata and the `inquiry-form` anchor. Preserve useful category/guide links in a compact sourcing reference disclosure. Keep existing homepage and public category/product URLs available.
- [x] Run Node catalogue/route contracts, component tests, TypeScript, lint and production build in the isolated worktree. Verify browser collection navigation, filtering, missing specifications, selection-to-inquiry handoff, keyboard focus, responsive layout and console errors. Do not submit a real inquiry during QA.
- [ ] Review the release diff for scope, correctness and exposed credentials; update `docs/next.md` with actual evidence. Commit only this release, push a fast-forward update to the configured repository, and inspect Vercel status for that commit.

## Verification commands
`npm test`, `npm run test:components`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`.

Browser acceptance: all three group totals; search GD2591 and check confirmation labels; filter Raised-pile to two; add an article and open the existing batch inquiry without sending; Escape restores focus; no horizontal overflow at desktop and mobile; no console errors. Production deployment is reported only after the provider confirms the exact commit.

## Release boundary
User approved the polished preview and instructed pushing it. Unrelated dirty files from the original checkout, local runtime files, credentials and prior experiment directories are outside this commit. Original routes and email delivery controls remain intact.
