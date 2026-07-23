import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

const navigationUrl = new URL("../lib/navigation.ts", import.meta.url);

const loadNavigation = async () => {
  assert.ok(existsSync(navigationUrl), "lib/navigation.ts must exist");
  return import(navigationUrl.href);
};

test("buyer-journey navigation exposes the approved groups and order", async () => {
  const { PRIMARY_NAVIGATION } = await loadNavigation();

  assert.deepEqual(
    PRIMARY_NAVIGATION.map((section) => section.id),
    ["products", "custom-development", "resources", "about"]
  );

  const products = PRIMARY_NAVIGATION.find(
    (section) => section.id === "products"
  );
  const resources = PRIMARY_NAVIGATION.find(
    (section) => section.id === "resources"
  );

  assert.equal(products.kind, "group");
  assert.deepEqual(
    products.items.map((item) => [item.label, item.href]),
    [
      ["Ready Stock", "/ready-stock-knit-fabrics"],
      ["Finished Knit Fabrics", "/fabrics"],
      ["Double-Knit Manufacturing", "/finished-double-knit-fabrics"],
      ["Interlock Fabric", "/fabrics/interlock-fabric"],
      ["Ponte Roma Fabric", "/fabrics/ponte-roma-fabric"],
      ["Rib Knit Fabric", "/fabrics/rib-knit-fabric"],
      ["View All Fabrics", "/fabrics"],
    ]
  );

  assert.equal(resources.kind, "group");
  assert.deepEqual(
    resources.items.map((item) => [item.label, item.href]),
    [
      [
        "What Is Double Knit Fabric?",
        "/blog/what-is-double-knit-fabric",
      ],
      ["What Is Interlock Fabric?", "/blog/what-is-interlock-fabric"],
      ["What Is Ponte Fabric?", "/blog/what-is-ponte-fabric"],
      ["View All Buyer Guides", "/blog"],
    ]
  );
});

test("every navigation destination resolves to a registered public page", async () => {
  const { NAVIGATION_DISCOVERY_HREFS } = await loadNavigation();
  const { getAllPublicPageSeo } = await import("../lib/seo/site-seo.ts");
  const publicPaths = new Set(getAllPublicPageSeo().map((page) => page.path));

  for (const href of NAVIGATION_DISCOVERY_HREFS) {
    const pathname = href.split("#")[0];
    assert.ok(publicPaths.has(pathname), `${href} must resolve publicly`);
  }
});

test("only the documented catalogue destination is duplicated", async () => {
  const { PRIMARY_NAVIGATION } = await loadNavigation();
  const hrefs = PRIMARY_NAVIGATION.flatMap((section) =>
    section.kind === "group" ? section.items.map((item) => item.href) : [section.href]
  );
  const duplicates = [...new Set(hrefs.filter(
    (href, index) => hrefs.indexOf(href) !== index
  ))];

  assert.deepEqual(duplicates, ["/fabrics"]);
  assert.equal(
    hrefs.filter((href) => href === "/fabrics").length,
    2
  );
});

test("active navigation follows the approved route families", async () => {
  const { getActiveNavigationId } = await loadNavigation();

  assert.equal(getActiveNavigationId("/"), "home");
  assert.equal(getActiveNavigationId("/fabrics"), "products");
  assert.equal(
    getActiveNavigationId("/fabrics/interlock-fabric"),
    "products"
  );
  assert.equal(
    getActiveNavigationId("/ready-stock-knit-fabrics"),
    "products"
  );
  assert.equal(
    getActiveNavigationId("/finished-double-knit-fabrics"),
    "products"
  );
  assert.equal(
    getActiveNavigationId("/custom-knit-fabric-development"),
    "custom-development"
  );
  assert.equal(getActiveNavigationId("/blog"), "resources");
  assert.equal(
    getActiveNavigationId("/blog/what-is-double-knit-fabric"),
    "resources"
  );
  assert.equal(getActiveNavigationId("/about"), "about");
  assert.equal(getActiveNavigationId("/unknown"), null);
});
