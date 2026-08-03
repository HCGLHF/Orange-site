import { describe, expectTypeOf, it } from "vitest";

import type { AnalyticsDataLayer, GoogleTag } from "@/types/analytics";

describe("analytics type contracts", () => {
  it("exposes an optional typed data layer and strict gtag callable", () => {
    expectTypeOf<Window["dataLayer"]>().toEqualTypeOf<AnalyticsDataLayer | undefined>();
    expectTypeOf<NonNullable<Window["gtag"]>>().toEqualTypeOf<GoogleTag>();
  });

  it("rejects direct queue mutation, advertising grants, and predeclared PII events", function () {
    if (false) {
      // @ts-expect-error Generated Google code, not application code, owns queue mutation.
      window.dataLayer?.push(arguments);

      // @ts-expect-error Advertising consent must never be granted.
      window.gtag?.("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });

      const piiPageView = {
        event: "orange_page_view",
        page_path: "/contact",
        page_location: "https://orange-textile.com/contact",
        email: "buyer@example.com",
      } as const;

      // @ts-expect-error Predeclared objects with PII cannot cross the controlled queue boundary.
      const rejectedQueue: AnalyticsDataLayer = [piiPageView];
      expectTypeOf(rejectedQueue).toEqualTypeOf<AnalyticsDataLayer>();
    }
  });
});
