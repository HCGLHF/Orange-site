import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FinishedFabricPage } from "@/components/finished-fabric/FinishedFabricPage";
import { getFinishedFabricPage } from "@/lib/finished-fabric-content";
import { buildSeoMetadata } from "@/lib/seo";

const page = getFinishedFabricPage("/finished-double-knit-fabrics");

export const dynamic = "force-static";

export const metadata: Metadata = buildSeoMetadata(
  "/finished-double-knit-fabrics"
);

export default function FinishedDoubleKnitFabricsPage() {
  if (!page) notFound();
  return <FinishedFabricPage page={page} />;
}
