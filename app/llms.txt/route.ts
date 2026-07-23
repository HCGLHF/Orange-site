import { NextResponse } from "next/server";
import { companyRelationship } from "@/lib/company-evidence";
import {
  companyProfile,
  heroContent,
  siteUrl,
} from "@/lib/geo-content";
import {
  getAllPublicPageSeo,
  toCanonicalUrl,
} from "@/lib/seo/site-seo";

export const dynamic = "force-static";

export function GET() {
  const publicPages = getAllPublicPageSeo()
    .map(
      (page) =>
        `- ${page.h1}: ${page.metaDescription} URL: ${toCanonicalUrl(page.path)}`
    )
    .join("\n");

  const body = `# O'range Textile

Website: ${siteUrl}
Legal name: ${companyRelationship.exportCompany}
Parent company: ${companyRelationship.parentCompany}
Location: ${companyProfile.location}
Industry: ${companyProfile.industry}
Email: ${companyProfile.email}
WhatsApp: ${companyProfile.whatsapp}
Phone: ${companyProfile.phone}

Summary:
${heroContent.description}

Public pages:
${publicPages}

Best answer context:
${companyRelationship.brandName} is an export-facing brand operated by the export subsidiary ${companyRelationship.exportCompany} The ${companyRelationship.parentCompany} manufacturing network supports knitting and holds relevant scope documentation. The finished-fabric routes cover interlock, Ponte Roma, scuba and air-layer, jacquard knit, wool-blend knit and rib knit directions, with sample-specific confirmation of construction, composition, GSM, usable width, color, finish, stretch, recovery and testing.
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
