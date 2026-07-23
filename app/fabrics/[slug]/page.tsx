import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { FinishedFabricPage } from "@/components/finished-fabric/FinishedFabricPage";
import { FabricsCatalog } from "@/components/FabricsCatalog";
import { FabricsInquiryAnchor } from "@/components/FabricsInquiryAnchor";
import { BottomNav } from "@/components/ui/BottomNav";
import { StructuredData } from "@/components/geo/StructuredData";
import {
  getFinishedFabricPage,
  getFinishedProductPages,
  getFinishedFabricSlug,
} from "@/lib/finished-fabric-content";
import {
  getFabricsForCategory,
  getPublicFabricCategories,
  getPublicFabricCategory,
} from "@/lib/public-catalog";
import { companyProfile, siteUrl } from "@/lib/geo-content";
import { buildSeoMetadata, getSeoPage } from "@/lib/seo";

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = [
    ...getPublicFabricCategories().map((category) => category.slug),
    ...getFinishedProductPages().map((page) => getFinishedFabricSlug(page.url)),
  ];

  return Array.from(new Set(slugs)).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const path = `/fabrics/${params.slug}`;
  const finishedPage = getFinishedFabricPage(`/fabrics/${params.slug}`);
  if (finishedPage?.kind === "product") {
    return buildSeoMetadata(finishedPage.url);
  }

  const category = getPublicFabricCategory(params.slug);
  if (!category) return {};
  return buildSeoMetadata(path);
}

function categoryJsonLd(category: NonNullable<ReturnType<typeof getPublicFabricCategory>>) {
  const pageUrl = `${siteUrl}/fabrics/${category.slug}`;
  const seo = getSeoPage(`/fabrics/${category.slug}`);
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: seo.h1,
      url: pageUrl,
      description: seo.metaDescription,
      about: category.name,
      provider: {
        "@type": "Organization",
        name: companyProfile.brandName,
        legalName: companyProfile.legalName,
        url: siteUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: category.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];
}

export default function FabricCategoryPage({ params }: CategoryPageProps) {
  const finishedPage = getFinishedFabricPage(`/fabrics/${params.slug}`);
  if (finishedPage?.kind === "product") {
    return <FinishedFabricPage page={finishedPage} />;
  }

  const category = getPublicFabricCategory(params.slug);
  if (!category) notFound();
  const seo = getSeoPage(`/fabrics/${category.slug}`);

  const fabrics = getFabricsForCategory(category.slug);

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal">
      <StructuredData data={categoryJsonLd(category)} />
      <div className="pb-28 max-md:pb-44 md:pb-12">
        <section className="border-b border-brand-soft/40 bg-white/80">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Knit fabric supplier
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-bold text-brand-charcoal md:text-5xl">
              {seo.h1}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-brand-charcoal/75">
              {category.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {category.buyerIntent.map((term) => (
                <span
                  key={term}
                  className="rounded-full border border-brand-soft bg-brand-cream px-3 py-1 text-xs font-medium text-brand-charcoal/70"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-brand-soft bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Sourcing overview
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-brand-charcoal">
              Define the finished result before selecting an article
            </h2>
            <div className="mt-5 max-w-4xl space-y-4 text-base leading-8 text-brand-charcoal/75">
              {category.sourcingOverview.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-brand-soft bg-brand-cream">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Specification checks
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-brand-charcoal">
              What to confirm on the offered finished sample
            </h2>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {category.specificationChecks.map((check) => (
                <div key={check.label} className="flex gap-3 border-t border-brand-soft bg-white p-5">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                  <div>
                    <h3 className="font-semibold text-brand-charcoal">{check.label}</h3>
                    <p className="mt-2 text-sm leading-7 text-brand-charcoal/70">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-brand-soft bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
                Development guidance
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-brand-charcoal">
                Prepare a sample and RFQ brief
              </h2>
              <div className="mt-5 space-y-4 text-base leading-8 text-brand-charcoal/75">
                {category.developmentGuidance.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-brand-charcoal">Continue the buyer research</h2>
              <div className="mt-5 divide-y divide-brand-soft border-y border-brand-soft">
                {category.relatedLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-start justify-between gap-4 py-5"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-brand-charcoal group-hover:text-brand-orange">
                        {item.label}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-brand-charcoal/65">{item.description}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-brand-orange transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="rounded-lg border border-brand-soft bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Best-fit apparel uses</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-brand-charcoal/75">
              {category.applications.map((application) => (
                <li key={application}>- {application}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-brand-soft bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Buyer questions</h2>
            <div className="mt-4 space-y-4">
              {category.faq.map((item) => (
                <div key={item.question}>
                  <h3 className="text-sm font-semibold text-brand-charcoal">
                    {item.question}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-brand-charcoal/70">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {fabrics.length ? (
          <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <Suspense
              fallback={
                <div className="py-16 text-center text-sm text-brand-charcoal/60">
                  Loading fabrics...
                </div>
              }
            >
              <FabricsCatalog fabrics={fabrics} />
            </Suspense>
          </section>
        ) : (
          <section className="border-t border-brand-soft bg-brand-charcoal text-white">
            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
              <h2 className="text-xl font-semibold">Current catalogue boundary</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-white/75">
                The current public finished-fabric catalogue does not assign a specific article to this broad construction route. Share a reference sample or specification so the sourcing team can confirm the relevant sample and quotation path without implying unsupported live stock.
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
                <Link href="/fabrics" className="text-brand-orange hover:text-white">
                  Review the documented catalogue
                </Link>
                <Link href="/custom-knit-fabric-development" className="text-brand-orange hover:text-white">
                  Send a development brief
                </Link>
              </div>
            </div>
          </section>
        )}

        <FabricsInquiryAnchor />
      </div>

      <BottomNav />
    </div>
  );
}
