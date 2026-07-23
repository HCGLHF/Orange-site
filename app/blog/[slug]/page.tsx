import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FinishedFabricPage } from "@/components/finished-fabric/FinishedFabricPage";
import {
  getFinishedBlogArticles,
  getFinishedFabricPage,
  getFinishedFabricSlug,
} from "@/lib/finished-fabric-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getPublicPageSeo } from "@/lib/seo/site-seo";

type BlogPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return getFinishedBlogArticles().map((page) => ({
    slug: getFinishedFabricSlug(page.url),
  }));
}

export function generateMetadata({ params }: BlogPageProps): Metadata {
  const path = `/blog/${params.slug}`;
  const page = getFinishedFabricPage(path);
  if (!page) return {};
  const seo = getPublicPageSeo(path);

  return createPageMetadata(seo, {
    type: "article",
    image: { src: page.hero.src, alt: page.hero.alt },
    publishedTime: page.published,
    modifiedTime: page.updated ?? seo.updatedAt,
  });
}

export default function FinishedFabricBlogPage({ params }: BlogPageProps) {
  const path = `/blog/${params.slug}`;
  const page = getFinishedFabricPage(path);
  if (!page || page.kind !== "article") notFound();
  return <FinishedFabricPage page={page} seo={getPublicPageSeo(path)} />;
}
