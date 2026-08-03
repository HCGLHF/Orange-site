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
      "/fabrics/fleece-french-terry?fabric=secret#details",
      "https://orange-textile.com/current?email=buyer%40example.com#private",
      "https://orange-textile.com/blog?q=orange#result",
    );

    expect(Array.from(window.dataLayer ?? [])).toEqual([
      {
        event: "orange_page_view",
        page_path: "/fabrics/fleece-french-terry",
        page_location: "https://orange-textile.com/fabrics/fleece-french-terry",
        page_referrer: "https://orange-textile.com/blog",
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
      pushPageView("/about", "not-an-absolute-url", referrer);

      expect(Array.from(window.dataLayer ?? [])).toEqual([
        {
          event: "orange_page_view",
          page_path: "/about",
          page_location: "/about",
        },
      ]);
    },
  );

  it.each([
    "/404",
    "/blog/buyer@example.com",
    "/blog/buyer%40example.com",
    "/blog/+61412345678",
    "/blog/order-61412345678",
    "/blog/free-form-customer-note",
    "/blog/%0Abuyer%40example.com",
    "/blog/%0D%0ASet-Cookie%3Asecret",
  ])("does not queue unknown or PII-bearing current path %j", (pathname) => {
    pushPageView(
      pathname,
      `https://orange-textile.com${pathname}?token=secret#private`,
      "https://crm.example/contacts/buyer%40example.com?token=secret#record",
    );

    expect(Array.from(window.dataLayer ?? [])).toEqual([]);
  });

  it("reduces a cross-origin CRM referrer to its origin", () => {
    pushPageView(
      "/about",
      "https://orange-textile.com/about?email=buyer%40example.com",
      "https://crm.example/contacts/buyer%40example.com?token=secret#record",
    );

    expect(Array.from(window.dataLayer ?? [])).toEqual([
      {
        event: "orange_page_view",
        page_path: "/about",
        page_location: "https://orange-textile.com/about",
        page_referrer: "https://crm.example",
      },
    ]);
  });

  it("reduces a same-origin unknown referrer to its origin", () => {
    pushPageView(
      "/fabrics",
      "https://orange-textile.com/fabrics",
      "https://orange-textile.com/private/buyer%40example.com?token=secret#record",
    );

    const event = (window.dataLayer ?? [])[0];
    expect(event).toEqual({
      event: "orange_page_view",
      page_path: "/fabrics",
      page_location: "https://orange-textile.com/fabrics",
      page_referrer: "https://orange-textile.com",
    });
    expect(JSON.stringify(event)).not.toMatch(/buyer|token|private|%40/i);
  });

  it("keeps only the path of an allowlisted same-origin referrer", () => {
    pushPageView(
      "/fabrics",
      "https://orange-textile.com/fabrics?token=secret#private",
      "https://orange-textile.com/blog?email=buyer%40example.com#record",
    );

    const event = (window.dataLayer ?? [])[0];
    expect(event).toEqual({
      event: "orange_page_view",
      page_path: "/fabrics",
      page_location: "https://orange-textile.com/fabrics",
      page_referrer: "https://orange-textile.com/blog",
    });
    expect(Object.keys(event ?? {})).toEqual([
      "event",
      "page_path",
      "page_location",
      "page_referrer",
    ]);
    expect(JSON.stringify(event)).not.toMatch(/buyer|token|%40/i);
  });

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
      expect(() => pushPageView("/about", "https://orange-textile.com/about", "")).not.toThrow();
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
