# O'range Textile GA4, GTM, and Privacy & Analytics Design

**Date:** 2026-08-03

**Status:** Ready for written-spec review

**Scope:** Local implementation and verification only. No GitHub push, Vercel deployment, or GTM publication.

## 1. Outcome

Implement a single analytics architecture for `https://orangetextiles.com` in which an Orange-specific Google Analytics 4 property is loaded only through an Orange-specific Google Tag Manager web container. Add an application-owned Privacy & analytics choice bar, Google Consent Mode v2, privacy settings in the footer, and accurate Privacy Policy and Terms pages.

The implementation must not alter homepage copy, SEO keywords, metadata, navigation structure, pricing, brand palette, or unrelated business behavior.

## 2. Confirmed Decisions

- Create a dedicated GA4 property named `Orange Textile` and a web stream for `https://orangetextiles.com`.
- Create a dedicated GTM web container named `orangetextiles.com` under the existing AlphaX Advisory GTM account.
- Load GA4 only through GTM. Remove the current standalone GA4 installation that uses `G-LXGZLVJXNP`.
- Use Google Advanced Consent Mode worldwide. When Analytics consent is denied, Google tags may send restricted cookieless measurement pings.
- Keep `ad_storage`, `ad_user_data`, and `ad_personalization` denied for every choice.
- Enable `analytics_storage` only after the visitor chooses Accept.
- Use an app-owned consent component rather than a third-party CMP.
- Use explicit, allowlisted Next.js route events rather than GA4 automatic page-view detection.
- Keep the GTM workspace unpublished until the user gives a separate approval.
- The legal entity is Shaoxing Shicheng Textile Products Co., Ltd.; the privacy contact is `folenchen0401@outlook.com`.
- Use English for the consent interface and both legal pages.

## 3. Google Account Configuration

### GA4

- Property name: `Orange Textile`
- Reporting time zone: China (GMT+8)
- Currency: USD
- Web stream URL: `https://orangetextiles.com`
- Stream name: `O'range Textile Website`
- Event-level data retention: 2 months
- Google Signals: disabled
- Ads personalization: disabled
- User-provided data collection: disabled
- Enhanced Measurement: disabled so that page views, form interactions, site search, scrolls, outbound clicks, and history events are not collected automatically

### GTM

- Container name: `orangetextiles.com`
- Target platform: Web
- The container remains a draft.
- Configure one Google Tag for the new GA4 Measurement ID.
- Disable automatic `page_view` on the Google Tag.
- Fire the Google Tag on Initialization — All Pages.
- Configure a GA4 page-view event triggered only by `orange_page_view`.
- Configure a GA4 lead event triggered only by `orange_generate_lead`.
- Use GTM data-layer variables only for the allowlisted parameters in section 7.
- Rely on Google's built-in consent checks and add no conflicting exception triggers or extra consent checks.
- Add no Google Ads, Floodlight, remarketing, or personalization tags.

The final IDs will be recorded after the properties are created. They are public identifiers, not secrets. The website will contain only the GTM container ID; the GA4 Measurement ID remains configured in GTM and is documented for verification.

The account and container setup will be performed through the user's already authenticated Chrome session after the written spec and implementation plan are approved. Creating the property/container and saving the GTM workspace are authorized; publishing the container is not.

## 4. Runtime Script Order

The server-rendered root layout must produce this deterministic order:

1. Create `window.dataLayer` and the `window.gtag` queue function.
2. Execute `gtag('consent', 'default', ...)` with all four Consent Mode v2 fields denied.
3. Safely read only the versioned Orange Analytics consent key from localStorage.
4. If the stored record is valid, queue the corresponding consent update before GTM starts. A stored grant changes only `analytics_storage` to granted.
5. Set privacy-preserving Google tag options, including disabled ads personalization and ads-data redaction where applicable.
6. Start the GTM head bootstrap.
7. Hydrate the application.
8. The route tracker pushes the initial allowlisted route event. GTM processes its initialization tag before the custom route event.

The GTM `noscript` iframe must be the first application-owned child after the opening `<body>`. It must be followed by providers and the existing application shell. The structure must not cause a hydration mismatch.

The implementation must contain exactly one GTM bootstrap, one GTM noscript iframe, and no standalone `googletagmanager.com/gtag/js` script.

## 5. Consent State Model

Use one dedicated localStorage key owned by Analytics consent. The value has this schema:

```json
{"version":1,"analytics":"granted"}
```

or:

```json
{"version":1,"analytics":"denied"}
```

No Analytics code may enumerate localStorage or read the existing locale or inquiry keys.

### Initial load

- Missing record: keep every consent type denied and display the banner.
- Valid granted record: restore `analytics_storage: granted`; keep all advertising fields denied; do not display the banner.
- Valid denied record: keep all fields denied; do not display the banner.
- Invalid record, unsupported version, or unavailable storage: fail closed, display the banner, and expose a readable persistence warning. A deliberately cleared or missing key is treated as a normal first visit and displays the banner without inventing an error.

### Accept

1. Attempt to persist the granted record.
2. If persistence succeeds, call `gtag('consent', 'update', ...)` with `analytics_storage: granted` and every advertising field denied.
3. Close the banner without reloading the page.
4. If the banner was opened from the footer, restore focus to the Privacy settings button.

If persistence fails, consent remains denied, the banner remains visible, and an error is announced.

### Decline

1. Attempt to persist the denied record.
2. If persistence succeeds, call the consent update with all fields denied.
3. Close the banner without reloading the page.
4. Restore footer focus when applicable.

Advanced Consent Mode remains active, so denied does not mean that no request is sent to Google. It means Analytics cookies are not permitted and only restricted cookieless measurement is allowed.

### Cross-tab synchronization

Listen only for storage events for the Analytics consent key:

- A valid new value updates Consent Mode and the banner without stealing focus.
- A removed value, invalid value, or unsupported version fails closed and reopens the banner.
- Unrelated storage events are ignored.

## 6. Privacy & Analytics Interface

The approved design is a full-width, fixed, dark-charcoal bar attached to the bottom edge of the viewport. It is not a floating card and has no close control.

### Content

- Label: `Privacy & analytics`
- Body: `We use basic cookieless measurement by default. Accepting enables analytics cookies for more complete traffic and conversion reporting. You can change your choice at any time through Privacy settings in the footer. Read our terms.`
- `terms` links to `/terms`.
- Actions: `Decline` and `Accept` only.

### Visual and accessibility contract

- Region accessible name: `Analytics privacy choices`
- Accept accessible name: `Accept analytics cookies`
- Decline accessible name: `Decline analytics cookies`
- Accept is a white primary button with dark text.
- Decline is transparent with a white border.
- Both buttons are at least 48px high and expose visible hover and `:focus-visible` states.
- Desktop content is centered within a maximum width; copy appears left and actions right.
- Mobile content wraps vertically and never produces horizontal overflow.
- At 320×256 the banner may scroll internally so that both actions remain reachable.
- Bottom padding includes `env(safe-area-inset-bottom)`.
- On first automatic display, the banner does not steal focus.
- When opened from the footer, focus moves to the label heading, which is programmatically focusable.
- Saving and closing returns focus to the footer trigger.
- A persistence error uses an accessible live alert.

The existing brand colors and typography remain unchanged outside this component. The new component uses the approved charcoal/white hierarchy and the existing orange only as a restrained focus/accent color.

## 7. Analytics Event Contract

Only two application events are in scope.

### Page view

Data-layer event: `orange_page_view`

GA4 event: `page_view`

Allowed parameters:

- `page_path`: the pathname only, such as `/fabrics/interlock`
- `page_location`: origin plus pathname, with query and hash removed
- `page_referrer`: sanitized to origin plus pathname or omitted

The client route tracker emits exactly one initial event and one event for each actual pathname change. It suppresses duplicate events for the same current pathname, including development remounts.

### Successful inquiry

Data-layer event: `orange_generate_lead`

GA4 event: `generate_lead`

Allowed parameter:

- `form_name`: fixed to `single_inquiry` or `batch_inquiry`

The event fires only after the current submission flow reports success. It does not change validation, submission endpoints, alerts, Notion handling, Formspree handling, or cart behavior.

### Explicit exclusions

Never send names, email addresses, telephone numbers, company names, notes, quantities, free-form fields, fabric text, inquiry IDs, Notion URLs, full href values, query parameters, URL fragments, localStorage contents, User IDs, advertising identifiers, or custom user properties to `dataLayer`, GTM, or GA4.

## 8. Footer and Legal Routes

The existing footer gains three items without changing its navigation hierarchy:

- `Privacy Policy` → `/privacy`
- `Terms of Service` → `/terms`
- `Privacy settings` → client-side action that reopens the choice bar

Both new routes use the project's existing centralized metadata/H1 contract, have exactly one English H1, and receive page-specific legal metadata. Their entries may be added to the public route inventory and sitemap as required by the current architecture, but no existing page title, description, H1, keyword assignment, canonical, or sitemap date may change.

### Privacy Policy

The policy must describe:

- the legal entity and contact email;
- current inquiry information collected by the website;
- the current use of Formspree, Notion, business email, and browser localStorage for inquiries;
- GA4 and GTM;
- traffic, page-interaction, and lead-conversion purposes;
- Advanced Consent Mode and the fact that denied cookieless measurement may still transmit limited request, device, page, and consent information to Google;
- Analytics cookies after Accept;
- the actual first-party GA4 cookie names and durations verified during browser testing;
- 2-month GA4 event-level retention;
- advertising storage, advertising user data, advertising personalization, Google Signals, and user-provided data collection being disabled;
- changing the Analytics choice through the footer;
- service-provider and cross-border processing risk without claiming complete anonymity;
- access, correction, complaint, and contact routes in terms suitable for the confirmed company.

The policy must keep inquiry processing separate from Analytics. No fixed inquiry-retention period will be invented; the absence of a formal retention schedule will be listed as a legal/process risk.

### Terms of Service

The terms cover website use, informational product content, intellectual property, acceptable use, external services, disclaimers, limitation of liability, and contact. They state that catalogue, specification, stock, lead-time, price, testing, and capacity information requires current written confirmation and that an inquiry does not create a binding supply contract. The page will not invent a governing-law or court clause without separate legal instruction.

These pages are operational drafts, not a substitute for counsel review.

## 9. Component and File Boundaries

The implementation plan may refine names, but responsibilities remain separated:

- `app/layout.tsx`: deterministic early consent/GTM order and GTM noscript placement
- `components/analytics/AnalyticsConsentProvider.tsx`: state, storage, synchronization, focus-return orchestration
- `components/analytics/AnalyticsConsentBanner.tsx`: approved presentation and accessibility
- `components/analytics/AnalyticsRouteTracker.tsx`: allowlisted pathname events
- `components/ui/PrivacySettingsButton.tsx`: footer trigger
- `components/ui/SiteFooter.tsx`: legal links and settings trigger
- `lib/analytics/consent.ts`: schema, parsing, serialization, fail-closed helpers, consent commands
- `lib/analytics/events.ts`: typed allowlisted data-layer events
- `app/privacy/page.tsx` and `app/terms/page.tsx`: legal pages and route metadata
- the existing SEO/public-route registry: additive entries for `/privacy` and `/terms` only
- `app/globals.css`: narrowly scoped banner/footer/legal-page styles
- tests and browser-test configuration described in section 10
- `design-qa.md`: final verification evidence and status

## 10. TDD and Verification

Implementation follows red-green-refactor. Before production code changes, add the relevant tests and confirm that they fail for the expected missing behavior.

### Unit and component coverage

Use Vitest, React Testing Library, and jsdom for:

- first visit displays the banner;
- exact label, body, terms link, and two action labels;
- Accept and Decline have distinct visual treatment;
- no Close button exists;
- valid granted and denied records are saved;
- invalid/unavailable storage fails closed;
- consent commands retain all ad fields as denied;
- footer trigger reopens the banner;
- focus moves to the label and returns to the trigger;
- storage events synchronize valid, removed, and invalid choices;
- unrelated storage keys are ignored;
- route and lead events contain only allowlisted fields.

### Structural integration coverage

- consent default appears before GTM bootstrap in rendered/source order;
- the real GTM ID appears exactly once in the bootstrap and once in noscript where expected;
- the old GA4 ID and standalone `gtag/js` loader are absent;
- the legal routes and footer controls exist;
- the root layout contains only one Analytics provider/tracker.

### Browser coverage

Use Playwright against a production build where feasible and intercept Google endpoints to keep tests deterministic:

- default consent is queued before GTM startup;
- GTM and GA4 identifiers are correct and the loader/config are not duplicated;
- Accept updates only `analytics_storage` to granted without reload;
- Decline retains denied;
- refreshing restores each stored state;
- two same-origin pages synchronize through a storage event;
- successful test submissions emit only `form_name` and never form values;
- 320×256 keeps both buttons reachable and has no horizontal overflow;
- desktop and mobile banners remain full-width and attached to the bottom edge;
- keyboard focus behavior works;
- no console errors or hydration errors occur.

Capture desktop and mobile screenshots and inspect them. Run:

- existing Node tests;
- Vitest component tests;
- Playwright browser tests;
- ESLint;
- TypeScript;
- production build.

`design-qa.md` may say `passed` only when every required check has current evidence. Otherwise it remains failed or incomplete and the work is not delivered as complete.

## 11. Risks and Constraints

- Advanced Consent Mode sends cookieless pings while consent is denied. “Cookieless” must not be described as anonymous or as no data transmission.
- The site targets Europe, the United Kingdom, Australia, the United States, and other markets. A custom single-category banner is proportionate to the present Analytics-only scope, but it is not a universal legal determination. Adding ads, retargeting, additional trackers, or region-specific requirements may justify a fuller CMP.
- Existing inquiry code persists contact details in the visitor's browser localStorage and sends them to Formspree and, when configured, Notion. Analytics code must not read this data. The persistence and vendor contracts deserve a later privacy/security review.
- The project currently uses Next.js 14.2.33. The dependency install reports known vulnerabilities, including a Next.js security notice. This task will record the risk but will not perform an unrelated framework upgrade.
- Browser privacy tools, content blockers, disabled JavaScript, unavailable storage, and network failures may prevent measurement. Consent must fail closed and the website must remain usable.
- A GTM draft cannot collect production data until separately published. This is intentional for the local-only delivery boundary.

## 12. Source Guidance

- Google Consent Mode setup: https://developers.google.com/tag-platform/security/guides/consent
- Google basic vs advanced Consent Mode: https://support.google.com/tagmanager/answer/14009635
- UK ICO cookies and similar technologies: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/
- EDPB technical scope of ePrivacy Article 5(3): https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-22023-technical-scope-art-53-eprivacy-directive_en
- OAIC Australian Privacy Principles: https://www.oaic.gov.au/privacy/australian-privacy-principles/read-the-australian-privacy-principles
