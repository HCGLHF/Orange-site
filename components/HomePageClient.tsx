"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import ContactCard from "@/components/ContactCard";
import { FabricCard } from "@/components/ui/FabricCard";
import FactoryStats from "@/components/FactoryStats";
import { SampleRequestCta } from "@/components/SampleRequestCta";
import { useLocale } from "@/components/LocaleProvider";
import { InquiryBar } from "@/components/InquiryBar";
import { BottomNav } from "@/components/ui/BottomNav";
import type { Fabric } from "@/lib/data";

type HomePageClientProps = {
  initialFabrics: Fabric[];
  /** Notion 成功返回但 0 条 */
  notionEmpty?: boolean;
};

export default function HomePageClient({
  initialFabrics,
  notionEmpty = false,
}: HomePageClientProps) {
  const { t, trustBadges } = useLocale();

  return (
    <div className="bg-brand-cream text-brand-charcoal">
      <LanguageToggle />

      <section
          id="home"
          className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center"
        >
          {/*
            Hero 不使用 Framer Motion：避免 SSR/hydration/StrictMode 下 initial 为 opacity:0
            导致首屏长期空白或反复「消失」。
          */}
          <div className="flex flex-col items-center">
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
          </div>
        </section>

        <section id="fabrics" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold">{t("fabricsTitle")}</h2>
              <p className="mt-1 text-sm text-brand-charcoal/70">
                {t("fabricsSubtitle")}
              </p>
            </div>
            <Link
              href="/fabrics"
              className="shrink-0 text-sm font-semibold text-brand-orange transition-colors hover:text-brand-orange/80 hover:underline"
            >
              {t("fabricsViewAll")} →
            </Link>
          </div>
          {notionEmpty || initialFabrics.length === 0 ? (
            <p className="py-12 text-center text-brand-charcoal/60">
              {t("fabricsEmpty")}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {initialFabrics.slice(0, 3).map((fabric) => (
                <FabricCard key={fabric.id} fabric={fabric} />
              ))}
            </div>
          )}
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

        <FactoryStats />

      <ContactCard />

      <footer className="px-6 pb-24 pt-2 text-center text-sm text-brand-charcoal/60 max-md:pb-40">
        <p>{t("footer")}</p>
      </footer>

      <InquiryBar />

      <BottomNav />
    </div>
  );
}
