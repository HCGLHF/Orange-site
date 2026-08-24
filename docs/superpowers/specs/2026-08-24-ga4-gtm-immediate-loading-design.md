# GA4/GTM Immediate Loading and Consent Design

**Date:** 2026-08-24

**Status:** Approved for implementation

**Scope:** Local application changes and verification only; no production deployment or GTM publication

## Problem

The site currently queues Consent Mode defaults correctly, but its custom GTM bootstrap waits for interaction/LCP conditions and may delay the external GTM request for up to eight seconds. Short visits can therefore end before GTM processes the queued `orange_page_view`, even though the GA4 measurement ID, GTM container, Consent Mode transitions, and custom event mappings are otherwise working.

The fix must improve the chance that denied-consent visits emit cookieless measurement signals without changing the site's privacy posture. It must not turn denied consent into granted consent or promise that GA4 will count an unconsented visit as an active user.

## Existing Invariants to Preserve

- `app/layout.tsx` emits the synchronous consent-default script before the GTM bootstrap.
- The default command sets `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` to `denied`.
- A strictly valid saved version-1 Analytics choice may update only `analytics_storage`; all advertising consent remains denied.
- Accept and Decline persist before updating Google consent. Persistence failures fail closed and keep the banner usable.
- A first visit with no saved choice displays the Analytics consent banner after hydration.
- The footer Privacy settings button reopens the banner, and a visitor can revoke prior Analytics consent.
- The application loads GA4 only through GTM. It does not install a standalone `gtag.js` or direct GA4 configuration.
- The GTM Google Tag uses measurement ID `G-051YHED3HG` with `send_page_view: false`.
- `AnalyticsRouteTracker` produces the controlled `orange_page_view` event and is the sole page-view owner. Its pathname guard suppresses Strict Mode/remount duplicates while allowing a later revisit to be counted.

## Chosen Approach

Keep the two ordered inline head scripts and simplify only the second script:

1. `buildAnalyticsHeadScript()` synchronously creates the shared data layer, queues the all-denied consent default, restores any valid saved Analytics choice, and queues the privacy settings.
2. `buildGtmBootstrap()` runs next. It validates the container ID, checks whether the external script already exists, queues one `gtm.js` startup event, creates one `async` script for `GTM-5FHDLXGV`, and appends it immediately.
3. Remove the 4-second minimum, LCP buffer, 8-second maximum, timers, performance observer, visibility handling, and interaction listeners.
4. Keep `AnalyticsRouteTracker` unchanged unless a new failing test exposes a real duplicate. Its event may be queued before GTM finishes loading; GTM will process the shared queue once it initializes.

The existing-script check must happen before the `gtm.js` startup event. This makes repeated bootstrap execution a no-op for both the network request and the GTM startup signal, reducing the risk of duplicate GA initialization or `session_start` events.

## Alternatives Rejected

### Merge consent and GTM into one inline script

This would make ordering self-contained, but it would couple consent parsing, fail-closed behavior, and third-party loading into one larger string. The current two-script DOM order is deterministic and keeps responsibilities easier to audit.

### Use Next.js `Script` with `afterInteractive`

This is more declarative, but its request timing depends on hydration and does not preserve the same strict, inspectable adjacency between the synchronous consent setup and the GTM request. It offers weaker evidence for the approximately one-second request target.

### Keep a shorter timer or idle callback

Any intentional delay preserves the short-visit blind spot the change is meant to remove. Async script loading already avoids blocking HTML parsing, so an additional application-level delay is unnecessary.

## Component Impact

### Production code

- `lib/analytics/bootstrap.ts`: replace the delayed loader with an immediate, idempotent async loader and remove obsolete timing exports.
- `app/layout.tsx`: retain the current script order and one-bootstrap structure. No behavior change is expected unless a test identifies a missing invariant.
- `lib/analytics/consent.ts`: retain Analytics-only consent updates and all-denied advertising fields.
- `components/analytics/AnalyticsConsentProvider.tsx`: retain first-visit, persistence, cross-tab, focus, and fail-closed behavior.
- `components/analytics/AnalyticsConsentBanner.tsx`: retain the approved disclosure and Accept/Decline UI.
- `components/analytics/AnalyticsRouteTracker.tsx`: retain controlled, deduplicated SPA page-view production.
- `components/ui/PrivacySettingsButton.tsx`: retain the consent-reopen entry point.

Files listed as retained should not be changed merely to create activity. A production change is warranted only when a failing acceptance test demonstrates a gap.

### Tests

- `tests/analytics/consent.test.ts`: replace delay/LCP tests with tests proving immediate insertion, ordering, ID validation, and complete bootstrap idempotence.
- `e2e/analytics-consent.spec.ts`: replace the eight-second timing contract with an approximately one-second upper-bound contract; retain exact consent order, one GTM request, no standalone GA loader, and no duplicate configuration event.
- Existing consent-provider and route-tracker tests remain regression coverage for the banner, Analytics-only Accept, all-denied Decline, revocation, cross-tab synchronization, and one event per SPA navigation.
- Browser assertions should verify no cookie whose name is `_ga` or starts with `_ga_` exists after a fresh denied visit and after Decline. Because the test suite stubs the third-party GTM response, this catches application regressions but does not replace the already completed real-GA browser verification.

## Runtime Data Flow

```text
HTML head
  -> consent default: all denied
  -> optional saved Analytics-only update
  -> ad-personalization disabled and ads data redacted
  -> one immediate async GTM request

React hydration / App Router navigation
  -> AnalyticsRouteTracker
  -> one allowlisted orange_page_view event per navigation
  -> GTM custom-event tag
  -> GA4 page_view under the current consent state

Consent action
  -> persist granted or denied Analytics choice
  -> update analytics_storage only
  -> advertising consent stays denied
```

If the route event is queued before the external container finishes loading, it remains in the shared `dataLayer` and is processed during GTM initialization. No replay is added on Accept, so granting consent does not create a second page view for the current route.

## Failure and Privacy Behavior

- Missing or invalid GTM IDs continue to omit the loader at the layout boundary or throw from the explicit builder call.
- An existing `#google-tag-manager` script makes the bootstrap return before another `gtm.js` event or request is created.
- Blocked or failed third-party requests must not interrupt page rendering or consent controls.
- Missing, invalid, or inaccessible consent storage remains denied and opens the banner; inaccessible writes remove any partial choice when possible and remain denied.
- Decline never asks the application to write Analytics cookies. With a real Google runtime, denied `analytics_storage` is expected to prevent `_ga` cookies while permitting cookieless signals.
- The application makes no claim that cookieless signals will produce active users or behavioral modelling on a low-traffic property.

## Verification Strategy

Implementation follows red-green-refactor:

1. Change the unit tests to require immediate, idempotent loading and confirm they fail against the delayed implementation.
2. Make the minimum bootstrap change and rerun targeted Analytics tests.
3. Change the Playwright timing and cookie assertions and confirm the timing assertion fails against the delayed implementation before applying the production fix.
4. Run the full Analytics component tests, Node Analytics/layout tests, `e2e/analytics-consent.spec.ts`, type checking, and a production build.
5. Inspect the final diff and map each acceptance criterion to source or runtime evidence.

The current workspace contains untracked `tmp/perf-paired-builds` TypeScript copies that are included by the broad `tsconfig.json` glob and currently break `next build` for an unrelated stale `Fabric` type. These user files will not be deleted or overwritten. Final verification will distinguish the current-workspace result from a clean-source-tree production build so the Analytics change is evaluated without concealing the unrelated condition.

## Acceptance Evidence

- Fresh context: banner visible; default consent all denied; exactly one GTM request starts within approximately one second; no `_ga`/`_ga_*` cookies in the denied state.
- Accept: persisted Analytics choice is granted; only `analytics_storage` becomes granted; advertising fields remain denied; no navigation or extra `orange_page_view` occurs.
- Decline/revocation: Analytics storage remains or returns to denied; no Analytics cookie is created by the application; the saved choice survives refresh.
- SPA routing: each real allowlisted navigation queues exactly one `orange_page_view`; unknown or PII-shaped paths remain suppressed.
- Loader ownership: one GTM external script, no standalone GA script, no direct GA config, and the recorded GTM `send_page_view: false` invariant leaves the route tracker as the only page-view owner.
- No production deployment, Git push, or GTM publication occurs without separate user approval.
