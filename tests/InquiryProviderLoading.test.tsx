import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));

vi.mock("@/components/DeferredStickyInquiryBar", () => ({
  DeferredStickyInquiryBar: () => null,
}));

vi.mock("@/components/InquiryCartProvider", () => ({
  InquiryCartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import {
  InquiryModalLoadBoundary,
  InquiryModalLoading,
} from "@/components/InquiryProvider";

function BrokenModal(): React.JSX.Element {
  throw new Error("chunk failed");
}

describe("InquiryModalLoading", () => {
  it("announces that the inquiry form is loading", () => {
    render(<InquiryModalLoading isLoading />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading inquiry form…");
  });

  it("shows an accessible error and retries once", async () => {
    const retry = vi.fn();
    const user = userEvent.setup();
    render(<InquiryModalLoading error={new Error("chunk failed")} retry={retry} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The inquiry form could not load. Please try again.",
    );
    await user.click(screen.getByRole("button", { name: "Retry" }));
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(retry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Retry" })).toBeDisabled();
  });

  it("keeps Retry disabled when retry is unavailable", () => {
    render(<InquiryModalLoading error={new Error("chunk failed")} />);

    expect(screen.getByRole("button", { name: "Retry" })).toBeDisabled();
  });

  it("keeps an open modal failure accessible, retryable once, and closable", async () => {
    const onClose = vi.fn();
    const onRetry = vi.fn();
    const user = userEvent.setup();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <InquiryModalLoadBoundary
        initialFabricId="french-terry"
        onClose={onClose}
        onRetry={onRetry}
      >
        <BrokenModal />
      </InquiryModalLoadBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The inquiry form could not load. Please try again.",
    );
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
