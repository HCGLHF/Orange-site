import React, { useEffect, useState, type ComponentType } from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetBatchInquiryStateForTests } from "@/components/InquiryBar";
import { InquiryCartProvider, useInquiryCart } from "@/components/InquiryCartProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import { dispatchOpenBatchInquiry, OPEN_BATCH_INQUIRY_EVENT } from "@/lib/inquiry-events";
import type { Fabric } from "@/lib/data";

const lazyImport = vi.hoisted(() => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { gate, release };
});

vi.mock("next/dynamic", () => ({
  default:
    (loader: () => Promise<ComponentType<Record<string, unknown>>>) =>
    function DeferredComponent(props: Record<string, unknown>) {
      const [LoadedComponent, setLoadedComponent] = useState<ComponentType<Record<string, unknown>> | null>(null);

      useEffect(() => {
        let active = true;
        void lazyImport.gate
          .then(loader)
          .then((component) => {
            if (active) setLoadedComponent(() => component);
          });
        return () => {
          active = false;
        };
      }, []);

      return LoadedComponent ? <LoadedComponent {...props} /> : null;
    },
}));

import { DeferredInquiryBarHost } from "@/components/DeferredInquiryBarHost";

const testFabric: Fabric = {
  id: "deferred-host-fabric",
  name: "Deferred Host Fabric",
  construction: "knit",
  composition: "100% test fibre",
  weight: 200,
  width: 160,
  tags: [],
  textureImage: "/test-texture.jpg",
  sceneImage: "/test-scene.jpg",
  description: "Deferred host test fabric",
  stockStatus: "In stock",
};

function DeferredHostHarness() {
  const { addItem } = useInquiryCart();

  return (
    <>
      <button type="button" onClick={() => addItem(testFabric)}>
        Add deferred fabric
      </button>
      <button type="button">First stable opener</button>
      <button type="button">Second stable opener</button>
      <DeferredInquiryBarHost />
    </>
  );
}

function closeBatchDialog() {
  const dialog = screen.getByRole("dialog", { name: "Batch inquiry" });
  fireEvent.click(within(dialog).getAllByRole("button", { name: "Close" })[1]);
}

beforeEach(() => {
  vi.stubGlobal("React", React);
});

afterEach(async () => {
  await act(async () => {
    resetBatchInquiryStateForTests();
    await Promise.resolve();
  });
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("DeferredInquiryBarHost", () => {
  it("buffers the first event until the lazy dialog loads, then handles later events once with their openers", async () => {
    const removeListenerSpy = vi.spyOn(window, "removeEventListener");
    const view = render(
      <LocaleProvider>
        <InquiryCartProvider>
          <DeferredHostHarness />
        </InquiryCartProvider>
      </LocaleProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Add deferred fabric" }));
    const firstOpener = screen.getByRole("button", { name: "First stable opener" });
    firstOpener.focus();

    act(() => dispatchOpenBatchInquiry(firstOpener));
    expect(screen.queryByRole("dialog", { name: "Batch inquiry" })).not.toBeInTheDocument();

    await act(async () => {
      lazyImport.release();
      await lazyImport.gate;
    });
    expect(await screen.findByRole("dialog", { name: "Batch inquiry" })).toBeInTheDocument();
    expect(screen.getAllByRole("dialog", { name: "Batch inquiry" })).toHaveLength(1);

    closeBatchDialog();
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Batch inquiry" })).not.toBeInTheDocument();
    });
    expect(firstOpener).toHaveFocus();

    const secondOpener = screen.getByRole("button", { name: "Second stable opener" });
    secondOpener.focus();
    act(() => dispatchOpenBatchInquiry(secondOpener));

    expect(await screen.findByRole("dialog", { name: "Batch inquiry" })).toBeInTheDocument();
    expect(screen.getAllByRole("dialog", { name: "Batch inquiry" })).toHaveLength(1);
    closeBatchDialog();
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Batch inquiry" })).not.toBeInTheDocument();
    });
    expect(secondOpener).toHaveFocus();

    view.unmount();
    expect(removeListenerSpy).toHaveBeenCalledWith(
      OPEN_BATCH_INQUIRY_EVENT,
      expect.any(Function),
    );
  });
});
