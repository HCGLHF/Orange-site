import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InquiryModal } from "@/components/ui/InquiryModal";
import { LocaleProvider } from "@/components/LocaleProvider";
import { LOCALE_STORAGE_KEY, messages } from "@/lib/i18n";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

const SUBMISSION_ID = "123e4567-e89b-42d3-a456-426614174000";
const SUBMIT_ERROR = "Submission failed. Please try again or email us directly.";

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

async function completeModalInquiry() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/^Name/), "Buyer Name");
  await user.type(screen.getByLabelText(/^Email/), "buyer@example.com");
  await user.type(screen.getByLabelText(/^Company/), "Private Company");
  await user.type(screen.getByLabelText(/^Phone/), "+61 400 123 456");
  await user.type(screen.getByLabelText(/^Notes/), "Need lab dips before approval");
  await user.type(screen.getByLabelText(/^Quantity needed/), "500 kg confidential");
  return user;
}

function renderModal() {
  const onClose = vi.fn();
  render(
    <LocaleProvider>
      <InquiryModal open onClose={onClose} />
    </LocaleProvider>,
  );
  return onClose;
}

describe("InquiryModal server submission and conversion analytics", () => {
  it("posts one complete single inquiry and records one lead only after confirmed success", async () => {
    const pendingResponse = deferred<Response>();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockReturnValue(pendingResponse.promise);
    const uuidSpy = vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => undefined);
    const onClose = renderModal();
    const user = await completeModalInquiry();
    const honeypot = document.querySelector<HTMLInputElement>('input[name="website"]');

    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("autocomplete", "off");
    expect(honeypot).toHaveAttribute("tabindex", "-1");

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(submitButton).toBeDisabled();
    expect(window.dataLayer).toEqual([]);
    expect(screen.queryByText("Submitted successfully")).not.toBeInTheDocument();

    await user.click(submitButton);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, request] = fetchSpy.mock.calls[0];
    expect(url).toBe("/api/inquiry");
    expect(request).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const body = JSON.parse(String(request?.body));
    expect(body).toEqual({
      type: "single",
      submissionId: SUBMISSION_ID,
      customer: "Buyer Name",
      email: "buyer@example.com",
      company: "Private Company",
      phone: "+61 400 123 456",
      notes: "Need lab dips before approval",
      sourceUrl: window.location.href,
      honeypot: "",
      items: [
        {
          name: "Specific finished-fabric article",
          quantity: "500 kg confidential",
        },
      ],
    });
    expect(body.submissionId).toMatch(/^[A-Za-z0-9_-]{16,100}$/);
    expect(uuidSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      pendingResponse.resolve(
        jsonResponse({ success: true, inquiryId: "inquiry_123" }),
      );
      await pendingResponse.promise;
    });

    expect(await screen.findByText("Submitted successfully")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).toEqual([
      { event: "orange_generate_lead", form_name: "single_inquiry" },
    ]);
    expect(localStorage).toHaveLength(0);

    const analyticsPayload = JSON.stringify(window.dataLayer);
    expect(analyticsPayload).not.toContain("Buyer Name");
    expect(analyticsPayload).not.toContain("buyer@example.com");
    expect(analyticsPayload).not.toContain("Private Company");
    expect(analyticsPayload).not.toContain("500 kg confidential");
  });

  it("keeps the accepted-submission success flow when the analytics queue is frozen", async () => {
    window.dataLayer = Object.freeze([]) as unknown as Window["dataLayer"];
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ success: true, inquiryId: "inquiry_123" }),
    );
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const onClose = renderModal();
    const user = await completeModalInquiry();

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Submitted successfully")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });

  it("blocks every user close path while a submission is pending", async () => {
    const pendingResponse = deferred<Response>();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockReturnValue(pendingResponse.promise);
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
    const onClose = renderModal();
    const user = await completeModalInquiry();

    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));

    for (const closeButton of screen.getAllByRole("button", { name: "Close" })) {
      await user.click(closeButton);
    }
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      pendingResponse.resolve(
        jsonResponse({ success: true, inquiryId: "inquiry_123" }),
      );
      await pendingResponse.promise;
    });
  });

  it("keeps one pending submission across unmount and releases it after settlement", async () => {
    const originalResponse = deferred<Response>();
    const laterResponse = deferred<Response>();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockReturnValueOnce(originalResponse.promise)
      .mockReturnValueOnce(laterResponse.promise);
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce(SUBMISSION_ID)
      .mockReturnValueOnce("123e4567-e89b-42d3-a456-426614174001");
    const firstView = render(
      <LocaleProvider>
        <InquiryModal open onClose={vi.fn()} />
      </LocaleProvider>,
    );
    const firstUser = await completeModalInquiry();

    await firstUser.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    firstView.unmount();

    render(
      <LocaleProvider>
        <InquiryModal open onClose={vi.fn()} />
      </LocaleProvider>,
    );
    const remountedUser = await completeModalInquiry();
    await remountedUser.click(screen.getByRole("button", { name: "Submit" }));
    const callsWhileOriginalPending = fetchSpy.mock.calls.length;

    await act(async () => {
      originalResponse.resolve(
        jsonResponse({ success: true, inquiryId: "inquiry_123" }),
      );
      await originalResponse.promise;
    });
    const leadsAfterOriginalSettled = Array.from(window.dataLayer ?? []);

    await remountedUser.click(screen.getByRole("button", { name: "Submit" }));
    const callsAfterLaterSubmit = fetchSpy.mock.calls.length;

    await act(async () => {
      laterResponse.resolve(
        jsonResponse({ success: true, inquiryId: "inquiry_456" }),
      );
      await laterResponse.promise;
    });

    const lead = { event: "orange_generate_lead", form_name: "single_inquiry" };
    expect(callsWhileOriginalPending).toBe(1);
    expect(leadsAfterOriginalSettled).toEqual([lead]);
    expect(callsAfterLaterSubmit).toBe(2);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(window.dataLayer).toEqual([lead, lead]);
  });

  it("renders the localized success detail for the active locale", async () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "zh");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ success: true, inquiryId: "inquiry_123" }),
    );
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
    renderModal();
    const user = await completeModalInquiry();

    await waitFor(() =>
      expect(document.documentElement).toHaveAttribute("lang", "zh"),
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Submitted successfully")).toBeInTheDocument();
    expect(screen.getByText(messages.zh.inquirySuccess)).toBeInTheDocument();
  });

  it("maps a populated website field to the API honeypot field", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ success: true, inquiryId: "inquiry_123" }),
    );
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
    renderModal();
    const user = await completeModalInquiry();
    const honeypot = document.querySelector<HTMLInputElement>('input[name="website"]');

    expect(honeypot).not.toBeNull();
    fireEvent.change(honeypot!, { target: { value: "bot.example" } });
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    const request = fetchSpy.mock.calls[0][1];
    expect(JSON.parse(String(request?.body))).toMatchObject({
      honeypot: "bot.example",
    });
  });

  it("does not push a lead when validation fails", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderModal();

    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(window.dataLayer).toEqual([]);
  });

  it("keeps the dialog and form values after a non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ success: true, inquiryId: "inquiry_123" }, { ok: false }),
    );
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => undefined);
    const onClose = renderModal();
    const user = await completeModalInquiry();

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText(SUBMIT_ERROR)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Name/)).toHaveValue("Buyer Name");
    expect(screen.getByLabelText(/^Email/)).toHaveValue("buyer@example.com");
    expect(screen.getByLabelText(/^Company/)).toHaveValue("Private Company");
    expect(screen.getByLabelText(/^Phone/)).toHaveValue("+61 400 123 456");
    expect(screen.getByLabelText(/^Notes/)).toHaveValue("Need lab dips before approval");
    expect(screen.getByLabelText(/^Quantity needed/)).toHaveValue(
      "500 kg confidential",
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(window.dataLayer).toEqual([]);
    expect(localStorage).toHaveLength(0);
  });

  it("keeps the dialog and form values after a network rejection", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => undefined);
    const onClose = renderModal();
    const user = await completeModalInquiry();

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText(SUBMIT_ERROR)).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Name/)).toHaveValue("Buyer Name");
    expect(screen.getByLabelText(/^Email/)).toHaveValue("buyer@example.com");
    expect(screen.getByLabelText(/^Company/)).toHaveValue("Private Company");
    expect(screen.getByLabelText(/^Phone/)).toHaveValue("+61 400 123 456");
    expect(screen.getByLabelText(/^Notes/)).toHaveValue("Need lab dips before approval");
    expect(screen.getByLabelText(/^Quantity needed/)).toHaveValue(
      "500 kg confidential",
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(window.dataLayer).toEqual([]);
    expect(localStorage).toHaveLength(0);
  });

  it.each([
    [
      "malformed JSON",
      {
        ok: true,
        json: vi.fn().mockRejectedValue(new SyntaxError("invalid JSON")),
      } as unknown as Response,
    ],
    ["an unsuccessful JSON body", jsonResponse({ success: false })],
    ["a success body without an inquiry ID", jsonResponse({ success: true })],
  ])("rejects %s without recording a lead", async (_label, response) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(response);
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
    renderModal();
    const user = await completeModalInquiry();

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText(SUBMIT_ERROR)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Name/)).toHaveValue("Buyer Name");
    expect(window.dataLayer).toEqual([]);
    expect(localStorage).toHaveLength(0);
  });
});
