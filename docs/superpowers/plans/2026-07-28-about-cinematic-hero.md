# About Cinematic Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the split About header with a full-width cinematic factory-image hero and begin the existing company introduction in a separate section below it.

**Architecture:** Keep the change inside the existing `AboutPage` server component and reuse the current optimized image asset. The visual hero owns only the background image, uniform contrast overlay, and “About Us” display title; the registry-owned H1, introductory copy, and Operating Model move into the following semantic section so SEO, structured data, routes, and analytics contracts remain unchanged.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, Tailwind CSS, `next/image`, Node test runner, ESLint, in-app browser QA.

---

## File Map

- Modify `components/company/AboutPage.tsx`: build the full-bleed Hero and move the existing introduction below it.
- Modify `tests/about-page.test.mjs`: define the full-bleed Hero, factual alt text, single-H1, and no-illustrative-copy contracts.
- Keep `public/images/company/about-circular-knitting-floor.png`: reuse the selected circular-knitting-machine image.
- Modify `design-qa.md`: record desktop/mobile comparison results and the final blocking QA result.

### Task 1: Lock the cinematic Hero contract with a failing test

**Files:**
- Modify: `tests/about-page.test.mjs:262`
- Test: `tests/about-page.test.mjs`

- [ ] **Step 1: Replace the current bounded-image test with the new layout contract**

Use one test that reads the real component source and asserts the selected B
design:

```js
test("About uses a full-bleed cinematic image hero before the company introduction", () => {
  const component = readFileSync(
    path.join(root, "components", "company", "AboutPage.tsx"),
    "utf8"
  );

  assert.match(component, /import Image from ["']next\/image["']/);
  assert.match(
    component,
    /<header\b[^>]*h-\[clamp\(26rem,58svh,35rem\)\][^>]*lg:h-\[clamp\(34rem,75svh,49rem\)\]/
  );
  assert.match(
    component,
    /src=["']\/images\/company\/about-circular-knitting-floor\.png["']/
  );
  assert.match(
    component,
    /alt=["']Rows of circular knitting machines inside a modern knitting factory["']/
  );
  assert.match(component, /sizes=["']100vw["']/);
  assert.match(component, /className=["']object-cover object-center["']/);
  assert.match(component, /absolute inset-0 bg-black\/45/);
  assert.match(component, />\s*About Us\s*</);
  assert.match(
    component,
    /<\/header>\s*<section\b[\s\S]*?<h1\b[^>]*>[\s\S]*?\{seo\.h1\}[\s\S]*?<\/h1>/
  );
  assert.doesNotMatch(component, /alt=["'][^"']*illustrative[^"']*["']/i);
  assert.doesNotMatch(
    component,
    /Illustrative manufacturing view|Replace with verified factory photography/
  );
  assert.doesNotMatch(component, /<figure\b/);
});
```

- [ ] **Step 2: Run the targeted test and verify RED**

Run:

```powershell
node --test tests/about-page.test.mjs
```

Expected: the cinematic-Hero test fails because the current header still uses a
two-column layout with a bounded `<figure>`.

- [ ] **Step 3: Confirm the failure is behavioural**

Check that the assertion failure references the missing clamped full-bleed
header or the still-present `<figure>`. Fix only test syntax if the run errors
for another reason; do not edit production code until the test fails for the
expected layout mismatch.

### Task 2: Implement the selected B layout

**Files:**
- Modify: `components/company/AboutPage.tsx:37-89`
- Test: `tests/about-page.test.mjs`

- [ ] **Step 1: Replace the current split header with the full-width image Hero**

Use this structure:

```tsx
<header className="relative isolate h-[clamp(26rem,58svh,35rem)] overflow-hidden border-b border-brand-soft bg-brand-charcoal lg:h-[clamp(34rem,75svh,49rem)]">
  <Image
    src="/images/company/about-circular-knitting-floor.png"
    alt="Rows of circular knitting machines inside a modern knitting factory"
    fill
    priority
    sizes="100vw"
    className="object-cover object-center"
  />
  <div className="absolute inset-0 bg-black/45" aria-hidden />
  <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6 lg:px-8">
    <p className="text-center text-6xl font-bold leading-none tracking-[-0.055em] text-white drop-shadow-lg sm:text-7xl lg:text-8xl">
      About Us
    </p>
  </div>
</header>
```

- [ ] **Step 2: Add the introduction section immediately after the Hero**

Move the current eyebrow, registry-owned H1, introductory paragraph, and
Operating Model into:

```tsx
<section className="border-b border-brand-soft bg-white">
  <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-start lg:px-8">
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-800">
        Company profile · Shaoxing, China
      </p>
      <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-brand-charcoal sm:text-5xl lg:text-6xl">
        {seo.h1}
      </h1>
      <p className="mt-7 max-w-3xl text-lg leading-8 text-brand-charcoal/80 sm:text-xl sm:leading-9">
        O&apos;range Textile connects international apparel teams with
        documented knit-fabric directions, sample coordination and export-order
        support through a defined company and parent manufacturing relationship.
      </p>
    </div>

    <aside className="border border-brand-charcoal/15 border-t-4 border-t-brand-orange bg-brand-cream p-6 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-charcoal/80">
        Operating model
      </p>
      <p className="mt-3 text-xl font-semibold leading-7 text-brand-charcoal sm:text-2xl sm:leading-8">
        Export communication at the front. Documented knitting capability behind
        it.
      </p>
      <p className="mt-4 text-sm leading-7 text-brand-charcoal/80">
        {companyRelationship.location}
      </p>
    </aside>
  </div>
</section>
```

Do not touch sections below the introduction.

- [ ] **Step 3: Run the targeted test and verify GREEN**

Run:

```powershell
node --test tests/about-page.test.mjs
```

Expected: 14 tests pass and 0 fail.

- [ ] **Step 4: Run TypeScript validation**

Run:

```powershell
npm.cmd run typecheck
```

Expected: exit code 0 and no TypeScript errors.

### Task 3: Verify the design in the in-app browser

**Files:**
- Modify: `design-qa.md`

- [ ] **Step 1: Reload the existing local About preview**

Open or reload `http://127.0.0.1:3000/about` in the in-app browser after the
development server has picked up the change.

- [ ] **Step 2: Check the desktop composition**

At a desktop viewport around 1440 × 900, verify:

- the image spans the full content width beneath the navigation;
- the Hero height is visually close to 75% of the viewport within its clamp;
- “About Us” is centred and legible;
- rows of knitting machines remain identifiable;
- the company introduction begins below the image;
- the page has no horizontal overflow.

Capture the desktop state to `tmp/about-preview/about-cinematic-desktop.png`.

- [ ] **Step 3: Check the mobile composition**

At 390 × 844, verify:

- the Hero uses the mobile clamp and does not consume the full page;
- the image remains full-bleed with textile machinery visible;
- the title does not clip or wrap unexpectedly;
- the introduction stacks above the Operating Model card;
- `document.documentElement.scrollWidth` equals
  `document.documentElement.clientWidth`.

Capture the mobile state to `tmp/about-preview/about-cinematic-mobile.png`.

- [ ] **Step 4: Check semantics and browser health**

Read page state and confirm:

```text
visible title: About Us
image alt: Rows of circular knitting machines inside a modern knitting factory
visible illustrative wording: false
H1 count: 1
console errors: 0
horizontal overflow: false
```

- [ ] **Step 5: Update the blocking QA report**

Write `design-qa.md` with:

```markdown
# About Cinematic Hero Design QA

## Reference

Approved option B: a full-width factory-image Hero at approximately 75svh with a
centred “About Us” title, followed by the company introduction.

## Desktop

- Full-bleed image and centred title match the approved direction.
- Company introduction starts below the image.
- No clipping or horizontal overflow.

## Mobile

- Responsive Hero clamp preserves useful image context.
- Title remains legible and the introduction stacks correctly.
- No clipping or horizontal overflow.

## Content and semantics

- One registry-owned H1 remains in the introduction.
- Image alt text is factual.
- No visible or semantic “illustrative” wording remains.
- No console errors were observed.

## Findings

- P0: none
- P1: none
- P2: none

final result: passed
```

If a P0, P1, or P2 issue is found, record it, fix it through a new failing test
where applicable, repeat the same viewport comparison, and change the final
result to `passed` only after the issue is resolved.

### Task 4: Run the full verification gate and commit the feature

**Files:**
- Modify: `components/company/AboutPage.tsx`
- Modify: `tests/about-page.test.mjs`
- Keep: `public/images/company/about-circular-knitting-floor.png`
- Modify: `design-qa.md`

- [ ] **Step 1: Run the full automated test suite**

Run:

```powershell
npm.cmd test
```

Expected: 93 tests pass and 0 fail.

- [ ] **Step 2: Run lint without the development cache**

Run:

```powershell
npm.cmd run lint -- --no-cache
```

Expected: exit code 0. The pre-existing `components/ui/FabricCard.tsx:131`
`@next/next/no-img-element` warning may remain; no new warnings may come from
the files changed by this feature.

- [ ] **Step 3: Re-run TypeScript and whitespace checks**

Run:

```powershell
npm.cmd run typecheck
git diff --check
```

Expected: both commands exit 0.

- [ ] **Step 4: Review the exact change set**

Run:

```powershell
git diff -- components/company/AboutPage.tsx tests/about-page.test.mjs design-qa.md
git status --short
```

Confirm that the feature commit will contain only:

```text
components/company/AboutPage.tsx
tests/about-page.test.mjs
public/images/company/about-circular-knitting-floor.png
design-qa.md
```

Do not stage `tmp/` or
`docs/superpowers/plans/2026-07-19-vercel-domain-migration.md`.

- [ ] **Step 5: Commit the verified feature**

Run:

```powershell
git add -- components/company/AboutPage.tsx tests/about-page.test.mjs public/images/company/about-circular-knitting-floor.png design-qa.md
git commit -m "feat: add cinematic About hero"
```

Expected: one local commit containing the verified About Hero feature. Do not
push or deploy without a separate user instruction.
