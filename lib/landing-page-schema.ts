import type { LandingFaq, PublicLandingPage } from "@/lib/landing-page-content";
import { siteUrl } from "@/lib/geo-content";
import { getPublicPageSeo } from "@/lib/seo/site-seo";

export function buildLandingPageSchema({
  page,
  path,
  faq = page.faq,
}: {
  page: PublicLandingPage;
  path: string;
  faq?: LandingFaq[];
}) {
  const canonical = `${siteUrl}${path}`;
  const seo = getPublicPageSeo(path);
  const schema: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: seo.h1,
      description: seo.metaDescription,
      url: canonical,
      isPartOf: { "@type": "WebSite", name: "O'range Textile", url: siteUrl },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${siteUrl}${page.heroImage.src}`,
        caption: page.heroImage.alt,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: seo.h1, item: canonical },
      ],
    },
  ];

  if (faq.length > 0) {
    schema.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }

  return schema;
}
