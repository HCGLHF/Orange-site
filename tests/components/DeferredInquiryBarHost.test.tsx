import React, { useEffect, useState, type ComponentType } from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetBatchInquiryStateForTests } from "@/components/InquiryBar";
import { InquiryCartProvider, useInquiryCart } from "@/components/InquiryCartProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import { dispatchOpenBatchInquiry, OPEN_BATCH_INQUIRY_EVENT } from "@/lib/inquiry-events";
import type { Fabric } from "@/lib/data";

type LoadingProps = {
  error?: Error | null;
  isLoading?: boolean;
  pastDelay?: boolean;
  timedOut?: boolean;
};

type LazyAttempt = {
  gate: Promise<void>;
  resolve: () => void;
  reject: (error: Error) => void;
};

const lazyImports = vi.hoisted(() => ({ attempts: [] as LazyAttempt[] }));

vi.mock("next/dynamic", () => ({
  default: (
    loader: () => Promise<ComponentType<Record<string, unknown>>>,
    options?: { loading?: ComponentType<LoadingProps> },
  ) => {
    let resolve!: () => void;
    let reject!: (error: Error) => void;
    const gate = new Promise<void>((promiseResolve, promiseReject) => {
      resolve = promiseResolve;
      reject = promiseReject;
    });
    const attempt = { gate, resolve, reject };
    lazyImports.attempts.push(attempt);

    return function DeferredComponent(props: Record<string, unknown>) {
      const [LoadedComponent, setLoadedComponent] = useState<ComponentType<Record<string, unknown>> | null>(null);
      const [loadError, setLoadError] = useState<Error | null>(null);

      useEffect(() => {
        let active = true;
        void attempt.gate
          .then(loader)
          .then((component) => {
            if (active) setLoadedComponent(() => component);
          })
          .catch((error: unknown) => {
            if (active) {
              setLoadError(error instanceof Error ? error : new Error("Lazy load failed"));
            }
          });
        return () => {
          active = false;
        };
      }, []);

      const LoadingComponent = options?.loading;
      if (loadError) {
        if (LoadingComponent) {
          return (
            <LoadingComponent
              error={loadError}
              isLoading={false}
              pastDelay
              timedOut={false}
            />
          );
        }
        throw loadError;
      }

      if (LoadedComponent) return <LoadedComponent {...props} />;
      return LoadingComponent ? (
        <LoadingComponent
          error={null}
          isLoading
          pastDelay
          timedOut={false}
        />
      ) : null;
    };
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
  it("recovers from failed lazy loads without losing the latest opener or listener handoff", async () => {
    const user = userEvent.setup();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const addListenerSpy = vi.spyOn(window, "addEventListener");
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
    const secondOpener = screen.getByRole("button", { name: "Second stable opener" });

    expect(lazyImports.attempts).toHaveLength(1);
    firstOpener.focus();
    act(() => dispatchOpenBatchInquiry(firstOpener));
    expect(await screen.findByRole("status")).toHaveTextContent("Loading inquiry form");

    await act(async () => {
      lazyImports.attempts[0].reject(new Error("first chunk failure"));
      await Promise.resolve();
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The inquiry form could not load",
    );

    secondOpener.focus();
    act(() => dispatchOpenBatchInquiry(secondOpener));
    await waitFor(() => expect(lazyImports.attempts).toHaveLength(2));
    expect(await screen.findByRole("status")).toHaveTextContent("Loading inquiry form");

    await act(async () => {
      lazyImports.attempts[1].reject(new Error("second chunk failure"));
      await Promise.resolve();
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The inquiry form could not load",
    );

    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(lazyImports.attempts).toHaveLength(3));
    expect(await screen.findByRole("status")).toHaveTextContent("Loading inquiry form");

    await act(async () => {
      lazyImports.attempts[2].resolve();
      await lazyImports.attempts[2].gate;
    });
    expect(await screen.findByRole("dialog", { name: "Batch inquiry" })).toBeInTheDocument();
    expect(screen.getAllByRole("dialog", { name: "Batch inquiry" })).toHaveLength(1);

    closeBatchDialog();
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Batch inquiry" })).not.toBeInTheDocument();
    });
    expect(secondOpener).toHaveFocus();

    firstOpener.focus();
    act(() => dispatchOpenBatchInquiry(firstOpener));
    expect(await screen.findByRole("dialog", { name: "Batch inquiry" })).toBeInTheDocument();
    expect(screen.getAllByRole("dialog", { name: "Batch inquiry" })).toHaveLength(1);
    expect(lazyImports.attempts).toHaveLength(3);
    closeBatchDialog();
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Batch inquiry" })).not.toBeInTheDocument();
    });
    expect(firstOpener).toHaveFocus();

    const openHandlers = addListenerSpy.mock.calls
      .filter(([eventName]) => eventName === OPEN_BATCH_INQUIRY_EVENT)
      .map(([, handler]) => handler);
    expect(openHandlers.length).toBeGreaterThan(0);
    view.unmount();
    for (const handler of openHandlers) {
      expect(removeListenerSpy).toHaveBeenCalledWith(
        OPEN_BATCH_INQUIRY_EVENT,
        handler,
      );
    }
  });
});
