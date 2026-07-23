import type { Metadata } from "next";
import {
  SEO_BRAND_NAME,
  getPublicPageSeo,
  toCanonicalUrl,
  type PublicPageSeo,
} from "@/lib/seo/site-seo";

type MetadataOptions = {
  type?: "website" | "article";
  image?: {
    src: string;
    alt: string;
  };
  publishedTime?: string;
  modifiedTime?: string;
};

export function createPageMetadata(
  pageOrPath: PublicPageSeo | string,
  options: MetadataOptions = {}
): Metadata {
  const page =
    typeof pageOrPath === "string"
      ? getPublicPageSeo(pageOrPath)
      : pageOrPath;
  const canonical = toCanonicalUrl(page.path);
  const images = options.image
    ? [{ url: options.image.src, alt: options.image.alt }]
    : undefined;
  const openGraph =
    options.type === "article"
      ? {
          title: page.metaTitle,
          description: page.metaDescription,
          url: canonical,
          siteName: SEO_BRAND_NAME,
          locale: "en_US",
          type: "article" as const,
          publishedTime: options.publishedTime,
          modifiedTime: options.modifiedTime ?? page.updatedAt,
          images,
        }
      : {
          title: page.metaTitle,
          description: page.metaDescription,
          url: canonical,
          siteName: SEO_BRAND_NAME,
          locale: "en_US",
          type: "website" as const,
          images,
        };

  return {
    title: { absolute: page.metaTitle },
    description: page.metaDescription,
    alternates: { canonical: page.path },
    robots: { index: true, follow: true },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
      images: options.image ? [options.image.src] : undefined,
    },
  };
}
