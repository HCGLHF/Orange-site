import type { Metadata } from "next";
import { CustomDevelopmentLanding } from "@/components/landing/CustomDevelopmentLanding";
import { buildSeoMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = buildSeoMetadata(
  "/custom-knit-fabric-development"
);

export default function CustomKnitFabricDevelopmentPage() {
  return <CustomDevelopmentLanding />;
}
