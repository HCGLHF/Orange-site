import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SampleRequestCta } from "@/components/SampleRequestCta";
import type { PublicLandingPage } from "@/lib/landing-page-content";

export function LandingHero({ page }: { page: PublicLandingPage }) {
  return (
    <header className="relative isolate min-h-[620px] overflow-hidden bg-brand-charcoal text-white md:min-h-[680px]">
      <Image
        src={page.heroImage.src}
        alt={page.heroImage.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(25,27,39,0.94)_0%,rgba(25,27,39,0.78)_46%,rgba(25,27,39,0.20)_78%,rgba(25,27,39,0.08)_100%)]" />
      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-end px-5 pb-16 pt-28 sm:px-6 md:min-h-[680px] md:pb-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-[#F2B7A5]">
            {page.eyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] text-white sm:text-5xl md:text-6xl">
            {page.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
            {page.summary}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SampleRequestCta
              label={page.primaryCta.label}
              className="mt-0 min-h-12 bg-brand-orange px-7 text-white shadow-none hover:bg-white hover:text-brand-charcoal"
            />
            <Link
              href={page.secondaryCta.href}
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/60 px-7 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-brand-charcoal"
            >
              {page.secondaryCta.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
