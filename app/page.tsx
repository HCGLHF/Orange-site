import { GeoHomePage } from "@/components/geo/GeoHomePage";
import { getPublicFabrics } from "@/lib/public-catalog";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublicPageSeo } from "@/lib/seo/site-seo";

const seo = getPublicPageSeo("/");

export const dynamic = "force-static";
export const metadata = createPageMetadata(seo);

export default async function Home() {
  return <GeoHomePage initialFabrics={getPublicFabrics()} />;
}
