import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FinishedFabricPage } from "@/components/finished-fabric/FinishedFabricPage";
import { getFinishedFabricPage } from "@/lib/finished-fabric-content";
import { siteUrl } from "@/lib/geo-content";

const page = getFinishedFabricPage("/blog");

export const dynamic = "force-static";

export const metadata: Metadata = page
  ? {
      title: { absolute: page.title },
      description: page.description,
      alternates: { canonical: page.url },
      openGraph: {
        title: page.title,
        description: page.description,
        url: `${siteUrl}${page.url}`,
        type: "website",
        images: [{ url: page.hero.src, alt: page.hero.alt }],
      },
    }
  : {};

export default function BlogIndexPage() {
  if (!page) notFound();
  return <FinishedFabricPage page={page} />;
}
