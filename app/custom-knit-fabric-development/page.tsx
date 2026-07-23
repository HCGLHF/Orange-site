import { CustomDevelopmentLanding } from "@/components/landing/CustomDevelopmentLanding";
import { getPublicLandingPage } from "@/lib/landing-page-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublicPageSeo } from "@/lib/seo/site-seo";

const page = getPublicLandingPage("customDevelopment");
const seo = getPublicPageSeo("/custom-knit-fabric-development");

export const dynamic = "force-static";

export const metadata = createPageMetadata(seo, {
  image: { src: page.heroImage.src, alt: page.heroImage.alt },
});

export default function CustomKnitFabricDevelopmentPage() {
  return <CustomDevelopmentLanding />;
}
