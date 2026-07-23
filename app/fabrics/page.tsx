import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { FabricsCatalog } from "@/components/FabricsCatalog";
import { FabricsInquiryAnchor } from "@/components/FabricsInquiryAnchor";
import { FabricsPageIntro } from "@/components/FabricsPageIntro";
import { BottomNav } from "@/components/ui/BottomNav";
import { getFinishedProductPages } from "@/lib/finished-fabric-content";
import {
  getInitialPublicFabrics,
  getPublicFabricCategories,
  getPublicFabricCount,
} from "@/lib/public-catalog";
import { buildSeoMetadata, getSeoPage } from "@/lib/seo";

export const metadata: Metadata = buildSeoMetadata("/fabrics");

export const dynamic = "force-static";

export default async function FabricsPage() {
  const seo = getSeoPage("/fabrics");
  const fabrics = getInitialPublicFabrics();
  const totalFabricCount = getPublicFabricCount();
  const finishedFabrics = getFinishedProductPages();
  const publicCategories = getPublicFabricCategories();

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal">
      <div className="pb-28 max-md:pb-44 md:pb-12">
        <div className="border-b border-brand-soft/40 bg-white/80">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <FabricsPageIntro h1={seo.h1} />
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
                    <h3 className="font-semibold text-brand-charcoal">
                      {getSeoPage(page.url).h1}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-brand-charcoal/65">{page.opening}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-brand-orange transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-brand-soft/40 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Browse by knit category
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-brand-charcoal">
              Start with the garment and construction family
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-charcoal/70">
              Use these category routes for application guidance, then compare the documented finished-fabric articles below before sending an inquiry.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {publicCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/fabrics/${category.slug}`}
                  className="group flex min-h-44 flex-col justify-between border border-brand-soft bg-brand-cream p-5 transition-colors hover:border-brand-orange"
                >
                  <div>
                    <h3 className="font-semibold text-brand-charcoal">
                      {category.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-brand-charcoal/65">
                      {category.description}
                    </p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange">
                    Review this category
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-brand-soft/40 bg-brand-cream">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Use the catalogue as evidence
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-brand-charcoal">
              Separate documented article data from order-specific approval
            </h2>
            <div className="mt-7 grid gap-4 lg:grid-cols-3">
              <article className="border border-brand-soft bg-white p-6">
                <h3 className="font-semibold text-brand-charcoal">
                  What the catalogue confirms
                </h3>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  Each public record identifies a finished-fabric article and its documented composition, GSM, usable width and series. These facts help a buyer shortlist a construction before requesting a sample.
                </p>
              </article>
              <article className="border border-brand-soft bg-white p-6">
                <h3 className="font-semibold text-brand-charcoal">
                  What still requires sample approval
                </h3>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  Hand feel, colour, surface finish, stretch, recovery and garment performance depend on the approved sample and intended processing route. They are not inferred from an article name alone.
                </p>
              </article>
              <article className="border border-brand-soft bg-white p-6">
                <h3 className="font-semibold text-brand-charcoal">
                  What makes an RFQ actionable
                </h3>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  Send the closest article number with garment use, target specification, colour, quantity, destination and testing requirements. Sales can then confirm sampling, live availability and commercial terms.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="border-b border-brand-soft/40 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Buyer shortlisting method
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold text-brand-charcoal">
              How to shortlist a finished knit fabric
            </h2>
            <div className="mt-8 grid gap-x-12 gap-y-8 lg:grid-cols-3">
              <div>
                <h3 className="font-semibold text-brand-charcoal">
                  Begin with garment behaviour
                </h3>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  Define what the garment must do before comparing fibre percentages. A close-fitting top may prioritise stretch, recovery and opacity, while a hoodie may prioritise body, warmth, surface character and seam behaviour. The same composition can perform differently when yarn, knit construction, density and finishing change.
                </p>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  Record the garment type, silhouette, season, target hand feel and care route. This gives the supplier a functional brief and reduces the risk of selecting an article only because its composition looks familiar.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-brand-charcoal">
                  Compare specifications under the same conditions
                </h3>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  Use article number, composition, GSM and usable width to create the first comparison set. Ask whether weight and width refer to the finished, relaxed condition and whether the requested colour or finish can change those measurements. A useful comparison keeps testing conditions and measurement methods consistent.
                </p>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  Then compare the sample for surface appearance, drape, opacity, stretch, recovery, shrinkage, pilling and colourfastness according to the intended market. Public records narrow the search; the approved sample establishes the working standard.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-brand-charcoal">
                  Build an approval record
                </h3>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  Keep the selected article number together with the approved colour, finish, measured GSM, usable width, test requirements and sample date. Add the intended order quantity, delivery destination and documentation needs before requesting final commercial confirmation.
                </p>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  This record gives the buyer and supplier one evidence trail for sampling and quotation. If a requirement changes, identify the changed field instead of treating the original catalogue name as a complete production specification.
                  Keep the superseded value in the record so later sample and bulk discussions can be traced to the correct revision.
                </p>
              </div>
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
            <FabricsCatalog
              fabrics={fabrics}
              totalFabricCount={totalFabricCount}
            />
          </Suspense>
        </div>

        <FabricsInquiryAnchor />
      </div>

      <BottomNav />
    </div>
  );
}
