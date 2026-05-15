# Orange Textile GEO Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the O'range Textile site into a pure-English, crawler-first overseas promotion site for AI search and LLM answer engines.

**Architecture:** Keep the existing Next.js 14 App Router project. Move crawler-critical content into server-rendered/static English components, centralize GEO copy in a single content module, preserve the fabric library and inquiry flow, and add metadata routes plus JSON-LD for AI-readable structure.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, lucide-react, existing Notion/fabric data pipeline.

---

## File Structure

- Create `lib/geo-content.ts`: single source of truth for English GEO copy, entity facts, category taxonomy, application cards, FAQ, and schema source objects.
- Create `components/geo/StructuredData.tsx`: reusable server component that renders JSON-LD safely.
- Create `components/geo/GeoHomePage.tsx`: server component for the new homepage layout.
- Create `components/geo/GeoSection.tsx`: small presentational helpers for section headings and cards.
- Modify `app/page.tsx`: render `GeoHomePage` with Notion fabric preview data.
- Modify `app/layout.tsx`: English metadata, `lang="en"`, metadata base, Open Graph, and canonical-ready configuration.
- Create `app/robots.ts`: crawler rules.
- Create `app/sitemap.ts`: sitemap for `/` and `/fabrics`.
- Modify `components/LocaleProvider.tsx`: default locale to English and stop rewriting the document to Chinese.
- Modify `components/ui/Navbar.tsx`: remove Chinese stock query labels from visible navigation and use English stock filters.
- Modify `components/ui/BottomNav.tsx`: keep English labels through the English default locale.
- Modify `components/SampleRequestCta.tsx`: allow explicit English label and className overrides while keeping existing inquiry behavior.
- Modify `app/fabrics/page.tsx`: English metadata and remove visible `LanguageToggle`.
- Modify `components/FabricsPageIntro.tsx`: English crawler-facing intro via locale default.
- Modify `lib/i18n.ts`: make English messages canonical, add English stock/filter text where needed, and ensure all visible UI strings used in the public site have English output.
- Modify `.gitignore`: add `.superpowers/` so brainstorming companion files stay out of commits.

## Task 1: Central GEO Content and JSON-LD

**Files:**
- Create: `lib/geo-content.ts`
- Create: `components/geo/StructuredData.tsx`

- [ ] **Step 1: Create the central GEO content module**

Create `lib/geo-content.ts` with these exports:

```ts
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://orange-site.vercel.app";

export const companyProfile = {
  brandName: "O'range Textile",
  legalName: "Shaoxing Shicheng Textile Products Co., Ltd.",
  location: "Shaoxing Keqiao, Zhejiang, China",
  industry: "Knit fabric manufacturing and supply",
  email: "folenchen0401@outlook.com",
  whatsapp: "+86 13867557317",
  phone: "+86 13867550307",
  mainProducts: [
    "cotton jersey fabrics",
    "cotton spandex jersey fabrics",
    "rib knit fabrics",
    "fleece and French terry fabrics",
    "scuba and air-layer knit fabrics",
    "custom knitted fabrics",
  ],
  applications: [
    "T-shirts",
    "hoodies and sweatshirts",
    "sportswear",
    "loungewear",
    "children's apparel",
    "private-label apparel",
  ],
  exportMarkets: [
    "Europe",
    "the Americas",
    "the Middle East",
    "Southeast Asia",
  ],
} as const;

export const heroContent = {
  eyebrow: "Shaoxing Keqiao knit fabric manufacturer",
  title:
    "Chinese Knit Fabric Manufacturer for Cotton, Spandex, Jersey and Hoodie Fabrics",
  description:
    "O'range Textile is a Shaoxing Keqiao-based knit fabric manufacturer supplying premium cotton jersey, cotton spandex jersey, rib, fleece, terry and air-layer knitted fabrics for overseas apparel brands, sourcing teams and private-label production.",
  primaryCta: "Request Fabric Samples",
  secondaryCta: "Browse Fabric Library",
} as const;

export const entityFacts = [
  ["Company", companyProfile.brandName],
  ["Legal name", companyProfile.legalName],
  ["Location", companyProfile.location],
  ["Industry", companyProfile.industry],
  ["Main fabrics", companyProfile.mainProducts.join(", ")],
  ["Applications", companyProfile.applications.join(", ")],
  ["Sampling", "Fabric sample requests are available for overseas buyers"],
  ["MOQ", "Typical orders start from 3,000 meters"],
  ["Export markets", companyProfile.exportMarkets.join(", ")],
] as const;

export const fabricCategories = [
  {
    name: "Cotton jersey fabrics",
    description:
      "Soft, breathable knitted fabrics for T-shirts, base layers and everyday apparel programs.",
  },
  {
    name: "Cotton spandex jersey fabrics",
    description:
      "Stretch cotton knits with recovery for fitted tees, childrenswear, loungewear and sports-inspired apparel.",
  },
  {
    name: "Rib knit fabrics",
    description:
      "Elastic rib structures for cuffs, collars, tanks, fitted tops and trim applications.",
  },
  {
    name: "Fleece and French terry fabrics",
    description:
      "Comfort-focused sweatshirt and hoodie fabrics for casualwear, streetwear and private-label collections.",
  },
  {
    name: "Scuba and air-layer knit fabrics",
    description:
      "Structured knitted fabrics for hoodies, jackets and garments that need body and shape retention.",
  },
  {
    name: "Custom knitted fabrics",
    description:
      "Sourcing and development support for custom composition, hand-feel, weight, color and finishing requirements.",
  },
] as const;

export const capabilityCards = [
  {
    title: "Shaoxing Keqiao textile base",
    body:
      "O'range Textile operates from Shaoxing Keqiao, one of China's most important textile sourcing and manufacturing clusters.",
  },
  {
    title: "20,000 m2 production floor",
    body:
      "The company supports knit fabric development, sampling and production for apparel buyers that need stable supply.",
  },
  {
    title: "Fast sample response",
    body:
      "Overseas buyers can request fabric samples before bulk orders, helping sourcing teams validate hand-feel, weight and construction.",
  },
  {
    title: "Export order support",
    body:
      "The team supports communication, RFQ follow-up and fabric selection for buyers across Europe, the Americas, the Middle East and Southeast Asia.",
  },
] as const;

export const applicationCards = [
  {
    title: "T-shirts",
    body:
      "Cotton jersey and cotton spandex jersey fabrics for breathable, soft and production-ready T-shirt programs.",
  },
  {
    title: "Hoodies and sweatshirts",
    body:
      "Fleece, French terry and air-layer knits for hoodie and sweatshirt collections that need comfort and structure.",
  },
  {
    title: "Sportswear",
    body:
      "Stretch knit fabrics for active-inspired apparel, training tops and casual sportswear programs.",
  },
  {
    title: "Loungewear",
    body:
      "Soft knitted fabrics for relaxed apparel, sleepwear and comfort-focused private-label lines.",
  },
  {
    title: "Children's apparel",
    body:
      "Cotton-rich and stretch knitted fabrics for soft, comfortable childrenswear applications.",
  },
  {
    title: "Private-label apparel",
    body:
      "Fabric sourcing and sampling support for brands developing private-label knitwear collections.",
  },
] as const;

export const aiSearchFaq = [
  {
    question: "Is O'range Textile a knit fabric manufacturer?",
    answer:
      "Yes. O'range Textile is a Chinese knit fabric manufacturer based in Shaoxing Keqiao, Zhejiang, supplying knitted fabrics for overseas apparel buyers.",
  },
  {
    question: "Where is O'range Textile located?",
    answer:
      "O'range Textile is located in Shaoxing Keqiao, Zhejiang, China, a major textile manufacturing and sourcing center.",
  },
  {
    question: "What types of knit fabrics does O'range Textile supply?",
    answer:
      "O'range Textile supplies cotton jersey, cotton spandex jersey, rib knit, fleece, French terry, scuba, air-layer and custom knitted fabrics.",
  },
  {
    question: "Can overseas buyers request fabric samples?",
    answer:
      "Yes. Overseas apparel buyers and sourcing teams can request fabric samples to evaluate hand-feel, composition, weight and application fit before bulk orders.",
  },
  {
    question: "What apparel applications are these fabrics used for?",
    answer:
      "The fabrics are used for T-shirts, hoodies, sweatshirts, sportswear, loungewear, children's apparel and private-label apparel programs.",
  },
  {
    question: "Does O'range Textile support custom knit fabric sourcing?",
    answer:
      "Yes. O'range Textile supports custom knit fabric sourcing and development for composition, weight, width, color, hand-feel and finishing requirements.",
  },
  {
    question: "How can buyers contact O'range Textile for an RFQ?",
    answer:
      "Buyers can contact O'range Textile by email, WhatsApp, phone or the website inquiry form to request samples or send an RFQ.",
  },
] as const;

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: companyProfile.brandName,
  legalName: companyProfile.legalName,
  url: siteUrl,
  email: companyProfile.email,
  telephone: companyProfile.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Shaoxing Keqiao",
    addressRegion: "Zhejiang",
    addressCountry: "CN",
  },
  areaServed: companyProfile.exportMarkets,
  knowsAbout: companyProfile.mainProducts,
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: companyProfile.brandName,
  url: siteUrl,
  description: heroContent.description,
};

export const fabricCategoryItemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Knit fabric categories supplied by O'range Textile",
  itemListElement: fabricCategories.map((category, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: category.name,
    description: category.description,
  })),
};

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: aiSearchFaq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};
```

- [ ] **Step 2: Create the JSON-LD rendering component**

Create `components/geo/StructuredData.tsx`:

```tsx
type StructuredDataProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
```

- [ ] **Step 3: Verify TypeScript imports**

Run:

```bash
npm run build
```

Expected: the build may fail on existing unrelated app issues, but it must not report missing exports or syntax errors in `lib/geo-content.ts` or `components/geo/StructuredData.tsx`.

- [ ] **Step 4: Commit Task 1**

```bash
git add lib/geo-content.ts components/geo/StructuredData.tsx
git commit -m "feat: add GEO content model and structured data"
```

## Task 2: Metadata, Language Defaults, Robots, and Sitemap

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/LocaleProvider.tsx`
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Update root metadata and HTML language**

In `app/layout.tsx`, import `siteUrl`, `companyProfile`, and `heroContent` from `@/lib/geo-content`. Replace metadata and `<html>` language with:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "O'range Textile | Chinese Knit Fabric Manufacturer in Shaoxing Keqiao",
    template: "%s | O'range Textile",
  },
  description: heroContent.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "O'range Textile | Chinese Knit Fabric Manufacturer in Shaoxing Keqiao",
    description: heroContent.description,
    url: siteUrl,
    siteName: companyProfile.brandName,
    locale: "en_US",
    type: "website",
  },
};
```

Also change:

```tsx
<html lang="en">
```

- [ ] **Step 2: Make English the locale default**

In `components/LocaleProvider.tsx`, change:

```ts
if (typeof window === "undefined") return "zh";
```

to:

```ts
if (typeof window === "undefined") return "en";
```

Change the initial state:

```ts
const [locale, setLocaleState] = useState<Locale>("en");
```

Change stored-locale fallback:

```ts
return raw === "zh" ? "zh" : "en";
```

Change the document-title effect so English is canonical:

```ts
document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
document.title =
  locale === "zh"
    ? "O'range Textile | Shaoxing Shicheng Textile Products Co., Ltd."
    : "O'range Textile | Chinese Knit Fabric Manufacturer in Shaoxing Keqiao";
```

- [ ] **Step 3: Add robots metadata route**

Create `app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/geo-content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
```

- [ ] **Step 4: Add sitemap metadata route**

Create `app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/geo-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/fabrics`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
```

- [ ] **Step 5: Ignore brainstorming artifacts**

Append this line to `.gitignore` if it is not already present:

```gitignore
.superpowers/
```

- [ ] **Step 6: Verify crawl routes compile**

Run:

```bash
npm run build
```

Expected: no errors about `robots`, `sitemap`, metadata, or locale defaults.

- [ ] **Step 7: Commit Task 2**

```bash
git add app/layout.tsx app/robots.ts app/sitemap.ts components/LocaleProvider.tsx .gitignore
git commit -m "feat: add crawler metadata routes"
```

## Task 3: GEO-First Homepage

**Files:**
- Create: `components/geo/GeoSection.tsx`
- Create: `components/geo/GeoHomePage.tsx`
- Modify: `components/SampleRequestCta.tsx`
- Modify: `app/page.tsx`
- Modify or replace: `components/HomePageClient.tsx`

- [ ] **Step 1: Allow the sample CTA to accept explicit English text**

Update `components/SampleRequestCta.tsx`:

```tsx
"use client";

import { useLocale } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { useInquiry } from "@/components/InquiryProvider";

type SampleRequestCtaProps = {
  label?: string;
  className?: string;
};

export function SampleRequestCta({ label, className = "mt-10" }: SampleRequestCtaProps) {
  const { openInquiry } = useInquiry();
  const { t } = useLocale();

  return (
    <Button type="button" className={className} onClick={openInquiry}>
      {label ?? t("ctaButton")}
    </Button>
  );
}
```

- [ ] **Step 2: Create shared GEO section helpers**

Create `components/geo/GeoSection.tsx`:

```tsx
import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold text-brand-charcoal md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-brand-charcoal/75">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function InfoCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-lg border border-brand-soft bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-brand-charcoal">{title}</h3>
      <div className="mt-3 text-sm leading-relaxed text-brand-charcoal/75">
        {children}
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Build the GEO homepage server component**

Create `components/geo/GeoHomePage.tsx`. It should import content arrays from `@/lib/geo-content`, `SampleRequestCta`, `FabricCard`, `ContactCard`, `InquiryBar`, and `BottomNav`. Use the following structure:

```tsx
import Link from "next/link";
import ContactCard from "@/components/ContactCard";
import { InquiryBar } from "@/components/InquiryBar";
import { SampleRequestCta } from "@/components/SampleRequestCta";
import { BottomNav } from "@/components/ui/BottomNav";
import { FabricCard } from "@/components/ui/FabricCard";
import { SectionHeading, InfoCard } from "@/components/geo/GeoSection";
import { StructuredData } from "@/components/geo/StructuredData";
import type { Fabric } from "@/lib/data";
import {
  aiSearchFaq,
  applicationCards,
  capabilityCards,
  entityFacts,
  fabricCategories,
  fabricCategoryItemListJsonLd,
  faqJsonLd,
  heroContent,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/geo-content";

type GeoHomePageProps = {
  initialFabrics: Fabric[];
  notionEmpty?: boolean;
};

export function GeoHomePage({
  initialFabrics,
  notionEmpty = false,
}: GeoHomePageProps) {
  const featuredFabrics = initialFabrics.slice(0, 3);

  return (
    <div className="bg-brand-cream text-brand-charcoal">
      <StructuredData
        data={[
          organizationJsonLd,
          websiteJsonLd,
          fabricCategoryItemListJsonLd,
          faqJsonLd,
        ]}
      />

      <section id="home" className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
            {heroContent.eyebrow}
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-brand-charcoal md:text-6xl">
            {heroContent.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-brand-charcoal/78">
            {heroContent.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <SampleRequestCta label={heroContent.primaryCta} className="mt-0" />
            <Link
              href="/fabrics"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-orange px-6 text-sm font-semibold text-brand-orange transition hover:bg-brand-orange hover:text-white"
            >
              {heroContent.secondaryCta}
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-brand-soft bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Entity facts for AI search</h2>
          <dl className="mt-5 grid gap-4">
            {entityFacts.map(([label, value]) => (
              <div key={label} className="border-b border-brand-soft/50 pb-3 last:border-0 last:pb-0">
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                  {label}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-brand-charcoal/78">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="categories" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Knit fabric taxonomy"
            title="Premium knitted fabric categories for overseas apparel buyers"
            description="O'range Textile organizes its fabric supply around clear product categories that AI search engines and sourcing teams can understand."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {fabricCategories.map((category) => (
              <InfoCard key={category.name} title={category.name}>
                <p>{category.description}</p>
              </InfoCard>
            ))}
          </div>
        </div>
      </section>

      <section id="capabilities" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Manufacturing capabilities"
            title="Knit fabric production and sampling support from Shaoxing Keqiao"
            description="The site describes O'range Textile with stable manufacturing facts instead of slogan-only marketing copy."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {capabilityCards.map((card) => (
              <InfoCard key={card.title} title={card.title}>
                <p>{card.body}</p>
              </InfoCard>
            ))}
          </div>
        </div>
      </section>

      <section id="applications" className="bg-brand-soft px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Applications"
            title="Knitted fabrics for T-shirts, hoodies, sportswear and private-label apparel"
            description="Application pages and sections help AI search engines connect O'range Textile fabrics with real apparel sourcing needs."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {applicationCards.map((card) => (
              <InfoCard key={card.title} title={card.title}>
                <p>{card.body}</p>
              </InfoCard>
            ))}
          </div>
        </div>
      </section>

      <section id="fabrics" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Fabric library
            </p>
            <h2 className="text-3xl font-semibold">Featured knit fabrics</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-charcoal/70">
              Browse selected cotton, spandex, jersey and hoodie fabrics, then request samples or add fabrics to an RFQ.
            </p>
          </div>
          <Link href="/fabrics" className="text-sm font-semibold text-brand-orange hover:underline">
            View full fabric library
          </Link>
        </div>
        {notionEmpty || featuredFabrics.length === 0 ? (
          <p className="rounded-lg border border-brand-soft bg-white px-6 py-10 text-center text-brand-charcoal/60">
            Fabric data is being updated. Contact O'range Textile to request current knit fabric samples.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredFabrics.map((fabric) => (
              <FabricCard key={fabric.id} fabric={fabric} />
            ))}
          </div>
        )}
      </section>

      <section id="faq" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="AI search FAQ"
            title="Direct answers about O'range Textile"
            description="These answers are written for both sourcing teams and AI answer engines."
          />
          <div className="space-y-4">
            {aiSearchFaq.map((item) => (
              <details key={item.question} className="rounded-lg border border-brand-soft bg-brand-cream p-5">
                <summary className="cursor-pointer text-base font-semibold text-brand-charcoal">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-brand-charcoal/75">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <ContactCard />
      <footer className="px-6 pb-24 pt-2 text-center text-sm text-brand-charcoal/60 max-md:pb-40">
        <p>O'range Textile · Shaoxing Shicheng Textile Products Co., Ltd. · Knit fabric inquiries welcome</p>
      </footer>
      <InquiryBar />
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 4: Wire homepage to the new server component**

Update `app/page.tsx`:

```tsx
import { GeoHomePage } from "@/components/geo/GeoHomePage";
import { resolveFabricsFromNotion } from "@/lib/fabrics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const { fabrics, notionEmpty } = await resolveFabricsFromNotion();
  return <GeoHomePage initialFabrics={fabrics} notionEmpty={notionEmpty} />;
}
```

- [ ] **Step 5: Retire the old homepage client**

Replace `components/HomePageClient.tsx` with a compatibility wrapper so no stale bilingual homepage remains:

```tsx
import { GeoHomePage } from "@/components/geo/GeoHomePage";

export default GeoHomePage;
```

- [ ] **Step 6: Verify homepage compiles**

Run:

```bash
npm run build
```

Expected: no errors about `GeoHomePage`, `GeoSection`, `StructuredData`, `SampleRequestCta`, or server/client component boundaries.

- [ ] **Step 7: Commit Task 3**

```bash
git add app/page.tsx components/HomePageClient.tsx components/SampleRequestCta.tsx components/geo
git commit -m "feat: rebuild homepage for AI search crawlers"
```

## Task 4: English-Only Fabric Library and Navigation

**Files:**
- Modify: `app/fabrics/page.tsx`
- Modify: `components/ui/Navbar.tsx`
- Modify: `lib/i18n.ts`

- [ ] **Step 1: Update fabric page metadata and remove language toggle**

In `app/fabrics/page.tsx`, replace metadata:

```ts
export const metadata: Metadata = {
  title: "Knit Fabric Library",
  description:
    "Browse cotton jersey, cotton spandex jersey, rib, fleece, terry and air-layer knit fabrics from O'range Textile.",
};
```

Remove this import:

```ts
import { LanguageToggle } from "@/components/LanguageToggle";
```

Remove this JSX:

```tsx
<LanguageToggle />
```

Change empty/fallback Chinese text:

```tsx
<p className="text-brand-charcoal/60">Fabric data is being updated.</p>
```

and Suspense fallback:

```tsx
<div className="py-16 text-center text-sm text-brand-charcoal/60">
  Loading fabrics...
</div>
```

- [ ] **Step 2: Use English stock query values in Navbar**

In `components/ui/Navbar.tsx`, replace stock param checks and links:

```ts
const navItems = [
  {
    href: "/fabrics?stock=in-stock",
    label: t("navStockFast"),
    icon: Package,
    badge: t("navBadge24h"),
    color: "text-emerald-600",
    isActive: onFabrics && stockParam === "in-stock",
  },
  {
    href: "/fabrics?stock=preorder",
    label: t("navStockPreorder"),
    icon: Shirt,
    color: "text-amber-600",
    isActive: onFabrics && stockParam === "preorder",
  },
  {
    href: "/fabrics",
    label: t("navFabricsAll"),
    icon: Grid3X3,
    color: "text-gray-600",
    isActive: onFabrics && !stockParam,
  },
];
```

- [ ] **Step 3: Ensure English messages are canonical**

In `lib/i18n.ts`, update the English values used by public navigation and fabric page if needed:

```ts
navStockFast: "In-stock fabrics",
navStockPreorder: "Preorder fabrics",
navFabricsAll: "All knit fabrics",
navCtaInquiry: "Request samples",
fabricsLibraryTitle: "Knit fabric library",
fabricsLibrarySubtitle:
  "Browse cotton jersey, cotton spandex jersey, rib, fleece, terry and air-layer knit fabrics. Add fabrics to your RFQ or request samples from O'range Textile.",
filterNoMatch: "No fabrics match your filters",
filterClear: "Clear filters",
```

- [ ] **Step 4: Verify fabric library compiles**

Run:

```bash
npm run build
```

Expected: no errors from `/fabrics`, `Navbar`, or `lib/i18n.ts`.

- [ ] **Step 5: Commit Task 4**

```bash
git add app/fabrics/page.tsx components/ui/Navbar.tsx lib/i18n.ts
git commit -m "feat: make fabric library English-first"
```

## Task 5: Manual Crawler Checks and Browser Verification

**Files:**
- No planned source edits unless verification finds a defect.

- [ ] **Step 1: Build production output**

Run:

```bash
npm run build
```

Expected: `Compiled successfully` and no TypeScript errors.

- [ ] **Step 2: Start development server**

Run:

```bash
npm run dev
```

Expected: local Next.js server starts and reports a URL such as `http://localhost:3000`.

- [ ] **Step 3: Check homepage visible content**

Open the local site in the browser and verify:

- H1 says `Chinese Knit Fabric Manufacturer for Cotton, Spandex, Jersey and Hoodie Fabrics`.
- The entity facts block is visible.
- Fabric categories are visible.
- FAQ answers are visible or expandable.
- Primary CTA says `Request Fabric Samples`.
- No language toggle is visible on the homepage.

- [ ] **Step 4: Check crawler routes**

Visit:

```text
http://localhost:3000/robots.txt
http://localhost:3000/sitemap.xml
```

Expected:

- `robots.txt` allows `/`.
- `sitemap.xml` includes `/` and `/fabrics`.

- [ ] **Step 5: Check JSON-LD in page source**

Use browser view-source or terminal:

```bash
curl http://localhost:3000 | findstr "application/ld+json"
```

Expected: at least one `application/ld+json` script appears in the homepage HTML.

- [ ] **Step 6: Commit verification fixes if any**

If verification required code changes, commit only those fixes:

```bash
git add <changed-files>
git commit -m "fix: polish GEO crawler verification"
```

## Task 6: Git Remote and Push

**Files:**
- No source edits planned.

- [ ] **Step 1: Inspect local status**

Run:

```bash
git status --short --branch
```

Expected: only known pre-existing user changes should remain, or the implementation changes should already be committed.

- [ ] **Step 2: Check remotes**

Run:

```bash
git remote -v
```

If `origin` is missing, run:

```bash
git remote add origin https://github.com/HCGLHF/Orange-site.git
```

If `origin` exists but points somewhere else, run:

```bash
git remote set-url origin https://github.com/HCGLHF/Orange-site.git
```

- [ ] **Step 3: Push main**

Run:

```bash
git push -u origin main
```

Expected: branch `main` is pushed to `https://github.com/HCGLHF/Orange-site.git`.

If authentication fails, report the failure and the exact Git message instead of retrying with credentials.

## Self-Review

- Spec coverage: homepage structure, English-only strategy, entity facts, fabric categories, capabilities, applications, FAQ, schema, robots, sitemap, metadata, fabric library preservation, inquiry preservation, verification, and push are all covered.
- Deferred-marker scan: the plan contains no deferred implementation markers.
- Type consistency: `GeoHomePage`, `StructuredData`, `SectionHeading`, `InfoCard`, and `geo-content` export names are defined before use.
