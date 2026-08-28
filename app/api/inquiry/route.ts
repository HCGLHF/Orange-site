import { NextResponse } from "next/server";
import {
  sendInquiryEmail,
  type InquiryEmailInput,
  type InquiryItem,
} from "@/lib/inquiry-email";

export const dynamic = "force-dynamic";

const REQUEST_BODY_LIMIT_BYTES = 32 * 1024;
const SUBMISSION_ID_PATTERN = /^[A-Za-z0-9_-]{16,100}$/;
const EMAIL_LOCAL_PART_PATTERN = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
const EMAIL_DOMAIN_LABEL_PATTERN =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
const ITEM_METADATA_FIELDS = [
  "quantity",
  "composition",
  "weight",
  "stockStatus",
] as const;

type JsonRecord = Record<string, unknown>;
type ReadStringResult = string | undefined | null;
type ReadBodyResult =
  | { status: "ok"; body: unknown }
  | { status: "invalid" }
  | { status: "too-large" };

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

function isReasonableEmail(value: string): boolean {
  const atIndex = value.indexOf("@");
  if (atIndex <= 0 || atIndex !== value.lastIndexOf("@")) return false;

  const localPart = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);
  if (
    localPart.length > 64 ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..") ||
    !EMAIL_LOCAL_PART_PATTERN.test(localPart)
  ) {
    return false;
  }

  const domainLabels = domain.split(".");
  return (
    domainLabels.length >= 2 &&
    domainLabels.every((label) => EMAIL_DOMAIN_LABEL_PATTERN.test(label))
  );
}

function readSourceUrl(value: unknown): ReadStringResult {
  const sourceUrl = readString(value, 500);
  if (!sourceUrl) return sourceUrl;

  try {
    const parsed = new URL(sourceUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return null;
  }
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
    if (typeof value.honeypot !== "string") return null;
  }

  const type = readString(value.type, 6, true);
  const submissionId = readString(value.submissionId, 100, true);
  const customer = readString(value.customer, 120, true);
  const email = readString(value.email, 254, true);
  const company = readString(value.company, 160);
  const phone = readString(value.phone, 60);
  const notes = readString(value.notes, 4000);
  const sourceUrl = readSourceUrl(value.sourceUrl);
  const items = normalizeItems(value.items);

  if (
    (type !== "single" && type !== "batch") ||
    !submissionId ||
    !SUBMISSION_ID_PATTERN.test(submissionId) ||
    !customer ||
    !email ||
    !isReasonableEmail(email) ||
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

function requestTooLarge() {
  return NextResponse.json(
    { success: false, error: "Request too large." },
    { status: 413 },
  );
}

function acceptedHoneypot() {
  return NextResponse.json({ success: true, inquiryId: "accepted" });
}

function hasOversizedDeclaredLength(request: Request): boolean {
  const value = request.headers.get("content-length")?.trim();
  if (!value || !/^\d+$/.test(value)) return false;

  return BigInt(value) > BigInt(REQUEST_BODY_LIMIT_BYTES);
}

async function readJsonBody(request: Request): Promise<ReadBodyResult> {
  if (hasOversizedDeclaredLength(request)) return { status: "too-large" };
  if (!request.body) return { status: "invalid" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value.byteLength > REQUEST_BODY_LIMIT_BYTES - byteLength) {
        try {
          await reader.cancel();
        } catch {
          // The request is already rejected; cancellation is best effort.
        }
        return { status: "too-large" };
      }

      byteLength += value.byteLength;
      chunks.push(value);
    }
  } catch {
    return { status: "invalid" };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { status: "ok", body: JSON.parse(text) };
  } catch {
    return { status: "invalid" };
  }
}

export async function POST(request: Request) {
  const mediaType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  if (mediaType !== "application/json") {
    return NextResponse.json(
      { success: false, error: "Unsupported content type." },
      { status: 415 },
    );
  }

  const parsedBody = await readJsonBody(request);
  if (parsedBody.status === "too-large") return requestTooLarge();
  if (parsedBody.status === "invalid") return invalidRequest();

  if (
    isRecord(parsedBody.body) &&
    typeof parsedBody.body.honeypot === "string" &&
    parsedBody.body.honeypot.trim()
  ) {
    return acceptedHoneypot();
  }

  const input = normalizeInput(parsedBody.body);
  if (!input) return invalidRequest();

  try {
    const result = await sendInquiryEmail(input);
    return NextResponse.json({ success: true, inquiryId: result.id });
  } catch (error) {
    console.error("Inquiry email delivery failed.", {
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
