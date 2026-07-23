import Link from "next/link";
import { ArrowRight, Check, FileText } from "lucide-react";
import ContactCard from "@/components/ContactCard";
import { LandingCtaBand } from "@/components/landing/LandingCtaBand";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingProofStrip } from "@/components/landing/LandingProofStrip";
import { StructuredData } from "@/components/geo/StructuredData";
import { BottomNav } from "@/components/ui/BottomNav";
import { getPublicLandingPage } from "@/lib/landing-page-content";
import { buildLandingPageSchema } from "@/lib/landing-page-schema";
import { getPublicPageSeo } from "@/lib/seo/site-seo";

export function CustomDevelopmentLanding() {
  const page = getPublicLandingPage("customDevelopment");
  const seo = getPublicPageSeo("/custom-knit-fabric-development");

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal">
      <StructuredData data={buildLandingPageSchema({ page, path: "/custom-knit-fabric-development" })} />
      <LandingHero page={page} h1={seo.h1} />
      <LandingProofStrip points={page.proofPoints} />

      <section className="bg-white px-5 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-orange">Inquiry input</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
              What the development brief should contain
            </h2>
            <p className="mt-4 text-sm leading-7 text-brand-charcoal/70">
              A useful brief separates fixed requirements from properties where the supplier may propose an alternative. That makes sample feedback easier to trace.
            </p>
            <Link href="/finished-double-knit-fabrics" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange">
              Review construction directions first
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {page.checklist.map((item) => (
              <li key={item} className="flex min-h-28 gap-3 border border-brand-soft p-5 text-sm leading-7 text-brand-charcoal/75">
                <FileText className="mt-1 h-5 w-5 shrink-0 text-brand-orange" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-brand-orange">Private sales review</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">How the private inquiry route works</h2>
            <p className="mt-4 text-sm leading-7 text-brand-charcoal/70">
              Send the available requirement first. The sales team can then confirm which product, sample, quotation or garment route should be discussed privately.
            </p>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {page.process.map((step, index) => (
              <li key={step.title} className="border-t-2 border-brand-orange pt-5">
                <span className="text-sm font-semibold text-brand-orange">0{index + 1}</span>
                <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/70">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-orange">Decision boundary</p>
            <h2 className="mt-3 text-3xl font-semibold">What is confirmed later</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Exact article or garment reference", "Colour and required quantity", "Commercial terms for the current order", "Testing, packing and documentation"].map((item) => (
              <div key={item} className="flex gap-3 border border-brand-soft bg-brand-cream p-5 text-sm leading-7 text-brand-charcoal/75">
                <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                <span>{item} are confirmed against the current requirement and quotation.</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase text-brand-orange">Development questions</p>
          <h2 className="mt-3 text-3xl font-semibold">Clarify the brief before sampling</h2>
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

      <LandingCtaBand page={page} title="Send the requirement directly to the sourcing team" />
      <ContactCard />
      <BottomNav />
    </div>
  );
}
