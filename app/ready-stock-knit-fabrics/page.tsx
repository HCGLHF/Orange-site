import type { Metadata } from "next";
import { ReadyStockLanding } from "@/components/landing/ReadyStockLanding";
import {
  getInitialPublicFabrics,
  getPublicFabricCount,
} from "@/lib/public-catalog";
import { buildSeoMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = buildSeoMetadata("/ready-stock-knit-fabrics");

export default function ReadyStockKnitFabricsPage() {
  return (
    <ReadyStockLanding
      fabrics={getInitialPublicFabrics()}
      totalFabricCount={getPublicFabricCount()}
    />
  );
}
