import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import ContactCard from "@/components/ContactCard";
import { FabricsCatalog } from "@/components/FabricsCatalog";
import { FabricsInquiryAnchor } from "@/components/FabricsInquiryAnchor";
import { LandingCtaBand } from "@/components/landing/LandingCtaBand";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingProofStrip } from "@/components/landing/LandingProofStrip";
import { StructuredData } from "@/components/geo/StructuredData";
import { BottomNav } from "@/components/ui/BottomNav";
import type { Fabric } from "@/lib/data";
import { getPublicLandingPage } from "@/lib/landing-page-content";
import { buildLandingPageSchema } from "@/lib/landing-page-schema";

export function ReadyStockLanding({ fabrics }: { fabrics: Fabric[] }) {
  const page = getPublicLandingPage("readyStock");

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal">
      <StructuredData data={buildLandingPageSchema({ page, path: "/ready-stock-knit-fabrics" })} />
      <LandingHero page={page} />
      <LandingProofStrip points={page.proofPoints} />

      <section className="bg-white px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-orange">Catalogue confirmation</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
              Before sending a finished-fabric RFQ
            </h2>
            <p className="mt-4 text-sm leading-7 text-brand-charcoal/70">
              A listed article is a sourcing reference, not a blanket inventory promise. Confirm the exact article, colour, usable quantity, finish and commercial terms directly with the sales team.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {page.checklist.map((item) => (
              <li key={item} className="flex min-h-28 gap-3 border border-brand-soft bg-brand-cream p-5 text-sm leading-7 text-brand-charcoal/75">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-brand-orange">Current finished-fabric catalogue</p>
              <h2 className="mt-3 text-3xl font-semibold">104 articles available for inquiry</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-charcoal/70">
                Use the series and specification filters to identify a relevant article, add it to the inquiry, and confirm live commercial details with the sourcing team.
              </p>
            </div>
            <Link href="/fabrics" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange">
              View the complete catalogue
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-8">
            <Suspense fallback={<p className="py-12 text-center text-sm text-brand-charcoal/60">Loading current fabric records...</p>}>
              <FabricsCatalog fabrics={fabrics} defaultStock="in-stock" />
            </Suspense>
          </div>
          <FabricsInquiryAnchor />
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase text-brand-orange">Catalogue questions</p>
          <h2 className="mt-3 text-3xl font-semibold">What an available article does and does not confirm</h2>
          <div className="mt-8 divide-y divide-brand-soft border-y border-brand-soft">
            {page.faq.map((item) => (
              <details key={item.question} className="py-5">
                <summary className="cursor-pointer font-semibold">{item.question}</summary>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/75">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <LandingCtaBand page={page} title="Ask sales to confirm the exact article for your order" />
      <ContactCard />
      <BottomNav />
    </div>
  );
}
