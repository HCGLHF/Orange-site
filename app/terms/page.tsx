import { LegalPage } from "@/components/legal/LegalPage";
import { TERMS_CONTENT } from "@/lib/legal-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublicPageSeo } from "@/lib/seo/site-seo";

const seo = getPublicPageSeo("/terms");

export const dynamic = "force-static";

export const metadata = createPageMetadata(seo);

export default function TermsRoute() {
  return <LegalPage seo={seo} content={TERMS_CONTENT} />;
}
