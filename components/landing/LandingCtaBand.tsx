import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SampleRequestCta } from "@/components/SampleRequestCta";
import type { PublicLandingPage } from "@/lib/landing-page-content";

export function LandingCtaBand({
  page,
  title = "Move from fabric research to a reviewable sourcing brief",
}: {
  page: PublicLandingPage;
  title?: string;
}) {
  return (
    <section className="bg-brand-charcoal px-5 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold leading-tight">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-white/72">
            Share the garment use, construction, composition, target GSM, usable width, colour, finish, quantity and destination. Commercial terms remain subject to the current sample and quotation.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <SampleRequestCta label={page.primaryCta.label} className="mt-0 min-h-12 shadow-none" />
          <Link
            href={page.secondaryCta.href}
            className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/40 px-6 text-sm font-semibold text-white hover:border-white"
          >
            {page.secondaryCta.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
