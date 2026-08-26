import { afterEach, describe, expect, it, vi } from "vitest";
import {
  renderInquiryEmail,
  sendInquiryEmail,
} from "@/lib/inquiry-email";

const input = {
  type: "single" as const,
  submissionId: "inq_1234567890abcdef",
  customer: "Buyer Name",
  email: "buyer@example.com",
  company: "Buyer Co",
  phone: "+86 13800000000",
  notes: "Need lab dips",
  sourceUrl: "https://orangetextiles.com/fabrics",
  items: [{ name: "Cotton Jersey", quantity: "500 m" }],
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("inquiry email transport", () => {
  it("sends from the website address to Outlook with buyer reply-to and idempotency", async () => {
    const send = vi.fn().mockResolvedValue({
      data: { id: "email_123" },
      error: null,
    });
    const sender = { emails: { send } };

    await expect(sendInquiryEmail(input, sender)).resolves.toEqual({
      id: "email_123",
    });
    expect(send).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "O'range Textile Website <inquiries@forms.orangetextiles.com>",
        to: ["folenchen0401@outlook.com"],
        replyTo: "buyer@example.com",
        subject: "[Website inquiry] Buyer Co | Cotton Jersey",
      }),
      {
        headers: {
          "Idempotency-Key": "inquiry-inq_1234567890abcdef",
        },
      },
    );
  });

  it("rejects a provider error with the public delivery failure", async () => {
    const sender = {
      emails: {
        send: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "rejected" },
        }),
      },
    };

    await expect(sendInquiryEmail(input, sender)).rejects.toThrowError(
      /^Inquiry delivery failed\.$/,
    );
  });

  it("normalizes a rejected provider call to the public delivery failure", async () => {
    const sender = {
      emails: {
        send: vi.fn().mockRejectedValue(new Error("network secret")),
      },
    };

    await expect(sendInquiryEmail(input, sender)).rejects.toThrowError(
      /^Inquiry delivery failed\.$/,
    );
  });

  it("rejects a provider response that has no message ID", async () => {
    const sender = {
      emails: {
        send: vi.fn().mockResolvedValue({ data: null, error: null }),
      },
    };

    await expect(sendInquiryEmail(input, sender)).rejects.toThrowError(
      /^Inquiry delivery failed\.$/,
    );
  });

  it("rejects default delivery when the Resend key is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");

    await expect(sendInquiryEmail(input)).rejects.toThrowError(
      /^Inquiry delivery is not configured\.$/,
    );
  });

  it("rejects default delivery when the Resend key is whitespace only", async () => {
    vi.stubEnv("RESEND_API_KEY", "   \t  ");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("must not fetch"));

    await expect(sendInquiryEmail(input)).rejects.toThrowError(
      /^Inquiry delivery is not configured\.$/,
    );
  });

  it("renders contact details, every fabric, notes, source, ID, and timestamp", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-26T10:15:30.000Z"));

    const rendered = renderInquiryEmail({
      ...input,
      type: "batch",
      items: [
        {
          name: "Cotton Jersey",
          quantity: "500 m",
          composition: "95% cotton / 5% elastane",
          weight: "180 gsm",
          stockStatus: "In stock",
        },
        {
          name: "French Terry",
          quantity: "750 m",
          composition: "100% cotton",
          weight: "320 gsm",
          stockStatus: "Custom development",
        },
      ],
    });

    expect(rendered.subject).toBe("[Website inquiry] Buyer Co | 2 fabrics");
    expect(rendered.text).toContain("Submission ID: inq_1234567890abcdef");
    expect(rendered.text).toContain("Inquiry type: batch");
    expect(rendered.text).toContain("Customer: Buyer Name");
    expect(rendered.text).toContain("Company: Buyer Co");
    expect(rendered.text).toContain("Email: buyer@example.com");
    expect(rendered.text).toContain("Phone: +86 13800000000");
    expect(rendered.text).toContain(
      "1. Cotton Jersey | 500 m | 95% cotton / 5% elastane | 180 gsm | In stock",
    );
    expect(rendered.text).toContain(
      "2. French Terry | 750 m | 100% cotton | 320 gsm | Custom development",
    );
    expect(rendered.text).toContain("Notes: Need lab dips");
    expect(rendered.text).toContain(
      "Source: https://orangetextiles.com/fabrics",
    );
    expect(rendered.text).toContain("Submitted: 2026-08-26T10:15:30.000Z");
  });
});
