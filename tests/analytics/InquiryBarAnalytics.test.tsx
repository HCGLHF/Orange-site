import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InquiryBar } from "@/components/InquiryBar";
import { InquiryCartProvider, useInquiryCart } from "@/components/InquiryCartProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import type { Fabric } from "@/lib/data";
import { OPEN_BATCH_INQUIRY_EVENT } from "@/lib/inquiry-events";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

const testFabric: Fabric = {
  id: "private-fabric-article",
  name: "Private Fabric Article",
  composition: "Sensitive composition",
  weight: 280,
  width: 160,
  tags: [],
  textureImage: "/test-texture.jpg",
  sceneImage: "/test-scene.jpg",
  description: "Private fabric description",
  stockStatus: "Private stock status",
};

function InquiryHarness() {
  const { addItem } = useInquiryCart();
  return (
    <button
      type="button"
      onClick={() => {
        addItem(testFabric);
        window.dispatchEvent(new Event(OPEN_BATCH_INQUIRY_EVENT));
      }}
    >
      Open batch inquiry
    </button>
  );
}

async function renderOpenBatchInquiry() {
  const user = userEvent.setup();
  render(
    <LocaleProvider>
      <InquiryCartProvider>
        <InquiryHarness />
        <InquiryBar />
      </InquiryCartProvider>
    </LocaleProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Open batch inquiry" }));
  await screen.findByRole("dialog", { name: "Batch inquiry" });
  return user;
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

describe("InquiryBar conversion analytics", () => {
  it("pushes one exact batch-inquiry lead after success and before resetting the form", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, skipped: false }),
      } as Response)
      .mockResolvedValueOnce({ ok: true } as Response);
    const resetSpy = vi
      .spyOn(HTMLFormElement.prototype, "reset")
      .mockImplementation(() => undefined);
    const dataLayer = window.dataLayer as unknown as Array<{
      event: string;
      form_name?: string;
    }>;
    const pushSpy = vi.spyOn(dataLayer, "push");
    const user = await renderOpenBatchInquiry();
    await completeBatchInquiry(user);

    await user.click(screen.getByRole("button", { name: "Submit inquiry" }));

    await screen.findByRole("heading", { name: "Submitted" });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(dataLayer).toEqual([
      { event: "orange_generate_lead", form_name: "batch_inquiry" },
    ]);
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy.mock.invocationCallOrder[0]).toBeLessThan(
      resetSpy.mock.invocationCallOrder[0],
    );
    const analyticsPayload = JSON.stringify(dataLayer);
    for (const privateValue of [
      "Buyer Name",
      "Private Company",
      "+86 138 0000 0000",
      "buyer@example.com",
      "Private target price and delivery notes",
      "Private Fabric Article",
      "Sensitive composition",
      "Private stock status",
    ]) {
      expect(analyticsPayload).not.toContain(privateValue);
    }
  });

  it("does not push a lead when validation fails", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await renderOpenBatchInquiry();

    fireEvent.submit(screen.getByRole("button", { name: "Submit inquiry" }).closest("form")!);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(window.dataLayer).toEqual([]);
  });

  it("does not push a lead for a non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, error: "rejected" }),
    } as Response);
    const user = await renderOpenBatchInquiry();
    await completeBatchInquiry(user);

    await user.click(screen.getByRole("button", { name: "Submit inquiry" }));

    await waitFor(() => expect(screen.getByText("rejected")).toBeInTheDocument());
    expect(window.dataLayer).toEqual([]);
  });

  it("does not push a lead for a network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    const user = await renderOpenBatchInquiry();
    await completeBatchInquiry(user);

    await user.click(screen.getByRole("button", { name: "Submit inquiry" }));

    await waitFor(() =>
      expect(screen.getByText("Submission failed. Please try again or email us directly.")).toBeInTheDocument(),
    );
    expect(window.dataLayer).toEqual([]);
  });
});
