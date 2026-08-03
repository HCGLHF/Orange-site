import { afterEach, describe, expect, it } from "vitest";

import {
  pushGenerateLead,
  pushPageView,
  sanitizePathname,
} from "@/lib/analytics/events";

describe("analytics events", () => {
  afterEach(() => {
    window.dataLayer = [];
  });

  it.each([
    ["/", "/"],
    ["/products/fleece?fabric=cotton#details", "/products/fleece"],
    ["/contact#form?ignored", "/contact"],
    ["contact", "/"],
    ["https://orange-textile.com/contact", "/"],
    ["//other.example/path", "/"],
    ["/bad\\path", "/"],
    ["/line\nbreak", "/"],
  ])("sanitizes %j to %j", (value, expected) => {
    expect(sanitizePathname(value)).toBe(expected);
  });

  it("queues an exact page event without query, hash, or extra fields", () => {
    pushPageView(
      "/products/fleece?fabric=secret#details",
      "https://orange-textile.com/current?email=buyer%40example.com#private",
      "https://search.example/results?q=orange#result",
    );

    expect(Array.from(window.dataLayer ?? [])).toEqual([
      {
        event: "orange_page_view",
        page_path: "/products/fleece",
        page_location: "https://orange-textile.com/products/fleece",
        page_referrer: "https://search.example/results",
      },
    ]);
    expect(Object.keys((window.dataLayer ?? [])[0] ?? {})).toEqual([
      "event",
      "page_path",
      "page_location",
      "page_referrer",
    ]);
  });

  it.each(["", "relative/path", "mailto:buyer@example.com", "https://[bad"])(
    "omits invalid or empty referrer %j",
    (referrer) => {
      pushPageView("/contact", "not-an-absolute-url", referrer);

      expect(Array.from(window.dataLayer ?? [])).toEqual([
        {
          event: "orange_page_view",
          page_path: "/contact",
          page_location: "/contact",
        },
      ]);
    },
  );

  it("queues only the allowlisted lead event fields", () => {
    pushGenerateLead("single_inquiry");
    pushGenerateLead("batch_inquiry");

    expect(Array.from(window.dataLayer ?? [])).toEqual([
      { event: "orange_generate_lead", form_name: "single_inquiry" },
      { event: "orange_generate_lead", form_name: "batch_inquiry" },
    ]);
    expect(Object.keys((window.dataLayer ?? [])[0] ?? {})).toEqual(["event", "form_name"]);
  });

  it("only accepts the two application form names at compile time", () => {
    if (false) {
      // @ts-expect-error Arbitrary form names must not cross the analytics boundary.
      pushGenerateLead("newsletter");
      // @ts-expect-error The event API never accepts arbitrary payloads.
      pushGenerateLead("single_inquiry", { email: "buyer@example.com" });
    }
  });

  it("is an SSR-safe no-op when window is absent", () => {
    const browserWindow = globalThis.window;
    Reflect.deleteProperty(globalThis, "window");

    try {
      expect(() => pushPageView("/contact", "https://orange-textile.com/contact", "")).not.toThrow();
      expect(() => pushGenerateLead("batch_inquiry")).not.toThrow();
    } finally {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: browserWindow,
        writable: true,
      });
    }
  });
});
