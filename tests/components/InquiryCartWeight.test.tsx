import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InquiryBar, resetBatchInquiryStateForTests } from "@/components/InquiryBar";
import { InquiryCartProvider, useInquiryCart } from "@/components/InquiryCartProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import type { Fabric } from "@/lib/data";
import { OPEN_BATCH_INQUIRY_EVENT } from "@/lib/inquiry-events";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

function InquiryHarness({ fabric }: { fabric: Fabric }) {
  const { addItem } = useInquiryCart();
  return (
    <>
      <button
        type="button"
        onClick={() => {
          addItem(fabric);
          window.dispatchEvent(new Event(OPEN_BATCH_INQUIRY_EVENT));
        }}
      >
        Open article inquiry
      </button>
      <InquiryBar />
    </>
  );
}

afterEach(async () => {
  await act(async () => {
    resetBatchInquiryStateForTests();
    await Promise.resolve();
  });
});

describe("inquiry cart weight specifications", () => {
  it.each([
    { name: "source confirmation label", weight: 0, weightLabel: "Confirm GSM", display: "Confirm GSM", submitted: "Confirm GSM" },
    { name: "source range label", weight: 250, weightLabel: "250-260 GSM", display: "250-260 GSM", submitted: "250-260 GSM" },
    { name: "missing weight without a label", weight: 0, weightLabel: undefined, display: "Confirm GSM", submitted: undefined },
    { name: "positive numeric fallback", weight: 280, weightLabel: undefined, display: "280 GSM", submitted: "280 gsm" },
  ])("preserves the $name through the real cart and batch form", async ({ weight, weightLabel, display, submitted }) => {
    const fabric: Fabric = {
      id: "test-article",
      name: "Test article",
      construction: "knit",
      composition: "100% test fibre",
      weight,
      weightLabel,
      width: 160,
      tags: [],
      textureImage: "",
      sceneImage: "",
      description: "Test specification",
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, inquiryId: "test-inquiry" }),
    } as Response);
    const user = userEvent.setup();
    render(
      <LocaleProvider>
        <InquiryCartProvider>
          <InquiryHarness fabric={fabric} />
        </InquiryCartProvider>
      </LocaleProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Open article inquiry" }));
    const dialog = await screen.findByRole("dialog", { name: "Batch inquiry" });
    expect(dialog).toHaveTextContent(`100% test fibre | ${display}`);
    expect(dialog.textContent).not.toMatch(/\b0\s*g(?:sm)?\b/i);

    fireEvent.change(screen.getByLabelText("Name *"), { target: { value: "Test Buyer" } });
    fireEvent.change(screen.getByLabelText("Phone *"), { target: { value: "+61 400 000 000" } });
    fireEvent.change(screen.getByLabelText("Email *"), { target: { value: "buyer@example.com" } });
    await user.click(screen.getByRole("button", { name: "Submit inquiry" }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledOnce());
    const payload = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));
    if (submitted === undefined) {
      expect(payload.items[0]).not.toHaveProperty("weight");
    } else {
      expect(payload.items[0].weight).toBe(submitted);
    }
    expect(JSON.stringify(payload.items[0])).not.toMatch(/"weight":"0\s*g(?:sm)?"/i);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Submitted"));
  });
});
