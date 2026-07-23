import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/geo-content";
import { getSeoPages } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return getSeoPages().map((page) => ({
    url: page.path === "/" ? siteUrl : `${siteUrl}${page.path}`,
    lastModified: new Date(page.lastModified),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
