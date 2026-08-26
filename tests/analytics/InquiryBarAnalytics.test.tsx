import React, { useState } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InquiryBar } from "@/components/InquiryBar";
import { InquiryCartProvider, useInquiryCart } from "@/components/InquiryCartProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import type { Fabric } from "@/lib/data";
import { OPEN_BATCH_INQUIRY_EVENT } from "@/lib/inquiry-events";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

const SUBMISSION_ID = "123e4567-e89b-42d3-a456-426614174000";
const NEXT_SUBMISSION_ID = "123e4567-e89b-42d3-a456-426614174001";
const SUBMIT_ERROR = "Submission failed. Please try again or email us directly.";

const testFabrics: Fabric[] = [
  {
    id: "private-fabric-article",
    name: "Private Fabric Article",
    construction: "knit",
    composition: "Sensitive composition",
    weight: 280,
    width: 160,
    tags: [],
    textureImage: "/test-texture.jpg",
    sceneImage: "/test-scene.jpg",
    description: "Private fabric description",
    stockStatus: "Private stock status",
    notionPageId: "notion-must-not-reach-client-api",
  },
  {
    id: "second-fabric-article",
    name: "Second Fabric Article",
    construction: "knit",
    composition: "100% test fibre",
    weight: 190,
    width: 170,
    tags: [],
    textureImage: "/second-texture.jpg",
    sceneImage: "/second-scene.jpg",
    description: "Second fabric description",
    stockStatus: "Custom development",
  },
];

function jsonResponse(
  body: unknown,
  { ok = true }: { ok?: boolean } = {},
): Response {
  return {
    ok,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

function InquiryHarness({ allowRemount = false }: { allowRemount?: boolean }) {
  const { addItem, items } = useInquiryCart();
  const [barMounted, setBarMounted] = useState(true);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          for (const fabric of testFabrics) addItem(fabric);
          window.dispatchEvent(new Event(OPEN_BATCH_INQUIRY_EVENT));
        }}
      >
        Open batch inquiry
      </button>
      {allowRemount && (
        <button type="button" onClick={() => setBarMounted((mounted) => !mounted)}>
          Toggle inquiry bar
        </button>
      )}
      <span aria-label="Cart item count">{items.length}</span>
      {barMounted && <InquiryBar />}
    </>
  );
}

async function renderOpenBatchInquiry({ allowRemount = false } = {}) {
  const user = userEvent.setup();
  const view = render(
    <LocaleProvider>
      <InquiryCartProvider>
        <InquiryHarness allowRemount={allowRemount} />
      </InquiryCartProvider>
    </LocaleProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Open batch inquiry" }));
  await screen.findByRole("dialog", { name: "Batch inquiry" });
  return { user, ...view };
}

async function completeBatchInquiry(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Your full name"), "Buyer Name");
  await user.type(screen.getByPlaceholderText("Company name"), "Private Company");
  await user.type(screen.getByPlaceholderText("+1 or +86"), "+86 138 0000 0000");
  await user.type(screen.getByPlaceholderText("example@company.com"), "buyer@example.com");
  await user.type(
    screen.getByPlaceholderText("Special requirements, delivery timeline, target price"),
    "Private target price and delivery notes",
  );
}

function expectPrivateDraftPreserved() {
  expect(screen.getByPlaceholderText("Your full name")).toHaveValue("Buyer Name");
  expect(screen.getByPlaceholderText("Company name")).toHaveValue("Private Company");
  expect(screen.getByPlaceholderText("+1 or +86")).toHaveValue(
    "+86 138 0000 0000",
  );
  expect(screen.getByPlaceholderText("example@company.com")).toHaveValue(
    "buyer@example.com",
  );
  expect(
    screen.getByPlaceholderText("Special requirements, delivery timeline, target price"),
  ).toHaveValue("Private target price and delivery notes");
}

function closeBatchInquiry() {
  fireEvent.keyDown(document, { key: "Escape" });
}

describe("InquiryBar server submission and conversion analytics", () => {
  it("posts exactly one complete batch inquiry and clears the cart only after confirmed success", async () => {
    const pendingResponse = deferred<Response>();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockReturnValue(pendingResponse.promise);
    const uuidSpy = vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => undefined);
    const { user } = await renderOpenBatchInquiry();
    await completeBatchInquiry(user);
    const quantityInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(quantityInputs[0], { target: { value: "250" } });
    const honeypot = document.querySelector<HTMLInputElement>('input[name="website"]');

    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("autocomplete", "off");
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(screen.queryByText(/saved on this device/i)).not.toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: "Submit inquiry" });
    await user.click(submitButton);

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByLabelText("Cart item count")).toHaveTextContent("2");
    expect(window.dataLayer).toEqual([]);

    const [url, request] = fetchSpy.mock.calls[0];
    expect(url).toBe("/api/inquiry");
    expect(request).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const body = JSON.parse(String(request?.body));
    expect(body).toEqual({
      type: "batch",
      submissionId: SUBMISSION_ID,
      customer: "Buyer Name",
      email: "buyer@example.com",
      company: "Private Company",
      phone: "+86 138 0000 0000",
      notes: "Private target price and delivery notes",
      sourceUrl: window.location.href,
      honeypot: "",
      items: [
        {
          name: "Private Fabric Article",
          quantity: "250 m",
          composition: "Sensitive composition",
          weight: "280 gsm",
          stockStatus: "Private stock status",
        },
        {
          name: "Second Fabric Article",
          quantity: "100 m",
          composition: "100% test fibre",
          weight: "190 gsm",
          stockStatus: "Custom development",
        },
      ],
    });
    expect(body.submissionId).toMatch(/^[A-Za-z0-9_-]{16,100}$/);
    expect(uuidSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      pendingResponse.resolve(jsonResponse({ success: true, inquiryId: "inquiry_123" }));
      await pendingResponse.promise;
    });

    const success = await screen.findByRole("status");
    expect(success).toHaveTextContent("Submitted");
    expect(success).toHaveTextContent(
      "Your selected articles have been recorded for direct sales review.",
    );
    expect(success).toHaveAttribute("aria-live", "polite");
    expect(success).toHaveAttribute("tabindex", "-1");
    expect(success).toHaveFocus();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "false");
    expect(screen.getByLabelText("Cart item count")).toHaveTextContent("0");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).toEqual([
      { event: "orange_generate_lead", form_name: "batch_inquiry" },
    ]);
    expect(alertSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem("orange-textile-inquiries")).toBeNull();
    expect(sessionStorage).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "OK" }));
  });

  it.each([
    [
      "a non-ok response",
      () => Promise.resolve(jsonResponse({ success: true, inquiryId: "ignored" }, { ok: false })),
    ],
    ["a network rejection", () => Promise.reject(new Error("offline"))],
    [
      "malformed JSON",
      () => Promise.resolve({
        ok: true,
        json: vi.fn().mockRejectedValue(new SyntaxError("invalid JSON")),
      } as unknown as Response),
    ],
    ["an unsuccessful JSON body", () => Promise.resolve(jsonResponse({ success: false }))],
    ["a success body without an inquiry ID", () => Promise.resolve(jsonResponse({ success: true }))],
  ])("keeps the form and cart after %s", async (_label, responseFactory) => {
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(responseFactory);
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => undefined);
    const { user } = await renderOpenBatchInquiry();
    await completeBatchInquiry(user);
    await user.click(screen.getByRole("button", { name: "Submit inquiry" }));

    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent(SUBMIT_ERROR);
    expect(error).toHaveAttribute("aria-live", "assertive");
    expect(error).toHaveAttribute("tabindex", "-1");
    expect(error).toHaveFocus();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "false");
    expectPrivateDraftPreserved();
    expect(screen.getByLabelText("Cart item count")).toHaveTextContent("2");
    expect(window.dataLayer).toEqual([]);
    expect(alertSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem("orange-textile-inquiries")).toBeNull();
    expect(sessionStorage).toHaveLength(0);

    closeBatchInquiry();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("reuses a failed draft submission ID and rotates it only after success", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ success: false }, { ok: false }))
      .mockResolvedValueOnce(jsonResponse({ success: true, inquiryId: "inquiry_retry" }))
      .mockResolvedValueOnce(jsonResponse({ success: true, inquiryId: "inquiry_new" }));
    const uuidSpy = vi
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce(SUBMISSION_ID)
      .mockReturnValueOnce(NEXT_SUBMISSION_ID);
    const { user } = await renderOpenBatchInquiry();
    await completeBatchInquiry(user);

    await user.click(screen.getByRole("button", { name: "Submit inquiry" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(SUBMIT_ERROR);
    await user.click(screen.getByRole("button", { name: "Submit inquiry" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Submitted");

    const firstBody = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));
    const retryBody = JSON.parse(String(fetchSpy.mock.calls[1][1]?.body));
    expect(firstBody.submissionId).toBe(SUBMISSION_ID);
    expect(retryBody.submissionId).toBe(SUBMISSION_ID);
    expect(uuidSpy).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).toEqual([
      { event: "orange_generate_lead", form_name: "batch_inquiry" },
    ]);

    await user.click(screen.getByRole("button", { name: "OK" }));
    await user.click(screen.getByRole("button", { name: "Open batch inquiry" }));
    await screen.findByRole("dialog", { name: "Batch inquiry" });
    await completeBatchInquiry(user);
    await user.click(screen.getByRole("button", { name: "Submit inquiry" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Submitted");

    const newDraftBody = JSON.parse(String(fetchSpy.mock.calls[2][1]?.body));
    expect(newDraftBody.submissionId).toBe(NEXT_SUBMISSION_ID);
    expect(newDraftBody.submissionId).not.toBe(SUBMISSION_ID);
    expect(uuidSpy).toHaveBeenCalledTimes(2);
    expect(window.dataLayer).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "OK" }));
  });

  it("blocks duplicate pending sends and close paths across an InquiryBar remount", async () => {
    const pendingResponse = deferred<Response>();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockReturnValue(pendingResponse.promise);
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
    const { user } = await renderOpenBatchInquiry({ allowRemount: true });
    await completeBatchInquiry(user);

    const submitButton = screen.getByRole("button", { name: "Submit inquiry" });
    await user.click(submitButton);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    await user.click(submitButton);
    for (const closeButton of screen.getAllByRole("button", { name: "Close" })) {
      expect(closeButton).toBeDisabled();
      await user.click(closeButton);
    }
    fireEvent.keyDown(document, { key: "Escape" });
    window.dispatchEvent(new Event(OPEN_BATCH_INQUIRY_EVENT));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Toggle inquiry bar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Toggle inquiry bar" }));

    const remountedSubmit = await screen.findByRole("button", { name: "Submit inquiry" });
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
    expect(remountedSubmit).toBeDisabled();
    expectPrivateDraftPreserved();
    await user.click(remountedSubmit);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      pendingResponse.resolve(jsonResponse({ success: true, inquiryId: "inquiry_123" }));
      await pendingResponse.promise;
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Submitted");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).toEqual([
      { event: "orange_generate_lead", form_name: "batch_inquiry" },
    ]);
    expect(screen.getByLabelText("Cart item count")).toHaveTextContent("0");

    await user.click(screen.getByRole("button", { name: "OK" }));
  });

  it("times out body parsing, allows retry with the same ID, and ignores the late result", async () => {
    const lateBody = deferred<unknown>();
    let requestSignal: AbortSignal | null = null;
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementationOnce((_url, request) => {
        requestSignal = request?.signal ?? null;
        return Promise.resolve({
          ok: true,
          json: vi.fn().mockReturnValue(lateBody.promise),
        } as unknown as Response);
      })
      .mockResolvedValueOnce(jsonResponse({ success: true, inquiryId: "inquiry_retry" }));
    const uuidSpy = vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
    const { user } = await renderOpenBatchInquiry();
    await completeBatchInquiry(user);

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "Submit inquiry" }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });
    vi.useRealTimers();

    expect(requestSignal).not.toBeNull();
    expect(requestSignal!.aborted).toBe(true);
    expect(screen.getByRole("alert")).toHaveTextContent(SUBMIT_ERROR);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "false");
    expectPrivateDraftPreserved();
    expect(screen.getByLabelText("Cart item count")).toHaveTextContent("2");
    expect(window.dataLayer).toEqual([]);

    await user.click(screen.getByRole("button", { name: "Submit inquiry" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Submitted");
    const firstBody = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));
    const retryBody = JSON.parse(String(fetchSpy.mock.calls[1][1]?.body));
    expect(retryBody.submissionId).toBe(firstBody.submissionId);
    expect(uuidSpy).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).toEqual([
      { event: "orange_generate_lead", form_name: "batch_inquiry" },
    ]);

    await act(async () => {
      lateBody.resolve({ success: true, inquiryId: "late_inquiry" });
      await lateBody.promise;
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(window.dataLayer).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("Submitted");

    await user.click(screen.getByRole("button", { name: "OK" }));
  });

  it("maps a populated hidden website field to the honeypot payload", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ success: true, inquiryId: "inquiry_123" }),
    );
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
    const { user } = await renderOpenBatchInquiry();
    await completeBatchInquiry(user);
    const honeypot = document.querySelector<HTMLInputElement>('input[name="website"]');

    expect(honeypot).not.toBeNull();
    fireEvent.change(honeypot!, { target: { value: "bot.example" } });
    await user.click(screen.getByRole("button", { name: "Submit inquiry" }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body))).toMatchObject({
      honeypot: "bot.example",
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Submitted");

    await user.click(screen.getByRole("button", { name: "OK" }));
  });

  it("keeps the confirmed success flow when analytics storage is unavailable", async () => {
    window.dataLayer = Object.freeze([]) as unknown as Window["dataLayer"];
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ success: true, inquiryId: "inquiry_123" }),
    );
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
    const { user } = await renderOpenBatchInquiry();
    await completeBatchInquiry(user);

    await user.click(screen.getByRole("button", { name: "Submit inquiry" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Submitted");
    expect(screen.getByLabelText("Cart item count")).toHaveTextContent("0");

    await user.click(screen.getByRole("button", { name: "OK" }));
  });
});
