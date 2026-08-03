import { LegalPage } from "@/components/legal/LegalPage";
import { PRIVACY_CONTENT } from "@/lib/legal-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublicPageSeo } from "@/lib/seo/site-seo";

const seo = getPublicPageSeo("/privacy");

export const dynamic = "force-static";

export const metadata = createPageMetadata(seo);

export default function PrivacyRoute() {
  return <LegalPage seo={seo} content={PRIVACY_CONTENT} />;
}
