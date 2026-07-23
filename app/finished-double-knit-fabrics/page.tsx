import { notFound } from "next/navigation";
import { FinishedFabricPage } from "@/components/finished-fabric/FinishedFabricPage";
import { getFinishedFabricPage } from "@/lib/finished-fabric-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublicPageSeo } from "@/lib/seo/site-seo";

const page = getFinishedFabricPage("/finished-double-knit-fabrics");
const seo = getPublicPageSeo("/finished-double-knit-fabrics");

export const dynamic = "force-static";

export const metadata = page
  ? createPageMetadata(seo, {
      image: { src: page.hero.src, alt: page.hero.alt },
    })
  : {};

export default function FinishedDoubleKnitFabricsPage() {
  if (!page) notFound();
  return <FinishedFabricPage page={page} />;
}
