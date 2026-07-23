# Orange Semrush Page-Family Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the three new-guide single-entry issues, normalize the homepage canonical URL, and run a measurable content-density experiment on six catalogue-derived buyer guides.

**Architecture:** Keep the existing SEO and finished-fabric registries as the only data sources. Add contextual inbound routes in `finished-fabrics.json`, normalize root URLs through `toCanonicalUrl`, and add an optional evidence snapshot to the finished-fabric content model that the existing server component renders with lightweight semantic markup.

**Tech Stack:** Next.js 14 App Router, React Server Components, TypeScript, JSON content registries, Node test runner, Semrush Site Audit.

> **Implementation addendum:** The root trailing-slash hypothesis in Tasks 1
> and 3 was falsified by the production build. Next.js 14 deliberately emits
> the root canonical as `https://orangetextiles.com`. The final implementation
> and test align metadata and sitemap to that bare origin instead of enabling a
> sitewide trailing-slash policy. The sitemap-orphan warning remains pending
> production Semrush measurement.

---

### Task 1: Lock the Semrush Regressions into Tests

**Files:**
- Modify: `tests/finished-fabric-content.test.mjs`
- Modify: `tests/site-seo-registry.test.mjs`
- Modify: `tests/semrush-foundation.test.mjs`

- [ ] **Step 1: Add a failing inbound-link test**

Add a content-graph assertion that counts the server-rendered blog index as one
entry and registry `relatedLinks` as additional entries:

```js
test("new catalogue guides have at least three contextual inbound routes", () => {
  const pages = loadPages();
  const targets = [
    "/blog/how-to-source-wool-blend-knit-fabric",
    "/blog/jacquard-knit-fabric-weight-and-width-guide",
    "/blog/brushed-and-pile-knit-fabric-finishes",
  ];

  for (const target of targets) {
    const registryEntries = pages.filter((page) =>
      page.relatedLinks.some((link) => link.href === target)
    );
    assert.ok(
      registryEntries.length >= 2,
      `${target} needs two contextual entries in addition to the blog index`
    );
  }
});
```

- [ ] **Step 2: Add a failing root-canonical test**

Read `lib/seo/site-seo.ts` and require the root branch to return a
slash-terminated origin. Keep the existing sitemap-helper assertion so both
metadata and sitemap share the normalization point:

```js
assert.match(
  registry,
  /if \(path === "\/"\)[\s\S]+?return `\$\{SEO_SITE_ORIGIN\}\/`;/
);
assert.match(sitemap, /url: toCanonicalUrl\(page\.path\)/);
```

- [ ] **Step 3: Add a failing guide-evidence test**

Require the six catalogue-derived guides to expose a unique evidence snapshot:

```js
test("catalogue-derived guides publish unique evidence snapshots", () => {
  const pages = loadPages();
  const guides = pages.filter((page) =>
    [
      "/blog/air-layer-knit-fabric-sourcing-guide",
      "/blog/how-to-source-wool-blend-knit-fabric",
      "/blog/jacquard-knit-fabric-weight-and-width-guide",
      "/blog/brushed-and-pile-knit-fabric-finishes",
      "/blog/how-to-write-a-knit-fabric-rfq",
      "/blog/knit-fabric-sourcing-questions",
    ].includes(page.url)
  );

  assert.equal(new Set(guides.map((page) => page.evidenceSnapshot.heading)).size, 6);
  for (const page of guides) {
    assert.ok(page.evidenceSnapshot.summary.length >= 180);
    assert.ok(page.evidenceSnapshot.items.length >= 3);
  }
});
```

- [ ] **Step 4: Add a failing rendering test**

Require `FinishedFabricPage.tsx` to render the evidence snapshot without a card
per sentence:

```js
assert.match(component, /page\.evidenceSnapshot/);
assert.match(component, /evidenceSnapshot\.items\.map/);
assert.match(component, /<dl/);
assert.match(component, /<dt/);
assert.match(component, /<dd/);
```

- [ ] **Step 5: Run the focused tests and verify RED**

Run:

```powershell
npm.cmd test -- tests/finished-fabric-content.test.mjs tests/site-seo-registry.test.mjs tests/semrush-foundation.test.mjs
```

Expected: failures report missing contextual entries, root slash normalization,
evidence snapshots, and evidence rendering.

### Task 2: Repair Contextual Inbound Links

**Files:**
- Modify: `content/finished-fabrics.json`
- Test: `tests/finished-fabric-content.test.mjs`

- [ ] **Step 1: Add the hub routes**

Add three `relatedLinks` to `/finished-double-knit-fabrics`:

```json
{
  "href": "/blog/how-to-source-wool-blend-knit-fabric",
  "label": "Source wool-blend knit with evidence",
  "description": "Use article, composition, finish, width and sample checks to prepare a wool-blend sourcing decision."
}
```

Add equivalent intent-specific routes for jacquard weight/width and
brushed/pile finishes.

- [ ] **Step 2: Add product-page routes**

Add the wool-blend sourcing and brushed-finish guides to
`/fabrics/wool-blend-knit-fabric`. Add the jacquard weight/width guide to
`/fabrics/jacquard-knit-fabric`.

- [ ] **Step 3: Run the inbound-link test and verify GREEN**

Run:

```powershell
npm.cmd test -- tests/finished-fabric-content.test.mjs
```

Expected: the new content-graph test passes and all existing content-boundary
tests remain green.

### Task 3: Normalize the Homepage Canonical

**Files:**
- Modify: `lib/seo/site-seo.ts`
- Test: `tests/site-seo-registry.test.mjs`

- [ ] **Step 1: Change only the root branch**

Use:

```ts
export function toCanonicalUrl(path: string): string {
  if (path === "/") {
    return `${SEO_SITE_ORIGIN}/`;
  }
  return new URL(path, `${SEO_SITE_ORIGIN}/`).toString();
}
```

- [ ] **Step 2: Run the registry test and verify GREEN**

Run:

```powershell
npm.cmd test -- tests/site-seo-registry.test.mjs
```

Expected: the slash-terminated root assertion passes without changing non-root
URLs.

### Task 4: Add Six Page-Specific Evidence Snapshots

**Files:**
- Modify: `content/finished-fabrics.json`
- Modify: `lib/finished-fabric-content.ts`
- Modify: `components/finished-fabric/FinishedFabricPage.tsx`
- Test: `tests/finished-fabric-content.test.mjs`
- Test: `tests/semrush-foundation.test.mjs`

- [ ] **Step 1: Extend the content type**

Add:

```ts
evidenceSnapshot?: {
  heading: string;
  summary: string;
  items: Array<{
    label: string;
    detail: string;
  }>;
};
```

to `FinishedFabricPage`.

- [ ] **Step 2: Add six unique snapshots**

For each approved guide, write one evidence snapshot with:

- a unique intent-specific heading;
- a 180-character-or-longer summary that explains how to use the documented
  evidence;
- at least three label/detail items;
- only claims already supported by catalogue records or existing page copy.

Use article identifiers, documented GSM/usable-width values, sample approval,
and commercial confirmation where relevant. For RFQ and sourcing-question
guides, use fields and decisions rather than inventing product specifications.

- [ ] **Step 3: Render semantic evidence markup**

After the normal guide sections and before the article cards/related routes,
render:

```tsx
{page.evidenceSnapshot ? (
  <section className="bg-white">
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h2>{page.evidenceSnapshot.heading}</h2>
      <p>{page.evidenceSnapshot.summary}</p>
      <dl>
        {page.evidenceSnapshot.items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.detail}</dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
) : null}
```

Use the existing typography and border colors, but keep the structure as one
section and one definition list rather than nested cards.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run:

```powershell
npm.cmd test -- tests/finished-fabric-content.test.mjs tests/semrush-foundation.test.mjs
```

Expected: all snapshot content and rendering assertions pass.

### Task 5: Run Full Local Verification

**Files:**
- Update if generated by the existing audit: `reports/seo/production-html-audit.json`

- [ ] **Step 1: Run the full unit suite**

Run `npm.cmd test`.

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run static checks**

Run:

```powershell
npm.cmd run lint
npm.cmd run typecheck
```

Expected: zero lint errors and zero TypeScript errors. The existing
`FabricCard.tsx` native-image warning may remain documented if unchanged.

- [ ] **Step 3: Run the production build**

Run `npm.cmd run build`.

Expected: Next.js completes the production build and generates every public
route.

- [ ] **Step 4: Run the production HTML audit**

Start the built app on an unused local port, then run:

```powershell
$env:SEO_AUDIT_BASE_URL="http://127.0.0.1:<port>"
npm.cmd run test:seo:production
```

Expected: all public pages return 200 and pass title, description, H1, image
alt, canonical, sitemap, and indexability checks. Verify the homepage
canonical ends in `/`.

- [ ] **Step 5: Scan for sensitive data**

Scan the changed files and generated report for credentials, API keys, tokens,
cookies, sessions, passwords, and private keys. Expected: zero credible secret
matches.

### Task 6: Commit, Push, and Prepare Semrush Measurement

**Files:**
- Create: `E:\geo\outputs\orangetextiles-seo\semrush-page-family-2026-07-23.md`
- Modify: `E:\geo\company-memory\index.md`
- Modify: `E:\geo\company-memory\wiki\current-priorities.md`
- Modify: `E:\geo\company-memory\wiki\seo-optimization-playbook.md`

- [ ] **Step 1: Record the implementation baseline**

Write the current metrics, changed URL families, verification results, and
post-deploy Semrush acceptance targets. Do not include credentials or session
data.

- [ ] **Step 2: Commit implementation**

Commit only the reviewed source, tests, and generated SEO audit evidence with
a message describing contextual links, canonical normalization, and guide
density.

- [ ] **Step 3: Push the fixed branch**

Push `codex/orange-semrush-foundation` to the authorized remote.

- [ ] **Step 4: Open or refresh the pull request**

Use `HCGLHF/Orange-site:main` as the base. Do not merge automatically. Provide
the user with the pull request/merge entry.

- [ ] **Step 5: Measure after production deployment**

After the user merges and production deploys, rerun Semrush and compare:

- Errors: remain 0
- Site Health: remain at least 99%
- AI Search issues: 3 to 0
- Sitemap orphan: 1 to 0
- low text/HTML ratio: compare the six experimental guides individually

If the ratio does not improve, stop broad copy expansion and inspect rendered
HTML weight before choosing another page family.
