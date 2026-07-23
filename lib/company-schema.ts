import {
  companyRelationship,
  knittingDirections,
  manufacturingScale,
} from "@/lib/company-evidence";
import {
  SEO_SITE_ORIGIN,
  toCanonicalUrl,
  type PublicPageSeo,
} from "@/lib/seo/site-seo";

export function createAboutPageJsonLd(seo: PublicPageSeo) {
  const organizationId = `${SEO_SITE_ORIGIN}/#organization`;
  const pageUrl = toCanonicalUrl(seo.path);
  const primaryScaleRecord = manufacturingScale[0];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: seo.h1,
        description: seo.metaDescription,
        about: { "@id": organizationId },
      },
      {
        "@type": "Organization",
        "@id": organizationId,
        name: companyRelationship.brandName,
        legalName: companyRelationship.exportCompany,
        url: SEO_SITE_ORIGIN,
        location: companyRelationship.location,
        parentOrganization: {
          "@type": "Organization",
          name: companyRelationship.parentCompany,
        },
        knowsAbout: knittingDirections.map((direction) => direction.name),
        description: `${companyRelationship.exportRole}. The parent manufacturing network records ${primaryScaleRecord.value} ${primaryScaleRecord.label}.`,
      },
    ],
  };
}
