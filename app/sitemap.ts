import type { MetadataRoute } from "next";
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
  ];

  const categoryPages: MetadataRoute.Sitemap = getPublicFabricCategories().map(
    (category) => ({
      url: `${siteUrl}/fabrics/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  return [...corePages, ...categoryPages];
}
