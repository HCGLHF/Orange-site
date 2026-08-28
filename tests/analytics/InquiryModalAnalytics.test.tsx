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

async function completeModalInquiry(user = userEvent.setup()) {
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
    expect(
      screen.queryByText("Submissions are saved on this device"),
    ).not.toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
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

    const success = await screen.findByRole("status");
    expect(success).toHaveTextContent("Submitted successfully");
    expect(success).toHaveAttribute("aria-live", "polite");
    expect(success).toHaveAttribute("tabindex", "-1");
    expect(success).toHaveFocus();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "false");
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

    await user.click(screen.getByRole("button", { name: "OK" }));
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

    await user.click(screen.getByRole("button", { name: "OK" }));
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

    await user.click(await screen.findByRole("button", { name: "OK" }));
  });

  it("shares a pending operation and its confirmed result across unmount and remount", async () => {
    const originalResponse = deferred<Response>();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockReturnValue(originalResponse.promise);
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
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
    const remountedUser = userEvent.setup();
    const dialog = screen.getByRole("dialog");
    const submitButton = screen.getByRole("button", { name: "Submit" });

    expect(dialog).toHaveAttribute("aria-busy", "true");
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    for (const closeButton of screen.getAllByRole("button", { name: "Close" })) {
      expect(closeButton).toBeDisabled();
    }
    await remountedUser.click(submitButton);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      originalResponse.resolve(
        jsonResponse({ success: true, inquiryId: "inquiry_123" }),
      );
      await originalResponse.promise;
    });

    const lead = { event: "orange_generate_lead", form_name: "single_inquiry" };
    const success = await screen.findByRole("status");
    expect(success).toHaveTextContent("Submitted successfully");
    expect(success).toHaveFocus();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).toEqual([lead]);

    await remountedUser.click(screen.getByRole("button", { name: "OK" }));
  });

  it("restores a remounted failed draft and retries its edited values with the same ID", async () => {
    const originalResponse = deferred<Response>();
    const retryResponse = deferred<Response>();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockReturnValueOnce(originalResponse.promise)
      .mockReturnValueOnce(retryResponse.promise);
    const uuidSpy = vi
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValue(SUBMISSION_ID);
    const firstView = render(
      <LocaleProvider>
        <InquiryModal open onClose={vi.fn()} />
      </LocaleProvider>,
    );
    const firstUser = await completeModalInquiry();
    await firstUser.selectOptions(
      screen.getByLabelText(/^Fabric of interest/),
      "french-terry",
    );
    const firstHoneypot = document.querySelector<HTMLInputElement>(
      'input[name="website"]',
    );
    fireEvent.change(firstHoneypot!, { target: { value: "draft.example" } });

    await firstUser.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    firstView.unmount();

    const remountedView = render(
      <LocaleProvider>
        <InquiryModal open onClose={vi.fn()} />
      </LocaleProvider>,
    );
    const retryUser = userEvent.setup();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByLabelText(/^Name/)).toHaveValue("Buyer Name");
    await retryUser.clear(screen.getByLabelText(/^Name/));
    await retryUser.type(screen.getByLabelText(/^Name/), "Remounted Buyer");
    await retryUser.clear(screen.getByLabelText(/^Email/));
    await retryUser.type(
      screen.getByLabelText(/^Email/),
      "remounted@example.com",
    );
    await retryUser.clear(screen.getByLabelText(/^Company/));
    await retryUser.type(screen.getByLabelText(/^Company/), "Remounted Company");
    await retryUser.clear(screen.getByLabelText(/^Phone/));
    await retryUser.type(screen.getByLabelText(/^Phone/), "+61 499 999 999");
    await retryUser.clear(screen.getByLabelText(/^Notes/));
    await retryUser.type(
      screen.getByLabelText(/^Notes/),
      "Updated after remount",
    );
    await retryUser.selectOptions(
      screen.getByLabelText(/^Fabric of interest/),
      "cotton-jersey",
    );
    await retryUser.clear(screen.getByLabelText(/^Quantity needed/));
    await retryUser.type(
      screen.getByLabelText(/^Quantity needed/),
      "750 kg updated",
    );
    fireEvent.change(
      document.querySelector<HTMLInputElement>('input[name="website"]')!,
      { target: { value: "edited.example" } },
    );

    await act(async () => {
      originalResponse.resolve(
        jsonResponse({ success: false }, { ok: false }),
      );
      await originalResponse.promise;
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(SUBMIT_ERROR);
    remountedView.unmount();

    const failedView = render(
      <LocaleProvider>
        <InquiryModal open onClose={vi.fn()} />
      </LocaleProvider>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(SUBMIT_ERROR);
    expect(screen.getByLabelText(/^Name/)).toHaveValue("Remounted Buyer");
    expect(screen.getByLabelText(/^Email/)).toHaveValue("remounted@example.com");
    expect(screen.getByLabelText(/^Company/)).toHaveValue("Remounted Company");
    expect(screen.getByLabelText(/^Phone/)).toHaveValue("+61 499 999 999");
    expect(screen.getByLabelText(/^Notes/)).toHaveValue("Updated after remount");
    expect(screen.getByLabelText(/^Fabric of interest/)).toHaveValue(
      "cotton-jersey",
    );
    expect(screen.getByLabelText(/^Quantity needed/)).toHaveValue(
      "750 kg updated",
    );
    expect(
      document.querySelector<HTMLInputElement>('input[name="website"]'),
    ).toHaveValue("edited.example");

    fireEvent.change(
      document.querySelector<HTMLInputElement>('input[name="website"]')!,
      { target: { value: "" } },
    );

    const failedRetryUser = userEvent.setup();
    await failedRetryUser.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
    expect.soft(screen.queryByRole("document")).toHaveFocus();

    await act(async () => {
      retryResponse.resolve(
        jsonResponse({ success: true, inquiryId: "inquiry_retry" }),
      );
      await retryResponse.promise;
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Submitted successfully",
    );
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const firstBody = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));
    const retryBody = JSON.parse(String(fetchSpy.mock.calls[1][1]?.body));
    expect(firstBody).toMatchObject({
      customer: "Buyer Name",
      email: "buyer@example.com",
      company: "Private Company",
      phone: "+61 400 123 456",
      notes: "Need lab dips before approval",
      honeypot: "draft.example",
      items: [{ name: "French terry fabric", quantity: "500 kg confidential" }],
    });
    expect(retryBody).toMatchObject({
      submissionId: firstBody.submissionId,
      customer: "Remounted Buyer",
      email: "remounted@example.com",
      company: "Remounted Company",
      phone: "+61 499 999 999",
      notes: "Updated after remount",
      honeypot: "",
      items: [{ name: "Cotton jersey fabric", quantity: "750 kg updated" }],
    });
    expect(retryBody.submissionId).toBe(SUBMISSION_ID);
    expect(uuidSpy).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).toEqual([
      { event: "orange_generate_lead", form_name: "single_inquiry" },
    ]);

    await failedRetryUser.click(screen.getByRole("button", { name: "OK" }));
    failedView.unmount();
    renderModal();
    expect(screen.getByLabelText(/^Name/)).toHaveValue("");
    expect(screen.getByLabelText(/^Email/)).toHaveValue("");
    expect(screen.getByLabelText(/^Fabric of interest/)).toHaveValue(
      "finished-range",
    );
    expect(
      document.querySelector<HTMLInputElement>('input[name="website"]'),
    ).toHaveValue("");
  });

  it("keeps a zero-subscriber success through StrictMode remounts until explicit reset", async () => {
    const nextSubmissionId = "123e4567-e89b-42d3-a456-426614174001";
    const pendingResponse = deferred<Response>();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockReturnValueOnce(pendingResponse.promise)
      .mockResolvedValueOnce(
        jsonResponse({ success: true, inquiryId: "inquiry_new" }),
      );
    const uuidSpy = vi
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce(SUBMISSION_ID)
      .mockReturnValueOnce(nextSubmissionId);
    const firstView = render(
      <React.StrictMode>
        <LocaleProvider>
          <InquiryModal open onClose={vi.fn()} />
        </LocaleProvider>
      </React.StrictMode>,
    );
    const firstUser = await completeModalInquiry();

    await firstUser.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    firstView.unmount();

    await act(async () => {
      pendingResponse.resolve(
        jsonResponse({ success: true, inquiryId: "inquiry_123" }),
      );
      await pendingResponse.promise;
    });

    const transientView = render(
      <React.StrictMode>
        <LocaleProvider>
          <InquiryModal open onClose={vi.fn()} />
        </LocaleProvider>
      </React.StrictMode>,
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Submitted successfully",
    );
    transientView.unmount();

    const onClose = vi.fn();
    render(
      <React.StrictMode>
        <LocaleProvider>
          <InquiryModal open onClose={onClose} />
        </LocaleProvider>
      </React.StrictMode>,
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Submitted successfully",
    );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).toEqual([
      { event: "orange_generate_lead", form_name: "single_inquiry" },
    ]);

    const remountedUser = userEvent.setup();
    await remountedUser.click(screen.getByRole("button", { name: "OK" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    const newDraftUser = await completeModalInquiry();
    await newDraftUser.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Submitted successfully",
    );
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const firstBody = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));
    const nextBody = JSON.parse(String(fetchSpy.mock.calls[1][1]?.body));
    expect(firstBody.submissionId).toBe(SUBMISSION_ID);
    expect(nextBody.submissionId).toBe(nextSubmissionId);
    expect(uuidSpy).toHaveBeenCalledTimes(2);

    await newDraftUser.click(screen.getByRole("button", { name: "OK" }));
  });

  it("reuses a draft submission ID after failure and rotates it after confirmed success", async () => {
    const nextSubmissionId = "123e4567-e89b-42d3-a456-426614174001";
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({ success: false }, { ok: false }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ success: true, inquiryId: "inquiry_retry" }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ success: true, inquiryId: "inquiry_new" }),
      );
    const uuidSpy = vi
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce(SUBMISSION_ID)
      .mockReturnValueOnce(nextSubmissionId);
    const firstView = render(
      <LocaleProvider>
        <InquiryModal open onClose={vi.fn()} />
      </LocaleProvider>,
    );
    const firstUser = await completeModalInquiry();

    await firstUser.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(SUBMIT_ERROR);
    const firstBody = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));
    firstView.unmount();

    renderModal();
    expect(screen.getByRole("alert")).toHaveTextContent(SUBMIT_ERROR);
    expect(screen.getByLabelText(/^Name/)).toHaveValue("Buyer Name");
    const retryUser = userEvent.setup();
    await retryUser.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Submitted successfully",
    );
    const retryBody = JSON.parse(String(fetchSpy.mock.calls[1][1]?.body));
    expect(retryBody.submissionId).toBe(firstBody.submissionId);
    expect(retryBody.submissionId).toBe(SUBMISSION_ID);
    expect(uuidSpy).toHaveBeenCalledTimes(1);

    await retryUser.click(screen.getByRole("button", { name: "OK" }));
    const newDraftUser = await completeModalInquiry();
    await newDraftUser.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Submitted successfully",
    );
    const newDraftBody = JSON.parse(String(fetchSpy.mock.calls[2][1]?.body));
    expect(newDraftBody.submissionId).toBe(nextSubmissionId);
    expect(newDraftBody.submissionId).not.toBe(SUBMISSION_ID);
    expect(uuidSpy).toHaveBeenCalledTimes(2);

    await newDraftUser.click(screen.getByRole("button", { name: "OK" }));
  });

  it("times out hung response parsing and retries with the same submission ID", async () => {
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
      .mockResolvedValueOnce(
        jsonResponse({ success: true, inquiryId: "inquiry_retry" }),
      );
    const uuidSpy = vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(SUBMISSION_ID);
    renderModal();
    await completeModalInquiry();

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
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
    expect(screen.getByLabelText(/^Name/)).toHaveValue("Buyer Name");
    expect(screen.getByLabelText(/^Email/)).toHaveValue("buyer@example.com");
    expect(screen.getByLabelText(/^Quantity needed/)).toHaveValue(
      "500 kg confidential",
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "false");
    expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
    expect(window.dataLayer).toEqual([]);

    const retryUser = userEvent.setup();
    await retryUser.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Submitted successfully",
    );
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const firstBody = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));
    const retryBody = JSON.parse(String(fetchSpy.mock.calls[1][1]?.body));
    expect(retryBody.submissionId).toBe(firstBody.submissionId);
    expect(uuidSpy).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).toEqual([
      { event: "orange_generate_lead", form_name: "single_inquiry" },
    ]);

    await act(async () => {
      lateBody.resolve({ success: true, inquiryId: "late_inquiry" });
      await lateBody.promise;
    });
    expect(window.dataLayer).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("Submitted successfully");

    await retryUser.click(screen.getByRole("button", { name: "OK" }));
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

    await user.click(screen.getByRole("button", { name: messages.zh.inquiryOk }));
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

    await user.click(await screen.findByRole("button", { name: "OK" }));
  });

  it("does not push a lead when validation fails", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderModal();

    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
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

    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent(SUBMIT_ERROR);
    expect(error).toHaveAttribute("aria-live", "assertive");
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

    await user.click(screen.getByRole("button", { name: "Cancel" }));
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

    await user.click(screen.getByRole("button", { name: "Cancel" }));
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

    await user.click(screen.getByRole("button", { name: "Cancel" }));
  });
});
