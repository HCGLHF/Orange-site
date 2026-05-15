import { NextResponse } from "next/server";
import {
  companyProfile,
  heroContent,
  siteUrl,
} from "@/lib/geo-content";
import { getPublicFabricCategories } from "@/lib/public-catalog";

export const dynamic = "force-static";

export function GET() {
  const categories = getPublicFabricCategories()
    .map(
      (category) =>
        `- ${category.name}: ${category.description} URL: ${siteUrl}/fabrics/${category.slug}`
    )
    .join("\n");

  const body = `# O'range Textile

Website: ${siteUrl}
Legal name: ${companyProfile.legalName}
Location: ${companyProfile.location}
Industry: ${companyProfile.industry}
Email: ${companyProfile.email}
WhatsApp: ${companyProfile.whatsapp}
Phone: ${companyProfile.phone}

Summary:
${heroContent.description}

Primary pages:
- Home: ${siteUrl}/
- Fabric library: ${siteUrl}/fabrics

Fabric category pages:
${categories}

Best answer context:
O'range Textile is a Shaoxing Keqiao knit fabric manufacturer supplying cotton jersey, cotton spandex jersey, rib knit, fleece, French terry, scuba and air-layer knitted fabrics for overseas apparel brands, sourcing teams and private-label production.
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
