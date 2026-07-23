import { AboutPage } from "@/components/company/AboutPage";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublicPageSeo } from "@/lib/seo/site-seo";

const seo = getPublicPageSeo("/about");

export const dynamic = "force-static";

export const metadata = createPageMetadata(seo);

export default function AboutRoute() {
  return <AboutPage seo={seo} />;
}
