# Orange Textile Knit-First Homepage and Product Taxonomy Design

## Objective

Make finished knit fabrics the primary product focus of the Orange Textile
homepage and core SEO positioning while preserving the site's existing woven
fabric inquiry capability and educational comparison content.

## Confirmed Scope

- Keep all existing public URLs.
- Keep existing woven references where they support a real inquiry route or a
  useful knit-versus-woven comparison.
- Remove woven fabrics from homepage promotion and homepage primary SEO
  positioning.
- Do not add unverified woven products.
- Do not change the navigation hierarchy, visual design system, or inquiry
  workflow.

## Product Taxonomy

The public product model will gain an explicit construction classification:

```ts
type FabricConstruction = "knit" | "woven";

type Fabric = {
  // Existing fields remain unchanged.
  construction: FabricConstruction;
};
```

All 104 records in the supplied finished-fabric catalogue are documented knit
articles and will be marked `construction: "knit"`. The union type deliberately
includes `woven` so future verified woven products can be added without changing
the page contract.

The classification is factual product data, not a UI-only label. Filtering and
homepage selection must use this field rather than product-name string matching.

## Homepage Behavior

The homepage will become knit-first in three places:

1. Buyer route cards will promote finished knit fabrics, finished double-knit
   and specialty knit fabrics, and custom knit development.
2. Featured product cards will be selected only from products where
   `construction === "knit"`.
3. Homepage copy will describe the promoted range as finished knit fabrics and
   will no longer instruct buyers to use a featured homepage route for woven
   fabrics.

The existing woven inquiry capability remains available through the general
inquiry and contact flow. Existing comparison content such as
`/blog/jacquard-knit-vs-woven-jacquard` remains public and unchanged unless a
small wording adjustment is required to keep internal links accurate.

## SEO Positioning

The homepage SEO record will use a finished-knit primary keyword and knit-led
secondary keywords. The following will be removed from homepage/core category
ownership:

- `finished woven fabric supplier`
- broad claims that Orange promotes knit and woven fabrics equally on the
  homepage

Woven terminology may remain on pages whose actual search intent is comparison,
education, or direct inquiry. It must not be used as a homepage primary or
secondary target.

Homepage metadata, H1, visible hero copy, structured data, and `llms.txt` summary
must remain consistent with the same knit-first positioning.

## Data Flow

1. `content/finished-fabric-catalogue.json` stores the explicit construction
   value for every product.
2. `lib/data.ts` defines the construction type.
3. `lib/public-catalog.ts` exposes helpers that return knit products and select
   representative knit products for homepage rendering.
4. `app/page.tsx` passes the knit-only featured collection to
   `components/geo/GeoHomePage.tsx`.
5. Homepage route copy and SEO metadata use knit-focused content from the
   existing landing-page and SEO registries.

No component should infer construction from the product name, series, tags, or
URL.

## Validation

Regression tests will verify:

- every catalogue product has `construction` set to `knit` or `woven`;
- all current 104 catalogue products are classified as knit;
- homepage selection excludes woven products even when a woven fixture is added;
- the homepage buyer routes contain no woven promotional route;
- homepage title, description, H1, and primary keyword are knit-led;
- the existing woven comparison URL remains in the public SEO registry and
  sitemap;
- the general inquiry path still accepts woven requirements;
- lint, TypeScript, tests, and production build pass.

## Non-Goals

- Removing woven comparison content.
- Removing woven inquiry language from contact or general sourcing forms.
- Creating new woven product pages.
- Rewriting the design system, navigation, layout, or CSS.
- Changing existing product URLs.

## Acceptance Criteria

- Homepage product cards are all explicitly classified knit products.
- Homepage route cards and visible product copy promote only knit directions.
- Homepage core SEO does not target woven supplier keywords.
- Existing woven inquiry and comparison content remains reachable.
- No existing public URL is removed.
