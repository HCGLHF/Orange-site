import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FinishedFabricPage } from "@/components/finished-fabric/FinishedFabricPage";
import { getFinishedFabricPage } from "@/lib/finished-fabric-content";
import { buildSeoMetadata } from "@/lib/seo";

const page = getFinishedFabricPage("/blog");

export const dynamic = "force-static";

export const metadata: Metadata = buildSeoMetadata("/blog");

export default function BlogIndexPage() {
  if (!page) notFound();
  return <FinishedFabricPage page={page} />;
}
