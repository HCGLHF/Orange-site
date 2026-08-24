# GA4/GTM Immediate Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Load the single GTM container immediately after the all-denied Consent Mode bootstrap while preserving Analytics-only opt-in, cookie restrictions, banner reliability, and exactly one controlled page view per Next.js route.

**Architecture:** Keep the two ordered inline scripts in `app/layout.tsx`. The first remains the synchronous consent/storage bootstrap; the second becomes a small idempotent loader that appends one async GTM script immediately. GTM continues to use `send_page_view: false`, and `AnalyticsRouteTracker` remains the only producer of the controlled `orange_page_view` event.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Google Consent Mode v2, GTM/GA4, Vitest, Testing Library, Playwright

---

## File Map

- Modify `tests/analytics/consent.test.ts`: replace the retired timer/LCP contract with immediate-load, ordering, validation, and complete-idempotence tests.
- Modify `e2e/analytics-consent.spec.ts`: require a GTM resource request within 1,000 ms, inspect denied-state cookie names, and prove Accept does not replay the current page view.
- Modify `lib/analytics/bootstrap.ts`: remove timing constants and replace the delayed bootstrap with one immediate async insertion guarded by the external script ID.
- Verify without production edits: `app/layout.tsx`, `lib/analytics/consent.ts`, `components/analytics/AnalyticsConsentProvider.tsx`, `components/analytics/AnalyticsConsentBanner.tsx`, `components/analytics/AnalyticsRouteTracker.tsx`, and `components/ui/PrivacySettingsButton.tsx`.
- Do not modify or delete the existing untracked `tmp/`, `output/`, or unrelated plan files.

### Task 1: Add failing immediate-load and privacy regression tests

**Files:**

- Modify: `tests/analytics/consent.test.ts:1-9,302-662`
- Modify: `e2e/analytics-consent.spec.ts:1-290,360-390`

- [ ] **Step 1: Remove the obsolete timing imports from the unit test**

Replace the bootstrap import with:

```ts
import {
  buildAnalyticsHeadScript,
  buildGtmBootstrap,
} from "@/lib/analytics/bootstrap";
```

- [ ] **Step 2: Replace the delayed-loader unit suite with the immediate and idempotent contract**

Replace the complete `describe("buildGtmBootstrap", ...)` block with:

```ts
describe("buildGtmBootstrap", () => {
  function createRuntime(options: { existingExternal?: boolean } = {}) {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const isolatedDocument = document.implementation.createHTMLDocument("analytics");
    const scriptWindow: {
      dataLayer?: AnalyticsDataLayer;
      performance: { now(): number };
      setTimeout: typeof setTimeout;
      clearTimeout: typeof clearTimeout;
      addEventListener: (...args: unknown[]) => void;
      removeEventListener: (...args: unknown[]) => void;
    } = {
      performance: { now: () => Date.now() },
      setTimeout,
      clearTimeout,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    };

    if (options.existingExternal) {
      const existing = isolatedDocument.createElement("script");
      existing.id = "google-tag-manager";
      existing.src = "https://www.googletagmanager.com/gtm.js?id=GTM-5FHDLXGV";
      isolatedDocument.head.append(existing);
    }

    const execute = () =>
      Function("window", "document", buildGtmBootstrap("GTM-5FHDLXGV"))(
        scriptWindow,
        isolatedDocument,
      );

    return { execute, isolatedDocument, scriptWindow };
  }

  function gtmScripts(documentUnderTest: Document) {
    return Array.from(documentUnderTest.scripts).filter(
      (script) => script.id === "google-tag-manager",
    );
  }

  function gtmStarts(dataLayer: AnalyticsDataLayer | undefined) {
    return runtimeQueueItems(dataLayer).filter(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "event" in item &&
        item.event === "gtm.js",
    );
  }

  it("queues startup and appends one async GTM request immediately", () => {
    const { execute, isolatedDocument, scriptWindow } = createRuntime();

    execute();

    expect(gtmStarts(scriptWindow.dataLayer)).toHaveLength(1);
    expect(gtmScripts(isolatedDocument)).toHaveLength(1);
    expect(gtmScripts(isolatedDocument)[0]).toMatchObject({
      id: "google-tag-manager",
      async: true,
      src: "https://www.googletagmanager.com/gtm.js?id=GTM-5FHDLXGV",
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("is a complete no-op when the external GTM script already exists", () => {
    const { execute, isolatedDocument, scriptWindow } = createRuntime({
      existingExternal: true,
    });
    const [existing] = gtmScripts(isolatedDocument);

    execute();

    expect(gtmScripts(isolatedDocument)).toEqual([existing]);
    expect(gtmStarts(scriptWindow.dataLayer)).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not duplicate the GTM startup event or request when executed twice", () => {
    const { execute, isolatedDocument, scriptWindow } = createRuntime();

    execute();
    execute();

    expect(gtmStarts(scriptWindow.dataLayer)).toHaveLength(1);
    expect(gtmScripts(isolatedDocument)).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("starts GTM once after consent default and privacy settings", () => {
    const scriptWindow: {
      dataLayer?: AnalyticsDataLayer;
      gtag?: GoogleTag;
      localStorage: StorageDouble;
      __orangeAnalyticsBootstrap?: AnalyticsBootstrapStatus;
      performance: { now(): number };
      setTimeout: typeof setTimeout;
      clearTimeout: typeof clearTimeout;
      addEventListener: (...args: unknown[]) => void;
      removeEventListener: (...args: unknown[]) => void;
    } = {
      localStorage: { getItem: () => null, setItem: vi.fn() },
      performance: { now: () => 0 },
      setTimeout,
      clearTimeout,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    };
    const isolatedDocument = document.implementation.createHTMLDocument("analytics");

    Function("window", buildAnalyticsHeadScript())(scriptWindow);
    Function("window", "document", buildGtmBootstrap("GTM-5FHDLXGV"))(
      scriptWindow,
      isolatedDocument,
    );

    const dataLayer = runtimeQueueItems(scriptWindow.dataLayer);
    const calls = dataLayer.map((item) =>
      Object.prototype.toString.call(item) === "[object Arguments]" ? asCall(item) : item,
    );
    expect(calls).toEqual([
      [
        "consent",
        "default",
        {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        },
      ],
      ["set", "allow_ad_personalization_signals", false],
      ["set", "ads_data_redaction", true],
      expect.objectContaining({ event: "gtm.js" }),
    ]);
    expect(gtmScripts(isolatedDocument)).toHaveLength(1);
  });

  it("emits one startup event and one GTM request for a validated ID without consent logic", () => {
    const script = buildGtmBootstrap("GTM-5FHDLXGV");

    expect(script.match(/gtm\.start/g)).toHaveLength(1);
    expect(script.match(/googletagmanager\.com\/gtm\.js/g)).toHaveLength(1);
    expect(script).toContain("GTM-5FHDLXGV");
    expect(script).not.toContain("consent");
    expect(script).not.toMatch(/setTimeout|PerformanceObserver|largest-contentful-paint/);
  });

  it.each(["", " GTM-5FHDLXGV", "gtm-5FHDLXGV", "GTM-5FHDLXGV';alert(1)//"])(
    "throws rather than embedding unsafe ID %s",
    (id) => {
      expect(() => buildGtmBootstrap(id)).toThrow("Invalid GTM container ID");
    },
  );
});
```

- [ ] **Step 3: Replace the E2E timing imports and add a cookie-name helper**

Delete the import of `GTM_LCP_BUFFER_MS` and `GTM_MAX_REQUEST_TIME_MS`. After `leadEvents`, add:

```ts
async function analyticsCookieNames(context: BrowserContext) {
  return (await context.cookies())
    .map((cookie) => cookie.name)
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));
}
```

This records cookie names only and never exposes cookie values.

- [ ] **Step 4: Replace the first browser test with the immediate-request contract**

Replace the complete delayed GTM test with:

```ts
test("queues denied consent before one immediate GTM request without standalone GA", async ({
  context,
  page,
}) => {
  const requests = await protectAnalyticsRequests(context);
  const failures = captureRuntimeFailures(page);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Privacy & analytics" })).toBeVisible();
  await expect.poll(() => requests.gtmRequests.length, { timeout: 3000 }).toBe(1);
  await expect(page.locator("#google-tag-manager-bootstrap")).toHaveCount(1);
  await expect(page.locator("#google-tag-manager")).toHaveCount(1);

  const requestStartTimes = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((entry) => /googletagmanager\.com\/gtm\.js(?:\?|$)/.test(entry.name))
      .map((entry) => entry.startTime),
  );
  expect(requestStartTimes).toHaveLength(1);
  expect(requestStartTimes[0]).toBeLessThanOrEqual(1000);

  const snapshot = await dataLayerSnapshot(page);
  const defaultIndex = snapshot.findIndex(
    (item) => Array.isArray(item) && item[0] === "consent" && item[1] === "default",
  );
  const gtmStartIndex = snapshot.findIndex(
    (item) => !Array.isArray(item) && item.event === "gtm.js" && "gtm.start" in item,
  );

  expect(defaultIndex).toBeGreaterThanOrEqual(0);
  expect(gtmStartIndex).toBeGreaterThan(defaultIndex);
  expect(snapshot[defaultIndex]).toEqual([
    "consent",
    "default",
    {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    },
  ]);
  expect(snapshot.slice(defaultIndex + 1, gtmStartIndex)).toEqual([
    ["set", "allow_ad_personalization_signals", false],
    ["set", "ads_data_redaction", true],
  ]);

  expect(requests.gtmRequests).toHaveLength(1);
  expect(new URL(requests.gtmRequests[0]).searchParams.get("id")).toBe(GTM_ID);
  expect(requests.prohibitedRequests).toEqual([]);
  expect(await page.locator('script[src*="googletagmanager.com"]').count()).toBe(1);
  expect(await page.locator('script[src*="/gtag/js"]').count()).toBe(0);
  expect(
    snapshot.filter((item) => Array.isArray(item) && item[0] === "config"),
    "the application must not queue a standalone GA config",
  ).toEqual([]);
  expect(await analyticsCookieNames(context)).toEqual([]);
  await expectNoRuntimeFailures(failures);
});
```

- [ ] **Step 5: Add no-replay and denied-cookie assertions to the existing choice tests**

In the Accept test, immediately before clicking Accept, add:

```ts
  await expect.poll(async () => (await pageViews(page)).length).toBe(1);
  const viewsBeforeAccept = await pageViews(page);
```

Immediately after the banner becomes hidden, add:

```ts
  expect(await pageViews(page)).toEqual(viewsBeforeAccept);
```

Immediately after the existing reload and hidden-banner assertion, add:

```ts
  await expect.poll(async () => (await pageViews(page)).length).toBe(1);
```

In the Decline test, after the consent-update assertion and again after the reload, add:

```ts
  expect(await analyticsCookieNames(context)).toEqual([]);
```

- [ ] **Step 6: Run the unit test and verify the new contract fails for the delayed implementation**

Run:

```powershell
npm.cmd run test:components -- tests/analytics/consent.test.ts
```

Expected: FAIL. The immediate insertion, zero-timer, existing-script no-op, and double-execution tests fail because the old implementation schedules a 4–8 second load and queues `gtm.js` before its duplicate check.

- [ ] **Step 7: Warm a local development server and verify the browser timing test fails**

Start a persistent terminal session:

```powershell
npm.cmd run dev -- --hostname 127.0.0.1 --port 3100
```

After the server is ready, warm `http://127.0.0.1:3100/`, then run in a second terminal:

```powershell
node.exe node_modules/@playwright/test/cli.js test e2e/analytics-consent.spec.ts --project=desktop-chromium --grep "one immediate GTM request"
```

Expected: FAIL because the GTM resource `startTime` is approximately 8,000 ms instead of at most 1,000 ms. Stop the development server after the red result.

### Task 2: Implement the immediate, idempotent async loader

**Files:**

- Modify: `lib/analytics/bootstrap.ts:7-44`

- [ ] **Step 1: Remove the three timing constants**

Delete:

```ts
export const GTM_MIN_REQUEST_TIME_MS = 4000;
export const GTM_LCP_BUFFER_MS = 1000;
export const GTM_MAX_REQUEST_TIME_MS = 8000;
```

- [ ] **Step 2: Replace only `buildGtmBootstrap` with the minimal loader**

Use:

```ts
export function buildGtmBootstrap(id: string): string {
  const containerId = getGtmContainerId(id);
  if (!containerId) throw new Error("Invalid GTM container ID");

  return `(function(w,d,i){w.dataLayer=w.dataLayer||[];if(d.getElementById("google-tag-manager"))return;w.dataLayer.push({"gtm.start":new Date().getTime(),event:"gtm.js"});var script=d.createElement("script");script.id="google-tag-manager";script.async=true;script.src="https://www.googletagmanager.com/gtm.js?id="+i;(d.head||d.documentElement).appendChild(script);})(window,document,${JSON.stringify(containerId)});`;
}
```

Do not change `buildAnalyticsHeadScript`, default consent fields, storage restoration, ad redaction, the layout script order, or route tracking.

- [ ] **Step 3: Run the targeted unit tests and verify green**

Run:

```powershell
npm.cmd run test:components -- tests/analytics/consent.test.ts tests/analytics/AnalyticsConsentProvider.test.tsx tests/analytics/AnalyticsRouteTracker.test.tsx
```

Expected: PASS, 84 tests across the three selected files (43 consent/bootstrap, 32 provider, and 9 route-tracker tests).

- [ ] **Step 4: Run the targeted browser test against the warmed development server and verify green**

Start and warm the development server as in Task 1, then run:

```powershell
node.exe node_modules/@playwright/test/cli.js test e2e/analytics-consent.spec.ts --project=desktop-chromium --grep "one immediate GTM request"
```

Expected: PASS with one request, resource `startTime <= 1000`, all-denied consent before `gtm.js`, no standalone GA request/config, and no `_ga`/`_ga_*` cookie names.

- [ ] **Step 5: Run the full Analytics browser spec in both configured viewports**

With the warmed development server still running, run:

```powershell
node.exe node_modules/@playwright/test/cli.js test e2e/analytics-consent.spec.ts
```

Expected: PASS, 18 results (9 tests in each of `desktop-chromium` and `mobile-320`), including first-visit banner, Accept, Decline, privacy-settings reopen, revocation/synchronization, fail-closed storage, one page view per SPA navigation, lead-field control, and banner accessibility. Stop the server after the run.

- [ ] **Step 6: Commit the tested implementation**

Run:

```powershell
git add lib/analytics/bootstrap.ts tests/analytics/consent.test.ts e2e/analytics-consent.spec.ts
git diff --cached --check
git commit -m "fix: load consent-aware GTM immediately"
```

Expected: one commit containing only the loader and its regression tests. Leave unrelated untracked files untouched.

### Task 3: Run complete local verification

**Files:**

- Verify: `app/layout.tsx`
- Verify: `lib/analytics/consent.ts`
- Verify: `components/analytics/AnalyticsConsentProvider.tsx`
- Verify: `components/analytics/AnalyticsConsentBanner.tsx`
- Verify: `components/analytics/AnalyticsRouteTracker.tsx`
- Verify: `components/ui/PrivacySettingsButton.tsx`
- Verify: `e2e/analytics-consent.spec.ts`

- [ ] **Step 1: Run the Analytics component and Node tests**

Run:

```powershell
npm.cmd run test:components -- tests/analytics
node.exe --test tests/analytics-layout.test.mjs tests/analytics-public-paths.test.mjs
```

Expected: the Analytics component run passes 115 tests across 7 files, and the Node run passes 2 tests.

- [ ] **Step 2: Run the existing Analytics E2E spec through the project runner**

Run:

```powershell
npm.cmd run test:browser -- e2e/analytics-consent.spec.ts
```

Expected in the current workspace: FAIL before Playwright at `tmp/perf-paired-builds/new/lib/public-catalog.ts:42` because the untracked stale `Fabric` copy lacks `construction`. Record this known unrelated result without deleting, moving, or modifying those user files.

- [ ] **Step 3: Verify the production build and full E2E spec from a clean detached worktree**

Use the `using-git-worktrees` skill before this step. Create a detached worktree at the explicit path `D:\GEO-ALPHA\orange-textile\.verification\orange-site-ga4-gtm`, verify its resolved path remains inside `D:\GEO-ALPHA\orange-textile\.verification`, and install the locked dependencies with:

```powershell
npm.cmd ci
```

Expected: dependency installation exits 0 from the committed lockfile.

Use `apply_patch` to create the ignored file `D:\GEO-ALPHA\orange-textile\.verification\orange-site-ga4-gtm\.env.production.local` with exactly:

```dotenv
NEXT_PUBLIC_GTM_ID=GTM-5FHDLXGV
```

Then run:

```powershell
npm.cmd run build
npm.cmd run test:browser -- e2e/analytics-consent.spec.ts
```

Expected: the standalone production build exits 0, then the project runner completes another production build and passes all 18 Analytics browser results. Do not deploy. Leave the verification worktree in place for inspectable evidence unless the user separately approves its removal; do not touch the original workspace's `tmp/`, `output/`, environment files, or `node_modules`.

- [ ] **Step 4: Run source and diff checks**

Run:

```powershell
git diff --check HEAD^ HEAD
rg -n "GTM_MIN_REQUEST_TIME_MS|GTM_LCP_BUFFER_MS|GTM_MAX_REQUEST_TIME_MS|PerformanceObserver|largest-contentful-paint|setTimeout" lib/analytics/bootstrap.ts e2e/analytics-consent.spec.ts tests/analytics/consent.test.ts
rg -n "analytics_storage|ad_storage|ad_user_data|ad_personalization|send_page_view|orange_page_view|google-tag-manager" app lib components design-qa.md
git status --short --branch
```

Expected: no whitespace errors; no retired delay machinery in the loader or its tests; consent remains default denied and Analytics-only on Accept; the recorded `send_page_view: false` invariant and one `AnalyticsRouteTracker` remain; unrelated untracked files are unchanged.

### Task 4: Audit every acceptance criterion and hand off without deployment

**Files:**

- Inspect: all files and fresh command outputs from Tasks 1–3

- [ ] **Step 1: Build the requirement-to-evidence audit**

Record evidence for each item:

```text
1. No 4–8 second delay -> immediate unit test + resource startTime <= 1000 ms.
2. Default consent denied -> head-script unit assertion + E2E data-layer order.
3. Denied cookieless loading -> GTM requested while consent is denied; real-GA behavior relies on the user's completed Chrome verification.
4. First-visit banner -> provider unit test + fresh-context E2E visibility.
5. Accept grants Analytics only -> provider and E2E exact update object.
6. Decline creates no Analytics cookie -> cookie-name assertions after initial denied state, Decline, and refresh.
7. No duplicate loader/page view/session -> complete bootstrap idempotence, one external script/request, no Accept replay, GTM send_page_view false record.
8. One SPA page view per route -> existing route-tracker unit and E2E navigation sequence.
9. Privacy settings and revocation -> existing focus, reopen, cross-tab, and granted-to-denied tests.
10. No default-consent workaround -> source scan shows all-denied default and documentation preserves expected GA4 limitations.
```

Treat real GA4 Realtime/active-user behavior as external evidence already supplied by the user; do not send additional production Analytics traffic during local verification.

- [ ] **Step 2: Confirm repository scope and deployment state**

Run:

```powershell
git log -3 --oneline --decorate
git status --short --branch
```

Expected: the design and implementation commits exist locally; no push, Vercel deployment, production deployment, or GTM publication was performed.

- [ ] **Step 3: Report exact results and remaining external limitations**

The handoff must include modified files, commit IDs, exact test/build counts, the current-workspace `tmp/` build condition if it remains, clean-source build evidence, and the fact that denied visitors may still not appear as GA4 active users. Do not claim production behavior changed until a separately approved deployment occurs.
