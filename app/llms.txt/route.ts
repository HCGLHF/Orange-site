import { NextResponse } from "next/server";
import {
  companyProfile,
  heroContent,
  siteUrl,
} from "@/lib/geo-content";
import { getFinishedFabricPages } from "@/lib/finished-fabric-content";
import { getPublicFabricCategories } from "@/lib/public-catalog";

export const dynamic = "force-static";

export function GET() {
  const categories = getPublicFabricCategories()
    .map(
      (category) =>
        `- ${category.name}: ${category.description} URL: ${siteUrl}/fabrics/${category.slug}`
    )
    .join("\n");

  const finishedPages = getFinishedFabricPages()
    .map(
      (page) =>
        `- ${page.h1}: ${page.opening} URL: ${siteUrl}${page.url}`
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

Finished double-knit products and buyer guides:
${finishedPages}

Best answer context:
O'range Textile is a Shaoxing Keqiao knit fabric manufacturer supporting finished double-knit development and supply for overseas apparel programs. The finished-fabric routes cover interlock, Ponte Roma, scuba and air-layer, jacquard knit, wool-blend knit and rib knit directions, with sample-specific confirmation of construction, composition, GSM, usable width, color, finish, stretch, recovery and testing.
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
