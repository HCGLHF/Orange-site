# Semrush Schema and Crawl Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Orange Textiles' seven invalid structured-data items and restore server-rendered entry links to all blog articles and public fabric categories.

**Architecture:** Keep the existing content registries as the source of truth. Change schema builders to reflect inquiry-led pages truthfully, then render dedicated crawlable link grids from the existing blog and category registries. Do not change global navigation or catalogue interaction behavior.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Node test runner.

---

### Task 1: Lock the Semrush regressions with tests

**Files:**
- Modify: `tests/finished-fabric-content.test.mjs`
- Modify: `tests/landing-pages.test.mjs`

- [ ] Add assertions that `lib/finished-fabric-schema.ts` contains a `WebPage` primary type and does not emit a `Product` type.
- [ ] Add assertions that `fabricCategoryItemListJsonLd` assigns `${siteUrl}/fabrics/${category.slug}` to each list item.
- [ ] Add assertions that the blog index imports `getFinishedBlogArticles`, maps the articles, and renders `href={article.url}`.
- [ ] Add assertions that the catalogue imports `getPublicFabricCategories`, maps the categories, and renders `/fabrics/${category.slug}` links.
- [ ] Run `npm.cmd test` and confirm the new assertions fail for the missing behavior.

### Task 2: Align structured data with visible evidence

**Files:**
- Modify: `lib/finished-fabric-schema.ts`
- Modify: `lib/geo-content.ts`

- [ ] Replace the product-page primary `Product` schema with `WebPage`, retaining canonical URL, name, description, image, provider, and a bounded `Thing` in `about`.
- [ ] Add canonical category URLs to homepage `ItemList` entries.
- [ ] Run `npm.cmd test` and confirm the schema assertions pass.

### Task 3: Add crawlable blog and category entry grids

**Files:**
- Modify: `components/finished-fabric/FinishedFabricPage.tsx`
- Modify: `app/fabrics/page.tsx`

- [ ] Read blog articles from `getFinishedBlogArticles()` when the current page is the blog index.
- [ ] Render a server-visible buyer-guide grid using real `Link` elements, article titles, and descriptions.
- [ ] Read public categories from `getPublicFabricCategories()` on `/fabrics`.
- [ ] Render a server-visible category grid with descriptive anchors to every public category route.
- [ ] Run `npm.cmd test` and confirm all crawl-graph assertions pass.

### Task 4: Verify and publish the test branch

**Files:**
- Create: `E:\geo\outputs\orangetextiles-seo\semrush-schema-crawl-implementation-2026-07-20.md`

- [ ] Run `npm.cmd test`.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.
- [ ] Run `git diff --check`.
- [ ] Scan the changed files and report for credentials, API keys, passwords, tokens, cookies, sessions, and private keys.
- [ ] Record the measured baseline, changed routes, local verification, branch, and next Semrush targets in the implementation report.
- [ ] Commit and push `codex/orange-semrush-foundation`, then create a pull request to `HCGLHF/Orange-site:main`.
