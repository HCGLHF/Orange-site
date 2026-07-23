import type { FinishedFabricPage } from "@/lib/finished-fabric-content";
import { companyProfile, siteUrl } from "@/lib/geo-content";
import { getSeoPage } from "@/lib/seo";

export function buildFinishedFabricSchema(page: FinishedFabricPage) {
  const pageUrl = `${siteUrl}${page.url}`;
  const seo = getSeoPage(page.url);
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
          headline: seo.h1,
          description: seo.metaDescription,
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
            "@type": "WebPage",
            name: page.product?.name ?? seo.h1,
            description: seo.metaDescription,
            url: pageUrl,
            image: `${siteUrl}${page.hero.src}`,
            provider: organization,
            about: {
              "@type": "Thing",
              name: page.product?.category ?? page.product?.name ?? seo.h1,
            },
          }
        : {
            "@context": "https://schema.org",
            "@type": page.kind === "hub" ? "CollectionPage" : "Blog",
            name: seo.h1,
            description: seo.metaDescription,
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
