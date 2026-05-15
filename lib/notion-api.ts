/**
 * 使用 Notion 原生 REST API（databases.query），不依赖 @notionhq/client 版本。
 */

const NOTION_API_VERSION = "2022-06-28";

export type NotionFabric = {
  id: string;
  name: string;
  composition: string;
  weight: number;
  width: number;
  description: string;
  imageUrl: string;
  images: string[];
  stockStatus: string;
  tags: string[];
  /** Notion「应用场景」Multi-select */
  scenarios: string[];
  status: string;
};

type NotionTextItem = { plain_text?: string };
type NotionSelectItem = { name?: string };
type NotionProperty = {
  title?: NotionTextItem[];
  rich_text?: NotionTextItem[];
  number?: number;
  url?: string;
  multi_select?: NotionSelectItem[];
  select?: NotionSelectItem;
  /** Notion「状态」列若为 Status 类型（非 Select），取此字段 */
  status?: { name?: string };
  files?: Array<{
    file?: { url?: string };
    external?: { url?: string };
  }>;
};

type NotionPage = { id: string; properties?: Record<string, NotionProperty> };

function joinTitlePlainText(title?: NotionTextItem[]): string {
  if (!title?.length) return "";
  return title.map((t) => t.plain_text ?? "").join("").trim();
}

function joinRichPlainText(prop: NotionProperty | undefined): string {
  if (!prop?.rich_text?.length) return "";
  return prop.rich_text.map((t) => t.plain_text ?? "").join("").trim();
}

/** 从文本里抽出第一个数字（兼容「180 g/m²」等） */
function parseLooseNumber(s: string): number | undefined {
  const m = s.replace(/,/g, " ").replace(/，/g, " ").match(/-?\d+(?:\.\d+)?/);
  if (!m) return undefined;
  const n = parseFloat(m[0]);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * 依次尝试多个属性名：Number 类型，或 Rich text / Title 里可解析的数字。
 * Notion 里若列名是英文或写成文本，也能读到。
 */
function readNumericField(
  properties: Record<string, NotionProperty>,
  keys: string[]
): number {
  for (const key of keys) {
    const p = properties[key];
    const num = p?.number;
    if (typeof num === "number" && Number.isFinite(num)) return num;
    const fromRich = joinRichPlainText(p);
    if (fromRich) {
      const n = parseLooseNumber(fromRich);
      if (n !== undefined) return n;
    }
    const fromTitle = joinTitlePlainText(p?.title);
    if (fromTitle) {
      const n = parseLooseNumber(fromTitle);
      if (n !== undefined) return n;
    }
  }
  return 0;
}

const STOCK_PROPERTY_KEYS = ["状态", "库存状态", "库存", "Status", "Stock"] as const;

function normalizeNotionStockName(name: string): string {
  const t = name.trim();
  const lower = t.toLowerCase();
  if (lower === "out of stock" || lower === "sold out") return "缺货";
  const map: Record<string, string> = {
    缺貨: "缺货",
    无货: "缺货",
    售完: "缺货",
    售罄: "缺货",
  };
  return map[t] ?? t;
}

/** 兼容 Select 与 Notion Status 列类型，并尝试多个常见列名 */
function readStockStatus(properties: Record<string, NotionProperty>): string {
  for (const key of STOCK_PROPERTY_KEYS) {
    const p = properties[key];
    if (!p) continue;
    const fromSelect = p.select?.name?.trim();
    if (fromSelect) return normalizeNotionStockName(fromSelect);
    const fromStatus = p.status?.name?.trim();
    if (fromStatus) return normalizeNotionStockName(fromStatus);
  }
  return "现货";
}

function mapPageToFabric(page: NotionPage): NotionFabric {
  const properties = page.properties ?? {};

  const images =
    properties["图片"]?.files
      ?.map((file) => file.file?.url ?? file.external?.url ?? "")
      .filter(Boolean) ?? [];
  const imageUrl = properties["图片URL"]?.url ?? images[0] ?? "";
  const stockStatus = readStockStatus(properties);
  const status = stockStatus;
  /** Notion 列「应用场景」multi_select */
  const scenarios =
    properties["应用场景"]?.multi_select?.map((s) => s.name ?? "").filter(Boolean) ??
    [];

  return {
    id: page.id,
    name: joinTitlePlainText(properties["名称"]?.title) || "未命名",
    composition: joinRichPlainText(properties["成分"]),
    /** 克重：优先「克重」，兼容 Weight / GSM 及文本列 */
    weight: readNumericField(properties, [
      "克重",
      "Weight",
      "GSM",
      "gsm",
      "克重 g/m²",
      "克重(g/m²)",
    ]),
    /** 门幅：优先「门幅」，兼容 Width / 幅宽 */
    width: readNumericField(properties, ["门幅", "Width", "幅宽", "门幅 cm", "门幅(cm)"]),
    description: joinRichPlainText(properties["描述"]),
    imageUrl,
    images,
    stockStatus,
    tags: properties["标签"]?.multi_select?.map((tag) => tag.name ?? "") ?? [],
    scenarios,
    status,
  };
}

export async function getFabricsFromNotion(): Promise<NotionFabric[]> {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const token = process.env.NOTION_TOKEN;

  if (!databaseId || !token) {
    throw new Error("Missing NOTION_DATABASE_ID or NOTION_TOKEN");
  }

  const url = `https://api.notion.com/v1/databases/${databaseId}/query`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_API_VERSION,
    "Content-Type": "application/json",
  } as const;

  const allPages: NotionPage[] = [];
  let startCursor: string | undefined;

  do {
    const body: Record<string, unknown> = {
      sorts: [{ property: "名称", direction: "ascending" }],
    };
    if (startCursor) body.start_cursor = startCursor;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const err = (await response.json()) as { message?: string };
        detail = err.message ?? JSON.stringify(err);
      } catch {
        detail = await response.text();
      }
      throw new Error(`Notion API error: ${detail}`);
    }

    const data = (await response.json()) as {
      results?: NotionPage[];
      has_more?: boolean;
      next_cursor?: string | null;
    };

    allPages.push(...(data.results ?? []));
    startCursor =
      data.has_more && data.next_cursor ? data.next_cursor : undefined;
  } while (startCursor);

  if (process.env.NODE_ENV === "development") {
    console.log("✅ Notion 返回数据条数:", allPages.length);
  }

  if (process.env.NOTION_DEBUG === "1" && allPages[0]) {
    const props = allPages[0].properties ?? {};
    console.log("所有字段:", Object.keys(props));
    console.log("状态（用于库存展示）原始数据:", props["状态"]);
  }

  return allPages.map((page) => {
    const fabric = mapPageToFabric(page);
    if (process.env.NODE_ENV === "development") {
      console.log(`📦 ${fabric.name}: 状态=[${fabric.stockStatus}]`);
    }
    return fabric;
  });
}
