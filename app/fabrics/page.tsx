import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { FabricsCatalog } from "@/components/FabricsCatalog";
import { FabricsInquiryAnchor } from "@/components/FabricsInquiryAnchor";
import { FabricsPageIntro } from "@/components/FabricsPageIntro";
import { BottomNav } from "@/components/ui/BottomNav";
import { getFinishedProductPages } from "@/lib/finished-fabric-content";
import { getPublicFabrics } from "@/lib/public-catalog";

export const metadata: Metadata = {
  title: "Finished Knit Fabric Catalogue",
  description:
    "Review 104 finished knit fabric articles across 11 documented series, with composition, GSM and usable width references from O'range Textile.",
  alternates: {
    canonical: "/fabrics",
  },
};

export const dynamic = "force-static";

export default async function FabricsPage() {
  const fabrics = getPublicFabrics();
  const finishedFabrics = getFinishedProductPages();

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal">
      <div className="pb-28 max-md:pb-44 md:pb-12">
        <div className="border-b border-brand-soft/40 bg-white/80">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <FabricsPageIntro />
          </div>
        </div>

        <section className="border-b border-brand-soft/40 bg-brand-cream">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
                  Finished fabric development
                </p>
                <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-brand-charcoal">
                  Finished-knit routes for apparel sampling and supply
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-charcoal/70">
                  Compare documented air-layer, structured, brushed, wool-blend, cashmere-blend and jacquard directions before sending an inquiry.
                </p>
              </div>
              <Link href="/finished-double-knit-fabrics" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-charcoal hover:text-brand-orange">
                Open the finished-fabric hub
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {finishedFabrics.map((page) => (
                <Link key={page.url} href={page.url} className="group flex min-h-28 items-center justify-between gap-4 rounded-lg border border-brand-soft bg-white p-5 transition-colors hover:border-brand-orange">
                  <div>
                    <h3 className="font-semibold text-brand-charcoal">{page.h1}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-brand-charcoal/65">{page.opening}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-brand-orange transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="py-16 text-center text-sm text-brand-charcoal/60">
                Loading fabrics...
              </div>
            }
          >
            <FabricsCatalog fabrics={fabrics} />
          </Suspense>
        </div>

        <FabricsInquiryAnchor />
      </div>

      <BottomNav />
    </div>
  );
}
