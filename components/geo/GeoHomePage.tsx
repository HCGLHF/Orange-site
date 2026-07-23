import Link from "next/link";
import ContactCard from "@/components/ContactCard";
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
import { getSeoPage } from "@/lib/seo";

type GeoHomePageProps = {
  initialFabrics: Fabric[];
  notionEmpty?: boolean;
};

const buyerRoutes: LandingRoute[] = [
  {
    title: "Current finished-fabric catalogue",
    description: "Review 104 documented articles, then confirm the exact colour, quantity, finish and commercial terms directly with sales.",
    href: "/ready-stock-knit-fabrics",
    action: "Review current catalogue",
    icon: "stock",
  },
  {
    title: "Finished double-knit directions",
    description: "Compare 11 documented air-layer, structured, brushed, wool-blend, cashmere-blend and jacquard series.",
    href: "/finished-double-knit-fabrics",
    action: "Compare finished fabrics",
    icon: "range",
  },
  {
    title: "Private fabric or garment inquiry",
    description: "Send greige fabric, finished fabric or garment requirements for direct review by the sourcing team.",
    href: "/custom-knit-fabric-development",
    action: "Build a development brief",
    icon: "custom",
  },
];

export function GeoHomePage({ initialFabrics, notionEmpty = false }: GeoHomePageProps) {
  const page = getPublicLandingPage("home");
  const seo = getSeoPage("/");
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

      {visibleAdvantages.length > 0 ? (
        <section className="px-5 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="text-sm font-semibold uppercase text-brand-orange">Why buyers start here</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
                  One sourcing route from greige fabric to finished garments
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
              <p className="text-sm font-semibold uppercase text-brand-orange">Article starting points</p>
              <h2 className="mt-3 text-3xl font-semibold">Featured knit fabrics</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-charcoal/70">
                Use a listed article as the starting point for a sample request, or send a garment brief when the required construction is not shown.
              </p>
            </div>
            <Link href="/fabrics" className="text-sm font-semibold text-brand-orange hover:underline">
              View the full fabric library
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

      <footer className="px-6 pb-24 pt-2 text-center text-sm text-brand-charcoal/60 max-md:pb-40">
        <p>O&apos;range Textile | Shaoxing Shicheng Textile Products Co., Ltd. | Knit fabric inquiries welcome</p>
      </footer>

      <InquiryBar />
      <BottomNav />
    </div>
  );
}
