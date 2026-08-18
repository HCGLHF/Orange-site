# Hero Final Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put Home and About mobile Hero images below 25,600 bytes, reduce Ready Stock mobile LCP below 2,300 ms, and deploy production only after a five-pair acceptance matrix passes.

**Architecture:** A focused server component will combine `getImageProps` with a `<picture>` element and mutually exclusive mobile/desktop preload links. Three pre-generated 750px AVIF q55 assets serve mobile only, while the existing Next WebP source set remains the desktop and compatibility fallback. Ready Stock opts into synchronous decoding; other Heroes remain asynchronous.

**Tech Stack:** Next.js 14 App Router, React server components, TypeScript, Node test runner, Playwright, Lighthouse 13.4.1, Vercel CLI.

---

### Task 1: Define the responsive Hero contract

**Files:**
- Modify: `tests/performance-critical-path.test.mjs`
- Create: `components/media/ResponsivePriorityHeroImage.tsx`

- [ ] **Step 1: Write the failing structural and asset test**

Add imports for `stat` and `access`, then add a test that reads `components/media/ResponsivePriorityHeroImage.tsx`, `components/landing/LandingHero.tsx`, `components/company/AboutPage.tsx`, and `content/landing-pages.ts`. Assert:

```js
const mobileAssets = [
  "public/images/finished-fabrics/finished-double-knit-factory-mobile.avif",
  "public/images/company/about-circular-knitting-floor-mobile.avif",
  "public/images/finished-fabrics/double-knit-interlock-comparison-mobile.avif",
];

for (const asset of mobileAssets) {
  await access(path.join(root, asset));
  const info = await stat(path.join(root, asset));
  assert.ok(info.size <= 25_600, `${asset} exceeds 25,600 bytes`);
  const header = await readFile(path.join(root, asset));
  assert.equal(header.subarray(4, 12).toString("ascii"), "ftypavif");
}

assert.match(responsiveHero, /getImageProps/);
assert.match(responsiveHero, /<picture>/);
assert.match(responsiveHero, /media="\(max-width: 767px\)"/);
assert.match(responsiveHero, /media="\(min-width: 768px\)"/);
assert.match(responsiveHero, /type="image\/avif"/);
assert.match(responsiveHero, /imageSrcSet=/);
assert.match(landingContent, /finished-double-knit-factory-mobile\.avif/);
assert.match(landingContent, /double-knit-interlock-comparison-mobile\.avif/);
assert.match(aboutPage, /about-circular-knitting-floor-mobile\.avif/);
```

Also require the Ready Stock record to contain `decoding: "sync"` and the Home record to contain `decoding: "async"`.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test tests/performance-critical-path.test.mjs
```

Expected: FAIL because the component, promoted assets, `mobileSrc`, and decoding declarations do not exist.

- [ ] **Step 3: Add the minimal shared component interface**

Create `components/media/ResponsivePriorityHeroImage.tsx` with this public API:

```tsx
import { getImageProps } from "next/image";

type ResponsivePriorityHeroImageProps = {
  src: string;
  mobileSrc: string;
  alt: string;
  className: string;
  sizes?: string;
  quality?: number;
  decoding?: "async" | "sync" | "auto";
};

export function ResponsivePriorityHeroImage({
  src,
  mobileSrc,
  alt,
  className,
  sizes = "100vw",
  quality = 35,
  decoding = "async",
}: ResponsivePriorityHeroImageProps) {
  const { props } = getImageProps({
    src,
    alt,
    fill: true,
    priority: true,
    quality,
    sizes,
    className,
    decoding,
  });

  return (
    <>
      <link rel="preload" as="image" href={mobileSrc} type="image/avif" media="(max-width: 767px)" fetchPriority="high" />
      <link rel="preload" as="image" href={props.src} imageSrcSet={props.srcSet} imageSizes={props.sizes} media="(min-width: 768px)" fetchPriority="high" />
      <picture>
        <source media="(max-width: 767px)" type="image/avif" srcSet={mobileSrc} />
        <img {...props} />
      </picture>
    </>
  );
}
```

- [ ] **Step 4: Promote the reviewed binary assets**

Copy, without re-encoding:

```text
tmp/perf-80-remediation/task2/avif-final-renditions/factory-q55.avif
  -> public/images/finished-fabrics/finished-double-knit-factory-mobile.avif
tmp/perf-80-remediation/task2/avif-final-renditions/about-q55.avif
  -> public/images/company/about-circular-knitting-floor-mobile.avif
tmp/perf-80-remediation/task2/avif-final-renditions/comparison-q55.avif
  -> public/images/finished-fabrics/double-knit-interlock-comparison-mobile.avif
```

Expected exact sizes: 21,032 / 24,805 / 13,388 bytes.

### Task 2: Wire Home, About, and Ready Stock

**Files:**
- Modify: `content/landing-pages.ts`
- Modify: `components/landing/LandingHero.tsx`
- Modify: `components/company/AboutPage.tsx`
- Test: `tests/performance-critical-path.test.mjs`

- [ ] **Step 1: Extend the Hero content type**

Change `heroImage` to:

```ts
heroImage: {
  src: string;
  mobileSrc?: string;
  alt: string;
  decoding?: "async" | "sync" | "auto";
};
```

Set Home to the factory mobile AVIF with `decoding: "async"`; set Ready Stock to the comparison mobile AVIF with `decoding: "sync"`.

- [ ] **Step 2: Use the shared component only when a mobile rendition exists**

In `LandingHero.tsx`, retain the existing priority `<Image>` fallback for records without `mobileSrc`. For records with `mobileSrc`, render:

```tsx
<ResponsivePriorityHeroImage
  src={page.heroImage.src}
  mobileSrc={page.heroImage.mobileSrc}
  alt={page.heroImage.alt}
  quality={35}
  sizes="100vw"
  className="object-cover object-center"
  decoding={page.heroImage.decoding}
/>
```

- [ ] **Step 3: Wire About**

Replace the About priority `<Image>` with `ResponsivePriorityHeroImage`, using the existing PNG as `src`, the new About AVIF as `mobileSrc`, quality 35, sizes 100vw, and asynchronous decoding.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
node --test tests/performance-critical-path.test.mjs
```

Expected: 8 tests pass, 0 fail.

- [ ] **Step 5: Run typecheck and production build**

Run separately:

```powershell
npm run typecheck
npm run build
```

Expected: exit 0. Existing `FabricCard.tsx` `<img>` warning may remain; no new warning is accepted.

- [ ] **Step 6: Commit implementation**

Stage only the shared component, three source/content files, three AVIF assets, and the test. Commit:

```text
perf: serve mobile-specific hero images
```

### Task 3: Prove there is no duplicate Hero download

**Files:**
- Create: `e2e/hero-image-delivery.spec.ts`
- Modify: `playwright.config.ts` only if the existing test match excludes the new file

- [ ] **Step 1: Write the runtime assertions**

For Home, About, and Ready Stock, collect image requests before navigation. On the existing mobile project assert exactly one request matching the expected `-mobile.avif` and zero requests containing the original Hero basename through `/_next/image`. On the desktop project assert zero mobile AVIF requests and exactly one optimized original Hero request.

Use this data table:

```ts
const cases = [
  { path: "/", mobile: "finished-double-knit-factory-mobile.avif", original: "finished-double-knit-factory.webp" },
  { path: "/about", mobile: "about-circular-knitting-floor-mobile.avif", original: "about-circular-knitting-floor.png" },
  { path: "/ready-stock-knit-fabrics", mobile: "double-knit-interlock-comparison-mobile.avif", original: "double-knit-interlock-comparison.webp" },
];
```

- [ ] **Step 2: Verify the runtime test passes against a clean production build**

Run:

```powershell
$env:NEXT_PUBLIC_GTM_ID='GTM-5FHDLXGV'
npm run test:browser
```

Expected: all existing 18 tests plus the new Hero cases pass, with no duplicate mobile/desktop Hero request.

- [ ] **Step 3: Run all local verification**

Run:

```powershell
node tmp/perf-80-remediation/scripts/run-local-verification.mjs
```

Expected: performance contract, Node tests, component tests, typecheck, build, and browser tests all exit 0.

- [ ] **Step 4: Commit runtime coverage**

Commit:

```text
test: verify responsive hero request selection
```

### Task 4: Deploy a fresh preview and execute the five-pair gate

**Files:**
- Create evidence under: `tmp/perf-80-remediation/final-gate/`
- Do not modify production source in this task

- [ ] **Step 1: Deploy preview only**

Run the linked Vercel project with `NEXT_PUBLIC_GTM_ID=GTM-5FHDLXGV` as a build environment value and without `--prod`. Record the deployment ID, URL, target, commit, and Ready status.

- [ ] **Step 2: Create one temporary Automation Bypass**

Create only one automation bypass for the protected preview. Keep the secret in process memory, exchange it for an HttpOnly cookie, never serialize it, and revoke it in a `finally` path after the matrix.

- [ ] **Step 3: Run five AB/BA mobile pairs**

Audit Home, About, and Ready Stock in this fixed order:

```text
pair 1 production -> preview
pair 2 preview -> production
pair 3 production -> preview
pair 4 preview -> production
pair 5 production -> preview
```

Every invocation uses a unique Chrome profile. Save all 30 LHRs; save pair-1 traces/devtools logs. Reject reports without numeric LCP or an exact LCP node, but do not rerun valid slow results.

- [ ] **Step 4: Compute the gate without selecting results**

Require:

```text
Home preview median LCP transfer bytes <= 25,600
About preview median LCP transfer bytes <= 25,600
Ready Stock preview median LCP <= 2,300 ms
Ready Stock preview median element render delay <= 700 ms
All preview median scores >= 80
All preview median TBT <= 200 ms
All preview median CLS <= 0.1
All 15 preview LHRs have exact LCP nodes
All preview pre-LCP Media / GA4-GTM-chat-heatmap / _rsc counts == 0
All preview Hero request counts == 1
```

- [ ] **Step 5: Stop if any gate fails**

Write a NO-GO report, revoke bypass, stop all Chrome processes/profiles, and do not issue a production deploy or promotion command.

### Task 5: Deploy production after a passing gate

**Files:**
- Create evidence under: `tmp/perf-80-remediation/production-deploy/`

- [ ] **Step 1: Promote the exact audited preview**

If and only if Task 4 is GO, run:

```text
vercel promote <exact-audited-preview-url> --yes --scope alphax-advisory
```

Do not rebuild a different artifact.

- [ ] **Step 2: Inspect production readiness**

Wait for Ready status and verify `https://orangetextiles.com` resolves to the promoted deployment. Record deployment ID, production alias, target, commit, and status.

- [ ] **Step 3: Run production smoke checks**

Verify Home, About, and Ready Stock return 200, contain their expected H1/Hero alt, request one intended Hero candidate on mobile, and have no console/page error. Confirm GA/GTM remains deferred and no Media request appears before LCP.

- [ ] **Step 4: Inspect production error logs**

Run a bounded Vercel production error-log query for the deployment. Record zero errors or the exact sanitized error count. If a new severe error appears, rollback to the prior production deployment.

- [ ] **Step 5: Final repository and credential cleanup**

Confirm no Automation Bypass remains, no temporary Chrome profile remains, no local audit server port is listening, no credential occurs in evidence, tracked worktree is clean, and only ignored/untracked audit evidence remains.
