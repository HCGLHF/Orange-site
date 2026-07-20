import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

test("commercial fabric pages emit evidence-aligned WebPage schema", async () => {
  const schema = await readSource("lib/finished-fabric-schema.ts");

  assert.match(schema, /page\.kind === "product"[\s\S]+?"@type": "WebPage"/);
  assert.match(schema, /"@type": "Thing"/);
  assert.doesNotMatch(schema, /"@type": "Product"/);
  assert.doesNotMatch(schema, /aggregateRating|offers|review/);
});

test("homepage category ItemList gives every item a canonical URL", async () => {
  const geoContent = await readSource("lib/geo-content.ts");

  assert.match(
    geoContent,
    /fabricCategoryItemListJsonLd[\s\S]+?url: `\$\{siteUrl\}\/fabrics\/\$\{category\.slug\}`/
  );
});

test("blog index exposes every buyer guide through server-rendered links", async () => {
  const component = await readSource(
    "components/finished-fabric/FinishedFabricPage.tsx"
  );

  assert.match(component, /getFinishedBlogArticles/);
  assert.match(component, /page\.kind === "index"/);
  assert.match(component, /blogArticles\.map/);
  assert.match(component, /href=\{article\.url\}/);
  assert.match(component, /article\.description/);
});

test("fabric catalogue exposes every public category through crawlable links", async () => {
  const fabricsPage = await readSource("app/fabrics/page.tsx");

  assert.match(fabricsPage, /getPublicFabricCategories/);
  assert.match(fabricsPage, /publicCategories\.map/);
  assert.match(
    fabricsPage,
    /href=\{`\/fabrics\/\$\{category\.slug\}`\}/
  );
  assert.match(fabricsPage, /category\.description/);
});

test("legacy fabric categories carry route-specific sourcing depth", async () => {
  const catalogue = await readSource("lib/public-catalog.ts");

  assert.equal(
    (catalogue.match(/^    sourcingOverview:/gm) ?? []).length,
    4,
    "every legacy category needs a sourcing overview"
  );
  assert.equal(
    (catalogue.match(/^    specificationChecks:/gm) ?? []).length,
    4,
    "every legacy category needs specification checks"
  );
  assert.equal(
    (catalogue.match(/^    developmentGuidance:/gm) ?? []).length,
    4,
    "every legacy category needs development guidance"
  );

  for (const guide of [
    "/blog/what-is-interlock-fabric",
    "/blog/what-is-rib-knit-fabric",
    "/blog/what-is-scuba-knit-fabric",
    "/blog/jacquard-knit-vs-woven-jacquard",
  ]) {
    assert.match(catalogue, new RegExp(guide.replaceAll("/", "\\/")));
  }
});

test("legacy category pages render sourcing evidence and contextual routes", async () => {
  const categoryPage = await readSource("app/fabrics/[slug]/page.tsx");

  assert.match(categoryPage, /category\.sourcingOverview/);
  assert.match(categoryPage, /category\.specificationChecks\.map/);
  assert.match(categoryPage, /category\.developmentGuidance/);
  assert.match(categoryPage, /category\.relatedLinks\.map/);
});

test("ready-stock page provides a second crawlable entry to legacy categories", async () => {
  const landing = await readSource("components/landing/ReadyStockLanding.tsx");

  assert.match(landing, /getPublicFabricCategories/);
  assert.match(landing, /publicCategories\.map/);
  assert.match(landing, /href=\{`\/fabrics\/\$\{category\.slug\}`\}/);
});
