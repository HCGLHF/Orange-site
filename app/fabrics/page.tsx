import localFont from "next/font/local";
import { FabricCollections } from "@/components/collections/FabricCollections";
import { SourcingEvidence } from "@/components/collections/SourcingEvidence";
import { FabricsInquiryAnchor } from "@/components/FabricsInquiryAnchor";
import { getFinishedProductPages } from "@/lib/finished-fabric-content";
import { publicFabrics, getPublicFabricCategories } from "@/lib/public-catalog";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublicPageSeo } from "@/lib/seo/site-seo";
import "@/components/collections/collections.css";

const seo = getPublicPageSeo("/fabrics");
const geist = localFont({ src: "../fonts/GeistVF.woff", variable: "--font-catalogue-geist", display: "swap" });

export const metadata = createPageMetadata(seo);
export const dynamic = "force-static";

export default function FabricsPage() {
  const sourcingLinks = [
    ...getFinishedProductPages().map((page) => ({ href: page.url, label: getPublicPageSeo(page.url).h1 })),
    ...getPublicFabricCategories().map((category) => ({ href: `/fabrics/${category.slug}`, label: category.name })),
    { href: "/finished-double-knit-fabrics", label: "Double-knit manufacturing" },
    { href: "/ready-stock-knit-fabrics", label: "Ready-stock sourcing" },
    { href: "/blog", label: "Buyer guides" },
  ];
  return <>
    <FabricCollections fabrics={publicFabrics} fontClassName={geist.variable} sourcingLinks={sourcingLinks} sourcingContent={<SourcingEvidence />} />
    <FabricsInquiryAnchor />
  </>;
}
