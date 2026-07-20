# Semrush Schema and Crawl Foundation Design

## Goal

Raise the Orange Textiles technical SEO baseline by removing the seven invalid structured-data items and giving every intended blog and fabric-category route a real server-rendered entry link.

## Scope

This cycle changes structured data and crawlable content discovery only. It does not change navigation, the visual system, inquiry behavior, public claims, catalogue records, pricing, availability, or fixed commercial terms. Catalogue HTML reduction remains a separate measured cycle because it requires a pagination decision and should not be mixed with the schema/internal-link experiment.

## Structured data

The homepage category `ItemList` will give every `ListItem` a canonical category URL. Finished-fabric commercial pages will use `WebPage` as their primary schema type, with a bounded `Thing` describing the fabric category. They will not emit `Product`, `Offer`, `Review`, or `AggregateRating` because the visible pages do not publish article-specific price, availability, or review evidence.

## Crawl graph

The blog index will render a dedicated buyer-guide grid sourced from `getFinishedBlogArticles()`. Each card will be a Next.js `Link` with the article title and description, making all six articles discoverable when JavaScript rendering is disabled.

The main fabric catalogue will render a separate category-route grid sourced from `getPublicFabricCategories()`. This gives the four legacy category pages a crawlable entry path without turning inquiry cards into deceptive product-detail links.

The finished-fabric hub and blog index will continue to provide contextual product routes. The catalogue category grid will also make the category hierarchy explicit for buyers and crawlers.

## Verification

Tests will fail first unless:

- the primary commercial schema no longer emits `Product`;
- homepage `ItemList` entries include canonical category URLs;
- the blog index imports and links all finished-fabric articles;
- the catalogue imports and links all public fabric categories.

After implementation, run the complete test suite, lint, build, diff check, and sensitive-pattern scan. The deployed result must then be rerun through Semrush using the existing Orange Textiles project.
