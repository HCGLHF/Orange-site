import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InquiryModal } from "@/components/ui/InquiryModal";
import { LocaleProvider } from "@/components/LocaleProvider";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

async function completeModalInquiry() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/^Name/), "Buyer Name");
  await user.type(screen.getByLabelText(/^Email/), "buyer@example.com");
  await user.type(screen.getByLabelText(/^Company/), "Private Company");
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

describe("InquiryModal conversion analytics", () => {
  it("pushes one exact single-inquiry lead only after a successful response", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true } as Response);
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
    const onClose = renderModal();
    const user = await completeModalInquiry();

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(window.dataLayer).toEqual([
      { event: "orange_generate_lead", form_name: "single_inquiry" },
    ]);
    const analyticsPayload = JSON.stringify(window.dataLayer);
    expect(analyticsPayload).not.toContain("Buyer Name");
    expect(analyticsPayload).not.toContain("buyer@example.com");
    expect(analyticsPayload).not.toContain("Private Company");
    expect(analyticsPayload).not.toContain("500 kg confidential");
  });

  it("keeps the accepted-submission success flow when the analytics queue is frozen", async () => {
    window.dataLayer = Object.freeze([]) as unknown as Window["dataLayer"];
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true } as Response);
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const onClose = renderModal();
    const user = await completeModalInquiry();

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(window.alert).toHaveBeenCalledWith(
      "Submitted successfully. We will contact you shortly.",
    );
  });

  it("does not push a lead when validation fails", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderModal();

    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(window.dataLayer).toEqual([]);
  });

  it("does not push a lead for a non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false } as Response);
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
    renderModal();
    const user = await completeModalInquiry();

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    expect(window.dataLayer).toEqual([]);
  });

  it("does not push a lead for a network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    renderModal();
    const user = await completeModalInquiry();

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    expect(window.dataLayer).toEqual([]);
  });
});
