# Privacy & Analytics Design QA

Status: passed

Verified locally on 2026-08-03 (Australia/Sydney) against branch `codex/ga4-gtm-consent`, based on `000f004`. This report covers the application implementation and the unpublished Google configuration reviewed in Chrome. It does not authorize or record a push, deployment, or GTM publication.

## Identifiers and duplicate-risk audit

- GTM container: `GTM-5FHDLXGV`.
- GA4 measurement ID: `G-051YHED3HG`.
- The application installs one GTM head bootstrap and one matching noscript iframe. The GTM bootstrap is omitted when the environment value is absent or invalid.
- The previous standalone `gtag.js` and direct GA4 config were removed. GA4 is now configured only by the GTM draft, so the application does not install a second GA4 runtime.
- The GTM GA4 Configuration tag uses `send_page_view: false`. Page views are produced only from the controlled `orange_page_view` data-layer event, preventing the configuration tag and the route tracker from both emitting a page view.
- App Router navigation is deduplicated by pathname. Only the exact public-route allowlist is tracked; malformed, unknown, and PII-shaped paths are suppressed. Inquiry events expose only the controlled values `single_inquiry` or `batch_inquiry` through `form_name`.
- Tag Assistant found exactly the expected container and measurement IDs. It observed one Configuration tag and one initial Page View tag, then exactly one additional Page View on the real `/` to `/about` App Router navigation.

## Consent execution order

1. The first application-owned script in `<head>` creates `dataLayer`/`gtag` and queues `consent/default` with `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` all set to `denied`.
2. The same synchronous script disables ad-personalization signals, enables ads-data redaction, and reads only `orange-textile.analytics-consent`. A strictly valid version-1 saved choice queues `consent/update`; invalid or unavailable storage remains denied.
3. Only after the default command and any saved-choice update does the GTM bootstrap queue `gtm.js` and request `GTM-5FHDLXGV`.
4. GTM initializes GA4 `G-051YHED3HG` once with automatic page views disabled. Controlled `orange_page_view` and successful `orange_generate_lead` events then drive measurement.
5. Accept saves `{"version":1,"analytics":"granted"}` and queues a consent update granting analytics storage only. Decline saves the same schema with `denied`; all advertising consent fields remain denied in both cases. Neither choice reloads the page.

Tag Assistant confirmed that the initial denied consent command preceded GTM. It also confirmed that Decline kept all four fields denied and Accept changed only `analytics_storage` to `granted`.

## Component test results

- `npm test`: passed, 136/136 Node tests.
- `npm run test:components`: passed, 126/126 Vitest tests across seven files.
- Coverage includes the exact first-visit text and buttons, distinct Accept/Decline styling, absence of a Close control, granted/denied persistence, inaccessible or invalid localStorage fail-closed behavior, footer reopen, heading focus and focus restoration, storage-event synchronization, consent bootstrap order, controlled data-layer fields, and successful inquiry conversion events.
- Analytics queue failures are isolated from successful inquiry submission behavior. No name, email, telephone number, message, or form content is included in custom analytics events.

## Browser and responsive results

- `npm run test:browser`: passed, 16/16 Playwright tests across desktop Chromium and Chromium at `320x256`.
- Browser coverage verifies consent-before-GTM ordering, exact IDs with one installation, no standalone GA script, Accept/Decline updates, refresh persistence, cross-tab synchronization, localStorage fail-closed behavior, one route event per allowed navigation, unknown/PII-path suppression, successful inquiry mapping, no horizontal overflow, a full-width bottom-fixed banner, and no console or hydration errors.
- Desktop visual review passed: the banner spans the viewport, remains attached to the bottom edge, separates explanation and actions clearly, and preserves the requested button hierarchy.
- `320x256` visual review passed: the banner uses internal vertical scrolling without horizontal overflow; both 48px-minimum action buttons remain reachable. The captured mobile frame is intentionally scrolled within the banner to show both actions.
- Visual evidence:
  - `test-results/visual/analytics-banner-desktop.png` (`1280x720`)
  - `test-results/visual/analytics-banner-320.png` (`320x256`)

## GA4/GTM draft verification

- Chrome Tag Assistant preview connected to `orangetextiles.com` and detected `GTM-5FHDLXGV` and GA4 `G-051YHED3HG`.
- The unpublished workspace contained nine additions and no modifications or deletions: four controlled data-layer variables, two custom-event triggers, and three Google tags (Configuration, Page View, and Generate Lead).
- The Configuration tag fired once with `send_page_view: false`. The Page View tag received the controlled `page_path`, `page_location`, and optional `page_referrer` values. The Generate Lead tag fired once for the controlled `orange_generate_lead` test and exposed only `form_name`.
- GA4 DebugView for property `548065639` showed one debug web device and the expected `generate_lead` event; the final debug timeline showed one `page_view` and one `generate_lead` for the isolated verification.
- Enhanced Measurement, Google Signals, user-provided data, advertising personalization, granular location/device collection, and Google Ads links were confirmed off. Ad-related consent remains denied.
- Preview mode was exited after verification. The GTM Submit/Publish action was not used.

## Lint, TypeScript, tests, and build

Fresh verification completed on 2026-08-03:

| Command | Result |
| --- | --- |
| `npm run lint` | Passed; one pre-existing `components/ui/FabricCard.tsx` `<img>` advisory warning |
| `npm run typecheck` | Passed |
| `npm test` | Passed, 136/136 |
| `npm run test:components` | Passed, 126/126 |
| `npm run test:browser` | Passed, 16/16; production server and both viewports |
| `npm run build` | Passed; 43 static/generated pages completed |
| `git diff --check` | Passed; no whitespace errors |

The first typecheck attempt exposed a stale `.next` reference to the temporary local analytics-preview route used during external verification. That regenerable build cache was removed after its path was verified inside this worktree; the clean typecheck and both subsequent production builds passed.

## Legal and browser compatibility risks

- Legal text should still be reviewed by qualified counsel for the business's actual operating regions. Advanced Consent Mode and this preference control may not replace a full, region-aware CMP where local law or a specific platform policy requires one.
- The implementation does not claim complete anonymity. Even denied-storage cookieless measurement can transmit limited request/device context to Google.
- Direct cookie and localStorage inspection was not performed through Chrome because the browser-control safety policy prohibits reading those stores. Component and Playwright tests independently cover persistence/fail-closed behavior, and Tag Assistant confirmed the effective consent commands and transitions.
- The current site has no strict Content Security Policy. If a strict CSP is introduced, the two inline head scripts will need an approved nonce or hash and Google endpoints will need appropriate directives.
- Node's test runner emits the existing `MODULE_TYPELESS_PACKAGE_JSON` performance warning because the package does not declare a module type. This does not fail tests.
- Lint emits the existing `FabricCard.tsx` `<img>` optimization advisory. It is outside this privacy/analytics change and does not fail lint.
- Three non-blocking Playwright hardening opportunities remain: the unknown-route assertion uses a fixed 100 ms wait, keyboard reachability is checked with programmatic `.focus()` rather than a complete Tab traversal, and the loopback server readiness probe has no per-request timeout.
- Vitest 3.2.4 depends on a Vite release whose declared Node requirement starts at Node 20.19. The project currently does not declare an `engines` range, so older Node installations could fail before tests run. Verification passed on Node 24.11.1.
- localStorage can be unavailable in restrictive browser modes. The implementation catches read/write failures, keeps analytics storage denied, leaves the choice UI usable, and presents a readable save error.

## Unpublished/unpushed confirmation

- GTM remains an unpublished draft. The last published container is still the empty baseline.
- No GitHub push, branch merge, Vercel deployment, production deployment, or GTM publication was performed during this work.
- The real IDs are supplied through the ignored local `.env.local`; no credential-bearing local environment file is committed.
- All implementation work remains on the local `codex/ga4-gtm-consent` branch awaiting explicit approval.

---

# About Cinematic Hero Design QA

The prior About-page visual QA record is retained below so this analytics review does not remove existing project evidence.

## Source visual truth

- Approved concept: option B, “电影感大画幅”.
- Source mock:
  `.superpowers/brainstorm/aboutus-hero-20260728/content/hero-layout-options.html`
- Source capture:
  `tmp/about-cinematic-preview/about-cinematic-source.png`
- Source capture pixels: 1265 × 712.
- Supporting specification:
  `docs/superpowers/specs/2026-07-28-about-cinematic-hero-design.md`.

## Rendered implementation

- Route: `http://127.0.0.1:3001/about`
- Desktop capture:
  `tmp/about-cinematic-preview/about-cinematic-desktop.png`
- Desktop browser viewport override: 1440 × 900 CSS px.
- Desktop rendered content width: 1425 CSS px.
- Desktop capture pixels: 1425 × 891 at browser density 1.
- Mobile capture:
  `tmp/about-cinematic-preview/about-cinematic-mobile.png`
- Mobile browser viewport override: 390 × 844 CSS px.
- Mobile rendered content width: 375 CSS px.
- Mobile capture pixels: 375 × 811 at browser density 1.
- Combined comparison:
  `tmp/about-cinematic-preview/about-cinematic-comparison.png`
  (1440 × 450; both desktop captures normalized to 720 × 450).
- State: initial `/about` page load, no menus or dialogs open.

## Full-view comparison evidence

The approved option B is the centre card in the source capture. The combined
comparison places the complete source board on the left and the desktop
implementation on the right. Both show the same factory image used as a
full-width, darkened Hero with a large centred “About Us” display title and the
company introduction starting below the image.

The implementation uses the approved desktop proportion: the Hero measures
675 px high at the 900 px browser viewport override, which is exactly 75% of
that viewport before clamping. The full-width crop keeps multiple rows of
circular knitting machines visible.

## Focused comparison evidence

No separate focused crop was required. The Hero, title, image crop, orange
divider treatment, and start of the company introduction are all large and
readable in the normalized side-by-side comparison. Mobile was evaluated
separately because it represents a responsive state rather than a same-viewport
fidelity target.

## Required fidelity surfaces

- Fonts and typography: the implementation keeps the site’s existing sans-serif
  family and weights. “About Us” is centred, high-contrast, and does not wrap at
  desktop or mobile widths. The registry-owned company H1 retains the established
  brand hierarchy below the Hero.
- Spacing and layout rhythm: the desktop Hero matches the selected 75svh
  direction. The introduction begins immediately below it. On mobile, the Hero
  resolves to 489.5 px high and the introduction begins at 553.5 px after the
  64 px navigation row.
- Colors and visual tokens: the implementation retains the approved dark,
  uniform image overlay, white display title, cream Operating Model card, orange
  rule, and existing charcoal type.
- Image quality and asset fidelity: the selected 1672 × 941 factory image renders
  through `next/image`, covers the full Hero, remains sharp, and retains
  identifiable textile machines in both crops.
- Copy and content: the only Hero copy is “About Us”. The visible and semantic
  page content contains no “illustrative” language. Existing company copy,
  location, and Operating Model content remain below the image.

## Responsive and technical checks

- Desktop: `scrollWidth` 1425 equals `clientWidth` 1425.
- Mobile: `scrollWidth` 375 equals `clientWidth` 375.
- Mobile title bounds remain inside the viewport and do not clip.
- Image alt:
  `Rows of circular knitting machines inside a modern knitting factory`.
- H1 count: 1.
- Browser console errors: 0.
- Browser console warnings: 0.

## Findings

- P0: none.
- P1: none.
- P2: none.

## Comparison history

- Pass 1: no actionable P0, P1, or P2 differences were found, so no visual fix
  iteration was required.

## Follow-up polish

- P3: replace the generated factory visual with verified photography when final
  factory photography becomes available, while preserving the approved crop and
  Hero proportions.

final result: passed
