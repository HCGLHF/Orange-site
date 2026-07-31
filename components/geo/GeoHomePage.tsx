import Link from "next/link";
import ContactCard from "@/components/ContactCard";
import { HomeCertificateSection } from "@/components/company/HomeCertificateSection";
import { InquiryBar } from "@/components/InquiryBar";
import { LandingCtaBand } from "@/components/landing/LandingCtaBand";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingProofStrip } from "@/components/landing/LandingProofStrip";
import { LandingRouteChooser, type LandingRoute } from "@/components/landing/LandingRouteChooser";
import { BottomNav } from "@/components/ui/BottomNav";
import { FabricCard } from "@/components/ui/FabricCard";
import { StructuredData } from "@/components/geo/StructuredData";
import type { Fabric } from "@/lib/data";
import {
  aiSearchFaq,
  fabricCategoryItemListJsonLd,
  faqJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/geo-content";
import { getPublicLandingPage } from "@/lib/landing-page-content";
import { getPublicPageSeo } from "@/lib/seo/site-seo";

type GeoHomePageProps = {
  initialFabrics: Fabric[];
  notionEmpty?: boolean;
};

const buyerRoutes: LandingRoute[] = [
  {
    title: "Finished knit fabrics",
    description: "Review article-level knit evidence across structured, air-layer, wool-blend, brushed, cashmere-blend and jacquard directions before confirming the exact specification.",
    href: "/fabrics",
    action: "Review finished knits",
    icon: "stock",
  },
  {
    title: "Finished woven fabrics",
    description: "Source structure, stretch and medium-to-heavy woven directions from the approved partner-supply catalogue, with exact article evidence confirmed during inquiry.",
    href: "/fabrics#inquiry-form",
    action: "Send a woven fabric brief",
    icon: "range",
  },
  {
    title: "Custom fabric development",
    description: "Start from an image, hand feel, reference sample, garment brief or functional target and let the sourcing team translate it into an executable fabric direction.",
    href: "/custom-knit-fabric-development",
    action: "Start a development brief",
    icon: "custom",
  },
];

export function GeoHomePage({ initialFabrics, notionEmpty = false }: GeoHomePageProps) {
  const page = getPublicLandingPage("home");
  const seo = getPublicPageSeo("/");
  const featuredFabrics = initialFabrics.slice(0, 3);
  const visibleAdvantages = page.advantages.filter((item) => item.enabled);

  return (
    <div className="bg-brand-cream text-brand-charcoal">
      <StructuredData
        data={[organizationJsonLd, websiteJsonLd, fabricCategoryItemListJsonLd, faqJsonLd]}
      />

      <LandingHero page={page} h1={seo.h1} />
      <LandingProofStrip points={page.proofPoints} />
      <LandingRouteChooser routes={buyerRoutes} />
      <HomeCertificateSection />

      {visibleAdvantages.length > 0 ? (
        <section className="px-5 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="text-sm font-semibold uppercase text-brand-orange">What we believe</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
                  Premium fabric development begins with a clear shared direction
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {visibleAdvantages.map((item, index) => (
                  <article key={item.title} className="border-t-2 border-brand-orange pt-5">
                    <span className="text-xs font-semibold text-brand-charcoal/45">0{index + 1}</span>
                    <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">{item.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section id="fabrics" className="bg-white px-5 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-brand-orange">Finished-fabric starting points</p>
              <h2 className="mt-3 text-3xl font-semibold">Selected finished knit articles</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-charcoal/70">
                These knit articles are selected from the current online library. Use one as a sample reference, explore the dedicated double-knit catalogue, or send a woven or custom fabric brief when the required direction is not shown.
              </p>
            </div>
            <Link href="/finished-double-knit-fabrics" className="text-sm font-semibold text-brand-orange hover:underline">
              Explore finished double-knit fabrics
            </Link>
          </div>
          {notionEmpty || featuredFabrics.length === 0 ? (
            <p className="border border-brand-soft bg-brand-cream px-6 py-10 text-center text-brand-charcoal/60">
              Fabric data is being updated. Contact O&apos;range Textile to request current knit fabric samples.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredFabrics.map((fabric) => (
                <FabricCard key={fabric.id} fabric={fabric} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="faq" className="px-5 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase text-brand-orange">Buyer questions</p>
          <h2 className="mt-3 text-3xl font-semibold">Direct answers before requesting a sample</h2>
          <div className="mt-8 divide-y divide-brand-soft border-y border-brand-soft">
            {aiSearchFaq.map((item) => (
              <details key={item.question} className="py-5">
                <summary className="cursor-pointer text-base font-semibold">{item.question}</summary>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/75">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <LandingCtaBand page={page} />
      <ContactCard />

      <InquiryBar />
      <BottomNav />
    </div>
  );
}
