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
      expect.objectContaining({
        idempotencyKey: "inquiry-inq_1234567890abcdef",
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("keeps real SDK request bytes and idempotency headers stable for identical input", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(
      async () =>
        new Response(JSON.stringify({ id: "email_123" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );

    await sendInquiryEmail(input);
    await sendInquiryEmail({ ...input });
    await sendInquiryEmail({
      ...input,
      submissionId: "inq_1234567890abcdeg",
      notes: "Edited lab-dip request",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    const requests = fetchSpy.mock.calls.map(([, options]) => ({
      body: options?.body,
      idempotencyKey: new Headers(options?.headers).get("Idempotency-Key"),
    }));
    expect(requests[0]).toEqual(requests[1]);
    expect(requests[0]?.idempotencyKey).toBe(
      "inquiry-inq_1234567890abcdef",
    );
    expect(requests[2]?.body).not.toBe(requests[0]?.body);
    expect(requests[2]?.idempotencyKey).toBe(
      "inquiry-inq_1234567890abcdeg",
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

  it("aborts each timed-out attempt and exhausts below the browser deadline", async () => {
    vi.useFakeTimers();
    const signals: AbortSignal[] = [];
    const send = vi.fn(
      (
        _message: unknown,
        options: { idempotencyKey: string; signal: AbortSignal },
      ) => {
        if (!options.signal) {
          return Promise.resolve({
            data: null,
            error: {
              name: "validation_error",
              statusCode: 400,
              message: "missing abort signal",
            },
          });
        }
        signals.push(options.signal);
        return new Promise<never>(() => {});
      },
    );
    const delivery = expect(
      sendInquiryEmail(input, { emails: { send } }),
    ).rejects.toThrowError(/^Inquiry delivery failed\.$/);

    await vi.advanceTimersByTimeAsync(14_999);

    await delivery;
    expect(send).toHaveBeenCalledTimes(3);
    expect(signals).toHaveLength(3);
    expect(signals.every((signal) => signal.aborted)).toBe(true);
  });

  it.each([
    ["a rejected network call", new Error("network unavailable")],
    [
      "application_error",
      { name: "application_error", statusCode: null, message: "temporary" },
    ],
    [
      "HTTP 429",
      { name: "validation_error", statusCode: 429, message: "temporary" },
    ],
    [
      "rate_limit_exceeded",
      { name: "rate_limit_exceeded", statusCode: 400, message: "temporary" },
    ],
    [
      "HTTP 5xx",
      { name: "validation_error", statusCode: 503, message: "temporary" },
    ],
    [
      "internal_server_error",
      { name: "internal_server_error", statusCode: 400, message: "temporary" },
    ],
    [
      "concurrent_idempotent_requests",
      {
        name: "concurrent_idempotent_requests",
        statusCode: 409,
        message: "temporary",
      },
    ],
  ])("retries %s and returns a later success", async (_label, failure) => {
    vi.useFakeTimers();
    const send = vi
      .fn()
      .mockImplementationOnce(() =>
        failure instanceof Error
          ? Promise.reject(failure)
          : Promise.resolve({ data: null, error: failure }),
      )
      .mockResolvedValueOnce({ data: { id: "email_retry" }, error: null });
    const delivery = expect(
      sendInquiryEmail(input, { emails: { send } }),
    ).resolves.toEqual({ id: "email_retry" });

    await vi.runAllTimersAsync();

    await delivery;
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("bounds transient exhaustion and reuses the exact message and key", async () => {
    vi.useFakeTimers();
    const send = vi.fn().mockResolvedValue({
      data: null,
      error: {
        name: "application_error",
        statusCode: null,
        message: "temporary provider detail",
      },
    });
    const delivery = expect(
      sendInquiryEmail(input, { emails: { send } }),
    ).rejects.toThrowError(/^Inquiry delivery failed\.$/);

    await vi.runAllTimersAsync();

    await delivery;
    expect(send).toHaveBeenCalledTimes(3);
    const messages = send.mock.calls.map(([message]) => message);
    const options = send.mock.calls.map(([, requestOptions]) => requestOptions);
    expect(messages[1]).toBe(messages[0]);
    expect(messages[2]).toBe(messages[0]);
    expect(messages.map((message) => JSON.stringify(message))).toEqual([
      JSON.stringify(messages[0]),
      JSON.stringify(messages[0]),
      JSON.stringify(messages[0]),
    ]);
    expect(
      options.map((requestOptions) => requestOptions.idempotencyKey),
    ).toEqual([
      "inquiry-inq_1234567890abcdef",
      "inquiry-inq_1234567890abcdef",
      "inquiry-inq_1234567890abcdef",
    ]);
    expect(new Set(options.map((requestOptions) => requestOptions.signal)).size).toBe(3);
  });

  it.each(["validation_error", "invalid_api_key", "invalid_idempotent_request"])(
    "does not retry permanent %s failures",
    async (name) => {
      const send = vi.fn().mockResolvedValue({
        data: null,
        error: { name, statusCode: 400, message: "permanent provider detail" },
      });

      await expect(
        sendInquiryEmail(input, { emails: { send } }),
      ).rejects.toThrowError(/^Inquiry delivery failed\.$/);
      expect(send).toHaveBeenCalledOnce();
    },
  );

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

  it("renders contact details, every fabric, notes, source, and ID deterministically", () => {
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
    expect(rendered.text).not.toContain("Submitted:");
  });
});
