import React from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

let pathname = "/products";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

import { AnalyticsRouteTracker } from "@/components/analytics/AnalyticsRouteTracker";
import type { AnalyticsDataLayerItem, OrangePageViewDataLayerItem } from "@/types/analytics";

function isPageView(item: AnalyticsDataLayerItem): item is OrangePageViewDataLayerItem {
  return !Array.isArray(item) && "event" in item && item.event === "orange_page_view";
}

function queuedPaths(): string[] {
  return Array.from(window.dataLayer ?? []).flatMap((item) =>
    isPageView(item) ? [item.page_path] : [],
  );
}

describe("AnalyticsRouteTracker", () => {
  beforeEach(() => {
    pathname = "/products";
  });

  it("tracks the initial pathname once in React Strict Mode", async () => {
    render(
      <React.StrictMode>
        <AnalyticsRouteTracker />
      </React.StrictMode>,
    );

    await waitFor(() => expect(queuedPaths()).toEqual(["/products"]));
  });

  it("does not duplicate the same pathname after a remount", async () => {
    const first = render(<AnalyticsRouteTracker />);
    await waitFor(() => expect(queuedPaths()).toEqual(["/products"]));
    first.unmount();

    render(<AnalyticsRouteTracker />);

    await waitFor(() => expect(queuedPaths()).toEqual(["/products"]));
  });

  it("tracks pathname changes and tracks a revisited pathname again", async () => {
    const view = render(<AnalyticsRouteTracker />);
    await waitFor(() => expect(queuedPaths()).toEqual(["/products"]));

    pathname = "/contact?private=value";
    view.rerender(<AnalyticsRouteTracker />);
    await waitFor(() => expect(queuedPaths()).toEqual(["/products", "/contact"]));

    pathname = "/products";
    view.rerender(<AnalyticsRouteTracker />);
    await waitFor(() => expect(queuedPaths()).toEqual(["/products", "/contact", "/products"]));
  });

  it("renders nothing", () => {
    const { container } = render(<AnalyticsRouteTracker />);
    expect(container).toBeEmptyDOMElement();
  });
});
