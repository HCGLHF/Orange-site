import Link from "next/link";
import ContactCard from "@/components/ContactCard";
import { InquiryBar } from "@/components/InquiryBar";
import { SampleRequestCta } from "@/components/SampleRequestCta";
import { BottomNav } from "@/components/ui/BottomNav";
import { FabricCard } from "@/components/ui/FabricCard";
import { InfoCard, SectionHeading } from "@/components/geo/GeoSection";
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

      <section
        id="home"
        className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
            {heroContent.eyebrow}
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-brand-charcoal md:text-6xl">
            {heroContent.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-brand-charcoal/80">
            {heroContent.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <SampleRequestCta
              label={heroContent.primaryCta}
              className="mt-0"
            />
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
              <div
                key={label}
                className="border-b border-brand-soft/50 pb-3 last:border-0 last:pb-0"
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                  {label}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-brand-charcoal/80">
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
            description="Application sections help AI search engines connect O'range Textile fabrics with real apparel sourcing needs."
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
              Browse selected cotton, spandex, jersey and hoodie fabrics, then
              request samples or add fabrics to an RFQ.
            </p>
          </div>
          <Link
            href="/fabrics"
            className="text-sm font-semibold text-brand-orange hover:underline"
          >
            View full fabric library
          </Link>
        </div>
        {notionEmpty || featuredFabrics.length === 0 ? (
          <p className="rounded-lg border border-brand-soft bg-white px-6 py-10 text-center text-brand-charcoal/60">
            Fabric data is being updated. Contact O&apos;range Textile to
            request current knit fabric samples.
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
              <details
                key={item.question}
                className="rounded-lg border border-brand-soft bg-brand-cream p-5"
              >
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
        <p>
          O&apos;range Textile · Shaoxing Shicheng Textile Products Co., Ltd. ·
          Knit fabric inquiries welcome
        </p>
      </footer>

      <InquiryBar />
      <BottomNav />
    </div>
  );
}
