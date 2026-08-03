import React from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

let pathname = "/fabrics";

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
    pathname = "/fabrics";
  });

  it("tracks the initial pathname once in React Strict Mode", async () => {
    render(
      <React.StrictMode>
        <AnalyticsRouteTracker />
      </React.StrictMode>,
    );

    await waitFor(() => expect(queuedPaths()).toEqual(["/fabrics"]));
  });

  it("does not duplicate the same pathname after a remount", async () => {
    const first = render(<AnalyticsRouteTracker />);
    await waitFor(() => expect(queuedPaths()).toEqual(["/fabrics"]));
    first.unmount();

    render(<AnalyticsRouteTracker />);

    await waitFor(() => expect(queuedPaths()).toEqual(["/fabrics"]));
  });

  it("tracks pathname changes and tracks a revisited pathname again", async () => {
    const view = render(<AnalyticsRouteTracker />);
    await waitFor(() => expect(queuedPaths()).toEqual(["/fabrics"]));

    pathname = "/about?private=value";
    view.rerender(<AnalyticsRouteTracker />);
    await waitFor(() => expect(queuedPaths()).toEqual(["/fabrics", "/about"]));

    pathname = "/fabrics";
    view.rerender(<AnalyticsRouteTracker />);
    await waitFor(() => expect(queuedPaths()).toEqual(["/fabrics", "/about", "/fabrics"]));
  });

  it("skips an unknown path and tracks a later allowlisted navigation", async () => {
    pathname = "/blog/buyer%40example.com";
    const view = render(<AnalyticsRouteTracker />);
    await waitFor(() => expect(queuedPaths()).toEqual([]));

    pathname = "/blog";
    view.rerender(<AnalyticsRouteTracker />);

    await waitFor(() => expect(queuedPaths()).toEqual(["/blog"]));
  });

  it.each(["/%", "//unknown", "/line\nbreak", "/null\u0000segment"])(
    "skips malformed observed path %j and later tracks one genuine homepage view",
    async (malformedPathname) => {
      pathname = malformedPathname;
      const view = render(<AnalyticsRouteTracker />);
      await waitFor(() => expect(queuedPaths()).toEqual([]));

      pathname = "/";
      view.rerender(<AnalyticsRouteTracker />);

      await waitFor(() => expect(queuedPaths()).toEqual(["/"]));
    },
  );

  it("renders nothing", () => {
    const { container } = render(<AnalyticsRouteTracker />);
    expect(container).toBeEmptyDOMElement();
  });
});
