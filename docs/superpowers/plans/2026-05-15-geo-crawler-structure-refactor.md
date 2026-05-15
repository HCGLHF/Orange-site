# GEO Crawler Structure Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public site easier for Google, AI search crawlers, and LLM retrievers to crawl, classify, and cite.

**Architecture:** Public marketing and fabric pages will use local English data instead of live Notion reads. The site will expose stable category URLs, richer metadata, an expanded sitemap, explicit crawler rules, and an `llms.txt` summary.

**Tech Stack:** Next.js 14 App Router, TypeScript, React, Tailwind CSS, JSON-LD structured data.

---

### Task 1: Local Public Catalog

**Files:**
- Create: `lib/public-catalog.ts`
- Modify: `app/page.tsx`
- Modify: `app/fabrics/page.tsx`
- Modify: `app/api/fabrics/route.ts`

- [ ] Create local English fabric and category data in `lib/public-catalog.ts`.
- [ ] Replace public page imports from `resolveFabricsFromNotion()` with `getPublicFabrics()`.
- [ ] Keep Notion only for inquiry CRM, not public page rendering.

### Task 2: Crawlable Category Pages

**Files:**
- Create: `app/fabrics/[slug]/page.tsx`
- Modify: `app/sitemap.ts`
- Modify: `components/FabricsPageIntro.tsx`

- [ ] Add category pages for cotton jersey, cotton spandex jersey, fleece/French terry, and scuba/air-layer knits.
- [ ] Add canonical metadata and FAQ JSON-LD for each category.
- [ ] Add category URLs to sitemap.

### Task 3: Robots and AI Retrieval Entry Points

**Files:**
- Modify: `app/robots.ts`
- Create: `app/llms.txt/route.ts`

- [ ] Explicitly allow Googlebot, Bingbot, OAI-SearchBot, GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, and common crawlers.
- [ ] Add sitemap reference to robots.
- [ ] Add an `llms.txt` plain-text summary with company facts, product categories, key URLs, and contact routes.

### Task 4: Trap Cleanup

**Files:**
- Delete: `components/LanguageToggle.tsx`
- Delete if unused: `lib/english-fabrics.ts`
- Delete if unused: `lib/fabric-pdf.ts`
- Modify: `lib/fabrics.ts`

- [ ] Remove unused public UI that can reintroduce multilingual ambiguity.
- [ ] Keep legacy fabric helpers static and English-only.
- [ ] Ensure public app files do not reference `orange-site.vercel.app`, `localhost`, Chinese copy, or live Notion fabric reads.

### Task 5: Verification and Push

**Commands:**
- `node node_modules\typescript\bin\tsc --noEmit --pretty false`
- `node node_modules\next\dist\bin\next build`
- `Invoke-WebRequest http://localhost:3000/sitemap.xml`
- `Invoke-WebRequest http://localhost:3000/robots.txt`
- `Invoke-WebRequest http://localhost:3000/llms.txt`

- [ ] Verify typecheck and production build.
- [ ] Verify sitemap lists production URLs only.
- [ ] Verify robots and llms text are reachable.
- [ ] Commit and push to `main`.
