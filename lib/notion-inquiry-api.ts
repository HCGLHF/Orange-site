/**
 * 在「客户询价管理」数据库中创建一条页面（Notion REST API）。
 * 属性名、库 ID 可通过环境变量覆盖，以匹配你的 Notion 实际 schema。
 */

const NOTION_API_VERSION = "2022-06-28";

export type InquiryLineItem = {
  notionPageId?: string | null;
  name: string;
  quantityMeters: number;
  composition?: string;
  weight?: number;
  stockStatus?: string;
};

function normalizeNotionPageId(raw: string): string | null {
  const compact = raw.replace(/-/g, "").trim();
  if (!/^[0-9a-f]{32}$/i.test(compact)) return null;
  return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`;
}

function normalizeDatabaseId(raw: string | undefined): string {
  if (!raw) return "";
  const compact = raw.replace(/-/g, "").trim();
  if (!/^[0-9a-f]{32}$/i.test(compact)) return "";
  return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`;
}

function richTextSegments(full: string, maxChunk = 2000) {
  const segments: Array<{ text: { content: string } }> = [];
  for (let i = 0; i < full.length; i += maxChunk) {
    segments.push({ text: { content: full.slice(i, i + maxChunk) } });
  }
  return segments.length > 0 ? segments : [{ text: { content: "" } }];
}

type FieldKind = "title" | "rich_text" | "select" | "status";

function parseFieldKind(
  raw: string | undefined,
  fallback: FieldKind
): FieldKind {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "title" || v === "rich_text" || v === "select" || v === "status")
    return v;
  return fallback;
}

function inquiryEnv() {
  const databaseId = normalizeDatabaseId(process.env.NOTION_INQUIRY_DATABASE_ID);
  const token = process.env.NOTION_TOKEN;
  const companyRaw = process.env.NOTION_INQUIRY_PROP_COMPANY;
  const propCompany =
    companyRaw === undefined || companyRaw === null
      ? "公司名称"
      : companyRaw.trim();
  const omitCompany =
    propCompany === "" ||
    propCompany === "-" ||
    propCompany.toLowerCase() === "omit";

  return {
    databaseId,
    token: token ?? "",
    propTitle: process.env.NOTION_INQUIRY_PROP_TITLE ?? "客户名称",
    /** 客户名称列在 Notion 里是 title 还是 rich_text */
    customerFieldKind: parseFieldKind(
      process.env.NOTION_INQUIRY_CUSTOMER_PROP_TYPE,
      "title"
    ),
    propPhone: process.env.NOTION_INQUIRY_PROP_PHONE ?? "联系方式",
    propEmail: process.env.NOTION_INQUIRY_PROP_EMAIL ?? "邮箱",
    propCompany: omitCompany ? "" : propCompany,
    omitCompany,
    propStatus: process.env.NOTION_INQUIRY_PROP_STATUS ?? "询价状态",
    statusNew: process.env.NOTION_INQUIRY_STATUS_NEW ?? "新询价",
    statusFieldKind: parseFieldKind(
      process.env.NOTION_INQUIRY_STATUS_PROP_TYPE,
      "select"
    ),
    propRelation: process.env.NOTION_INQUIRY_PROP_RELATION ?? "诗橙面料库",
    propPriority: process.env.NOTION_INQUIRY_PROP_PRIORITY ?? "优先级",
    priorityDefault: process.env.NOTION_INQUIRY_PRIORITY_DEFAULT ?? "中",
    priorityFieldKind: parseFieldKind(
      process.env.NOTION_INQUIRY_PRIORITY_PROP_TYPE,
      "select"
    ),
    propNotes: process.env.NOTION_INQUIRY_PROP_NOTES ?? "备注",
  };
}

export function isNotionInquiryConfigured(): boolean {
  const { databaseId, token } = inquiryEnv();
  return Boolean(databaseId && token);
}

export type CreateNotionInquiryInput = {
  customer: string;
  company?: string;
  phone: string;
  email?: string;
  notes?: string;
  items: InquiryLineItem[];
};

/** Notion 错误体（常见字段），见 https://developers.notion.com/reference/status-codes */
type NotionErrorBody = {
  object?: string;
  status?: number;
  code?: string;
  message?: string;
};

/**
 * 根据 Notion 返回的 `code` 给出可操作的排查说明（便于对照日志 / 接口响应）。
 */
export function explainNotionInquiryError(raw: unknown): {
  code: string;
  notionMessage: string;
  hint: string;
} {
  const body =
    raw && typeof raw === "object"
      ? (raw as NotionErrorBody)
      : ({} as NotionErrorBody);
  const code = typeof body.code === "string" ? body.code : "unknown";
  const notionMessage =
    typeof body.message === "string" ? body.message : "";

  const hints: Record<string, string> = {
    unauthorized:
      "unauthorized：Token 问题。检查 NOTION_TOKEN 是否正确、集成密钥是否未过期，以及是否已重新生成后未更新环境变量。",
    object_not_found:
      "object_not_found：数据库或页面 ID 错误。核对 NOTION_INQUIRY_DATABASE_ID 是否为「客户询价管理」库 ID；若报错在 relation 上，检查面料页是否属于关联库、NOTION_INQUIRY_PROP_RELATION 是否指向正确属性。",
    validation_error:
      "validation_error：字段名或类型与 Notion 库不一致。核对 NOTION_INQUIRY_PROP_* 属性名；用 NOTION_INQUIRY_CUSTOMER_PROP_TYPE=rich_text|title、NOTION_INQUIRY_STATUS_PROP_TYPE=status|select、NOTION_INQUIRY_PRIORITY_PROP_TYPE=status|select 对齐列类型；无「公司」列时设 NOTION_INQUIRY_PROP_COMPANY=-。选项名（如「新询价」「中」）须与库中完全一致。",
    restricted_resource:
      "restricted_resource：集成无权限。在 Notion 目标数据库页面菜单中将连接（集成）加入，并授予可写入权限。",
    conflict_error:
      "conflict_error：与当前数据状态冲突，可稍后重试或检查是否重复提交。",
    invalid_json:
      "invalid_json：请求 JSON 格式无效（多为服务端组装 body 问题）。",
    rate_limited:
      "rate_limited：请求过于频繁，请稍后重试。",
  };

  const base = hints[code];
  const hint = base
    ? `${base}${notionMessage ? ` Notion: ${notionMessage}` : ""}`
    : notionMessage
      ? `Notion 错误 [${code}]: ${notionMessage}`
      : `Notion 错误 [${code}]，请查看 details 原始响应。`;

  return { code, notionMessage, hint };
}

export type CreateNotionInquiryResult =
  | { ok: true; pageId: string; pageUrl: string }
  | {
      ok: false;
      message: string;
      notionCode?: string;
      notionError?: unknown;
    };

/**
 * Notion 每个数据库仅允许一个 title 属性：这里用一条标题汇总客户与款数。
 */
export async function createNotionInquiryPage(
  input: CreateNotionInquiryInput
): Promise<CreateNotionInquiryResult> {
  const env = inquiryEnv();
  if (!env.databaseId || !env.token) {
    return { ok: false, message: "Notion 询价库未配置（NOTION_INQUIRY_DATABASE_ID / NOTION_TOKEN）" };
  }

  const { customer, company, phone, email, notes, items } = input;

  const relationIds = items
    .map((it) => (it.notionPageId ? normalizeNotionPageId(String(it.notionPageId)) : null))
    .filter((id): id is string => Boolean(id));

  const fabricLines = items.map((it, index) => {
    const parts = [
      `面料${index + 1}: ${it.name}`,
      `${it.quantityMeters}米`,
      it.composition,
      typeof it.weight === "number" ? `${it.weight}g` : undefined,
      it.stockStatus,
    ].filter(Boolean);
    return parts.join(" · ");
  });

  const fullNotes = [
    fabricLines.join("\n"),
    "",
    `客户备注: ${notes?.trim() || "无"}`,
    `联系电话: ${phone}`,
    email?.trim() ? `邮箱: ${email.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const titleText = `${customer} · ${items.length}款面料询价`;

  const properties: Record<string, unknown> = {};

  if (env.customerFieldKind === "rich_text") {
    properties[env.propTitle] = {
      rich_text: [{ text: { content: titleText.slice(0, 2000) } }],
    };
  } else {
    properties[env.propTitle] = {
      title: [{ text: { content: titleText.slice(0, 2000) } }],
    };
  }

  properties[env.propPhone] = { phone_number: phone };

  if (!env.omitCompany && env.propCompany) {
    properties[env.propCompany] = {
      rich_text: [
        {
          text: {
            content: (company?.trim() || "个人客户").slice(0, 2000),
          },
        },
      ],
    };
  }

  if (env.statusFieldKind === "status") {
    properties[env.propStatus] = { status: { name: env.statusNew } };
  } else {
    properties[env.propStatus] = { select: { name: env.statusNew } };
  }

  if (env.priorityFieldKind === "status") {
    properties[env.propPriority] = { status: { name: env.priorityDefault } };
  } else {
    properties[env.propPriority] = { select: { name: env.priorityDefault } };
  }

  properties[env.propNotes] = {
    rich_text: richTextSegments(fullNotes),
  };

  if (email?.trim()) {
    properties[env.propEmail] = { email: email.trim() };
  }

  if (relationIds.length > 0) {
    properties[env.propRelation] = {
      relation: relationIds.map((id) => ({ id })),
    };
  }

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.token}`,
      "Notion-Version": NOTION_API_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: env.databaseId },
      properties,
    }),
  });

  if (!response.ok) {
    let notionError: unknown;
    try {
      notionError = await response.json();
    } catch {
      notionError = await response.text();
    }
    const { code, hint } = explainNotionInquiryError(notionError);
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[Notion inquiry]",
        response.status,
        code,
        hint,
        notionError
      );
    }
    return {
      ok: false,
      message: hint,
      notionCode: code,
      notionError,
    };
  }

  const data = (await response.json()) as { id: string };
  const pageId = data.id;
  const pageUrl = `https://www.notion.so/${pageId.replace(/-/g, "")}`;

  return { ok: true, pageId, pageUrl };
}
