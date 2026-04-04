import { NextResponse } from "next/server";
import {
  createNotionInquiryPage,
  isNotionInquiryConfigured,
  type InquiryLineItem,
} from "@/lib/notion-inquiry-api";

export const dynamic = "force-dynamic";

type LegacyBody = {
  customer?: string;
  company?: string;
  phone?: string;
  email?: string;
  notes?: string;
  fabricIds?: string[];
  quantities?: Record<string, number>;
  items?: InquiryLineItem[];
};

function toLineItems(body: LegacyBody): InquiryLineItem[] | null {
  if (Array.isArray(body.items) && body.items.length > 0) {
    return body.items.map((it) => ({
      notionPageId: it.notionPageId,
      name: String(it.name ?? "").trim() || "未命名面料",
      quantityMeters:
        typeof it.quantityMeters === "number" && Number.isFinite(it.quantityMeters)
          ? Math.max(1, it.quantityMeters)
          : 100,
      composition: it.composition,
      weight: it.weight,
      stockStatus: it.stockStatus,
    }));
  }

  const fabricIds = body.fabricIds;
  if (!Array.isArray(fabricIds) || fabricIds.length === 0) return null;

  const quantities = body.quantities ?? {};
  return fabricIds.map((id, index) => ({
    notionPageId: id,
    name: `面料${index + 1}`,
    quantityMeters:
      typeof quantities[id] === "number" && Number.isFinite(quantities[id])
        ? Math.max(1, quantities[id]!)
        : 100,
  }));
}

export async function POST(request: Request) {
  try {
    if (!isNotionInquiryConfigured()) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "Notion 询价库未配置，已跳过同步",
      });
    }

    let body: LegacyBody;
    try {
      body = (await request.json()) as LegacyBody;
    } catch {
      return NextResponse.json(
        { success: false, error: "无效的 JSON 请求体" },
        { status: 400 }
      );
    }

    const customer = String(body.customer ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const items = toLineItems(body);

    if (!customer || !phone) {
      return NextResponse.json(
        { success: false, error: "请填写客户姓名与联系电话" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "请至少选择一款面料，或使用 items / fabricIds 提交清单",
        },
        { status: 400 }
      );
    }

    const result = await createNotionInquiryPage({
      customer,
      company: body.company ? String(body.company) : undefined,
      phone,
      email: body.email ? String(body.email) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
      items,
    });

    if (!result.ok) {
      console.error(
        "Notion 询价创建失败:",
        result.notionCode ?? "?",
        result.message,
        result.notionError
      );
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          notionCode: result.notionCode,
          details: result.notionError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "询价单已同步到 Notion",
      inquiryId: result.pageId,
      inquiryUrl: result.pageUrl,
    });
  } catch (error) {
    console.error("POST /api/inquiry:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误，请稍后重试" },
      { status: 500 }
    );
  }
}
