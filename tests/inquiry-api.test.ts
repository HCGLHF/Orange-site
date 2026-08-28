import { afterEach, describe, expect, it, vi } from "vitest";
import { sendInquiryEmail } from "@/lib/inquiry-email";
import { POST } from "@/app/api/inquiry/route";

vi.mock("@/lib/inquiry-email", () => ({
  sendInquiryEmail: vi.fn(),
}));

const mockedSendInquiryEmail = vi.mocked(sendInquiryEmail);
const REQUEST_BODY_LIMIT_BYTES = 32 * 1024;

const validBody = {
  type: "single",
  submissionId: "inq_1234567890abcdef",
  customer: "Buyer Name",
  email: "buyer@example.com",
  company: "Buyer Co",
  phone: "+86 13800000000",
  notes: "Need lab dips",
  sourceUrl: "https://orangetextiles.com/fabrics",
  honeypot: "",
  items: [{ name: "Cotton Jersey", quantity: "500 m" }],
};

function makeRequest(
  body: unknown,
  contentType = "application/json",
): Request {
  return new Request("http://localhost/api/inquiry", {
    method: "POST",
    headers: { "content-type": contentType },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function makeStreamRequest(chunks: string[]): Request {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });

  return new Request("http://localhost/api/inquiry", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    duplex: "half",
  } as RequestInit);
}

async function expectInvalid(body: unknown) {
  const response = await POST(makeRequest(body));

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({
    success: false,
    error: "Invalid request.",
  });
  expect(mockedSendInquiryEmail).not.toHaveBeenCalled();
}

afterEach(() => {
  vi.resetAllMocks();
});

describe("POST /api/inquiry", () => {
  it("rejects non-JSON content types without sending", async () => {
    const response = await POST(makeRequest(validBody, "text/plain"));

    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Unsupported content type.",
    });
    expect(mockedSendInquiryEmail).not.toHaveBeenCalled();
  });

  it("rejects lookalike JSON media types without sending", async () => {
    mockedSendInquiryEmail.mockResolvedValue({ id: "email_123" });

    const response = await POST(
      makeRequest(validBody, "application/jsonp; charset=UTF-8"),
    );

    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Unsupported content type.",
    });
    expect(mockedSendInquiryEmail).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON with the stable public error", async () => {
    await expectInvalid("{not-json");
  });

  it("fast-rejects a declared oversized body without sending", async () => {
    const response = await POST(
      new Request("http://localhost/api/inquiry", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": String(REQUEST_BODY_LIMIT_BYTES + 1),
        },
        body: JSON.stringify(validBody),
      }),
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Request too large.",
    });
    expect(mockedSendInquiryEmail).not.toHaveBeenCalled();
  });

  it("rejects an oversized streamed body before JSON parsing or sending", async () => {
    const oversizedBody = JSON.stringify({
      ...validBody,
      notes: "x".repeat(REQUEST_BODY_LIMIT_BYTES),
    });
    const response = await POST(
      makeStreamRequest([
        oversizedBody.slice(0, 16_384),
        oversizedBody.slice(16_384),
      ]),
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Request too large.",
    });
    expect(mockedSendInquiryEmail).not.toHaveBeenCalled();
  });

  it("accepts and sends a normal streamed JSON payload", async () => {
    mockedSendInquiryEmail.mockResolvedValue({ id: "email_streamed" });
    const body = JSON.stringify(validBody);
    const response = await POST(
      makeStreamRequest([body.slice(0, 37), body.slice(37)]),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      inquiryId: "email_streamed",
    });
    expect(mockedSendInquiryEmail).toHaveBeenCalledOnce();
    expect(mockedSendInquiryEmail).toHaveBeenCalledWith({
      type: "single",
      submissionId: "inq_1234567890abcdef",
      customer: "Buyer Name",
      email: "buyer@example.com",
      company: "Buyer Co",
      phone: "+86 13800000000",
      notes: "Need lab dips",
      sourceUrl: "https://orangetextiles.com/fabrics",
      items: [{ name: "Cotton Jersey", quantity: "500 m" }],
    });
  });

  it.each([
    ["a missing type", { ...validBody, type: undefined }],
    ["an unsupported type", { ...validBody, type: "general" }],
    ["a missing submission ID", { ...validBody, submissionId: undefined }],
    ["a short submission ID", { ...validBody, submissionId: "short" }],
    [
      "an overlong submission ID",
      { ...validBody, submissionId: "a".repeat(101) },
    ],
    [
      "a submission ID with invalid characters",
      { ...validBody, submissionId: "inq.1234567890abcdef" },
    ],
    ["a missing customer", { ...validBody, customer: "  " }],
    ["an overlong customer", { ...validBody, customer: "a".repeat(121) }],
    ["a missing email", { ...validBody, email: "" }],
    ["an invalid email", { ...validBody, email: "buyer-at-example.com" }],
    [
      "an overlong email",
      { ...validBody, email: `${"a".repeat(243)}@example.com` },
    ],
    ["an overlong company", { ...validBody, company: "a".repeat(161) }],
    ["an overlong phone", { ...validBody, phone: "1".repeat(61) }],
    ["overlong notes", { ...validBody, notes: "a".repeat(4001) }],
    [
      "an overlong source URL",
      { ...validBody, sourceUrl: "a".repeat(501) },
    ],
    [
      "more than 50 items",
      {
        ...validBody,
        items: Array.from({ length: 51 }, (_, index) => ({
          name: `Fabric ${index}`,
        })),
      },
    ],
    ["a non-array items value", { ...validBody, items: {} }],
    ["an item without a name", { ...validBody, items: [{ quantity: "1 m" }] }],
    [
      "an item with a blank name",
      { ...validBody, items: [{ name: "   " }] },
    ],
    [
      "an overlong item name",
      { ...validBody, items: [{ name: "a".repeat(241) }] },
    ],
    [
      "overlong item quantity",
      {
        ...validBody,
        items: [{ name: "Jersey", quantity: "a".repeat(241) }],
      },
    ],
    [
      "overlong item composition",
      {
        ...validBody,
        items: [{ name: "Jersey", composition: "a".repeat(241) }],
      },
    ],
    [
      "overlong item weight",
      {
        ...validBody,
        items: [{ name: "Jersey", weight: "a".repeat(241) }],
      },
    ],
    [
      "overlong item stock status",
      {
        ...validBody,
        items: [{ name: "Jersey", stockStatus: "a".repeat(241) }],
      },
    ],
  ])("rejects %s without sending", async (_label, body) => {
    await expectInvalid(body);
  });

  it.each([
    ".buyer@example.com",
    "buyer@example..com",
    "buyer@-example.com",
  ])("rejects the clearly invalid email %s without sending", async (email) => {
    mockedSendInquiryEmail.mockResolvedValue({ id: "email_123" });

    await expectInvalid({ ...validBody, email });
  });

  it.each([
    "buyer.name+rfq@example.co.uk",
    "buyer_name@example-domain.com",
    "buyer-name@sub.example.com",
  ])("accepts the representative valid email %s", async (email) => {
    mockedSendInquiryEmail.mockResolvedValue({ id: "email_123" });

    const response = await POST(
      makeRequest({ ...validBody, email: `  ${email}  ` }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      inquiryId: "email_123",
    });
    expect(mockedSendInquiryEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email }),
    );
  });

  it("silently accepts a populated honeypot without sending", async () => {
    const response = await POST(
      makeRequest({ ...validBody, honeypot: "spam" }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      inquiryId: "accepted",
    });
    expect(mockedSendInquiryEmail).not.toHaveBeenCalled();
  });

  it("requires at least one item for a batch inquiry", async () => {
    await expectInvalid({ ...validBody, type: "batch", items: [] });
  });

  it("accepts a single general inquiry with no items", async () => {
    mockedSendInquiryEmail.mockResolvedValue({ id: "email_123" });

    const response = await POST(
      makeRequest({
        ...validBody,
        company: "   ",
        phone: "",
        notes: "  ",
        sourceUrl: "\t",
        items: [],
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      inquiryId: "email_123",
    });
    expect(mockedSendInquiryEmail).toHaveBeenCalledWith({
      type: "single",
      submissionId: "inq_1234567890abcdef",
      customer: "Buyer Name",
      email: "buyer@example.com",
      company: undefined,
      phone: undefined,
      notes: undefined,
      sourceUrl: undefined,
      items: [],
    });
  });

  it("strips query parameters and fragments from a client source URL", async () => {
    mockedSendInquiryEmail.mockResolvedValue({ id: "email_source" });

    const response = await POST(
      makeRequest({
        ...validBody,
        sourceUrl:
          "https://orangetextiles.com/fabrics?email=buyer%40example.com#private-token",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockedSendInquiryEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceUrl: "https://orangetextiles.com/fabrics",
      }),
    );
  });

  it.each([
    "https://attacker.example/fabrics",
    "https://orangetextiles.com/private/buyer@example.com",
  ])("omits the unapproved source URL %s", async (sourceUrl) => {
    mockedSendInquiryEmail.mockResolvedValue({ id: "email_source" });

    const response = await POST(makeRequest({ ...validBody, sourceUrl }));

    expect(response.status).toBe(200);
    expect(mockedSendInquiryEmail).toHaveBeenCalledWith(
      expect.objectContaining({ sourceUrl: undefined }),
    );
  });

  it("normalizes and sends a valid single inquiry", async () => {
    mockedSendInquiryEmail.mockResolvedValue({ id: "email_123" });

    const response = await POST(
      makeRequest(
        {
          ...validBody,
          type: " single ",
          submissionId: "  inq_1234567890abcdef  ",
          customer: "  Buyer Name  ",
          email: "  buyer@example.com  ",
          company: "  Buyer Co  ",
          phone: "  +86 13800000000  ",
          notes: "  Need lab dips  ",
          sourceUrl: "  https://orangetextiles.com/fabrics  ",
          honeypot: "   ",
          items: [
            {
              name: "  Cotton Jersey  ",
              quantity: "  500 m  ",
              composition: "  95% cotton / 5% elastane  ",
              weight: "  180 gsm  ",
              stockStatus: "  In stock  ",
            },
          ],
        },
        "Application/JSON; Charset=UTF-8",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      inquiryId: "email_123",
    });
    expect(mockedSendInquiryEmail).toHaveBeenCalledOnce();
    expect(mockedSendInquiryEmail).toHaveBeenCalledWith({
      type: "single",
      submissionId: "inq_1234567890abcdef",
      customer: "Buyer Name",
      email: "buyer@example.com",
      company: "Buyer Co",
      phone: "+86 13800000000",
      notes: "Need lab dips",
      sourceUrl: "https://orangetextiles.com/fabrics",
      items: [
        {
          name: "Cotton Jersey",
          quantity: "500 m",
          composition: "95% cotton / 5% elastane",
          weight: "180 gsm",
          stockStatus: "In stock",
        },
      ],
    });
  });

  it("normalizes and sends a valid batch inquiry", async () => {
    mockedSendInquiryEmail.mockResolvedValue({ id: "email_123" });

    const response = await POST(
      makeRequest({
        ...validBody,
        type: "batch",
        items: [
          { name: "  Cotton Jersey  ", quantity: "  500 m  " },
          {
            name: "  French Terry  ",
            quantity: "",
            composition: "  100% cotton  ",
            weight: "   ",
            stockStatus: "  Custom development  ",
          },
        ],
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      inquiryId: "email_123",
    });
    expect(mockedSendInquiryEmail).toHaveBeenCalledWith({
      type: "batch",
      submissionId: "inq_1234567890abcdef",
      customer: "Buyer Name",
      email: "buyer@example.com",
      company: "Buyer Co",
      phone: "+86 13800000000",
      notes: "Need lab dips",
      sourceUrl: "https://orangetextiles.com/fabrics",
      items: [
        { name: "Cotton Jersey", quantity: "500 m" },
        {
          name: "French Terry",
          quantity: undefined,
          composition: "100% cotton",
          weight: undefined,
          stockStatus: "Custom development",
        },
      ],
    });
  });

  it("returns a stable 502 without logging PII or provider details", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockedSendInquiryEmail.mockRejectedValue(
      new Error("provider token re_secret buyer@example.com"),
    );

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Submission failed. Please try again or email us directly.",
    });
    expect(errorSpy).toHaveBeenCalledWith("Inquiry email delivery failed.", {
      errorType: "Error",
    });

    const logged = JSON.stringify(errorSpy.mock.calls);
    expect(logged).not.toContain("Buyer Name");
    expect(logged).not.toContain("buyer@example.com");
    expect(logged).not.toContain("Buyer Co");
    expect(logged).not.toContain("re_secret");
    expect(logged).not.toContain("provider token");
    expect(logged).not.toContain("inq_1234567890abcdef");
  });
});
