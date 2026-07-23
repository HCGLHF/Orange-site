import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Factory,
  FileCheck2,
  Globe2,
} from "lucide-react";
import ContactCard from "@/components/ContactCard";
import { StructuredData } from "@/components/geo/StructuredData";
import {
  certificationEvidence,
  companyRelationship,
  knittingDirections,
  manufacturingScale,
} from "@/lib/company-evidence";
import { createAboutPageJsonLd } from "@/lib/company-schema";
import type { PublicPageSeo } from "@/lib/seo/site-seo";

const sourcingBrief = [
  "Garment use",
  "Composition",
  "Target GSM",
  "Usable width",
  "Colour",
  "Finish",
  "Order quantity",
  "Testing needs",
] as const;

export function AboutPage({ seo }: { seo: PublicPageSeo }) {
  return (
    <main className="min-h-screen bg-brand-cream text-brand-charcoal">
      <StructuredData data={createAboutPageJsonLd(seo)} />

      <article>
        <header className="relative overflow-hidden border-b border-brand-soft bg-white">
          <div
            className="absolute inset-y-0 right-0 hidden w-[38%] border-l border-brand-soft bg-brand-cream lg:block"
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.25fr_0.75fr] lg:px-8 lg:py-28">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-800">
                Company profile · Shaoxing, China
              </p>
              <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-brand-charcoal sm:text-5xl lg:text-7xl">
                {seo.h1}
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-brand-charcoal/75 sm:text-xl sm:leading-9">
                O&apos;range Textile connects international apparel teams with
                documented knit-fabric directions, sample coordination and
                export-order support through a defined company and parent
                manufacturing relationship.
              </p>
            </div>

            <aside className="self-end border-t-4 border-brand-orange pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-charcoal/65">
                Operating model
              </p>
              <p className="mt-3 text-2xl font-semibold leading-8 text-brand-charcoal">
                Export communication at the front. Documented knitting
                capability behind it.
              </p>
              <p className="mt-5 text-sm leading-7 text-brand-charcoal/70">
                {companyRelationship.location}
              </p>
            </aside>
          </div>
        </header>

        <section className="bg-brand-cream">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-800">
                Company relationship
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-brand-charcoal sm:text-4xl">
                Two entities, clearly identified responsibilities
              </h2>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden border border-brand-charcoal/15 bg-brand-charcoal/15 md:grid-cols-2">
              <div className="bg-white p-7 sm:p-9">
                <Building2 className="h-7 w-7 text-brand-charcoal" aria-hidden />
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-charcoal/60">
                  Export company
                </p>
                <h3 className="mt-3 text-xl font-semibold text-brand-charcoal">
                  {companyRelationship.exportCompany}
                </h3>
                <p className="mt-4 text-base leading-8 text-brand-charcoal/70">
                  Shicheng operates O&apos;range export business, supporting
                  international sales, buyer communication, sampling
                  coordination and export orders.
                </p>
              </div>

              <div className="bg-white p-7 sm:p-9">
                <Factory className="h-7 w-7 text-brand-charcoal" aria-hidden />
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-charcoal/60">
                  Parent manufacturer
                </p>
                <h3 className="mt-3 text-xl font-semibold text-brand-charcoal">
                  {companyRelationship.parentCompany}
                </h3>
                <p className="mt-4 text-base leading-8 text-brand-charcoal/70">
                  Jingtian supports documented knitting and is the GRS scope certificate holder.
                  Certificate status belongs to the parent entity, not the
                  export subsidiary.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-brand-soft bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-800">
                  Parent manufacturing network
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-brand-charcoal sm:text-4xl">
                  Rounded figures backed by the parent company record
                </h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-brand-charcoal/70">
                  These figures describe recorded machinery and configurations.
                  They are context for development conversations, not a promise
                  of available capacity for a specific order.
                </p>
              </div>

              <dl className="grid gap-3 sm:grid-cols-2">
                {manufacturingScale.map((metric, index) => (
                  <div
                    key={metric.label}
                    className={`border border-brand-charcoal/15 bg-brand-cream p-6 ${
                      index === 0 ? "sm:col-span-2" : ""
                    }`}
                  >
                    <dt className="text-sm font-semibold leading-6 text-brand-charcoal/70">
                      {metric.label}
                    </dt>
                    <dd className="mt-5 text-4xl font-bold tracking-[-0.04em] text-brand-charcoal">
                      {metric.value}
                    </dd>
                    <p className="mt-4 text-sm leading-7 text-brand-charcoal/65">
                      {metric.detail}
                    </p>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="bg-brand-cream">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-5 border-b border-brand-charcoal/20 pb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-800">
                  Knitting directions
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-brand-charcoal sm:text-4xl">
                  Start with a construction family
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-brand-charcoal/70">
                Review the relevant sourcing page, then confirm the actual
                article against your garment and test brief.
              </p>
            </div>

            <div className="grid md:grid-cols-2">
              {knittingDirections.map((direction, index) => (
                <Link
                  key={direction.href}
                  href={direction.href}
                  className={`group flex min-h-52 flex-col justify-between border-brand-charcoal/20 py-8 outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-brand-charcoal focus-visible:ring-offset-4 focus-visible:ring-offset-brand-cream ${
                    index % 2 === 0
                      ? "border-b md:border-r md:pr-8"
                      : "border-b md:pl-8"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-bold tabular-nums text-brand-charcoal/55">
                      0{index + 1}
                    </span>
                    <ArrowUpRight
                      className="h-5 w-5 text-brand-charcoal transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </div>
                  <div className="mt-10">
                    <h3 className="text-2xl font-semibold text-brand-charcoal">
                      {direction.name}
                    </h3>
                    <p className="mt-3 max-w-lg text-sm leading-7 text-brand-charcoal/70">
                      {direction.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-charcoal text-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <FileCheck2 className="h-9 w-9 text-brand-orange" aria-hidden />
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-brand-soft">
                  Certificate evidence
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  GRS scope documentation, with the holder made explicit
                </h2>
                <p className="mt-5 text-base leading-8 text-white/70">
                  The scope record supports due diligence on the parent
                  manufacturer. It is not presented as a product-level claim.
                </p>
              </div>

              <div>
                <dl className="grid border-t border-white/20 sm:grid-cols-2">
                  {[
                    ["Holder", certificationEvidence.holder],
                    [
                      "Standard",
                      `${certificationEvidence.standard} ${certificationEvidence.version}`,
                    ],
                    [
                      "Certification body",
                      certificationEvidence.certificationBody,
                    ],
                    [
                      "Scope certificate",
                      certificationEvidence.scopeCertificateNumber,
                    ],
                    [
                      "Product scope",
                      `${certificationEvidence.productCategory} · ${certificationEvidence.productDetail} · ${certificationEvidence.process}`,
                    ],
                    ["Valid until", certificationEvidence.validUntil],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="border-b border-white/20 py-5 sm:odd:pr-6 sm:even:pl-6"
                    >
                      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
                        {label}
                      </dt>
                      <dd className="mt-2 text-sm font-medium leading-6 text-white">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8 border-l-4 border-brand-orange bg-white/[0.07] p-6">
                  <div className="flex gap-4">
                    <CheckCircle2
                      className="mt-1 h-5 w-5 shrink-0 text-brand-orange"
                      aria-hidden
                    />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/65">
                        Qualification
                      </p>
                      <p className="mt-3 text-sm leading-7 text-white/80">
                        {certificationEvidence.qualification}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-24">
            <div>
              <Globe2 className="h-8 w-8 text-brand-charcoal" aria-hidden />
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-amber-800">
                International sourcing
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-brand-charcoal sm:text-4xl">
                English-language B2B support for global buyers
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-brand-charcoal/70">
                O&apos;range supports international apparel sourcing teams,
                including buyers in the United States and Australia, from
                initial construction direction through sample and RFQ review.
              </p>
              <Link
                href="/custom-knit-fabric-development"
                className="mt-8 inline-flex items-center gap-2 bg-brand-charcoal px-6 py-3.5 text-sm font-bold text-white outline-none transition-colors hover:bg-brand-charcoal/90 focus-visible:ring-2 focus-visible:ring-brand-charcoal focus-visible:ring-offset-4"
              >
                Plan a custom fabric brief
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="border border-brand-charcoal/15 bg-brand-cream p-7 sm:p-9">
              <p className="text-sm font-semibold leading-7 text-brand-charcoal">
                Include these details so the team can assess the sourcing route:
              </p>
              <ul className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {sourcingBrief.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 border-t border-brand-charcoal/15 pt-4 text-sm font-medium text-brand-charcoal/75"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 bg-brand-orange"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </article>

      <ContactCard />
    </main>
  );
}
