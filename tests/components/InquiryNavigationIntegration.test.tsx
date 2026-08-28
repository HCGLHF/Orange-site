import React from "react";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetBatchInquiryStateForTests } from "@/components/InquiryBar";
import { useInquiryCart } from "@/components/InquiryCartProvider";
import { InquiryProvider } from "@/components/InquiryProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import { Navbar } from "@/components/ui/Navbar";
import type { Fabric } from "@/lib/data";

vi.mock("next/navigation", () => ({
  usePathname: () => "/route-without-local-inquiry-bar",
}));

const testFabric: Fabric = {
  id: "global-inquiry-fabric",
  name: "Global Inquiry Fabric",
  construction: "knit",
  composition: "100% test fibre",
  weight: 220,
  width: 160,
  tags: [],
  textureImage: "/test-texture.jpg",
  sceneImage: "/test-scene.jpg",
  description: "Global inquiry integration test fabric",
  stockStatus: "In stock",
};

function RouteWithoutLocalInquiryBar() {
  const { addItem } = useInquiryCart();

  return (
    <main>
      <p>Route body without a local inquiry host</p>
      <button type="button" onClick={() => addItem(testFabric)}>
        Add test fabric
      </button>
    </main>
  );
}

function renderGlobalInquiryRoute() {
  return render(
    <LocaleProvider>
      <InquiryProvider>
        <Navbar />
        <RouteWithoutLocalInquiryBar />
      </InquiryProvider>
    </LocaleProvider>,
  );
}

function batchDialogControls() {
  const dialog = screen.getByRole("dialog", { name: "Batch inquiry" });
  const closeButtons = within(dialog).getAllByRole("button", { name: "Close" });
  const closeButton = closeButtons[1];
  const submitButton = within(dialog).getByRole("button", {
    name: "Submit inquiry",
  });
  return { dialog, closeButton, submitButton };
}

function singleDialogControls() {
  const dialog = screen.getByRole("dialog", { name: "Request free samples" });
  const closeButtons = within(dialog).getAllByRole("button", { name: "Close" });
  const closeButton = closeButtons[1];
  const submitButton = within(dialog).getByRole("button", { name: "Submit" });
  return { dialog, closeButton, submitButton };
}

describe("global inquiry navigation", () => {
  beforeEach(() => {
    vi.stubGlobal("React", React);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
  });

  afterEach(async () => {
    try {
      await act(async () => {
        resetBatchInquiryStateForTests();
        await Promise.resolve();
      });
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("routes from an empty single inquiry to the global batch dialog after the cart changes", async () => {
    const user = userEvent.setup();
    renderGlobalInquiryRoute();
    const quoteButton = screen.getByRole("button", { name: "Request a quote" });

    await user.click(quoteButton);
    const singleDialog = await screen.findByRole("dialog", {
      name: "Request free samples",
    });
    expect(singleDialog).toBeInTheDocument();

    await user.click(within(singleDialog).getAllByRole("button", { name: "Close" })[1]);
    await user.click(screen.getByRole("button", { name: "Add test fabric" }));
    await user.click(quoteButton);

    expect(
      await screen.findByRole("dialog", { name: "Batch inquiry" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("dialog", { name: "Batch inquiry" }),
    ).toHaveLength(1);
    expect(
      screen.queryByRole("dialog", { name: "Request free samples" }),
    ).not.toBeInTheDocument();
  });

  it("moves desktop focus into the empty-cart dialog, traps it, and restores the quote button", async () => {
    const user = userEvent.setup();
    renderGlobalInquiryRoute();
    const quoteButton = screen.getByRole("button", { name: "Request a quote" });

    await user.click(quoteButton);
    await screen.findByRole("dialog", { name: "Request free samples" });
    const { closeButton, submitButton } = singleDialogControls();

    expect(closeButton).toHaveFocus();
    submitButton.focus();
    await user.tab();
    expect(closeButton).toHaveFocus();
    await user.tab({ shift: true });
    expect(submitButton).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Request free samples" }),
      ).not.toBeInTheDocument();
    });
    expect(quoteButton).toHaveFocus();
  });

  it("moves desktop focus into the batch dialog, traps it, and restores the opener", async () => {
    const user = userEvent.setup();
    renderGlobalInquiryRoute();
    await user.click(screen.getByRole("button", { name: "Add test fabric" }));
    const quoteButton = screen.getByRole("button", { name: "Request a quote" });

    await user.click(quoteButton);
    await screen.findByRole("dialog", { name: "Batch inquiry" });
    const { closeButton, submitButton } = batchDialogControls();

    expect(closeButton).toHaveFocus();
    submitButton.focus();
    await user.tab();
    expect(closeButton).toHaveFocus();
    await user.tab({ shift: true });
    expect(submitButton).toHaveFocus();

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Batch inquiry" }),
      ).not.toBeInTheDocument();
    });
    expect(quoteButton).toHaveFocus();
  });

  it("hands mobile trigger focus to the batch dialog and restores it after close", async () => {
    const user = userEvent.setup();
    renderGlobalInquiryRoute();
    await user.click(screen.getByRole("button", { name: "Add test fabric" }));
    const menuTrigger = screen.getByRole("button", {
      name: "Open navigation menu",
    });

    await user.click(menuTrigger);
    await user.click(screen.getByRole("button", { name: "Request a Quote" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "O'range Textile" }),
      ).not.toBeInTheDocument();
    });
    await screen.findByRole("dialog", { name: "Batch inquiry" });
    const { closeButton } = batchDialogControls();
    expect(closeButton).toHaveFocus();

    await user.click(closeButton);
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Batch inquiry" }),
      ).not.toBeInTheDocument();
    });
    expect(menuTrigger).toHaveFocus();
  });

  it("hands mobile drawer focus to the empty-cart dialog, traps it, and restores the menu trigger", async () => {
    const user = userEvent.setup();
    renderGlobalInquiryRoute();
    const menuTrigger = screen.getByRole("button", {
      name: "Open navigation menu",
    });

    await user.click(menuTrigger);
    await user.click(screen.getByRole("button", { name: "Request a Quote" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "O'range Textile" }),
      ).not.toBeInTheDocument();
    });
    await screen.findByRole("dialog", { name: "Request free samples" });
    const { closeButton, submitButton } = singleDialogControls();
    expect(closeButton).toHaveFocus();

    submitButton.focus();
    await user.tab();
    expect(closeButton).toHaveFocus();
    await user.tab({ shift: true });
    expect(submitButton).toHaveFocus();

    await user.click(closeButton);
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Request free samples" }),
      ).not.toBeInTheDocument();
    });
    expect(menuTrigger).toHaveFocus();
  });
});
