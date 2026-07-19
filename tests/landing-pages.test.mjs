import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("stock navigation resolves every URL state including all fabrics", async () => {
  const { resolveStockFilter } = await import("../lib/fabric-filter-state.ts");

  assert.equal(resolveStockFilter("in-stock", "all"), "in-stock");
  assert.equal(resolveStockFilter("preorder", "all"), "preorder");
  assert.equal(resolveStockFilter(null, "all"), "all");
  assert.equal(resolveStockFilter("unsupported", "all"), "all");
  assert.equal(resolveStockFilter(null, "in-stock"), "in-stock");
});

test("landing registry exposes four unique buyer purposes without editor notes", async () => {
  const { getPublicLandingPage, landingPageKeys } = await import(
    "../content/landing-pages.ts"
  );

  assert.deepEqual(landingPageKeys, [
    "home",
    "readyStock",
    "finishedDoubleKnit",
    "customDevelopment",
  ]);

  const pages = landingPageKeys.map(getPublicLandingPage);
  assert.equal(new Set(pages.map((page) => page.headline)).size, 4);
  assert.equal(new Set(pages.map((page) => page.purpose)).size, 4);
  assert.ok(pages.every((page) => !("editorNotes" in page)));
  assert.ok(pages.every((page) => page.primaryCta.href));
  assert.ok(pages.every((page) => page.secondaryCta.href));
});

test("homepage uses the human-facing landing page system", async () => {
  const source = await readFile(
    new URL("../components/geo/GeoHomePage.tsx", import.meta.url),
    "utf8"
  );

  for (const component of [
    "LandingHero",
    "LandingProofStrip",
    "LandingRouteChooser",
    "LandingCtaBand",
  ]) {
    assert.match(source, new RegExp(component));
  }

  assert.doesNotMatch(source, /Entity facts for AI search/i);
});

test("ready-stock and custom development routes have distinct buyer flows", async () => {
  const readyStockRoute = await readFile(
    new URL("../app/ready-stock-knit-fabrics/page.tsx", import.meta.url),
    "utf8"
  );
  const customRoute = await readFile(
    new URL("../app/custom-knit-fabric-development/page.tsx", import.meta.url),
    "utf8"
  );
  const readyStockLanding = await readFile(
    new URL("../components/landing/ReadyStockLanding.tsx", import.meta.url),
    "utf8"
  );
  const customLanding = await readFile(
    new URL("../components/landing/CustomDevelopmentLanding.tsx", import.meta.url),
    "utf8"
  );

  assert.match(readyStockRoute, /ReadyStockLanding/);
  assert.match(customRoute, /CustomDevelopmentLanding/);
  assert.match(readyStockLanding, /defaultStock="in-stock"/);
  assert.match(readyStockLanding, /Before sending a stock-fabric RFQ/);
  assert.match(customLanding, /What the development brief should contain/);
  assert.match(customLanding, /How the development route works/);
  assert.notEqual(readyStockLanding, customLanding);
});

test("primary buyer navigation and discovery files expose all landing routes", async () => {
  const navbar = await readFile(
    new URL("../components/ui/Navbar.tsx", import.meta.url),
    "utf8"
  );
  const finishedPage = await readFile(
    new URL("../components/finished-fabric/FinishedFabricPage.tsx", import.meta.url),
    "utf8"
  );
  const sitemap = await readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  const llms = await readFile(new URL("../app/llms.txt/route.ts", import.meta.url), "utf8");

  for (const route of [
    "/ready-stock-knit-fabrics",
    "/finished-double-knit-fabrics",
    "/custom-knit-fabric-development",
  ]) {
    assert.match(navbar, new RegExp(route));
    assert.match(sitemap, new RegExp(route));
    assert.match(llms, new RegExp(route));
  }

  assert.doesNotMatch(navbar, /navBadge24h/);
  assert.match(finishedPage, /page\.kind === "hub"/);
  assert.match(finishedPage, /LandingHero/);
  assert.match(finishedPage, /LandingProofStrip/);
});
