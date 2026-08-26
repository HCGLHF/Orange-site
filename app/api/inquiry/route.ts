import { NextResponse } from "next/server";
import {
  sendInquiryEmail,
  type InquiryEmailInput,
  type InquiryItem,
} from "@/lib/inquiry-email";

export const dynamic = "force-dynamic";

const SUBMISSION_ID_PATTERN = /^[A-Za-z0-9_-]{16,100}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ITEM_METADATA_FIELDS = [
  "quantity",
  "composition",
  "weight",
  "stockStatus",
] as const;

type JsonRecord = Record<string, unknown>;
type ReadStringResult = string | undefined | null;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(
  value: unknown,
  maxLength: number,
  required = false,
): ReadStringResult {
  if (value === undefined || value === null) {
    return required ? null : undefined;
  }

  if (typeof value !== "string") return null;

  const normalized = value.trim();
  if (!normalized) return required ? null : undefined;
  if (normalized.length > maxLength) return null;

  return normalized;
}

function hasOwn(record: JsonRecord, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function normalizeItem(value: unknown): InquiryItem | null {
  if (!isRecord(value)) return null;

  const name = readString(value.name, 240, true);
  if (!name) return null;

  const normalized: InquiryItem = { name };

  for (const field of ITEM_METADATA_FIELDS) {
    if (!hasOwn(value, field)) continue;

    const fieldValue = readString(value[field], 240);
    if (fieldValue === null) return null;
    normalized[field] = fieldValue;
  }

  return normalized;
}

function normalizeItems(value: unknown): InquiryItem[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 50) return null;

  const items: InquiryItem[] = [];
  for (const item of value) {
    const normalized = normalizeItem(item);
    if (!normalized) return null;
    items.push(normalized);
  }

  return items;
}

function normalizeInput(value: unknown): InquiryEmailInput | null {
  if (!isRecord(value)) return null;

  if (value.honeypot !== undefined) {
    if (typeof value.honeypot !== "string" || value.honeypot.trim()) return null;
  }

  const type = readString(value.type, 6, true);
  const submissionId = readString(value.submissionId, 100, true);
  const customer = readString(value.customer, 120, true);
  const email = readString(value.email, 254, true);
  const company = readString(value.company, 160);
  const phone = readString(value.phone, 60);
  const notes = readString(value.notes, 4000);
  const sourceUrl = readString(value.sourceUrl, 500);
  const items = normalizeItems(value.items);

  if (
    (type !== "single" && type !== "batch") ||
    !submissionId ||
    !SUBMISSION_ID_PATTERN.test(submissionId) ||
    !customer ||
    !email ||
    !EMAIL_PATTERN.test(email) ||
    company === null ||
    phone === null ||
    notes === null ||
    sourceUrl === null ||
    !items ||
    (type === "batch" && items.length === 0)
  ) {
    return null;
  }

  return {
    type,
    submissionId,
    customer,
    email,
    company,
    phone,
    notes,
    sourceUrl,
    items,
  };
}

function invalidRequest() {
  return NextResponse.json(
    { success: false, error: "Invalid request." },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase();
  if (!contentType?.startsWith("application/json")) {
    return NextResponse.json(
      { success: false, error: "Unsupported content type." },
      { status: 415 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidRequest();
  }

  const input = normalizeInput(body);
  if (!input) return invalidRequest();

  try {
    const result = await sendInquiryEmail(input);
    return NextResponse.json({ success: true, inquiryId: result.id });
  } catch (error) {
    console.error("Inquiry email delivery failed.", {
      submissionId: input.submissionId,
      errorType: error instanceof Error ? "Error" : "Unknown",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Submission failed. Please try again or email us directly.",
      },
      { status: 502 },
    );
  }
}
