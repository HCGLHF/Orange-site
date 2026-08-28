import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FabricsInquiryAnchor } from "@/components/FabricsInquiryAnchor";
import { InquiryBar, resetBatchInquiryStateForTests } from "@/components/InquiryBar";
import { InquiryCartProvider, useInquiryCart } from "@/components/InquiryCartProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import StickyInquiryBar from "@/components/StickyInquiryBar";
import type { Fabric } from "@/lib/data";

const testFabric: Fabric = {
  id: "sticky-opener-fabric",
  name: "Sticky Opener Fabric",
  construction: "knit",
  composition: "100% test fibre",
  weight: 210,
  width: 165,
  tags: [],
  textureImage: "/test-texture.jpg",
  sceneImage: "/test-scene.jpg",
  description: "Sticky opener integration test fabric",
  stockStatus: "In stock",
};

function StickyHarness({ withAnchor }: { withAnchor: boolean }) {
  const { addItem } = useInquiryCart();

  return (
    <>
      <button type="button" onClick={() => addItem(testFabric)}>
        Add sticky fabric
      </button>
      {withAnchor ? <FabricsInquiryAnchor /> : null}
      <StickyInquiryBar />
      <InquiryBar />
    </>
  );
}

beforeEach(() => {
  vi.stubGlobal("React", React);
});

afterEach(async () => {
  try {
    await act(async () => {
      resetBatchInquiryStateForTests();
      await Promise.resolve();
    });
  } finally {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Reflect.deleteProperty(Element.prototype, "scrollIntoView");
  }
});

describe("StickyInquiryBar batch opener", () => {
  it.each([
    ["after its anchor delay", true],
    ["immediately without an anchor", false],
  ])("restores focus to the persistent sticky trigger %s", async (_label, withAnchor) => {
    if (withAnchor) vi.useFakeTimers();
    vi.stubGlobal("scrollY", 400);
    const scrollIntoView = vi.fn();
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    render(
      <LocaleProvider>
        <InquiryCartProvider>
          <StickyHarness withAnchor={withAnchor} />
        </InquiryCartProvider>
      </LocaleProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add sticky fabric" }));
    fireEvent.scroll(window);
    const stickyTrigger = screen.getByRole("button", {
      name: /1 pending inquiry/i,
    });
    fireEvent.click(stickyTrigger);
    fireEvent.click(screen.getByRole("button", { name: "Fill inquiry form" }));

    if (withAnchor) {
      expect(stickyTrigger).toHaveFocus();
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });
      expect(screen.queryByRole("dialog", { name: "Batch inquiry" })).not.toBeInTheDocument();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(380);
      });
    } else {
      expect(scrollIntoView).not.toHaveBeenCalled();
    }

    const dialog = screen.getByRole("dialog", { name: "Batch inquiry" });
    expect(screen.getAllByRole("dialog", { name: "Batch inquiry" })).toHaveLength(1);
    fireEvent.click(within(dialog).getAllByRole("button", { name: "Close" })[1]);
    expect(screen.queryByRole("dialog", { name: "Batch inquiry" })).not.toBeInTheDocument();
    expect(stickyTrigger).toHaveFocus();
  });
});
