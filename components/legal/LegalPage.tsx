import type { LegalPageContent } from "@/lib/legal-content";
import type { PublicPageSeo } from "@/lib/seo/site-seo";

const CONTACT_EMAIL = "folenchen0401@outlook.com";

type LegalPageProps = {
  seo: PublicPageSeo;
  content: LegalPageContent;
};

export function LegalPage({ seo, content }: LegalPageProps) {
  return (
    <article className="min-h-screen bg-brand-cream text-brand-charcoal">
      <header className="border-b border-brand-soft bg-white">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6 md:py-16 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Legal
          </p>
          <h1 className="mt-4 text-balance text-4xl font-bold leading-tight md:text-5xl">
            {seo.h1}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-brand-charcoal/75">
            {content.introduction}
          </p>
          <p className="mt-4 text-sm font-medium text-brand-charcoal/60">
            Effective date: <time dateTime={seo.updatedAt}>{content.effectiveDate}</time>
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-[15rem_minmax(0,1fr)] lg:px-8 lg:py-16">
        <nav aria-label="On this page" className="md:sticky md:top-24 md:self-start">
          <p className="text-sm font-semibold text-brand-charcoal">On this page</p>
          <ul className="mt-4 space-y-2 border-l border-brand-soft pl-4">
            {content.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="inline-block py-1 text-sm leading-6 text-brand-charcoal/70 underline-offset-4 hover:text-brand-orange hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 max-w-3xl space-y-10">
          {content.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-2xl font-semibold leading-tight text-brand-charcoal">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-brand-charcoal/75">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <p className="border-t border-brand-soft pt-8 text-sm leading-7 text-brand-charcoal/70">
            Contact: {" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-brand-charcoal underline decoration-brand-orange underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </article>
  );
}
