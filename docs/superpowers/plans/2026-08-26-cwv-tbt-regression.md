# Core Web Vitals TBT Regression Remediation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove GTM and GA execution from the mobile Lighthouse critical path while preserving denied-by-default consent, one GTM bootstrap, and one application-owned page view per route.

**Architecture:** Keep the existing inline consent-default script first. Queue the GTM startup event immediately, but defer insertion of the external `gtm.js` script until either the page is finalized and both the 4-second floor and latest-LCP-plus-1-second buffer have elapsed, or the 8-second hard cap is reached. Preserve the early existing-script guard so repeated bootstrap execution remains a complete no-op.

**Tech Stack:** Next.js 14, TypeScript, Vitest/jsdom, Playwright, Lighthouse 12.8.2.

---

### Task 1: Encode the regression as a failing unit contract

**Files:**
- Modify: `tests/analytics/consent.test.ts`

- [x] **Step 1: Replace the immediate-load assertion with the critical-path contract**

```ts
it("queues startup immediately but keeps the GTM request off the critical path until the hard cap", () => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
  const { execute, isolatedDocument, scriptWindow } = createRuntime();
  execute();

  expect(scriptWindow.dataLayer?.[0]).toMatchObject({ "gtm.start": 0, event: "gtm.js" });
  expect(gtmScripts(isolatedDocument)).toHaveLength(0);
  vi.advanceTimersByTime(GTM_MAX_REQUEST_TIME_MS - 1);
  expect(gtmScripts(isolatedDocument)).toHaveLength(0);
  vi.advanceTimersByTime(1);
  expect(gtmScripts(isolatedDocument)).toHaveLength(1);
});
```

Import `GTM_MAX_REQUEST_TIME_MS` from `@/lib/analytics/bootstrap`. Update the source-shape assertion to require `setTimeout`, `PerformanceObserver`, and `largest-contentful-paint` instead of rejecting them. Keep the existing-script and double-execution tests because they protect the 8 August 24 idempotence improvement.

- [x] **Step 2: Run the focused test and verify RED**

Run: `npm.cmd run test:components -- tests/analytics/consent.test.ts`

Expected: FAIL because the current bootstrap inserts `#google-tag-manager` synchronously and exports no hard-cap constant.

### Task 2: Restore the proven delayed external loader

**Files:**
- Modify: `lib/analytics/bootstrap.ts`

- [x] **Step 1: Restore the timing constants**

```ts
export const GTM_MIN_REQUEST_TIME_MS = 4000;
export const GTM_LCP_BUFFER_MS = 1000;
export const GTM_MAX_REQUEST_TIME_MS = 8000;
```

- [x] **Step 2: Replace `buildGtmBootstrap` with the guarded delayed loader**

The generated IIFE must perform these operations in order:

```ts
if (d.getElementById("google-tag-manager")) return;
w.dataLayer = w.dataLayer || [];
w.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
```

It must then use `performance.now()`, `setTimeout`, a buffered `PerformanceObserver` for `largest-contentful-paint`, and one-shot `pointerdown`, `keydown`, `touchstart`, and `pagehide` listeners. External insertion is permitted only when `now >= max(4000, latestLcp + 1000)` after finalization, or at the 8000 ms hard cap. On insertion it must create exactly one async script with ID `google-tag-manager`, set `data-orange-loaded-at`, disconnect the observer, cancel the timer, remove listeners, and append the script to `head` or `documentElement`.

- [x] **Step 3: Run the focused test and verify GREEN**

Run: `npm.cmd run test:components -- tests/analytics/consent.test.ts`

Expected: all tests in the file pass.

### Task 3: Align browser coverage and verify the full behavior

**Files:**
- Modify: `e2e/analytics-consent.spec.ts`
- Verify: `tests/analytics/AnalyticsConsentProvider.test.tsx`
- Verify: `tests/analytics/AnalyticsRouteTracker.test.tsx`

- [x] **Step 1: Change the browser timing assertion**

After `page.goto("/")`, assert that `#google-tag-manager` and the captured GTM request count remain zero before the 4-second floor. Then poll up to 12 seconds for exactly one request and assert its resource start time is at least 4,000 ms and at most 8,500 ms. Preserve denied-consent ordering, cookie absence, no standalone GA config, one page view, and no duplicate request assertions.

- [x] **Step 2: Run Analytics unit and browser tests**

Run:

```powershell
npm.cmd run test:components -- tests/analytics
npm.cmd run test:browser -- e2e/analytics-consent.spec.ts
```

Expected: component tests pass; the current workspace browser runner may hit the pre-existing untracked `tmp/perf-paired-builds` type error, in which case use the tracked-source staging build for browser verification and do not modify `tmp/`.

### Task 4: Measure the fix and enforce completion gates

**Files:**
- Verify: `output/cwv-baseline-immediate-*.json`
- Create: `output/cwv-fixed-deferred-*.json`

- [x] **Step 1: Build tracked source with `NEXT_PUBLIC_GTM_ID=GTM-5FHDLXGV`**

Use the same clean tracked-source staging method and the same local production server settings as the baseline.

- [x] **Step 2: Run the same ten mobile Lighthouse URLs**

Use Lighthouse 12.8.2, performance category, mobile form factor, fresh headless Chrome per URL, and identical throttling flags.

- [x] **Step 3: Compare causal metrics**

For every route record performance score, LCP, TBT, total main-thread work, Google bootup time, Google request count, and Google transfer bytes. The gate is zero Google requests before LCP/TTI, median Google bootup removed from the measured critical path, no TBT regression, and unchanged LCP node/CLS behavior.

- [x] **Step 4: Run final verification**

Run targeted Analytics tests, the performance contract, typecheck against tracked source, and the production build. Report the known current-workspace `tmp/` condition separately. Do not deploy or publish GTM without separate user approval.
