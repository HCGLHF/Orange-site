import type { Metadata } from "next";
import { ReadyStockLanding } from "@/components/landing/ReadyStockLanding";
import { getPublicLandingPage } from "@/lib/landing-page-content";
import { getPublicFabrics } from "@/lib/public-catalog";
import { siteUrl } from "@/lib/geo-content";

const page = getPublicLandingPage("readyStock");

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: { absolute: "Ready-stock Knit Fabrics | O'range Textile" },
  description: page.summary,
  alternates: { canonical: "/ready-stock-knit-fabrics" },
  openGraph: {
    title: page.headline,
    description: page.summary,
    url: `${siteUrl}/ready-stock-knit-fabrics`,
    type: "website",
    images: [{ url: page.heroImage.src, alt: page.heroImage.alt }],
  },
};

export default function ReadyStockKnitFabricsPage() {
  return <ReadyStockLanding fabrics={getPublicFabrics()} />;
}
