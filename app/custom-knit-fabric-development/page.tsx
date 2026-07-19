import type { Metadata } from "next";
import { CustomDevelopmentLanding } from "@/components/landing/CustomDevelopmentLanding";
import { getPublicLandingPage } from "@/lib/landing-page-content";
import { siteUrl } from "@/lib/geo-content";

const page = getPublicLandingPage("customDevelopment");

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: { absolute: "Custom Knit Fabric Development | O'range Textile" },
  description: page.summary,
  alternates: { canonical: "/custom-knit-fabric-development" },
  openGraph: {
    title: page.headline,
    description: page.summary,
    url: `${siteUrl}/custom-knit-fabric-development`,
    type: "website",
    images: [{ url: page.heroImage.src, alt: page.heroImage.alt }],
  },
};

export default function CustomKnitFabricDevelopmentPage() {
  return <CustomDevelopmentLanding />;
}
