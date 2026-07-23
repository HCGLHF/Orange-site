import { ReadyStockLanding } from "@/components/landing/ReadyStockLanding";
import { getPublicLandingPage } from "@/lib/landing-page-content";
import {
  getInitialPublicFabrics,
  getPublicFabricCount,
} from "@/lib/public-catalog";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublicPageSeo } from "@/lib/seo/site-seo";

const page = getPublicLandingPage("readyStock");
const seo = getPublicPageSeo("/ready-stock-knit-fabrics");

export const dynamic = "force-static";

export const metadata = createPageMetadata(seo, {
  image: { src: page.heroImage.src, alt: page.heroImage.alt },
});

export default function ReadyStockKnitFabricsPage() {
  return (
    <ReadyStockLanding
      fabrics={getInitialPublicFabrics()}
      totalFabricCount={getPublicFabricCount()}
    />
  );
}
