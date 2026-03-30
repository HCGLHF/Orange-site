"use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { SampleRequestCta } from "@/components/SampleRequestCta";
import { useLocale } from "@/components/LocaleProvider";
import { BottomNav } from "@/components/ui/BottomNav";
import { FabricCard } from "@/components/ui/FabricCard";
import { Navbar } from "@/components/ui/Navbar";
import { fabrics } from "@/lib/data";

export default function Home() {
  const { t, trustBadges } = useLocale();

  return (
    <div className="bg-brand-cream text-brand-charcoal">
      <LanguageToggle />
      <Navbar />

      <main>
        <section
          id="home"
          className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center"
        >
          <p className="mb-4 rounded-full bg-brand-soft px-4 py-1 text-sm text-brand-charcoal/80">
            {t("heroBadge")}
          </p>
          <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 text-lg text-brand-charcoal/80 md:text-xl">
            {t("heroSubtitle")}
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-charcoal/75 md:text-lg">
            {t("heroTagline")}
          </p>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-brand-charcoal/80 md:gap-x-8">
            {trustBadges.map((badge) => (
              <li key={badge}>{badge}</li>
            ))}
          </ul>
          <SampleRequestCta />
        </section>

        <section id="fabrics" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-3xl font-semibold">{t("fabricsTitle")}</h2>
            <p className="text-sm text-brand-charcoal/70">{t("fabricsSubtitle")}</p>
          </div>
          <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2">
            {fabrics.map((fabric) => (
              <div key={fabric.id} className="snap-start">
                <FabricCard fabric={fabric} />
              </div>
            ))}
          </div>
        </section>

        <section
          id="why"
          className="bg-brand-soft py-20"
          aria-labelledby="why-heading"
        >
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h2 className="mb-8 text-3xl font-bold text-brand-charcoal" id="why-heading">
              {t("whyTitle")}
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-2xl bg-white/80 p-6 shadow-sm">
                <span className="text-3xl" aria-hidden>
                  🏭
                </span>
                <h3 className="mt-3 text-lg font-semibold text-brand-charcoal">
                  {t("whyFactoryTitle")}
                </h3>
                <p className="mt-2 text-sm text-brand-charcoal/75">{t("whyFactoryDesc")}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-6 shadow-sm">
                <span className="text-3xl" aria-hidden>
                  🚚
                </span>
                <h3 className="mt-3 text-lg font-semibold text-brand-charcoal">
                  {t("whySpeedTitle")}
                </h3>
                <p className="mt-2 text-sm text-brand-charcoal/75">{t("whySpeedDesc")}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-6 shadow-sm">
                <span className="text-3xl" aria-hidden>
                  🌍
                </span>
                <h3 className="mt-3 text-lg font-semibold text-brand-charcoal">
                  {t("whyExportTitle")}
                </h3>
                <p className="mt-2 text-sm text-brand-charcoal/75">{t("whyExportDesc")}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="story" className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-3xl bg-white p-8 shadow-sm md:p-12">
            <p className="mb-3 text-sm uppercase tracking-[0.18em] text-brand-orange">
              {t("storyLabel")}
            </p>
            <h3 className="text-3xl font-semibold md:text-4xl">{t("storyTitle")}</h3>
            <p className="mt-4 max-w-3xl leading-relaxed text-brand-charcoal/80">
              {t("storyBody")}
            </p>
          </div>
        </section>
      </main>

      <footer id="contact" className="space-y-2 px-6 pb-24 pt-6 text-center text-sm text-brand-charcoal/70">
        <p>{t("footer")}</p>
        <p className="text-brand-charcoal/80">{t("footerContact")}</p>
      </footer>

      <BottomNav />
    </div>
  );
}
