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
import { getFinishedBlogArticles } from "@/lib/finished-fabric-content";
import { buildFinishedFabricSchema } from "@/lib/finished-fabric-schema";
import { getPublicLandingPage } from "@/lib/landing-page-content";
import {
  getPublicPageSeo,
  type PublicPageSeo,
} from "@/lib/seo/site-seo";

function ContentTable({ table }: { table: NonNullable<FinishedFabricSection["table"]> }) {
  return (
    <div className="ff-table-box">
      <table className="ff-table">
        <thead className="ff-table-head">
          <tr>
            {table.headers.map((header) => (
              <th key={header} className="ff-th">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`${row[0]}-${rowIndex}`} className="ff-tr">
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`} className="ff-td">
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
    <section className={index % 2 === 0 ? "ff-section" : "ff-section ff-section-alt"}>
      <div className="ff-wrap">
        <h2 className="ff-h2">
          {section.heading}
        </h2>

        {section.paragraphs?.length ? (
          <div className="ff-copy">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        {section.note ? (
          <aside className="ff-note">
            <Quote className="ff-note-icon" aria-hidden />
            <div>
              <p className="ff-note-label">{section.note.label}</p>
              <p className="ff-note-text">{section.note.text}</p>
            </div>
          </aside>
        ) : null}

        {section.bullets?.length ? (
          <ul className="ff-bullets">
            {section.bullets.map((bullet) => (
              <li key={bullet} className="ff-bullet">
                <Check className="ff-check" aria-hidden />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {section.steps?.length ? (
          <ol className="ff-steps">
            {section.steps.map((step, stepIndex) => (
              <li key={step} className="ff-step">
                <span className="ff-step-number">
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

export function FinishedFabricPage({
  page,
  seo,
}: {
  page: FinishedFabricPageData;
  seo: PublicPageSeo;
}) {
  const landingPage = page.kind === "hub" ? getPublicLandingPage("finishedDoubleKnit") : null;
  const blogArticles = page.kind === "index" ? getFinishedBlogArticles() : [];
  const evidenceSnapshot = page.evidenceSnapshot;

  return (
    <div className="ff-page">
      <StructuredData data={buildFinishedFabricSchema(page, seo)} />

      <article>
        {landingPage ? (
          <>
            <LandingHero page={landingPage} h1={seo.h1} />
            <LandingProofStrip points={landingPage.proofPoints} />
          </>
        ) : (
        <header className="ff-header">
          <div className="ff-header-inner">
            <nav aria-label="Breadcrumb" className="ff-breadcrumb">
              {page.breadcrumbs.map((item, index) => (
                <span key={item.href} className="ff-crumb">
                  {index > 0 ? <span aria-hidden>/</span> : null}
                  <Link href={item.href} className="ff-crumb-link">
                    {item.label}
                  </Link>
                </span>
              ))}
            </nav>

            <div className="ff-hero-grid">
              <div>
                <p className="ff-eyebrow">
                  {page.eyebrow}
                </p>
                <h1 className="ff-h1">
                  {seo.h1}
                </h1>
                <p className="ff-opening">
                  {page.opening}
                </p>
                {page.kind === "article" && page.updated ? (
                  <p className="ff-updated">
                    Updated {page.updated} · Reviewed by {page.reviewer ?? "O'range Textile"}
                  </p>
                ) : null}
                <div className="ff-hero-actions">
                  <SampleRequestCta label="Request a finished-fabric sample" className="" />
                  <Link href="/finished-double-knit-fabrics" className="ff-range-link">
                    View the finished-fabric range
                    <ArrowRight className="ff-arrow" aria-hidden />
                  </Link>
                </div>
              </div>

              <figure>
                <div className="ff-image">
                  <Image
                    src={page.hero.src}
                    alt={page.hero.alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 52vw, 100vw"
                    className="ff-image-fill"
                  />
                </div>
                <figcaption className="ff-caption">
                  {page.hero.caption}
                </figcaption>
              </figure>
            </div>
          </div>
        </header>
        )}

        {blogArticles.length ? (
          <section className="ff-guides">
            <div className="ff-wrap">
              <p className="ff-eyebrow">
                Finished-fabric buyer guides
              </p>
              <h2 className="ff-guide-title">
                Choose a construction question to investigate
              </h2>
              <p className="ff-guide-intro">
                Each guide connects a buyer question to specification checks, sample evidence, and a relevant finished-fabric sourcing route.
              </p>
              <div className="ff-guide-grid">
                {blogArticles.map((article) => {
                  const articleSeo = getPublicPageSeo(article.url);
                  return (
                    <Link
                      key={article.url}
                      href={article.url}
                      className="ff-guide-card"
                    >
                      <div>
                        <h3 className="ff-guide-card-title">
                          {articleSeo.h1}
                        </h3>
                        <p className="ff-guide-card-copy">
                          {articleSeo.metaDescription}
                        </p>
                      </div>
                      <span className="ff-guide-card-link">
                        Read the buyer guide
                        <ArrowRight
                          className="ff-guide-arrow"
                          aria-hidden
                        />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {page.sections.map((section, index) => (
          <ContentSection key={section.heading} section={section} index={index} />
        ))}

        {evidenceSnapshot ? (
          <section className="ff-evidence">
            <div className="ff-wrap">
              <p className="ff-eyebrow">
                Article evidence snapshot
              </p>
              <h2 className="ff-evidence-title">
                {evidenceSnapshot.heading}
              </h2>
              <p className="ff-evidence-summary">
                {evidenceSnapshot.summary}
              </p>
              <dl className="ff-evidence-list">
                {evidenceSnapshot.items.map((item) => (
                  <div key={item.label} className="ff-evidence-row">
                    <dt className="ff-evidence-label">{item.label}</dt>
                    <dd className="ff-evidence-detail">{item.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        ) : null}

        <section className="ff-boundary">
          <div className="ff-boundary-inner">
            <ClipboardCheck className="ff-boundary-icon" aria-hidden />
            <div>
              <h2 className="ff-boundary-title">Evidence boundary</h2>
              <p className="ff-boundary-copy">{page.evidenceBoundary}</p>
            </div>
          </div>
        </section>

        <section className="ff-faq">
          <div className="ff-wrap">
            <p className="ff-eyebrow">Buyer questions</p>
            <h2 className="ff-faq-title">Frequently asked questions</h2>
            <div className="ff-faq-list">
              {page.faq.map((item) => (
                <details key={item.q} className="ff-faq-item">
                  <summary className="ff-faq-question">
                    {item.q}
                  </summary>
                  <p className="ff-faq-answer">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="ff-related">
          <div className="ff-wrap">
            <h2 className="ff-related-title">Continue the sourcing route</h2>
            <div className="ff-related-grid">
              {page.relatedLinks.map((item) => (
                <Link key={item.href} href={item.href} className="ff-related-link">
                  <span>{item.label}</span>
                  <ArrowRight className="ff-related-arrow" aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="ff-cta">
          <div className="ff-cta-inner">
            <h2 className="ff-cta-title">Move from category research to a sample brief</h2>
            <p className="ff-cta-copy">
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
