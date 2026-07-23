import type { Metadata } from "next";
import rawSeoPages from "@/content/seo-pages.json";
import { companyProfile, siteUrl } from "@/lib/geo-content";

export type SeoSearchIntent =
  | "informational"
  | "commercial"
  | "transactional"
  | "navigational";

export type SeoPage = {
  path: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: SeoSearchIntent;
  topicCluster: string;
  targetPageType: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  socialImage: string;
  socialImageAlt: string;
  lastModified: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
};

const seoPages = rawSeoPages as SeoPage[];
const seoPagesByPath = new Map(seoPages.map((page) => [page.path, page]));

export function getSeoPages(): SeoPage[] {
  return seoPages;
}

export function getSeoPage(path: string): SeoPage {
  const page = seoPagesByPath.get(path);
  if (!page) {
    throw new Error(`Missing SEO page configuration for ${path}`);
  }
  return page;
}

export function buildSeoMetadata(path: string): Metadata {
  const page = getSeoPage(path);
  const canonicalUrl = path === "/" ? siteUrl : `${siteUrl}${path}`;

  return {
    title: { absolute: page.metaTitle },
    description: page.metaDescription,
    alternates: { canonical: canonicalUrl },
    keywords: [page.primaryKeyword, ...page.secondaryKeywords],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: canonicalUrl,
      siteName: companyProfile.brandName,
      locale: "en_US",
      type: ["blog-page", "guide-page", "faq-page"].includes(
        page.targetPageType
      )
        ? "article"
        : "website",
      images: [
        {
          url: page.socialImage,
          alt: page.socialImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
      images: [page.socialImage],
    },
  };
}
