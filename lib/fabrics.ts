import { fabrics as fallbackFabrics, type Fabric } from "@/lib/data";
import type { NotionFabric } from "@/lib/notion-api";
import { getFabricsFromNotion } from "@/lib/notion";

/** 无真实图片时留空，由 FabricCard 用渐变首字占位（避免 placehold.co 中文渲染成问号图） */
const NO_IMAGE = "";

/** 将 Notion 行转为首页 / FabricCard 使用的 Fabric（id 为 Notion 页 UUID） */
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
  /** Notion 请求成功但返回 0 条（页面可展示空态，不用本地兜底） */
  notionEmpty: boolean;
};

/**
 * 从 Notion 拉取并映射为 Fabric。失败时用本地 fallback；仅「成功且 0 条」时 notionEmpty。
 */
export async function resolveFabricsFromNotion(): Promise<FabricsNotionResult> {
  try {
    const rows = await getFabricsFromNotion();
    if (process.env.NODE_ENV === "development") {
      console.log("Notion 面料数:", rows.length);
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

/** API 等：Notion 无数据时仍返回本地示例列表 */
export async function getFabrics(): Promise<Fabric[]> {
  const { fabrics, notionEmpty } = await resolveFabricsFromNotion();
  if (notionEmpty) {
    return fallbackFabrics;
  }
  return fabrics;
}
