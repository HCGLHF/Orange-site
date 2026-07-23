# Certificates and About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a concise homepage GRS trust section and a fully indexed About page that accurately presents the export subsidiary, parent manufacturer, rounded equipment scale, and certificate scope.

**Architecture:** Introduce one typed evidence module for company relationships, public machine metrics, certification facts, and product directions. Server-rendered homepage and About components consume this module, while the existing SEO registry remains the only metadata/H1 inventory and a small schema adapter expresses the parent-company relationship without transferring the certificate claim to the subsidiary.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, lucide-react, Node.js test runner, existing production SEO audit

---

## File Structure

**Create**

- `lib/company-evidence.ts` — typed, reusable public facts and rounded metrics.
- `lib/company-schema.ts` — AboutPage and Organization structured-data graph.
- `components/company/HomeCertificateSection.tsx` — compact homepage trust section.
- `components/company/AboutPage.tsx` — server-rendered About page presentation.
- `components/ui/SiteFooter.tsx` — global footer with the About link and core commercial routes.
- `app/about/page.tsx` — static route, metadata adapter, and About page entry point.
- `tests/about-page.test.mjs` — evidence-boundary, rendering-wiring, schema, and privacy regression tests.

**Modify**

- `lib/seo/site-seo.ts` — add the `about` page type and `/about` SEO assignment.
- `tests/site-seo-registry.test.mjs` — update inventory to 29 pages and permit `about`.
- `tests/site-seo-integration.test.mjs` — include the About route in shared metadata enforcement.
- `components/geo/GeoHomePage.tsx` — render the compact certificate section and remove the local-only footer.
- `lib/geo-content.ts` — consume the shared company facts, round public machine claims, and add the parent organization to the existing Organization schema.
- `components/AppShell.tsx` — render the global footer after all page content.
- `reports/seo/production-html-audit.json` — regenerate from the final production build.

The supplied PDF and machine-inventory photograph remain outside `public/` and must never be added to the repository.

### Task 1: Lock the Public Evidence Boundary

**Files:**

- Create: `tests/about-page.test.mjs`
- Create: `lib/company-evidence.ts`

- [ ] **Step 1: Write the failing evidence tests**

Create `tests/about-page.test.mjs` with:

```js
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

const rootUrl = new URL("../", import.meta.url);

const readSource = async (relativePath) => {
  const url = new URL(relativePath, rootUrl);
  assert.ok(existsSync(url), `${relativePath} must exist`);
  return readFile(url, "utf8");
};

test("public company evidence uses the confirmed parent-subsidiary relationship", async () => {
  const {
    certificationEvidence,
    companyRelationship,
    manufacturingScale,
  } = await import(new URL("../lib/company-evidence.ts", import.meta.url));

  assert.equal(
    companyRelationship.exportCompany,
    "Shaoxing Shicheng Textile Products Co., Ltd."
  );
  assert.equal(
    companyRelationship.parentCompany,
    "Shaoxing Jingtian Textile Technology Co., Ltd."
  );
  assert.equal(certificationEvidence.holder, companyRelationship.parentCompany);
  assert.equal(certificationEvidence.standard, "Global Recycled Standard");
  assert.equal(certificationEvidence.version, "4.0");
  assert.equal(certificationEvidence.validUntil, "2027-04-19");
  assert.deepEqual(
    manufacturingScale.map(({ value }) => value),
    ["200+", "17", "60+", "40+", "100+"]
  );
});

test("public evidence excludes private files and unsupported equipment claims", async () => {
  const source = await readSource("lib/company-evidence.ts");
  assert.doesNotMatch(source, /\.pdf|\.jpe?g|\.png/i);
  assert.doesNotMatch(source, /\b221\b|\b177\b|\b114\b|\b63\b|\b44\b/);
  assert.doesNotMatch(source, /["'`]50\+["'`]/);
  assert.match(source, /Transaction Certificate/);
});
```

- [ ] **Step 2: Run the test and verify the missing module failure**

Run:

```bash
node --test tests/about-page.test.mjs
```

Expected: FAIL because `lib/company-evidence.ts` does not exist.

- [ ] **Step 3: Add the typed public evidence module**

Create `lib/company-evidence.ts`:

```ts
export const companyRelationship = {
  brandName: "O'range Textile",
  exportCompany: "Shaoxing Shicheng Textile Products Co., Ltd.",
  parentCompany: "Shaoxing Jingtian Textile Technology Co., Ltd.",
  exportRole:
    "International sales, buyer communication, sampling coordination and export order support",
  parentRole:
    "Knitting capability, manufacturing coordination and certificate-holder operations",
  location: "Shaoxing Keqiao, Zhejiang, China",
} as const;

export const manufacturingScale = [
  {
    value: "200+",
    label: "circular knitting machines",
    detail: "Documented manufacturing scale across double-knit and rib directions.",
  },
  {
    value: "17",
    label: "machine configurations",
    detail: "Multiple gauge, diameter and feeder combinations for structured knit development.",
  },
  {
    value: "60+",
    label: "84-feeder double-knit machines",
    detail: "A rounded public count supported by the parent company's machine record.",
  },
  {
    value: "40+",
    label: "72-feeder rib machines",
    detail: "A rounded public count for rib and related knit structures.",
  },
  {
    value: "100+",
    label: "72-feeder double-knit machines",
    detail: "A rounded public count across documented gauge configurations.",
  },
] as const;

export const certificationEvidence = {
  standard: "Global Recycled Standard",
  shortName: "GRS",
  version: "4.0",
  holder: companyRelationship.parentCompany,
  certificationBody: "TÜV Rheinland (China) Ltd.",
  scopeCertificateNumber: "TRC-GRS-350849-00",
  productCategory: "Greige fabrics",
  productDetail: "Knitted fabrics",
  process: "Knitting",
  validUntil: "2027-04-19",
  qualification:
    "Scope certification does not prove that a delivered product is GRS certified. Shipment-level claims require a valid Transaction Certificate or equivalent supporting documentation for the applicable order.",
} as const;

export const knittingDirections = [
  {
    name: "Ponte Roma",
    href: "/fabrics/ponte-roma-fabric",
    description: "Structured double-knit directions for stable apparel silhouettes.",
  },
  {
    name: "Air-layer and scuba",
    href: "/fabrics/scuba-air-layer-fabric",
    description: "Dimensional knit constructions for shape, body and cushioning.",
  },
  {
    name: "Interlock",
    href: "/fabrics/interlock-fabric",
    description: "Balanced double-knit structures for smooth faces and stable handling.",
  },
  {
    name: "Rib knit",
    href: "/fabrics/rib-knit-fabric",
    description: "Elastic rib structures for trims, fitted garments and body fabrics.",
  },
] as const;
```

- [ ] **Step 4: Run the evidence tests**

Run:

```bash
node --test tests/about-page.test.mjs
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit the evidence boundary**

```bash
git add tests/about-page.test.mjs lib/company-evidence.ts
git commit -m "test: lock company evidence boundaries"
```

### Task 2: Register the About Page in the Unified SEO Inventory

**Files:**

- Modify: `tests/site-seo-registry.test.mjs`
- Modify: `lib/seo/site-seo.ts`

- [ ] **Step 1: Update the registry test first**

In `tests/site-seo-registry.test.mjs`:

```js
const allowedPageTypes = new Set([
  "homepage",
  "service",
  "guide",
  "blog",
  "about",
]);

test("SEO registry owns exactly 29 normalized public pages", async () => {
  const { getAllPublicPageSeo } = await loadSeo();
  const pages = getAllPublicPageSeo();
  assert.equal(pages.length, 29);
  assert.equal(new Set(pages.map((page) => page.path)).size, pages.length);
  for (const page of pages) {
    assert.match(page.path, /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/);
  }
});

test("about page owns a navigational brand keyword without commercial cannibalization", async () => {
  const { getPublicPageSeo } = await loadSeo();
  const about = getPublicPageSeo("/about");
  assert.equal(about.primaryKeyword, "O'range Textile");
  assert.equal(about.searchIntent, "navigational");
  assert.equal(about.targetPageType, "about");
  assert.equal(
    about.metaTitle,
    "O'range Textile | Knit Fabric Company in Shaoxing"
  );
});
```

Replace the old `28` test name and assertion rather than keeping both inventory tests.

- [ ] **Step 2: Run the registry test and verify the count/type failures**

Run:

```bash
node --test tests/site-seo-registry.test.mjs
```

Expected: FAIL because the registry still has 28 pages and `about` is not an allowed TypeScript page type.

- [ ] **Step 3: Extend the page type and add the SEO record**

In `lib/seo/site-seo.ts`, change the type to:

```ts
export type SeoPageType =
  | "homepage"
  | "service"
  | "guide"
  | "blog"
  | "about";
```

Add this record immediately after the homepage record:

```ts
{
  path: "/about",
  primaryKeyword: "O'range Textile",
  secondaryKeywords: [
    "Shaoxing knit fabric company",
    "China knit fabric supplier",
    "knit fabric export company",
  ],
  searchIntent: "navigational",
  topicCluster: "company-trust",
  targetPageType: "about",
  metaTitle: "O'range Textile | Knit Fabric Company in Shaoxing",
  metaDescription:
    "O'range Textile is the export-focused knit fabric business of Shaoxing Shicheng Textile Products Co., Ltd. Explore its parent-company manufacturing network, 200+ circular knitting machines, GRS scope documentation and support for global B2B buyers.",
  h1: "O'range Textile: Export-Focused Knit Fabric Sourcing",
  updatedAt: "2026-07-23",
  changeFrequency: "monthly",
  priority: 0.7,
},
```

- [ ] **Step 4: Run the registry tests**

Run:

```bash
node --test tests/site-seo-registry.test.mjs
```

Expected: all registry tests PASS, including 29 unique primary keywords, title length, 248-character description, and H1 keyword coverage.

- [ ] **Step 5: Commit the SEO inventory change**

```bash
git add tests/site-seo-registry.test.mjs lib/seo/site-seo.ts
git commit -m "feat: register about page SEO"
```

### Task 3: Add the Compact Homepage Certificate Section

**Files:**

- Modify: `tests/about-page.test.mjs`
- Create: `components/company/HomeCertificateSection.tsx`
- Modify: `components/geo/GeoHomePage.tsx`

- [ ] **Step 1: Add failing homepage wiring and privacy tests**

Append to `tests/about-page.test.mjs`:

```js
test("homepage renders a compact certificate summary linked to About", async () => {
  const homepage = await readSource("components/geo/GeoHomePage.tsx");
  const section = await readSource(
    "components/company/HomeCertificateSection.tsx"
  );

  assert.match(homepage, /<HomeCertificateSection\s*\/>/);
  assert.match(section, /GRS Scope Documentation/);
  assert.match(section, /companyRelationship\.parentCompany/);
  assert.match(section, /certificationEvidence\.productDetail/);
  assert.match(section, /href="\/about"/);
  assert.doesNotMatch(section, /<h1\b/i);
  assert.doesNotMatch(section, /download|\.pdf|<img\b/i);
});
```

- [ ] **Step 2: Run the test and verify the missing component failure**

Run:

```bash
node --test tests/about-page.test.mjs
```

Expected: FAIL because `HomeCertificateSection.tsx` does not exist and the homepage does not render it.

- [ ] **Step 3: Create the compact server component**

Create `components/company/HomeCertificateSection.tsx`:

```tsx
import Link from "next/link";
import { ArrowRight, FileCheck2 } from "lucide-react";
import {
  certificationEvidence,
  companyRelationship,
} from "@/lib/company-evidence";

export function HomeCertificateSection() {
  return (
    <section
      aria-labelledby="grs-scope-heading"
      className="border-y border-brand-soft bg-white px-5 py-10 sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand-orange">
          <FileCheck2 className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Certificates
          </p>
          <h2
            id="grs-scope-heading"
            className="mt-2 text-2xl font-semibold text-brand-charcoal"
          >
            GRS Scope Documentation
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-charcoal/70">
            Our parent company, {companyRelationship.parentCompany}, holds a{" "}
            {certificationEvidence.shortName} v{certificationEvidence.version}{" "}
            scope certificate covering{" "}
            {certificationEvidence.productDetail.toLowerCase()} and{" "}
            {certificationEvidence.process.toLowerCase()}. Documentation for
            applicable sourcing requests is reviewed case by case.
          </p>
        </div>
        <Link
          href="/about"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange hover:underline"
        >
          Learn about our company
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Render it after the homepage route chooser**

In `components/geo/GeoHomePage.tsx`, import:

```tsx
import { HomeCertificateSection } from "@/components/company/HomeCertificateSection";
```

Render it after `<LandingRouteChooser routes={buyerRoutes} />`:

```tsx
<LandingRouteChooser routes={buyerRoutes} />
<HomeCertificateSection />
```

- [ ] **Step 5: Run the homepage regression tests**

Run:

```bash
node --test tests/about-page.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 6: Commit the homepage trust section**

```bash
git add tests/about-page.test.mjs components/company/HomeCertificateSection.tsx components/geo/GeoHomePage.tsx
git commit -m "feat: add homepage GRS summary"
```

### Task 4: Build the About Page and Structured Data

**Files:**

- Modify: `tests/about-page.test.mjs`
- Modify: `tests/site-seo-integration.test.mjs`
- Create: `lib/company-schema.ts`
- Create: `components/company/AboutPage.tsx`
- Create: `app/about/page.tsx`

- [ ] **Step 1: Add failing About route and schema tests**

Append to `tests/about-page.test.mjs`:

```js
test("About route uses unified metadata and one registry-owned H1", async () => {
  const route = await readSource("app/about/page.tsx");
  const page = await readSource("components/company/AboutPage.tsx");

  assert.match(route, /getPublicPageSeo\\(["'`]\\/about["'`]\\)/);
  assert.match(route, /createPageMetadata\\(seo\\)/);
  assert.match(route, /<AboutPage seo=\\{seo\\}/);
  assert.equal((page.match(/<h1\\b/g) ?? []).length, 1);
  assert.match(page, /\\{seo\\.h1\\}/);
  assert.match(page, /manufacturingScale\\.map/);
  assert.match(page, /certificationEvidence\\.qualification/);
  assert.doesNotMatch(page, /<img\\b|\\.pdf|download/i);
});

test("About schema identifies the parent without assigning its certificate to the subsidiary", async () => {
  const source = await readSource("lib/company-schema.ts");
  assert.match(source, /"@type": "AboutPage"/);
  assert.match(source, /parentOrganization/);
  assert.match(source, /companyRelationship\\.parentCompany/);
  assert.doesNotMatch(source, /certificationEvidence|scopeCertificateNumber/);
});
```

In `tests/site-seo-integration.test.mjs`, add `"app/about/page.tsx"` to `staticRoutes`.

- [ ] **Step 2: Run the focused tests and verify missing-file failures**

Run:

```bash
node --test tests/about-page.test.mjs tests/site-seo-integration.test.mjs
```

Expected: FAIL because the About route, component, and schema adapter do not exist.

- [ ] **Step 3: Create the About schema adapter**

Create `lib/company-schema.ts`:

```ts
import {
  companyRelationship,
  manufacturingScale,
  knittingDirections,
} from "@/lib/company-evidence";
import {
  SEO_SITE_ORIGIN,
  toCanonicalUrl,
  type PublicPageSeo,
} from "@/lib/seo/site-seo";

export function createAboutPageJsonLd(seo: PublicPageSeo) {
  const organizationId = `${SEO_SITE_ORIGIN}/#organization`;
  const aboutUrl = toCanonicalUrl(seo.path);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${aboutUrl}#webpage`,
        url: aboutUrl,
        name: seo.h1,
        description: seo.metaDescription,
        about: { "@id": organizationId },
      },
      {
        "@type": "Organization",
        "@id": organizationId,
        name: companyRelationship.brandName,
        legalName: companyRelationship.exportCompany,
        url: SEO_SITE_ORIGIN,
        location: companyRelationship.location,
        parentOrganization: {
          "@type": "Organization",
          name: companyRelationship.parentCompany,
        },
        knowsAbout: knittingDirections.map(({ name }) => name),
        description: `${companyRelationship.exportRole}. The parent manufacturing network records ${manufacturingScale[0].value} ${manufacturingScale[0].label}.`,
      },
    ],
  };
}
```

- [ ] **Step 4: Create the server-rendered About component**

Create `components/company/AboutPage.tsx` with:

```tsx
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Factory,
  FileCheck2,
  Globe2,
} from "lucide-react";
import ContactCard from "@/components/ContactCard";
import { StructuredData } from "@/components/geo/StructuredData";
import {
  certificationEvidence,
  companyRelationship,
  knittingDirections,
  manufacturingScale,
} from "@/lib/company-evidence";
import { createAboutPageJsonLd } from "@/lib/company-schema";
import type { PublicPageSeo } from "@/lib/seo/site-seo";

export function AboutPage({ seo }: { seo: PublicPageSeo }) {
  return (
    <div className="bg-brand-cream text-brand-charcoal">
      <StructuredData data={createAboutPageJsonLd(seo)} />

      <header className="border-b border-brand-soft px-5 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
            About our company
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
            {seo.h1}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-brand-charcoal/70">
            {companyRelationship.brandName} connects international buyers with
            documented knit fabric sourcing, sample coordination and export
            support from Shaoxing Keqiao.
          </p>
        </div>
      </header>

      <section className="bg-white px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <article className="border-t-2 border-brand-orange pt-6">
            <Building2 className="h-7 w-7 text-brand-orange" aria-hidden />
            <h2 className="mt-5 text-2xl font-semibold">Export company</h2>
            <p className="mt-4 text-sm leading-7 text-brand-charcoal/70">
              {companyRelationship.exportCompany} operates the O&apos;range
              Textile export business, focusing on international buyer
              communication, specification review, samples and order follow-up.
            </p>
          </article>
          <article className="border-t-2 border-brand-charcoal pt-6">
            <Factory className="h-7 w-7 text-brand-charcoal" aria-hidden />
            <h2 className="mt-5 text-2xl font-semibold">Parent manufacturer</h2>
            <p className="mt-4 text-sm leading-7 text-brand-charcoal/70">
              {companyRelationship.parentCompany} is the parent company,
              supporting the documented knitting capability and holding the
              GRS scope certificate described below.
            </p>
          </article>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Documented manufacturing scale
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold">
            Rounded public figures backed by the parent company&apos;s machine record
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {manufacturingScale.map((metric) => (
              <article key={metric.label} className="border border-brand-soft bg-white p-5">
                <p className="text-4xl font-semibold text-brand-orange">{metric.value}</p>
                <h3 className="mt-3 text-sm font-semibold">{metric.label}</h3>
                <p className="mt-3 text-xs leading-6 text-brand-charcoal/65">
                  {metric.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-semibold">Knitting directions for buyer review</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {knittingDirections.map((direction) => (
              <Link
                key={direction.name}
                href={direction.href}
                className="group border border-brand-soft p-6 transition-colors hover:border-brand-orange"
              >
                <h3 className="text-lg font-semibold">{direction.name}</h3>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  {direction.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange">
                  Review this fabric direction
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-charcoal px-5 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <FileCheck2 className="h-8 w-8 text-brand-orange" aria-hidden />
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Certificate summary
            </p>
            <h2 className="mt-3 text-3xl font-semibold">GRS scope documentation</h2>
          </div>
          <div>
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {[
                ["Holder", certificationEvidence.holder],
                ["Standard", `${certificationEvidence.standard} v${certificationEvidence.version}`],
                ["Certification body", certificationEvidence.certificationBody],
                ["Scope certificate", certificationEvidence.scopeCertificateNumber],
                ["Product scope", `${certificationEvidence.productCategory}; ${certificationEvidence.productDetail}`],
                ["Valid until", certificationEvidence.validUntil],
              ].map(([term, detail]) => (
                <div key={term}>
                  <dt className="text-xs uppercase tracking-[0.14em] text-white/50">{term}</dt>
                  <dd className="mt-2 text-sm leading-6 text-white/85">{detail}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 border-l-2 border-brand-orange pl-5 text-sm leading-7 text-white/70">
              {certificationEvidence.qualification}
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
          <Globe2 className="h-9 w-9 text-brand-orange" aria-hidden />
          <div>
            <h2 className="text-3xl font-semibold">Support for international sourcing teams</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-charcoal/70">
              Global B2B buyers, including sourcing teams in the United States
              and Australia, can submit intended use, composition, target GSM,
              usable width, colour, finish, quantity and testing requirements
              for sample-route and quotation review.
            </p>
            <Link
              href="/custom-knit-fabric-development"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange"
            >
              Build a development brief
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <ContactCard />
    </div>
  );
}
```

- [ ] **Step 5: Create the static About route**

Create `app/about/page.tsx`:

```tsx
import { AboutPage } from "@/components/company/AboutPage";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublicPageSeo } from "@/lib/seo/site-seo";

const seo = getPublicPageSeo("/about");

export const dynamic = "force-static";
export const metadata = createPageMetadata(seo);

export default function About() {
  return <AboutPage seo={seo} />;
}
```

- [ ] **Step 6: Run the focused tests**

Run:

```bash
node --test tests/about-page.test.mjs tests/site-seo-integration.test.mjs
```

Expected: all About and SEO integration tests PASS.

- [ ] **Step 7: Commit the About page**

```bash
git add tests/about-page.test.mjs tests/site-seo-integration.test.mjs lib/company-schema.ts components/company/AboutPage.tsx app/about/page.tsx
git commit -m "feat: add evidence-led about page"
```

### Task 5: Make Company Trust Discoverable Sitewide

**Files:**

- Modify: `tests/about-page.test.mjs`
- Create: `components/ui/SiteFooter.tsx`
- Modify: `components/AppShell.tsx`
- Modify: `components/geo/GeoHomePage.tsx`
- Modify: `lib/geo-content.ts`

- [ ] **Step 1: Add failing global footer and company-schema alignment tests**

Append to `tests/about-page.test.mjs`:

```js
test("global shell exposes About without duplicating the homepage footer", async () => {
  const shell = await readSource("components/AppShell.tsx");
  const footer = await readSource("components/ui/SiteFooter.tsx");
  const homepage = await readSource("components/geo/GeoHomePage.tsx");

  assert.match(shell, /<SiteFooter\s*\/>/);
  assert.match(footer, /href="\/about"/);
  assert.match(footer, /companyRelationship\.exportCompany/);
  assert.doesNotMatch(homepage, /<footer\b/);
});

test("existing organization and AI discovery content use shared relationship facts", async () => {
  const geo = await readSource("lib/geo-content.ts");
  assert.match(geo, /companyRelationship\.exportCompany/);
  assert.match(geo, /parentOrganization/);
  assert.match(geo, /companyRelationship\.parentCompany/);
  assert.doesNotMatch(geo, /\b221\b|\b177\b|\b114\b|\b63\b|\b44\b/);
});
```

- [ ] **Step 2: Run the test and verify footer and legacy-claim failures**

Run:

```bash
node --test tests/about-page.test.mjs
```

Expected: FAIL because no global SiteFooter exists, the homepage still has its local footer, and `geo-content.ts` contains exact machine counts.

- [ ] **Step 3: Create the global footer**

Create `components/ui/SiteFooter.tsx`:

```tsx
import Link from "next/link";
import { companyRelationship } from "@/lib/company-evidence";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/fabrics", label: "Finished fabrics" },
  { href: "/finished-double-knit-fabrics", label: "Double-knit manufacturing" },
  { href: "/custom-knit-fabric-development", label: "Custom development" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-soft bg-white px-5 pb-24 pt-10 text-brand-charcoal sm:px-6 md:pb-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-semibold">{companyRelationship.brandName}</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-charcoal/60">
            {companyRelationship.exportCompany} — export-focused knit fabric
            sourcing from Shaoxing Keqiao.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand-orange">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Render the global footer from the server shell**

Replace `components/AppShell.tsx` with:

```tsx
import type { ReactNode } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { SiteFooter } from "@/components/ui/SiteFooter";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="h-[7.5rem] shrink-0 sm:h-16" aria-hidden />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
```

Remove the local `<footer>...</footer>` block from `components/geo/GeoHomePage.tsx`.

- [ ] **Step 5: Align existing company facts and Organization schema**

At the top of `lib/geo-content.ts`, import:

```ts
import {
  certificationEvidence,
  companyRelationship,
  manufacturingScale,
} from "@/lib/company-evidence";
```

Change `companyProfile` to consume the relationship values:

```ts
brandName: companyRelationship.brandName,
legalName: companyRelationship.exportCompany,
location: companyRelationship.location,
```

Replace the exact machine entity fact with:

```ts
["Machine evidence", `${manufacturingScale[0].value} documented circular knitting machines`],
```

Replace the exact-count capability card with:

```ts
{
  title: `${manufacturingScale[0].value} documented knitting machines`,
  body:
    "The parent company's supplied machine record supports rounded public counts across double-knit, rib, gauge and feeder configurations.",
},
```

Replace the GRS FAQ answer with:

```ts
answer:
  `${companyRelationship.parentCompany} holds a ${certificationEvidence.shortName} v${certificationEvidence.version} scope certificate covering ${certificationEvidence.productDetail.toLowerCase()} and ${certificationEvidence.process.toLowerCase()}. Shipment-level claims require the applicable valid Transaction Certificate or equivalent supporting documentation.`,
```

Extend `organizationJsonLd` with a stable ID and parent organization:

```ts
"@id": `${siteUrl}/#organization`,
parentOrganization: {
  "@type": "Organization",
  name: companyRelationship.parentCompany,
},
```

Do not add certificate fields to the subsidiary Organization node.

- [ ] **Step 6: Run the complete unit test suite**

Run:

```bash
npm test
```

Expected: all tests PASS and the registry reports exactly 29 public pages.

- [ ] **Step 7: Commit global discovery and company alignment**

```bash
git add tests/about-page.test.mjs components/ui/SiteFooter.tsx components/AppShell.tsx components/geo/GeoHomePage.tsx lib/geo-content.ts
git commit -m "feat: expose company trust sitewide"
```

### Task 6: Verify the Production Build and Final HTML

**Files:**

- Modify: `reports/seo/production-html-audit.json`

- [ ] **Step 1: Run lint**

Run:

```bash
npm run lint
```

Expected: exit code 0 with no ESLint errors.

- [ ] **Step 2: Run TypeScript validation**

Run:

```bash
npm run typecheck
```

Expected: exit code 0 with no TypeScript errors.

- [ ] **Step 3: Run all tests**

Run:

```bash
npm test
```

Expected: exit code 0 with all tests passing.

- [ ] **Step 4: Produce the Next.js production build**

Run:

```bash
npm run build
```

Expected: exit code 0; the static route table includes `/about`.

- [ ] **Step 5: Audit all final production HTML**

Run:

```bash
npm run test:seo:production
```

Expected:

- 29 checked pages
- 29 PASS
- 0 FAIL
- 0 unchecked
- `/about` returns HTTP 200
- one H1 on `/about` and one H1 on `/`
- title begins with `O'range Textile` and is no longer than 70 characters
- description is 248 characters and contains `O'range Textile`
- one correct `https://orangetextiles.com/about` canonical
- `/about` appears in `sitemap.xml`
- no unintended `noindex`
- all rendered images have `alt` attributes

- [ ] **Step 6: Confirm private source files are absent from tracked and public files**

Run:

```bash
git ls-files | rg -i "GRS2026|针筒明细|\\.(pdf|jpe?g)$"
rg -n "221|177|114|63|44|50\\+|\\.pdf|针筒明细" app components lib public
```

Expected:

- the first command prints no supplied certificate or inventory asset;
- the second command prints no private exact equipment totals, unsupported `50+`, PDF link, or Chinese inventory title in public source.

- [ ] **Step 7: Review the generated audit report**

Run:

```bash
git diff -- reports/seo/production-html-audit.json
git diff --check
git status --short
```

Expected: only the intentional implementation files and regenerated SEO report differ; the pre-existing untracked `docs/superpowers/plans/2026-07-19-vercel-domain-migration.md` and temporary `tmp/` directory remain excluded.

- [ ] **Step 8: Commit the verified production report**

```bash
git add reports/seo/production-html-audit.json
git commit -m "test: verify 29-page production SEO"
```

- [ ] **Step 9: Perform the pre-push risk audit**

Use the `pre-push-risk-auditor` skill to inspect staged/tracked changes, repository exposure, private source-file absence, generated artifacts, and commit history. Resolve any high-confidence issue, then rerun the affected verification command.

- [ ] **Step 10: Push the verified main branch**

Run:

```bash
git push origin main
```

Expected: the remote `main` branch advances to the final verified commit and triggers the configured Vercel deployment.
