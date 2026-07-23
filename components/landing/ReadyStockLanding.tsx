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
import { getPublicFabricCategories } from "@/lib/public-catalog";
import { getPublicPageSeo } from "@/lib/seo/site-seo";

export function ReadyStockLanding({
  fabrics,
  totalFabricCount,
}: {
  fabrics: Fabric[];
  totalFabricCount: number;
}) {
  const page = getPublicLandingPage("readyStock");
  const seo = getPublicPageSeo("/ready-stock-knit-fabrics");
  const publicCategories = getPublicFabricCategories();

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal">
      <StructuredData data={buildLandingPageSchema({ page, path: "/ready-stock-knit-fabrics" })} />
      <LandingHero page={page} h1={seo.h1} />
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

      <section className="border-y border-brand-soft bg-brand-cream px-5 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase text-brand-orange">Browse by construction need</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold">
            Prepare the category brief before asking about an article
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-charcoal/70">
            These routes explain the garment use and finished-sample checks behind four common knit directions. Use them to prepare a clearer inquiry, then confirm the exact article, colour and quantity privately.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {publicCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/fabrics/${category.slug}`}
                className="group flex min-h-44 flex-col justify-between border border-brand-soft bg-white p-5 transition-colors hover:border-brand-orange"
              >
                <div>
                  <h3 className="font-semibold text-brand-charcoal">{category.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-brand-charcoal/65">{category.description}</p>
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange">
                  Review sourcing checks
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase text-brand-orange">
            Availability decision record
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold">
            How availability is confirmed
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-charcoal/70">
            The public catalogue starts the sourcing conversation. A supply decision is complete only after the article, sample and order conditions have been checked for the buyer&apos;s programme.
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <article className="border border-brand-soft bg-brand-cream p-6">
              <h3 className="font-semibold">Article match</h3>
              <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                Match the garment use to a documented article number, composition, GSM, usable width and construction series. Share a reference swatch when the catalogue record is only an approximate match.
              </p>
            </article>
            <article className="border border-brand-soft bg-brand-cream p-6">
              <h3 className="font-semibold">Sample and finish approval</h3>
              <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                Confirm colour, finish, hand feel, stretch, recovery and required testing on the actual sample. A catalogue listing does not replace buyer approval of the finished result.
              </p>
            </article>
            <article className="border border-brand-soft bg-brand-cream p-6">
              <h3 className="font-semibold">Commercial confirmation</h3>
              <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                Sales confirms live quantity, sample route, lead time, price basis, destination and documentation against the current inquiry. No public article record is a fixed inventory promise.
              </p>
            </article>
          </div>

          <div className="mt-14 border-t border-brand-soft pt-12">
            <h2 className="max-w-3xl text-3xl font-semibold">
              From catalogue reference to confirmed supply
            </h2>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-brand-charcoal/70">
              Ready-stock sourcing is a sequence of checks, not a claim attached permanently to a web page. The public record lets a buyer identify a relevant finished-fabric direction. The sales confirmation then connects that reference to a sample, a current quantity and a defined order.
            </p>
            <div className="mt-8 grid gap-x-12 gap-y-9 lg:grid-cols-2">
              <div>
                <h3 className="font-semibold">1. Define the intended garment</h3>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  State the garment category, silhouette, season and end market. Include the behaviour that matters most, such as breathability, warmth, stretch, recovery, body, drape, surface texture or dimensional stability. This separates the functional requirement from a broad fabric name and helps sales identify the closest construction family.
                </p>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  When available, attach a reference swatch, garment image or existing specification. Describe which features must be matched and which can be adjusted. A clear benchmark makes the first sample discussion more useful than a request for a generic jersey, interlock, fleece or air-layer fabric.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">2. Select the closest article record</h3>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  Use the public article number, composition, GSM, usable width and series to form a shortlist. These fields are evidence from the current catalogue, but they do not establish colour, hand feel, finish or performance for a new order. Quote the exact article number in the inquiry so the buyer and sales team are discussing the same reference.
                </p>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  If several records appear suitable, explain the trade-off being evaluated. For example, a buyer may be comparing lower weight with opacity, softer hand with recovery, or extra structure with seam bulk. This gives the supplier a reason to recommend one sample route over another.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">3. Approve the relevant finished sample</h3>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  Confirm the sample in the requested colour and finish whenever those variables affect the garment result. Review hand feel, face and back appearance, drape, stretch, recovery and usable width. Align shrinkage, pilling, colourfastness and other tests with the destination market and intended care instructions.
                </p>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  Record the approved sample reference and the conditions under which measurements were taken. This avoids using a catalogue value as a substitute for the finished approval standard and gives both sides a clearer basis for later production discussion.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">4. Confirm the live commercial position</h3>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  Provide required quantity, colour allocation, delivery destination, timing request, price basis and documentation needs. Sales can then confirm the current usable quantity, whether sampling or additional production is required, and which commercial terms apply to that specific inquiry.
                </p>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">
                  Treat the written confirmation for the inquiry as the live decision point. Catalogue publication dates and article descriptions support discovery, but they cannot guarantee that an unchanged quantity remains available for every buyer, colour and delivery window.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-brand-soft pt-12">
            <h2 className="max-w-3xl text-3xl font-semibold">
              Questions to settle before price confirmation
            </h2>
            <div className="mt-7 max-w-4xl space-y-5 text-sm leading-7 text-brand-charcoal/70">
              <p>
                Confirm whether the target is an existing finished-fabric article, a modified finish or a new development. State the acceptable composition and GSM ranges, the required usable width and any non-negotiable surface or performance requirement. If the programme can accept alternatives, identify which fields may move and by how much.
              </p>
              <p>
                Explain how the fabric will be cut, sewn, washed and tested. Garment engineering can expose issues that are not obvious in a small swatch, including seam bulk, edge curling, growth, torque, opacity and recovery. Sharing these conditions helps the supplier evaluate the article in the context that matters to the buyer.
              </p>
              <p>
                Finally, provide quantity by colour, destination, target schedule, packaging needs and required certificates or test reports. Certification details can be reviewed privately when relevant to the programme. The resulting quotation should refer to the selected article or approved development, not to a broad category page alone.
              </p>
              <p>
                Keep the article reference, sample approval, testing scope and commercial confirmation in one decision record. Note any later change to composition, GSM, usable width, colour, finish or quantity as a new revision. This makes it clear which evidence supported the quoted route and prevents an earlier catalogue screenshot from being mistaken for a current supply commitment.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-brand-orange">Current finished-fabric catalogue</p>
              <h2 className="mt-3 text-3xl font-semibold">{totalFabricCount} articles available for inquiry</h2>
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
              <FabricsCatalog
                fabrics={fabrics}
                totalFabricCount={totalFabricCount}
                defaultStock="in-stock"
              />
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
