import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FabricsCatalog } from "@/components/FabricsCatalog";
import { FabricsInquiryAnchor } from "@/components/FabricsInquiryAnchor";
import { BottomNav } from "@/components/ui/BottomNav";
import { StructuredData } from "@/components/geo/StructuredData";
import {
  getFabricsForCategory,
  getPublicFabricCategories,
  getPublicFabricCategory,
} from "@/lib/public-catalog";
import { companyProfile, siteUrl } from "@/lib/geo-content";

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return getPublicFabricCategories().map((category) => ({
    slug: category.slug,
  }));
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const category = getPublicFabricCategory(params.slug);
  if (!category) return {};

  const title = `${category.name} Supplier`;
  const path = `/fabrics/${category.slug}`;

  return {
    title,
    description: category.metaDescription,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} | O'range Textile`,
      description: category.metaDescription,
      url: `${siteUrl}${path}`,
      siteName: companyProfile.brandName,
      locale: "en_US",
      type: "website",
    },
  };
}

function categoryJsonLd(category: NonNullable<ReturnType<typeof getPublicFabricCategory>>) {
  const pageUrl = `${siteUrl}/fabrics/${category.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${category.name} Supplier`,
      url: pageUrl,
      description: category.metaDescription,
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
  const category = getPublicFabricCategory(params.slug);
  if (!category) notFound();

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
              {category.name} from O&apos;range Textile
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-brand-charcoal/75">
              {category.metaDescription}
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

        <FabricsInquiryAnchor />
      </div>

      <BottomNav />
    </div>
  );
}
