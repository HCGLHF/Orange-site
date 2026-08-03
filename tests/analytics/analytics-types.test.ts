import { describe, expectTypeOf, it } from "vitest";

import type { AnalyticsDataLayer, GoogleTag } from "@/types/analytics";

describe("analytics type contracts", () => {
  it("exposes an optional typed data layer and strict gtag callable", () => {
    expectTypeOf<Window["dataLayer"]>().toEqualTypeOf<AnalyticsDataLayer | undefined>();
    expectTypeOf<NonNullable<Window["gtag"]>>().toEqualTypeOf<GoogleTag>();
  });

  it("rejects advertising grants and PII-bearing event objects at compile time", () => {
    if (false) {
      // @ts-expect-error Advertising consent must never be granted.
      window.gtag?.("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });

      window.dataLayer?.push({
        event: "orange_page_view",
        page_path: "/contact",
        page_location: "https://orange-textile.com/contact",
        // @ts-expect-error Analytics events may not contain PII fields.
        email: "buyer@example.com",
      });
    }
  });
});
