import type { FinishedFabricPage } from "@/lib/finished-fabric-content";
import { companyProfile, siteUrl } from "@/lib/geo-content";

export function buildFinishedFabricSchema(page: FinishedFabricPage) {
  const pageUrl = `${siteUrl}${page.url}`;
  const organization = {
    "@type": "Organization",
    name: companyProfile.brandName,
    legalName: companyProfile.legalName,
    url: siteUrl,
    email: companyProfile.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Shaoxing",
      addressRegion: "Zhejiang",
      addressCountry: "CN",
    },
  };

  const primary =
    page.kind === "article"
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: page.h1,
          description: page.description,
          url: pageUrl,
          image: `${siteUrl}${page.hero.src}`,
          datePublished: page.published,
          dateModified: page.updated,
          author: organization,
          publisher: organization,
        }
      : page.kind === "product"
        ? {
            "@context": "https://schema.org",
            "@type": "Product",
            name: page.product?.name ?? page.h1,
            category: page.product?.category,
            description: page.description,
            url: pageUrl,
            image: `${siteUrl}${page.hero.src}`,
            brand: organization,
            manufacturer: organization,
          }
        : {
            "@context": "https://schema.org",
            "@type": page.kind === "hub" ? "CollectionPage" : "Blog",
            name: page.h1,
            description: page.description,
            url: pageUrl,
            image: `${siteUrl}${page.hero.src}`,
            provider: organization,
          };

  return [
    primary,
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: page.breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item: `${siteUrl}${item.href}`,
      })),
    },
  ];
}
