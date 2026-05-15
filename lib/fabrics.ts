import { fabrics as fallbackFabrics, type Fabric } from "@/lib/data";
import type { NotionFabric } from "@/lib/notion-api";
import { getFabricsFromNotion } from "@/lib/notion";

const NO_IMAGE = "";

export function notionRowsToFabrics(notionRows: NotionFabric[]): Fabric[] {
  return notionRows.map((fabric) => ({
    id: fabric.id,
    notionPageId: fabric.id,
    name: fabric.name,
    composition: fabric.composition,
    weight: fabric.weight,
    width: fabric.width,
    description: fabric.description,
    tags:
      fabric.tags.length > 0
        ? fabric.tags
        : fabric.stockStatus
          ? [fabric.stockStatus]
          : [],
    textureImage: fabric.images[0] || fabric.imageUrl || NO_IMAGE,
    sceneImage: fabric.images[1] || NO_IMAGE,
    stockStatus: fabric.stockStatus,
    images: fabric.images,
    scenarios: fabric.scenarios.length > 0 ? fabric.scenarios : undefined,
  }));
}

export type FabricsNotionResult = {
  fabrics: Fabric[];
  notionEmpty: boolean;
};

export async function resolveFabricsFromNotion(): Promise<FabricsNotionResult> {
  try {
    const rows = await getFabricsFromNotion();
    if (process.env.NODE_ENV === "development") {
      console.log("Notion fabric rows:", rows.length);
    }
    if (rows.length === 0) {
      return { fabrics: [], notionEmpty: true };
    }
    return { fabrics: notionRowsToFabrics(rows), notionEmpty: false };
  } catch (error) {
    console.error("Fabrics server fetch error:", error);
    return { fabrics: fallbackFabrics, notionEmpty: false };
  }
}

export async function getFabrics(): Promise<Fabric[]> {
  const { fabrics, notionEmpty } = await resolveFabricsFromNotion();
  if (notionEmpty) {
    return fallbackFabrics;
  }
  return fabrics;
}
