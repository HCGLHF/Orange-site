import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FinishedFabricPage } from "@/components/finished-fabric/FinishedFabricPage";
import {
  getFinishedBlogArticles,
  getFinishedFabricPage,
  getFinishedFabricSlug,
} from "@/lib/finished-fabric-content";
import { buildSeoMetadata } from "@/lib/seo";

type BlogPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getFinishedBlogArticles().map((page) => ({
    slug: getFinishedFabricSlug(page.url),
  }));
}

export function generateMetadata({ params }: BlogPageProps): Metadata {
  const page = getFinishedFabricPage(`/blog/${params.slug}`);
  if (!page) return {};
  return buildSeoMetadata(page.url);
}

export default function FinishedFabricBlogPage({ params }: BlogPageProps) {
  const page = getFinishedFabricPage(`/blog/${params.slug}`);
  if (!page || page.kind !== "article") notFound();
  return <FinishedFabricPage page={page} />;
}
