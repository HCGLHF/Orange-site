import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FinishedFabricPage } from "@/components/finished-fabric/FinishedFabricPage";
import {
  getFinishedBlogArticles,
  getFinishedFabricPage,
  getFinishedFabricSlug,
} from "@/lib/finished-fabric-content";
import { siteUrl } from "@/lib/geo-content";

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
  const page = getFinishedFabricPage(`/blog/${params.slug}`);
  if (!page) return {};

  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: page.url },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${siteUrl}${page.url}`,
      type: "article",
      publishedTime: page.published,
      modifiedTime: page.updated,
      images: [{ url: page.hero.src, alt: page.hero.alt }],
    },
  };
}

export default function FinishedFabricBlogPage({ params }: BlogPageProps) {
  const page = getFinishedFabricPage(`/blog/${params.slug}`);
  if (!page || page.kind !== "article") notFound();
  return <FinishedFabricPage page={page} />;
}
