import type { MetadataRoute } from "next";
import { getFinishedFabricPages } from "@/lib/finished-fabric-content";
import { siteUrl } from "@/lib/geo-content";
import { getPublicFabricCategories } from "@/lib/public-catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const corePages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/fabrics`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/ready-stock-knit-fabrics`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/finished-double-knit-fabrics`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/custom-knit-fabric-development`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = getPublicFabricCategories().map(
    (category) => ({
      url: `${siteUrl}/fabrics/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  const finishedFabricPages: MetadataRoute.Sitemap = getFinishedFabricPages().map(
    (page) => ({
      url: `${siteUrl}${page.url}`,
      lastModified: page.updated ? new Date(page.updated) : now,
      changeFrequency: page.kind === "article" ? "monthly" : "weekly",
      priority:
        page.kind === "hub" ? 0.9 : page.kind === "product" ? 0.8 : 0.7,
    })
  );

  const pagesByUrl = new Map(
    [...corePages, ...categoryPages, ...finishedFabricPages].map((page) => [
      page.url,
      page,
    ])
  );

  return Array.from(pagesByUrl.values());
}
