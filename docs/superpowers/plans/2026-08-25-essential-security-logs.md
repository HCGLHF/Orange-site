# Essential Security Logs Disclosure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Disclose Vercel-hosted essential security logging in the Privacy Policy and Analytics choice bar without adding application-owned IP storage or changing Consent Mode behavior.

**Architecture:** Keep security processing at Vercel's hosting and Firewall layer, independent of the application's Analytics-cookie choice. Change only typed legal content, the existing consent-banner copy/link, and their tests; do not add logging middleware, an IP database, identifiers, Cookies, GTM parameters, or Vercel production configuration.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Vitest, React Testing Library, Node test runner, Playwright.

---

## File Map

- Modify `lib/legal-content.ts`: add the reviewed essential-security-log section and update provider, retention, choice, and effective-date disclosures.
- Modify `tests/legal-pages.test.mjs`: enforce every reviewed policy statement and the new section order.
- Modify `components/analytics/AnalyticsConsentBanner.tsx`: add the security-log sentence and replace the Terms link with a Privacy Policy link.
- Modify `tests/analytics/AnalyticsConsentProvider.test.tsx`: enforce the exact revised copy and `/privacy` link without changing consent-state expectations.
- Modify `e2e/analytics-consent.spec.ts`: enforce the rendered copy/link while retaining existing Cookie, GTM timing, consent, focus, and responsive checks.
- Do not create middleware, API routes, log-storage modules, database schemas, Cookies, localStorage records, GTM events, or GA4 parameters.

### Task 1: Add the essential security-log Privacy Policy disclosure

**Files:**
- Modify: `tests/legal-pages.test.mjs`
- Modify: `lib/legal-content.ts`

- [ ] **Step 1: Write the failing legal-content test**

In `tests/legal-pages.test.mjs`, insert `Essential security and server logs` after `Browser storage`, change the expected Privacy Policy date, and extend the required disclosures:

```js
const privacyTitles = [
  "Who we are",
  "Information you provide",
  "Browser storage",
  "Essential security and server logs",
  "Analytics by default",
  "Accepting Analytics cookies",
  "What Analytics receives",
  "Providers and international processing",
  "Retention",
  "Your choices and requests",
  "Changes and contact",
];
```

Replace the existing Privacy Policy date assertion with:

```js
assert.equal(PRIVACY_CONTENT.effectiveDate, "August 25, 2026");
```

Add these strings to the existing `required` array:

```js
"IP address",
"request date and time",
"User-Agent",
"requested path",
"response status",
"referrer where available",
"related security signals",
"decline Analytics cookies or have not made a choice",
"Vercel",
"advertising or cross-site profiling",
"We do not add IP addresses to Google Analytics event data.",
"uses the source IP at collection time",
"discards the IP before Analytics data is logged",
"does not create a separate application IP database",
"no more than 30 days",
"does not stop necessary security logging",
```

Keep the Terms date assertion at `August 3, 2026`.

- [ ] **Step 2: Run the legal test and verify the intended failure**

Run:

```powershell
node --test tests/legal-pages.test.mjs
```

Expected: FAIL because the Privacy Policy still lacks `Essential security and server logs` and still has the August 3 effective date.

- [ ] **Step 3: Add the reviewed Privacy Policy section**

In `lib/legal-content.ts`, change only `PRIVACY_CONTENT.effectiveDate`:

```ts
effectiveDate: "August 25, 2026",
```

Insert this section immediately after `browser-storage`:

```ts
{
  id: "essential-security-logs",
  title: "Essential security and server logs",
  paragraphs: [
    "When you visit the website, our hosting and security provider may process your IP address, request date and time, User-Agent, requested path, response status, referrer where available, and related security signals. This processing continues if you decline Analytics cookies or have not made a choice. We use this information only to deliver and protect the website, identify automated or abusive traffic, investigate security incidents, and diagnose availability or technical problems. We do not use these logs for advertising or cross-site profiling. We do not add IP addresses to Google Analytics event data. When your browser connects to Google Analytics, Google may use the source IP at collection time to derive location information and states that it discards the IP before Analytics data is logged. Full IP addresses used for our own security analysis remain within Vercel's hosting and security layer; O'range Textile does not create a separate application IP database. Security logs available to us are retained for no more than 30 days, or for a shorter period when required by platform availability.",
  ],
},
```

- [ ] **Step 4: Update provider, retention, and choice disclosures**

Replace the `providers-and-international-processing` paragraph with:

```ts
"Vercel hosts and protects the website and may process the essential security and server-log information described above. Google provides GA4 and Google Tag Manager. Formspree receives website inquiry submissions, and Notion may receive them when that integration is configured. These providers may process information in countries outside your location under their own terms and privacy arrangements.",
```

Replace the `retention` paragraph with:

```ts
"Security logs available to us are retained for no more than 30 days, or for a shorter period when required by platform availability. GA4 event-level data retention is set to two months. Inquiry information is retained only for as long as reasonably required to respond, keep business records and meet applicable obligations; O'range Textile has not represented a more specific public retention schedule.",
```

Replace the first `your-choices-and-requests` paragraph with:

```ts
"You can reopen the choice bar at any time through Privacy settings in the footer. Declining withdraws permission for Analytics cookies but retains the limited cookieless measurement described above. Declining Analytics cookies or not making a choice does not stop necessary security logging described in this policy.",
```

Do not change `TERMS_CONTENT`.

- [ ] **Step 5: Run the legal test and verify it passes**

Run:

```powershell
node --test tests/legal-pages.test.mjs
```

Expected: all tests in `tests/legal-pages.test.mjs` PASS.

- [ ] **Step 6: Commit the policy disclosure**

```powershell
git add -- tests/legal-pages.test.mjs lib/legal-content.ts
git commit -m "feat: disclose essential security logs"
```

### Task 2: Update the Analytics choice bar without changing consent behavior

**Files:**
- Modify: `tests/analytics/AnalyticsConsentProvider.test.tsx`
- Modify: `e2e/analytics-consent.spec.ts`
- Modify: `components/analytics/AnalyticsConsentBanner.tsx`

- [ ] **Step 1: Write the failing component test**

In `tests/analytics/AnalyticsConsentProvider.test.tsx`, replace `BODY` with:

```ts
const BODY =
  "We use basic cookieless measurement by default. Accepting enables analytics cookies for more complete traffic and conversion reporting. Essential security logs operate regardless of your Analytics choice. You can change your choice at any time through Privacy settings in the footer. Read our Privacy Policy.";
```

In `shows the complete privacy choices on a first visit without stealing focus`, replace the link assertions with:

```ts
expect(links[0]).toHaveAccessibleName("Privacy Policy");
expect(links[0]).toHaveAttribute("href", "/privacy");
```

- [ ] **Step 2: Write the failing browser assertion**

In `e2e/analytics-consent.spec.ts`, replace `BANNER_COPY` with:

```ts
const BANNER_COPY =
  "We use basic cookieless measurement by default. Accepting enables analytics cookies for more complete traffic and conversion reporting. Essential security logs operate regardless of your Analytics choice. You can change your choice at any time through Privacy settings in the footer. Read our Privacy Policy.";
```

Immediately after the existing `BANNER_COPY` visibility assertion in `shows the exact first-visit choices and Accept grants only analytics without a reload`, add:

```ts
await expect(banner.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
  "href",
  "/privacy",
);
```

- [ ] **Step 3: Run the component test and verify the intended failure**

Run:

```powershell
npm run test:components -- tests/analytics/AnalyticsConsentProvider.test.tsx
```

Expected: FAIL because the rendered banner still says `Read our terms` and links to `/terms`.

- [ ] **Step 4: Run the focused browser test and verify the intended failure**

Ensure port 3100 is free, then run:

```powershell
npm run test:browser -- e2e/analytics-consent.spec.ts --project=desktop-chromium --grep "shows the exact first-visit"
```

Expected: FAIL at the revised `BANNER_COPY` or `Privacy Policy` link assertion. The command performs a production build before starting the local test server.

- [ ] **Step 5: Implement the reviewed banner copy and link**

In `components/analytics/AnalyticsConsentBanner.tsx`, replace the body paragraph content with:

```tsx
<p className="mt-2 text-sm leading-6 text-white/90 sm:text-[15px]">
  We use basic cookieless measurement by default. Accepting enables analytics cookies
  for more complete traffic and conversion reporting. Essential security logs operate
  regardless of your Analytics choice. You can change your choice at any time through
  Privacy settings in the footer. Read our{" "}
  <Link href="/privacy" prefetch={false} className="underline underline-offset-4">
    Privacy Policy
  </Link>
  .
</p>
```

Do not alter the region name, heading, error alert, button labels, button accessible names, focus behavior, styling, or callback wiring.

- [ ] **Step 6: Run the focused component test and verify it passes**

Run:

```powershell
npm run test:components -- tests/analytics/AnalyticsConsentProvider.test.tsx
```

Expected: the focused Vitest file PASS with no console or hydration warnings.

- [ ] **Step 7: Run the focused browser test and verify it passes**

Ensure port 3100 is free, then run:

```powershell
npm run test:browser -- e2e/analytics-consent.spec.ts --project=desktop-chromium --grep "shows the exact first-visit"
```

Expected: PASS; Accept still grants only `analytics_storage`, no reload occurs, and no duplicate page view is emitted.

- [ ] **Step 8: Commit the banner disclosure**

```powershell
git add -- tests/analytics/AnalyticsConsentProvider.test.tsx e2e/analytics-consent.spec.ts components/analytics/AnalyticsConsentBanner.tsx
git commit -m "feat: clarify essential logs in privacy choices"
```

### Task 3: Run complete local regression verification

**Files:**
- Verify only; no expected production-file changes.

- [ ] **Step 1: Run all Node structural and legal tests**

```powershell
npm test
```

Expected: PASS with zero failed Node tests.

- [ ] **Step 2: Run all Vitest unit and component tests**

```powershell
npm run test:components
```

Expected: PASS with zero failed Vitest tests and no unexpected warnings.

- [ ] **Step 3: Run lint and TypeScript checks**

```powershell
npm run lint
npm run typecheck
```

Expected: both commands exit 0 with no errors.

- [ ] **Step 4: Run the complete Analytics browser suite on desktop and 320px mobile**

Ensure port 3100 is free, then run:

```powershell
npm run test:browser -- e2e/analytics-consent.spec.ts
```

Expected: all desktop and `mobile-320` Analytics consent tests PASS. Confirm the existing mobile checks still show both actions as reachable, no horizontal overflow, no hydration errors, one GTM request within one second, no Analytics Cookie after Decline, and one page view per route.

- [ ] **Step 5: Run a final production build**

```powershell
npm run build
```

Expected: Next.js production build exits 0 and generates `/privacy` as a static route.

- [ ] **Step 6: Check scope and worktree hygiene**

```powershell
git diff --check
git status --short --branch
git log --oneline -8
```

Expected:

- `git diff --check` returns no errors;
- only the user's pre-existing untracked plan/output/tmp files remain untracked;
- no middleware, API route, database, Cookie, localStorage schema, GTM event, or GA4 parameter was added; and
- the branch remains local and ahead of `origin/main` with no push or deployment.

- [ ] **Step 7: Prepare the local-only handoff**

Report:

- the exact policy and banner changes;
- the two implementation commit hashes;
- current test/build evidence;
- that Vercel Bot Protection is still not enabled; and
- that production deployment and Vercel Log-mode activation each require separate approval.

Do not run `git push`, `npm run deploy`, `vercel --prod`, or any Vercel Firewall mutation.
