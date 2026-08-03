# GA4, GTM, and Privacy & Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one Orange-specific GA4 installation through GTM, Advanced Consent Mode v2, a persistent accessible Analytics choice bar, controlled page/lead events, and accurate legal routes without publishing or deploying.

**Architecture:** A server-rendered bootstrap sets every consent field to denied, restores only a validated versioned Analytics choice, and then starts one GTM container. Client components own consent state, focus, cross-tab synchronization, pathname tracking, and successful-inquiry events; GTM maps two allowlisted data-layer events into one GA4 property.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Google Tag Manager, Google Analytics 4, Vitest, React Testing Library, jsdom, Playwright, Node test runner.

---

## File map

### Create

- `lib/analytics/config.ts` — validate the public GTM container ID.
- `lib/analytics/consent.ts` — consent schema, parsing, storage, and consent updates.
- `lib/analytics/bootstrap.ts` — generate deterministic pre-GTM consent and GTM scripts.
- `lib/analytics/events.ts` — allowlisted page-view and lead data-layer events.
- `types/analytics.d.ts` — typed window/data-layer contract.
- `components/analytics/AnalyticsConsentProvider.tsx` — consent lifecycle, synchronization, and focus return.
- `components/analytics/AnalyticsConsentBanner.tsx` — approved accessible bottom bar.
- `components/analytics/AnalyticsRouteTracker.tsx` — explicit pathname tracking.
- `components/ui/PrivacySettingsButton.tsx` — footer reopen control.
- `components/legal/LegalPage.tsx` — shared legal-page presentation.
- `lib/legal-content.ts` — reviewed Privacy and Terms copy.
- `app/privacy/page.tsx` — Privacy Policy route.
- `app/terms/page.tsx` — Terms of Service route.
- `tests/analytics/consent.test.ts` — consent/storage unit tests.
- `tests/analytics/events.test.ts` — event allowlist and sanitization tests.
- `tests/analytics/AnalyticsConsentProvider.test.tsx` — component and focus tests.
- `tests/analytics-layout.test.mjs` — root ordering and uniqueness tests.
- `tests/analytics-inquiry-events.test.mjs` — successful-inquiry instrumentation contract.
- `tests/legal-pages.test.mjs` — legal routes, H1, metadata, and footer contract.
- `tests/setup.ts` — component-test cleanup and matchers.
- `vitest.config.ts` — jsdom/alias configuration.
- `playwright.config.ts` — local browser-test server and artifacts.
- `e2e/analytics-consent.spec.ts` — consent/order/responsive browser tests.
- `design-qa.md` — final evidence, created only after verification.

### Modify

- `app/layout.tsx` — remove standalone GA4 and enforce consent → GTM → app order.
- `components/ui/SiteFooter.tsx` — add legal links and Privacy settings.
- `components/ui/InquiryModal.tsx` — emit one successful single-inquiry lead event.
- `components/InquiryBar.tsx` — emit one successful batch-inquiry lead event.
- `app/globals.css` — narrowly scoped footer/legal refinements if Tailwind classes are insufficient.
- `lib/seo/site-seo.ts` — additive `/privacy` and `/terms` entries and `legal` page type.
- `tests/site-seo-integration.test.mjs` — include both new static routes.
- `tests/site-seo-registry.test.mjs` — expect 35 pages and allow `legal`.
- `package.json` and `package-lock.json` — test dependencies and scripts.

## Task 1: Create the Google resources without publishing

**Files:**
- Create locally ignored: `.env.local`
- Verify in Chrome: Google Analytics Admin and Google Tag Manager Workspace

- [ ] **Step 1: Create the Orange GA4 property in the authenticated Chrome session**

Create `Orange Textile` under Analytics account `Google Ads Account` with China (GMT+8) and USD. Create web stream `O'range Textile Website` for `https://orangetextiles.com`. The generated `G-` Measurement ID is an output of this step and must be copied exactly in later steps.

- [ ] **Step 2: Apply privacy-preserving GA4 settings**

Turn Enhanced Measurement off. Verify Google Signals, user-provided data collection, and ads personalization are off. Set event data retention to 2 months. Do not link Google Ads.

- [ ] **Step 3: Create the Orange GTM web container**

Under GTM account `AlphaX Advisory Pty Ltd` (`6369318146`), create web container `orangetextiles.com`. The generated `GTM-` Container ID is the second output of this step.

- [ ] **Step 4: Configure the unpublished GTM workspace**

Create these exact items:

- Google Tag `Orange GA4 - Configuration`, using the generated Measurement ID, trigger `Initialization - All Pages`, configuration parameter `send_page_view = false`, no additional consent checks.
- Data Layer Variable `DLV - page_path`, version 2, name `page_path`.
- Data Layer Variable `DLV - page_location`, version 2, name `page_location`.
- Data Layer Variable `DLV - page_referrer`, version 2, name `page_referrer`.
- Data Layer Variable `DLV - form_name`, version 2, name `form_name`.
- Custom Event trigger `CE - orange_page_view`, event name `orange_page_view`.
- Custom Event trigger `CE - orange_generate_lead`, event name `orange_generate_lead`.
- GA4 Event tag `Orange GA4 - Page View`, event `page_view`, with only `page_path`, `page_location`, and `page_referrer`, triggered by `CE - orange_page_view`.
- GA4 Event tag `Orange GA4 - Generate Lead`, event `generate_lead`, with only `form_name`, triggered by `CE - orange_generate_lead`.

Save but do not submit or publish the container.

- [ ] **Step 5: Store the generated IDs only in the isolated worktree**

Use `apply_patch` to create `.env.local` with exactly two assignments. The first assigns `NEXT_PUBLIC_GTM_ID` to the literal Container ID displayed by GTM; the second assigns `GA4_MEASUREMENT_ID` to the literal Measurement ID displayed by GA4. These values are outputs of Task 1 and must be copied exactly; the plan does not invent stand-in IDs.

Confirm `.env.local` is ignored:

```powershell
git check-ignore -v .env.local
```

Expected: `.gitignore` reports `.env*.local`; `git status --short` does not list the file.

## Task 2: Add the component and browser test harness

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `playwright.config.ts`

- [ ] **Step 1: Install compatible test dependencies**

Run:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' install --save-dev vitest@3.2.4 jsdom@26.1.0 @testing-library/react@16.3.0 @testing-library/user-event@14.6.1 @testing-library/jest-dom@6.6.3 @playwright/test@1.54.2
```

Expected: package and lockfile update without changing production dependencies.

- [ ] **Step 2: Add explicit scripts**

Add these keys without changing the existing `test` command:

```json
{
  "test:components": "vitest run",
  "test:browser": "playwright test"
}
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    restoreMocks: true,
    passWithNoTests: true,
  },
});
```

Create `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  delete window.__orangeAnalyticsBootstrap;
  delete window.__orangeLastTrackedPath;
  window.dataLayer = [];
});
```

- [ ] **Step 4: Add Playwright configuration**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results/playwright",
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-320", use: { browserName: "chromium", viewport: { width: 320, height: 256 } } },
  ],
  webServer: {
    command: "npm run build && npm run start -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
```

- [ ] **Step 5: Verify the harness**

Run:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run test:components
```

Expected: PASS with zero tests because the harness explicitly permits the empty initial suite. Later tasks add substantive assertions.

- [ ] **Step 6: Commit the harness**

```powershell
git add package.json package-lock.json vitest.config.ts playwright.config.ts tests/setup.ts
git commit -m "test: add analytics consent harness"
```

## Task 3: Build the consent schema and early bootstrap with TDD

**Files:**
- Create: `types/analytics.d.ts`
- Create: `lib/analytics/config.ts`
- Create: `lib/analytics/consent.ts`
- Create: `lib/analytics/bootstrap.ts`
- Test: `tests/analytics/consent.test.ts`

- [ ] **Step 1: Write failing consent tests**

Create `tests/analytics/consent.test.ts` covering these exact assertions:

```ts
import { describe, expect, it, vi } from "vitest";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  parseConsentValue,
  readConsent,
  writeConsent,
  updateGoogleConsent,
} from "@/lib/analytics/consent";
import { buildAnalyticsHeadScript } from "@/lib/analytics/bootstrap";

describe("analytics consent persistence", () => {
  it("accepts only version 1 granted or denied records", () => {
    expect(parseConsentValue('{"version":1,"analytics":"granted"}')).toEqual({ version: 1, analytics: "granted" });
    expect(parseConsentValue('{"version":1,"analytics":"denied"}')).toEqual({ version: 1, analytics: "denied" });
    expect(parseConsentValue('{"version":2,"analytics":"granted"}')).toBeNull();
    expect(parseConsentValue('{"version":1,"analytics":"yes"}')).toBeNull();
    expect(parseConsentValue("not-json")).toBeNull();
  });

  it("reads only the analytics key and fails closed", () => {
    const storage = { getItem: vi.fn(() => null) };
    expect(readConsent(storage)).toEqual({ choice: null, error: null });
    expect(storage.getItem).toHaveBeenCalledOnce();
    expect(storage.getItem).toHaveBeenCalledWith(ANALYTICS_CONSENT_STORAGE_KEY);
  });

  it("reports unavailable storage and keeps denied", () => {
    const storage = { getItem: vi.fn(() => { throw new Error("blocked"); }) };
    expect(readConsent(storage)).toEqual({ choice: null, error: "storage_unavailable" });
  });

  it("writes exact versioned values", () => {
    const storage = { setItem: vi.fn() };
    expect(writeConsent(storage, "granted")).toEqual({ ok: true });
    expect(storage.setItem).toHaveBeenCalledWith(
      ANALYTICS_CONSENT_STORAGE_KEY,
      '{"version":1,"analytics":"granted"}',
    );
  });

  it("never grants advertising consent", () => {
    window.gtag = vi.fn();
    updateGoogleConsent("granted");
    expect(window.gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });
});

describe("early bootstrap", () => {
  it("queues default denied before storage restore and GTM", () => {
    const source = buildAnalyticsHeadScript();
    expect(source.indexOf("'consent','default'")).toBeGreaterThan(-1);
    expect(source.indexOf("localStorage.getItem")).toBeGreaterThan(source.indexOf("'consent','default'"));
    expect(source).toContain("allow_ad_personalization_signals");
    expect(source).toContain("ads_data_redaction");
  });
});
```

- [ ] **Step 2: Run the tests and confirm RED**

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run test:components -- tests/analytics/consent.test.ts
```

Expected: FAIL because the analytics modules do not exist.

- [ ] **Step 3: Implement typed consent helpers**

Create `types/analytics.d.ts` with `DataLayerItem`, `window.dataLayer`, `window.gtag`, bootstrap status, and last-path declarations. Create `lib/analytics/consent.ts` with:

```ts
export const ANALYTICS_CONSENT_STORAGE_KEY = "orange-textile.analytics-consent";
export const ANALYTICS_CONSENT_VERSION = 1 as const;
export type AnalyticsConsentChoice = "granted" | "denied";
export type StoredAnalyticsConsent = { version: 1; analytics: AnalyticsConsentChoice };

export function parseConsentValue(raw: string | null): StoredAnalyticsConsent | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<StoredAnalyticsConsent>;
    return value.version === 1 && (value.analytics === "granted" || value.analytics === "denied")
      ? { version: 1, analytics: value.analytics }
      : null;
  } catch {
    return null;
  }
}

export function readConsent(storage: Pick<Storage, "getItem">) {
  try {
    const raw = storage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    if (raw === null) return { choice: null, error: null } as const;
    const parsed = parseConsentValue(raw);
    return parsed
      ? ({ choice: parsed.analytics, error: null } as const)
      : ({ choice: null, error: "invalid_value" } as const);
  } catch {
    return { choice: null, error: "storage_unavailable" } as const;
  }
}

export function writeConsent(storage: Pick<Storage, "setItem">, choice: AnalyticsConsentChoice) {
  try {
    storage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, JSON.stringify({ version: 1, analytics: choice }));
    return { ok: true } as const;
  } catch {
    return { ok: false, error: "storage_unavailable" } as const;
  }
}

export function updateGoogleConsent(choice: AnalyticsConsentChoice) {
  window.gtag?.("consent", "update", {
    analytics_storage: choice,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}
```

Create `lib/analytics/config.ts` with a `^GTM-[A-Z0-9]+$` validator returning `null` for missing/invalid configuration. Create `lib/analytics/bootstrap.ts` so `buildAnalyticsHeadScript()` emits one IIFE containing, in order: dataLayer/gtag creation, default denied, privacy settings, one-key storage restore, and bootstrap status. Add `buildGtmBootstrap(id)` separately so the root layout can place it after the consent script.

- [ ] **Step 4: Run tests and confirm GREEN**

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run test:components -- tests/analytics/consent.test.ts
```

Expected: all consent tests PASS.

- [ ] **Step 5: Commit consent core**

```powershell
git add types/analytics.d.ts lib/analytics tests/analytics/consent.test.ts
git commit -m "feat: add fail-closed analytics consent core"
```

## Task 4: Implement the banner, provider, storage sync, and focus behavior

**Files:**
- Create: `components/analytics/AnalyticsConsentProvider.tsx`
- Create: `components/analytics/AnalyticsConsentBanner.tsx`
- Create: `components/ui/PrivacySettingsButton.tsx`
- Test: `tests/analytics/AnalyticsConsentProvider.test.tsx`

- [ ] **Step 1: Write the failing component tests**

Render a provider, a test footer trigger, and children. Assert exact title/body/link/button text, `aria-label="Analytics privacy choices"`, exactly two buttons, no Close button, white Accept versus bordered transparent Decline classes, granted/denied persistence, fail-closed error, footer reopen, heading focus, trigger focus restoration, valid cross-tab sync, removed-key reopening, invalid-key warning, and ignoring `orange-textile-inquiries`.

Use this shared render shape:

```tsx
function Fixture() {
  const consent = useAnalyticsConsent();
  return (
    <>
      <button onClick={(event) => consent.open(event.currentTarget)}>Privacy settings</button>
      <span>Page content</span>
    </>
  );
}

render(
  <AnalyticsConsentProvider>
    <Fixture />
  </AnalyticsConsentProvider>,
);
```

- [ ] **Step 2: Run the tests and confirm RED**

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run test:components -- tests/analytics/AnalyticsConsentProvider.test.tsx
```

Expected: FAIL because provider/banner modules do not exist.

- [ ] **Step 3: Implement the approved banner**

`AnalyticsConsentBanner.tsx` must render:

```tsx
<section className="fixed inset-x-0 bottom-0 z-[120] max-h-[100dvh] overflow-y-auto border-t border-white/15 bg-[#24252a] text-white" aria-label="Analytics privacy choices">
  <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 lg:min-h-40 lg:flex-row lg:items-center lg:justify-between lg:gap-9 lg:px-8 lg:py-6">
    <div className="max-w-4xl">
      <h2 ref={titleRef} tabIndex={-1} className="text-xs font-bold uppercase tracking-[0.16em] text-[#f0987e] outline-none">Privacy &amp; analytics</h2>
      <p className="mt-2 text-sm leading-6 text-white/90 sm:text-[15px]">
        We use basic cookieless measurement by default. Accepting enables analytics cookies for more complete traffic and conversion reporting. You can change your choice at any time through Privacy settings in the footer. Read our <Link className="underline underline-offset-4" href="/terms">terms</Link>.
      </p>
      {error ? <p role="alert" className="mt-3 text-sm font-medium text-[#ffd5ca]">We could not save your analytics choice in this browser. Analytics cookies remain off; please try again.</p> : null}
    </div>
    <div className="grid shrink-0 grid-cols-1 gap-2.5 sm:grid-cols-2">
      <button aria-label="Decline analytics cookies" className="min-h-12 min-w-32 rounded-lg border border-white bg-transparent px-6 font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0987e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#24252a]" onClick={onDecline}>Decline</button>
      <button aria-label="Accept analytics cookies" className="min-h-12 min-w-32 rounded-lg border border-white bg-white px-6 font-semibold text-[#24252a] hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0987e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#24252a]" onClick={onAccept}>Accept</button>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Implement provider behavior**

`AnalyticsConsentProvider` must:

- initialize after mount from `window.__orangeAnalyticsBootstrap` or `readConsent(window.localStorage)`;
- show on no choice and hide on valid saved choice;
- persist before calling `updateGoogleConsent`;
- keep visible and denied on persistence failure;
- listen only for `ANALYTICS_CONSENT_STORAGE_KEY` storage events;
- focus the heading only for a manual footer open;
- restore the exact trigger after a successful choice;
- expose `{ open(trigger), choice, isOpen }` through `useAnalyticsConsent`.

Create `PrivacySettingsButton.tsx` as a client component that calls `open(event.currentTarget)` and uses the existing `.sf-link` class.

- [ ] **Step 5: Run focused and full component tests**

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run test:components -- tests/analytics/AnalyticsConsentProvider.test.tsx
& 'C:\Program Files\nodejs\npm.cmd' run test:components
```

Expected: all component tests PASS.

- [ ] **Step 6: Commit the consent UI**

```powershell
git add components/analytics components/ui/PrivacySettingsButton.tsx tests/analytics/AnalyticsConsentProvider.test.tsx
git commit -m "feat: add accessible analytics privacy choices"
```

## Task 5: Install one GTM loader and explicit page tracking

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/analytics/AnalyticsRouteTracker.tsx`
- Create: `lib/analytics/events.ts`
- Test: `tests/analytics/events.test.ts`
- Test: `tests/analytics-layout.test.mjs`

- [ ] **Step 1: Write failing event and layout tests**

Assert that pathname `/fabrics/interlock?email=buyer@example.com#x` becomes `/fabrics/interlock`, page location has no query/hash, malformed referrers are omitted, page data contains no unapproved keys, lead events accept only the two fixed form names, and the old ID/standalone `gtag/js` code is absent from `app/layout.tsx`.

The structural test must assert source order:

```js
assert.ok(layout.indexOf("buildAnalyticsHeadScript") < layout.indexOf("buildGtmBootstrap"));
assert.doesNotMatch(layout, /G-LXGZLVJXNP|googletagmanager\.com\/gtag\/js|ga4-init/);
assert.match(layout, /<head>/);
assert.match(layout, /<noscript>[\s\S]*googletagmanager\.com\/ns\.html/);
```

- [ ] **Step 2: Run tests and confirm RED**

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run test:components -- tests/analytics/events.test.ts
& 'C:\Program Files\nodejs\node.exe' --test tests/analytics-layout.test.mjs
```

Expected: FAIL because events and new layout do not exist.

- [ ] **Step 3: Implement the allowlisted event API**

Create `lib/analytics/events.ts` with:

```ts
export type InquiryFormName = "single_inquiry" | "batch_inquiry";

export function sanitizePathname(value: string): string {
  const path = value.split(/[?#]/, 1)[0];
  return path.startsWith("/") ? path : "/";
}

function sanitizeUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return `${url.origin}${sanitizePathname(url.pathname)}`;
  } catch {
    return undefined;
  }
}

export function pushPageView(pathname: string, locationHref: string, referrer: string) {
  const page_path = sanitizePathname(pathname);
  const event: Record<string, string> = {
    event: "orange_page_view",
    page_path,
    page_location: sanitizeUrl(locationHref) ?? page_path,
  };
  const safeReferrer = sanitizeUrl(referrer);
  if (safeReferrer) event.page_referrer = safeReferrer;
  window.dataLayer ??= [];
  window.dataLayer.push(event);
}

export function pushGenerateLead(form_name: InquiryFormName) {
  window.dataLayer ??= [];
  window.dataLayer.push({ event: "orange_generate_lead", form_name });
}
```

- [ ] **Step 4: Implement deterministic route tracking**

`AnalyticsRouteTracker.tsx` uses `usePathname()`. In an effect, return when `window.__orangeLastTrackedPath === pathname`; otherwise set it and call `pushPageView(pathname, window.location.href, document.referrer)`. Render `null`.

- [ ] **Step 5: Replace standalone GA4 in the root layout**

Remove `next/script`, `GA_ID`, both current `<Script>` elements, and all independent GA4 config. Add an explicit `<head>` with the consent script first and GTM bootstrap second. In `<body>`, render the GTM noscript iframe first when `getGtmContainerId()` returns a valid value. Wrap the existing providers with `AnalyticsConsentProvider` and render one `AnalyticsRouteTracker`.

Do not add `suppressHydrationWarning`, a second provider, or any page-specific loader.

- [ ] **Step 6: Run tests and verify GREEN**

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run test:components -- tests/analytics/events.test.ts
& 'C:\Program Files\nodejs\npm.cmd' test
& 'C:\Program Files\nodejs\npm.cmd' run typecheck
```

Expected: all tests and TypeScript PASS.

- [ ] **Step 7: Commit GTM and routing**

```powershell
git add app/layout.tsx components/analytics/AnalyticsRouteTracker.tsx lib/analytics/events.ts tests/analytics/events.test.ts tests/analytics-layout.test.mjs
git commit -m "feat: load GA4 through consent-aware GTM"
```

## Task 6: Instrument only successful inquiries

**Files:**
- Modify: `components/ui/InquiryModal.tsx`
- Modify: `components/InquiryBar.tsx`
- Test: `tests/analytics-inquiry-events.test.mjs`

- [ ] **Step 1: Write a failing source-contract test**

Assert both components import `pushGenerateLead`; the modal call appears inside the `response.ok` branch and uses `single_inquiry`; the batch call appears only after both required response checks and uses `batch_inquiry`; neither source passes `name`, `email`, `phone`, `company`, `notes`, `fabric`, `quantity`, `items`, or response data to the analytics function.

- [ ] **Step 2: Run and confirm RED**

```powershell
& 'C:\Program Files\nodejs\node.exe' --test tests/analytics-inquiry-events.test.mjs
```

Expected: FAIL because neither component is instrumented.

- [ ] **Step 3: Add the two minimal success hooks**

In `InquiryModal.tsx`, add `pushGenerateLead("single_inquiry")` as the first statement inside `if (response.ok)`. In `InquiryBar.tsx`, add `pushGenerateLead("batch_inquiry")` immediately before `form.reset()` after Notion/Formspree success has been established.

No form field or response object is passed.

- [ ] **Step 4: Run tests and commit**

```powershell
& 'C:\Program Files\nodejs\npm.cmd' test
& 'C:\Program Files\nodejs\npm.cmd' run typecheck
git add components/ui/InquiryModal.tsx components/InquiryBar.tsx tests/analytics-inquiry-events.test.mjs
git commit -m "feat: track successful inquiry conversions"
```

Expected: all tests and TypeScript PASS.

## Task 7: Add legal SEO entries, pages, and footer controls

**Files:**
- Modify: `lib/seo/site-seo.ts`
- Modify: `tests/site-seo-integration.test.mjs`
- Modify: `tests/site-seo-registry.test.mjs`
- Create: `tests/legal-pages.test.mjs`
- Create: `lib/legal-content.ts`
- Create: `components/legal/LegalPage.tsx`
- Create: `app/privacy/page.tsx`
- Create: `app/terms/page.tsx`
- Modify: `components/ui/SiteFooter.tsx`

- [ ] **Step 1: Write failing SEO and legal-route tests**

Change the registry expectation from 33 to 35 only in the new test commit, add `legal` to allowed page types, add both route files to `staticRoutes`, and assert:

- one H1 per legal route sourced from `seo.h1`;
- Privacy content includes GA4, GTM, cookieless measurement, Analytics cookies, all disabled advertising modes, Formspree, Notion, browser localStorage, 2 months, the legal entity, email, and `Privacy settings`;
- Terms content includes informational content, written confirmation, inquiry not a contract, intellectual property, external services, disclaimer, and liability;
- footer contains `/privacy`, `/terms`, and `PrivacySettingsButton`.

- [ ] **Step 2: Run and confirm RED**

```powershell
& 'C:\Program Files\nodejs\npm.cmd' test
```

Expected: FAIL for missing routes, missing registry entries, count 35, and footer controls.

- [ ] **Step 3: Add the two exact SEO records**

Add `legal` to `SeoPageType`, then add:

```ts
{
  path: "/privacy",
  primaryKeyword: "O'range Textile privacy policy",
  secondaryKeywords: ["analytics privacy choices", "textile inquiry data privacy"],
  searchIntent: "navigational",
  topicCluster: "legal",
  targetPageType: "legal",
  metaTitle: "O'range Textile Privacy Policy | Analytics and Inquiries",
  metaDescription: "O'range Textile privacy policy explains how Shaoxing Shicheng Textile Products Co., Ltd. handles buyer inquiries, browser storage, GA4 cookieless measurement, optional analytics cookies, service providers, retention, choices and privacy contact requests.",
  h1: "O'range Textile Privacy Policy",
  updatedAt: "2026-08-03",
  changeFrequency: "monthly",
  priority: 0.2,
},
{
  path: "/terms",
  primaryKeyword: "O'range Textile terms of service",
  secondaryKeywords: ["textile website terms", "fabric inquiry terms"],
  searchIntent: "navigational",
  topicCluster: "legal",
  targetPageType: "legal",
  metaTitle: "O'range Textile Terms of Service | Website Use",
  metaDescription: "O'range Textile terms of service explain permitted website use, informational fabric content, inquiry status, specification and availability confirmation, intellectual property, external services, disclaimers, liability limits and contact.",
  h1: "O'range Textile Terms of Service",
  updatedAt: "2026-08-03",
  changeFrequency: "monthly",
  priority: 0.2,
},
```

- [ ] **Step 4: Implement legal content and routes**

Create typed section arrays in `lib/legal-content.ts`. Privacy sections must be: Who we are; Information you provide; Browser storage; Analytics by default; Accepting Analytics cookies; What Analytics receives; Providers and international processing; Retention; Your choices and requests; Changes and contact. Terms sections must be: Using this website; Informational fabric content; Inquiries and orders; Intellectual property; Acceptable use; External services; Disclaimer; Limitation of liability; Changes and contact.

Use the exact facts from the approved design; explicitly state that denied cookieless measurement may still send limited request, device, page, and consent information to Google and is not described as anonymous. Do not invent governing law, guaranteed stock, production claims, or an inquiry retention period.

The Analytics/storage paragraphs must use this reviewed wording verbatim:

```text
We use Google Analytics 4 through Google Tag Manager to measure traffic, page interaction and completed inquiry conversions. Before Google Tag Manager starts, Google Consent Mode sets analytics storage, advertising storage, advertising user data and advertising personalisation to denied.

When Analytics is denied, Google tags may still send limited cookieless measurement requests containing consent status and technical request, device and page information. We do not describe this processing as anonymous. Google Analytics does not receive the name, email address, telephone number, company, notes, quantity or other content entered in an inquiry form.

If you select Accept, analytics storage becomes granted and Google Analytics may set first-party cookies including _ga and a stream-specific _ga_* cookie. These cookies are generally configured for up to two years, although browser controls or later configuration may shorten their life. Advertising storage, advertising user data, advertising personalisation, Google Signals and user-provided data collection remain disabled.

The website stores your Analytics choice in a dedicated versioned localStorage record. Existing inquiry functionality separately stores a copy of submitted inquiry details in your browser until that browser storage is cleared and sends inquiry details to Formspree and, when configured, Notion and the business email workflow. Analytics code does not read those inquiry records.

GA4 event-level data retention is set to two months. Inquiry information is retained only for as long as reasonably required to respond, keep business records and meet applicable obligations; O'range Textile has not represented a more specific public retention schedule.

You can reopen the choice bar at any time through Privacy settings in the footer. Declining withdraws permission for Analytics cookies but retains the limited cookieless measurement described above.
```

The Terms inquiry paragraph must use this reviewed wording verbatim:

```text
Submitting an inquiry asks O'range Textile to review a possible sourcing requirement. It does not create an order, reservation, exclusivity arrangement or binding supply contract. Composition, GSM, usable width, colour, finish, sample route, testing, quantity, stock status, price, lead time, capacity, documentation and delivery terms require current written confirmation for the specific inquiry.
```

Create one reusable semantic `LegalPage` with a single `<h1>{seo.h1}</h1>`, effective date, linked section navigation, readable max width, and contact link. Each route uses `createPageMetadata(seo)` and `dynamic = "force-static"`.

- [ ] **Step 5: Add footer legal links and settings button**

Append Privacy Policy and Terms of Service to `footerLinks`. Add one list item containing `PrivacySettingsButton`; do not alter primary navigation data or the existing footer brand copy.

- [ ] **Step 6: Run all tests and commit**

```powershell
& 'C:\Program Files\nodejs\npm.cmd' test
& 'C:\Program Files\nodejs\npm.cmd' run test:components
& 'C:\Program Files\nodejs\npm.cmd' run typecheck
```

Expected: Node, component, and type tests PASS; SEO registry owns exactly 35 pages.

```powershell
git add app/privacy app/terms components/legal components/ui/SiteFooter.tsx lib/legal-content.ts lib/seo/site-seo.ts tests
git commit -m "feat: add analytics privacy and terms controls"
```

## Task 8: Add deterministic browser coverage

**Files:**
- Create: `e2e/analytics-consent.spec.ts`
- Modify: `playwright.config.ts` only if startup evidence requires it

- [ ] **Step 1: Write browser tests before final polish**

Intercept `https://www.googletagmanager.com/gtm.js**` and return harmless JavaScript so no real analytics data is emitted. Capture console errors and page errors. Test:

1. `window.dataLayer` contains the `consent/default` arguments before the `gtm.start` object.
2. The GTM network request uses the environment's real `NEXT_PUBLIC_GTM_ID` exactly once.
3. No standalone `gtag/js` request occurs.
4. First visit shows exact copy and two buttons, with no Close button.
5. Accept queues granted Analytics plus denied advertising fields without navigation/reload.
6. Decline queues all denied.
7. Refresh preserves each choice and hides the banner.
8. Footer reopen focuses the title; save returns focus to the button.
9. Two pages synchronize a choice through localStorage.
10. Removing or corrupting the consent key reopens fail-closed behavior.
11. At 320×256 both buttons can be scrolled into view, the banner width equals the viewport, its bottom equals the viewport bottom, and `scrollWidth <= clientWidth`.
12. Desktop and mobile screenshots are saved to `test-results/visual/analytics-banner-desktop.png` and `test-results/visual/analytics-banner-320.png`.

- [ ] **Step 2: Run browser tests and confirm any failures are product failures**

```powershell
& 'C:\Program Files\nodejs\npx.cmd' playwright install chromium
& 'C:\Program Files\nodejs\npm.cmd' run test:browser
```

Expected before polish: tests may fail only on identified implementation details, not missing browser binaries or server startup.

- [ ] **Step 3: Make the smallest implementation adjustments**

Adjust only consent component/layout code needed for the failing assertions. Do not change approved copy, colors, button hierarchy, footer structure, homepage, or SEO entries.

- [ ] **Step 4: Re-run and commit browser coverage**

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run test:browser
git add e2e playwright.config.ts components/analytics app/layout.tsx
git commit -m "test: verify analytics consent in browsers"
```

Expected: both Playwright projects PASS with no console/hydration errors.

## Task 9: Validate the GTM draft with Tag Assistant and GA4 DebugView

**Files:**
- No tracked file changes
- Verify in Chrome: GTM Preview/Tag Assistant and GA4 DebugView

- [ ] **Step 1: Open GTM Preview without publishing**

Connect the unpublished workspace to the local site. Verify Consent Initialization reports all four denied before tags and that the Google Tag fires once.

- [ ] **Step 2: Validate Decline**

Confirm no `_ga` or `_ga_<stream>` cookie is created. Confirm restricted cookieless GA requests may occur and no advertising tag/request is present.

- [ ] **Step 3: Validate Accept**

Confirm the page does not reload, `analytics_storage` becomes granted, Analytics cookies appear, one initial `page_view` is visible, and one route change creates one additional `page_view`. To validate the unpublished GTM lead mapping without creating a real Formspree or Notion record, push one synthetic allowlisted data-layer object in the local preview: `{ event: "orange_generate_lead", form_name: "single_inquiry" }`. Confirm DebugView shows one `generate_lead` with only `form_name`.

Use synthetic test contact information clearly marked as test data; do not expose a real person's details in screenshots or logs.

- [ ] **Step 4: Reconfirm external settings and leave unpublished**

Verify Enhanced Measurement, Google Signals, user-provided data, and ads personalization remain off. Exit Preview. Confirm the workspace shows draft changes and has not been submitted or published.

## Task 10: Run full verification and create `design-qa.md`

**Files:**
- Create: `design-qa.md`

- [ ] **Step 1: Run every required command from a clean state**

```powershell
git status --short
& 'C:\Program Files\nodejs\npm.cmd' run lint
& 'C:\Program Files\nodejs\npm.cmd' run typecheck
& 'C:\Program Files\nodejs\npm.cmd' test
& 'C:\Program Files\nodejs\npm.cmd' run test:components
& 'C:\Program Files\nodejs\npm.cmd' run test:browser
& 'C:\Program Files\nodejs\npm.cmd' run build
```

Expected: every command exits 0. The known pre-existing FabricCard `<img>` lint warning may be recorded but must not become an error.

- [ ] **Step 2: Review the production output and images**

Inspect rendered `/`, `/about`, `/privacy`, and `/terms`; verify no homepage copy/meta/navigation changes, no horizontal overflow, and no banner overlap regression beyond the approved fixed overlay. Inspect both browser screenshots directly.

- [ ] **Step 3: Write evidence, not claims**

Create `design-qa.md` with these headings and real results:

```md
# Privacy & Analytics Design QA

Status: passed

## Identifiers and duplicate-risk audit
## Consent execution order
## Component test results
## Browser and responsive results
## GA4/GTM draft verification
## Lint, TypeScript, tests, and build
## Legal and browser compatibility risks
## Unpublished/unpushed confirmation
```

Include the real generated IDs, timestamps, command summaries, screenshot paths, and remaining risks. Set `Status: passed` only if every required result is currently passing; otherwise write `Status: failed` and continue fixing.

- [ ] **Step 4: Apply React and completion reviews**

Use the `vercel:react-best-practices` skill to review edited TSX files and the `verification-before-completion` skill before claiming completion. Fix any correctness, hydration, accessibility, or performance issue they identify, then rerun affected tests.

- [ ] **Step 5: Commit verified local work**

```powershell
git add design-qa.md
git commit -m "docs: record analytics consent verification"
git status --short
git log --oneline --decorate -10
```

Expected: clean tracked worktree, local branch `codex/ga4-gtm-consent`, no remote push, no Vercel deployment, and GTM still unpublished.
