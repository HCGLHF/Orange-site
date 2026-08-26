import { Resend } from "resend";

export const INQUIRY_FROM =
  "O'range Textile Website <inquiries@forms.orangetextiles.com>";
export const INQUIRY_TO = "folenchen0401@outlook.com";

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
      options: { headers: Record<string, string> },
    ) => Promise<{ data: { id: string } | null; error: unknown }>;
  };
};

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
      `Submitted: ${new Date().toISOString()}`,
    ].join("\n"),
  };
}

export async function sendInquiryEmail(
  input: InquiryEmailInput,
  injectedSender?: Sender,
) {
  let sender = injectedSender;

  if (!sender) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("Inquiry delivery is not configured.");
    }
    sender = new Resend(apiKey);
  }

  const rendered = renderInquiryEmail(input);
  const { data, error } = await sender.emails.send(
    {
      from: INQUIRY_FROM,
      to: [INQUIRY_TO],
      replyTo: input.email,
      subject: rendered.subject,
      text: rendered.text,
    },
    {
      headers: {
        "Idempotency-Key": `inquiry-${input.submissionId}`,
      },
    },
  );

  if (error || !data?.id) {
    throw new Error("Inquiry delivery failed.");
  }

  return { id: data.id };
}
