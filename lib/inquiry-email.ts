import { Resend } from "resend";

export const INQUIRY_FROM =
  "O'range Textile Website <inquiries@forms.orangetextiles.com>";
export const INQUIRY_TO = "folenchen0401@outlook.com";

const INQUIRY_SEND_MAX_ATTEMPTS = 3;
const INQUIRY_SEND_ATTEMPT_TIMEOUT_MS = 4_000;
const INQUIRY_SEND_TOTAL_TIMEOUT_MS = 13_500;
const INQUIRY_SEND_RETRY_DELAY_MS = 200;
const INQUIRY_SEND_RATE_LIMIT_DELAY_MS = 1_000;

export type InquiryItem = {
  name: string;
  quantity?: string;
  composition?: string;
  weight?: string;
  stockStatus?: string;
};

export type InquiryEmailInput = {
  type: "single" | "batch";
  submissionId: string;
  customer: string;
  email: string;
  company?: string;
  phone?: string;
  notes?: string;
  sourceUrl?: string;
  items: InquiryItem[];
};

type InquiryMessage = {
  from: string;
  to: string[];
  replyTo: string;
  subject: string;
  text: string;
};

type Sender = {
  emails: {
    send: (
      message: InquiryMessage,
      options: { idempotencyKey: string; signal: AbortSignal },
    ) => Promise<{
      data: { id: string } | null;
      error: unknown;
      headers?: Record<string, string> | null;
    }>;
  };
};

type AttemptResult =
  | { status: "success"; id: string }
  | { status: "transient"; retryDelayMs?: number }
  | { status: "permanent" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTransientProviderError(error: unknown): boolean {
  if (!isRecord(error)) return false;

  const name = typeof error.name === "string" ? error.name : "";
  const statusCode =
    typeof error.statusCode === "number" ? error.statusCode : null;

  if (name === "daily_quota_exceeded" || name === "monthly_quota_exceeded") {
    return false;
  }

  return (
    name === "application_error" ||
    name === "rate_limit_exceeded" ||
    name === "internal_server_error" ||
    name === "concurrent_idempotent_requests" ||
    statusCode === 429 ||
    (statusCode !== null && statusCode >= 500)
  );
}

function readProviderHeader(
  headers: Record<string, string> | null | undefined,
  name: string,
) {
  if (!headers) return undefined;
  const target = name.toLowerCase();
  const entry = Object.entries(headers).find(
    ([headerName]) => headerName.toLowerCase() === target,
  );
  return entry?.[1];
}

function rateLimitRetryDelayMs(
  error: unknown,
  headers: Record<string, string> | null | undefined,
) {
  if (!isRecord(error)) return undefined;
  const name = typeof error.name === "string" ? error.name : "";
  const statusCode =
    typeof error.statusCode === "number" ? error.statusCode : null;
  if (name !== "rate_limit_exceeded" && statusCode !== 429) return undefined;

  for (const headerName of ["retry-after", "ratelimit-reset"]) {
    const value = readProviderHeader(headers, headerName);
    if (value === undefined) continue;
    const seconds = Number(value);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.max(
        INQUIRY_SEND_RATE_LIMIT_DELAY_MS,
        Math.ceil(seconds * 1_000),
      );
    }
  }

  return INQUIRY_SEND_RATE_LIMIT_DELAY_MS;
}

function waitForRetry(delayMs: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

async function sendInquiryAttempt(
  sender: Sender,
  message: InquiryMessage,
  idempotencyKey: string,
  timeoutMs: number,
): Promise<AttemptResult> {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const send = Promise.resolve()
    .then(() =>
      sender.emails.send(message, {
        idempotencyKey,
        signal: controller.signal,
      }),
    )
    .then(
      (result) => ({ status: "resolved" as const, result }),
      () => ({ status: "rejected" as const }),
    );
  const timeout = new Promise<{ status: "timeout" }>((resolve) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      resolve({ status: "timeout" });
    }, timeoutMs);
  });

  try {
    const outcome = await Promise.race([send, timeout]);
    if (outcome.status === "timeout" || outcome.status === "rejected") {
      return { status: "transient" };
    }

    const { data, error, headers } = outcome.result;
    if (!error && data?.id) return { status: "success", id: data.id };

    if (!isTransientProviderError(error)) return { status: "permanent" };
    return {
      status: "transient",
      retryDelayMs: rateLimitRetryDelayMs(error, headers),
    };
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

export function renderInquiryEmail(input: InquiryEmailInput) {
  const subjectTarget = input.company?.trim() || input.customer;
  const itemSummary =
    input.type === "batch"
      ? `${input.items.length} fabrics`
      : input.items[0]?.name || "General request";
  const fabricLines = input.items.map((item, index) =>
    [
      `${index + 1}. ${item.name}`,
      item.quantity,
      item.composition,
      item.weight,
      item.stockStatus,
    ]
      .filter(Boolean)
      .join(" | "),
  );

  return {
    subject: `[Website inquiry] ${subjectTarget} | ${itemSummary}`,
    text: [
      `Submission ID: ${input.submissionId}`,
      `Inquiry type: ${input.type}`,
      `Customer: ${input.customer}`,
      `Company: ${input.company?.trim() || "Not provided"}`,
      `Email: ${input.email}`,
      `Phone: ${input.phone?.trim() || "Not provided"}`,
      "",
      "Requested fabrics:",
      ...(fabricLines.length ? fabricLines : ["General sourcing request"]),
      "",
      `Notes: ${input.notes?.trim() || "None"}`,
      `Source: ${input.sourceUrl?.trim() || "Not provided"}`,
    ].join("\n"),
  };
}

export async function sendInquiryEmail(
  input: InquiryEmailInput,
  injectedSender?: Sender,
) {
  let sender = injectedSender;

  if (!sender) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("Inquiry delivery is not configured.");
    }
    sender = new Resend(apiKey) as unknown as Sender;
  }

  const rendered = renderInquiryEmail(input);
  const message: InquiryMessage = {
    from: INQUIRY_FROM,
    to: [INQUIRY_TO],
    replyTo: input.email,
    subject: rendered.subject,
    text: rendered.text,
  };
  const idempotencyKey = `inquiry-${input.submissionId}`;
  const deadline = Date.now() + INQUIRY_SEND_TOTAL_TIMEOUT_MS;

  for (let attempt = 1; attempt <= INQUIRY_SEND_MAX_ATTEMPTS; attempt += 1) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) break;
    const result = await sendInquiryAttempt(
      sender,
      message,
      idempotencyKey,
      Math.min(INQUIRY_SEND_ATTEMPT_TIMEOUT_MS, remainingMs),
    );
    if (result.status === "success") return { id: result.id };
    if (result.status === "permanent" || attempt === INQUIRY_SEND_MAX_ATTEMPTS) {
      break;
    }
    const retryDelayMs =
      result.retryDelayMs ?? INQUIRY_SEND_RETRY_DELAY_MS * attempt;
    if (retryDelayMs >= deadline - Date.now()) break;
    await waitForRetry(retryDelayMs);
  }

  throw new Error("Inquiry delivery failed.");
}
