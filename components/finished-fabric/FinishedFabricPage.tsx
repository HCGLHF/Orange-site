import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ClipboardCheck, Quote } from "lucide-react";
import ContactCard from "@/components/ContactCard";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingProofStrip } from "@/components/landing/LandingProofStrip";
import { StructuredData } from "@/components/geo/StructuredData";
import { SampleRequestCta } from "@/components/SampleRequestCta";
import type {
  FinishedFabricPage as FinishedFabricPageData,
  FinishedFabricSection,
} from "@/lib/finished-fabric-content";
import { buildFinishedFabricSchema } from "@/lib/finished-fabric-schema";
import { getPublicLandingPage } from "@/lib/landing-page-content";

function ContentTable({ table }: { table: NonNullable<FinishedFabricSection["table"]> }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-brand-soft bg-white">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="bg-brand-soft/45 text-brand-charcoal">
          <tr>
            {table.headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`${row[0]}-${rowIndex}`} className="border-t border-brand-soft/70">
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`} className="px-4 py-3 align-top leading-relaxed text-brand-charcoal/75">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContentSection({ section, index }: { section: FinishedFabricSection; index: number }) {
  return (
    <section className={index % 2 === 0 ? "bg-white" : "bg-brand-cream"}>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="max-w-3xl text-2xl font-semibold text-brand-charcoal md:text-3xl">
          {section.heading}
        </h2>

        {section.paragraphs?.length ? (
          <div className="mt-5 max-w-4xl space-y-4 text-base leading-8 text-brand-charcoal/75">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        {section.note ? (
          <aside className="mt-6 flex max-w-4xl gap-3 border-l-4 border-brand-orange bg-brand-soft/35 px-5 py-4">
            <Quote className="mt-1 h-5 w-5 shrink-0 text-brand-orange" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-brand-charcoal">{section.note.label}</p>
              <p className="mt-1 text-sm leading-7 text-brand-charcoal/75">{section.note.text}</p>
            </div>
          </aside>
        ) : null}

        {section.bullets?.length ? (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {section.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 rounded-lg border border-brand-soft bg-white p-4 text-sm leading-6 text-brand-charcoal/75">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" aria-hidden />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {section.steps?.length ? (
          <ol className="mt-6 grid gap-4 md:grid-cols-2">
            {section.steps.map((step, stepIndex) => (
              <li key={step} className="flex gap-4 border-t border-brand-soft pt-4 text-sm leading-7 text-brand-charcoal/75">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-charcoal text-xs font-semibold text-white">
                  {stepIndex + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        ) : null}

        {section.table ? <ContentTable table={section.table} /> : null}
      </div>
    </section>
  );
}

export function FinishedFabricPage({ page }: { page: FinishedFabricPageData }) {
  const landingPage = page.kind === "hub" ? getPublicLandingPage("finishedDoubleKnit") : null;

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal">
      <StructuredData data={buildFinishedFabricSchema(page)} />

      <article>
        {landingPage ? (
          <>
            <LandingHero page={landingPage} />
            <LandingProofStrip points={landingPage.proofPoints} />
          </>
        ) : (
        <header className="border-b border-brand-soft bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-brand-charcoal/60">
              {page.breadcrumbs.map((item, index) => (
                <span key={item.href} className="flex items-center gap-2">
                  {index > 0 ? <span aria-hidden>/</span> : null}
                  <Link href={item.href} className="hover:text-brand-orange">
                    {item.label}
                  </Link>
                </span>
              ))}
            </nav>

            <div className="mt-8 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
                  {page.eyebrow}
                </p>
                <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-brand-charcoal md:text-5xl">
                  {page.h1}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-brand-charcoal/75">
                  {page.opening}
                </p>
                {page.kind === "article" && page.updated ? (
                  <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-brand-charcoal/55">
                    Updated {page.updated} · Reviewed by {page.reviewer ?? "O'range Textile"}
                  </p>
                ) : null}
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <SampleRequestCta label="Request a finished-fabric sample" className="" />
                  <Link href="/finished-double-knit-fabrics" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-charcoal hover:text-brand-orange">
                    View the finished-fabric range
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>

              <figure>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-brand-soft">
                  <Image
                    src={page.hero.src}
                    alt={page.hero.alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 52vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-xs leading-5 text-brand-charcoal/55">
                  {page.hero.caption}
                </figcaption>
              </figure>
            </div>
          </div>
        </header>
        )}

        {page.sections.map((section, index) => (
          <ContentSection key={section.heading} section={section} index={index} />
        ))}

        <section className="border-y border-brand-soft bg-brand-charcoal text-white">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[auto_1fr] md:items-start lg:px-8">
            <ClipboardCheck className="h-8 w-8 text-brand-orange" aria-hidden />
            <div>
              <h2 className="text-xl font-semibold">Evidence boundary</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-white/75">{page.evidenceBoundary}</p>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">Buyer questions</p>
            <h2 className="mt-3 text-3xl font-semibold text-brand-charcoal">Frequently asked questions</h2>
            <div className="mt-7 divide-y divide-brand-soft border-y border-brand-soft">
              {page.faq.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="cursor-pointer list-none pr-8 text-base font-semibold text-brand-charcoal">
                    {item.q}
                  </summary>
                  <p className="mt-3 max-w-4xl text-sm leading-7 text-brand-charcoal/75">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-cream">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-brand-charcoal">Continue the sourcing route</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {page.relatedLinks.map((item) => (
                <Link key={item.href} href={item.href} className="group flex min-h-24 items-center justify-between gap-3 rounded-lg border border-brand-soft bg-white p-4 text-sm font-semibold text-brand-charcoal transition-colors hover:border-brand-orange">
                  <span>{item.label}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-brand-orange transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold text-brand-charcoal">Move from category research to a sample brief</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-brand-charcoal/70">
              Share the garment use, construction direction, composition, target GSM, usable width, color, finish and tests that matter. The team can then confirm the appropriate article and quotation route.
            </p>
            <SampleRequestCta label="Start the sample and RFQ process" className="mt-7" />
          </div>
        </section>
      </article>

      <ContactCard />
    </div>
  );
}
