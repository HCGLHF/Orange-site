import type { MetadataRoute } from "next";
import {
  getAllPublicPageSeo,
  toCanonicalUrl,
} from "@/lib/seo/site-seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return getAllPublicPageSeo().map((page) => ({
    url: toCanonicalUrl(page.path),
    lastModified: new Date(`${page.updatedAt}T00:00:00.000Z`),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
