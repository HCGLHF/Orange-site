import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OPEN_BATCH_INQUIRY_EVENT } from "@/lib/inquiry-events";

const inquiryMocks = vi.hoisted(() => ({
  openInquiry: vi.fn(),
  totalCount: 0,
}));

vi.mock("@/components/InquiryProvider", () => ({
  useInquiry: () => ({ openInquiry: inquiryMocks.openInquiry }),
}));

vi.mock("@/components/InquiryCartProvider", () => ({
  useInquiryCart: () => ({ totalCount: inquiryMocks.totalCount }),
}));

import { RequestQuoteButton } from "@/components/RequestQuoteButton";

describe("RequestQuoteButton", () => {
  let listenerController: AbortController;

  beforeEach(() => {
    inquiryMocks.openInquiry.mockReset();
    inquiryMocks.totalCount = 0;
    listenerController = new window.AbortController();
    vi.stubGlobal("React", React);
  });

  afterEach(() => {
    try {
      listenerController.abort();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("opens one general inquiry without a fabricated fabric ID for an empty cart", async () => {
    const onBatchOpen = vi.fn();
    window.addEventListener(OPEN_BATCH_INQUIRY_EVENT, onBatchOpen, {
      signal: listenerController.signal,
    });
    const user = userEvent.setup();
    render(<RequestQuoteButton>Request a Quote</RequestQuoteButton>);

    await user.click(screen.getByRole("button", { name: "Request a Quote" }));

    expect(inquiryMocks.openInquiry).toHaveBeenCalledTimes(1);
    expect(inquiryMocks.openInquiry.mock.calls[0]).toEqual([]);
    expect(onBatchOpen).not.toHaveBeenCalled();
  });

  it("dispatches one batch inquiry event and skips the general inquiry for a populated cart", async () => {
    inquiryMocks.totalCount = 2;
    const onBatchOpen = vi.fn();
    window.addEventListener(OPEN_BATCH_INQUIRY_EVENT, onBatchOpen, {
      signal: listenerController.signal,
    });
    const user = userEvent.setup();
    render(<RequestQuoteButton>Request a Quote</RequestQuoteButton>);

    await user.click(screen.getByRole("button", { name: "Request a Quote" }));

    expect(onBatchOpen).toHaveBeenCalledTimes(1);
    expect(inquiryMocks.openInquiry).not.toHaveBeenCalled();
  });

  it("runs onBeforeOpen before routing to the inquiry form", async () => {
    inquiryMocks.totalCount = 1;
    const callOrder: string[] = [];
    const onBeforeOpen = vi.fn(() => callOrder.push("before"));
    const onBatchOpen = () => callOrder.push("route");
    window.addEventListener(OPEN_BATCH_INQUIRY_EVENT, onBatchOpen, {
      signal: listenerController.signal,
    });
    const user = userEvent.setup();
    render(
      <RequestQuoteButton onBeforeOpen={onBeforeOpen} className="quote-style">
        Request a Quote
      </RequestQuoteButton>,
    );

    const button = screen.getByRole("button", { name: "Request a Quote" });
    await user.click(button);

    expect(callOrder).toEqual(["before", "route"]);
    expect(onBeforeOpen).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("quote-style");
  });
});
