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
  if (v === "title" || v === "rich_text" || v === "select" || v === "status") {
    return v;
  }
  return fallback;
}

function inquiryEnv() {
  const databaseId = normalizeDatabaseId(process.env.NOTION_INQUIRY_DATABASE_ID);
  const token = process.env.NOTION_TOKEN;
  const companyRaw = process.env.NOTION_INQUIRY_PROP_COMPANY;
  const propCompany =
    companyRaw === undefined || companyRaw === null
      ? "Company"
      : companyRaw.trim();
  const omitCompany =
    propCompany === "" ||
    propCompany === "-" ||
    propCompany.toLowerCase() === "omit";

  return {
    databaseId,
    token: token ?? "",
    propTitle: process.env.NOTION_INQUIRY_PROP_TITLE ?? "Customer",
    customerFieldKind: parseFieldKind(
      process.env.NOTION_INQUIRY_CUSTOMER_PROP_TYPE,
      "title"
    ),
    propPhone: process.env.NOTION_INQUIRY_PROP_PHONE ?? "Phone",
    propEmail: process.env.NOTION_INQUIRY_PROP_EMAIL ?? "Email",
    propCompany: omitCompany ? "" : propCompany,
    omitCompany,
    propStatus: process.env.NOTION_INQUIRY_PROP_STATUS ?? "Status",
    statusNew: process.env.NOTION_INQUIRY_STATUS_NEW ?? "New inquiry",
    statusFieldKind: parseFieldKind(
      process.env.NOTION_INQUIRY_STATUS_PROP_TYPE,
      "select"
    ),
    propRelation: process.env.NOTION_INQUIRY_PROP_RELATION ?? "Fabrics",
    propPriority: process.env.NOTION_INQUIRY_PROP_PRIORITY ?? "Priority",
    priorityDefault: process.env.NOTION_INQUIRY_PRIORITY_DEFAULT ?? "Medium",
    priorityFieldKind: parseFieldKind(
      process.env.NOTION_INQUIRY_PRIORITY_PROP_TYPE,
      "select"
    ),
    propNotes: process.env.NOTION_INQUIRY_PROP_NOTES ?? "Notes",
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

type NotionErrorBody = {
  object?: string;
  status?: number;
  code?: string;
  message?: string;
};

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
      "Unauthorized Notion request. Check NOTION_TOKEN and confirm the integration still has access.",
    object_not_found:
      "Notion database or related page was not found. Check NOTION_INQUIRY_DATABASE_ID and any relation property values.",
    validation_error:
      "Notion validation failed. Check NOTION_INQUIRY_PROP_* names and field type overrides.",
    restricted_resource:
      "The Notion integration does not have permission to write to the target database.",
    conflict_error:
      "Notion reported a data conflict. Retry later or check for duplicate submissions.",
    invalid_json:
      "The Notion request body was invalid JSON.",
    rate_limited:
      "Notion rate limited the request. Retry later.",
  };

  const base = hints[code];
  const hint = base
    ? `${base}${notionMessage ? ` Notion: ${notionMessage}` : ""}`
    : notionMessage
      ? `Notion error [${code}]: ${notionMessage}`
      : `Notion error [${code}]. Check the raw details response.`;

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

export async function createNotionInquiryPage(
  input: CreateNotionInquiryInput
): Promise<CreateNotionInquiryResult> {
  const env = inquiryEnv();
  if (!env.databaseId || !env.token) {
    return {
      ok: false,
      message:
        "Notion inquiry database is not configured. Set NOTION_INQUIRY_DATABASE_ID and NOTION_TOKEN.",
    };
  }

  const { customer, company, phone, email, notes, items } = input;

  const relationIds = items
    .map((it) => (it.notionPageId ? normalizeNotionPageId(String(it.notionPageId)) : null))
    .filter((id): id is string => Boolean(id));

  const fabricLines = items.map((it, index) => {
    const parts = [
      `Fabric ${index + 1}: ${it.name}`,
      `${it.quantityMeters} m`,
      it.composition,
      typeof it.weight === "number" ? `${it.weight} g` : undefined,
      it.stockStatus,
    ].filter(Boolean);
    return parts.join(" | ");
  });

  const fullNotes = [
    fabricLines.join("\n"),
    "",
    `Customer notes: ${notes?.trim() || "None"}`,
    `Phone: ${phone}`,
    email?.trim() ? `Email: ${email.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const titleText = `${customer} | ${items.length} fabric inquiry`;

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
            content: (company?.trim() || "Individual buyer").slice(0, 2000),
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
