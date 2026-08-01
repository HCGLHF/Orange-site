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

test("homepage content contract covers premium finished knit and woven fabrics", async () => {
  const { landingPages } = await import("../content/landing-pages.ts");

  const homeText = JSON.stringify(landingPages.home);
  assert.match(landingPages.home.summary, /finished knit/i);
  assert.match(landingPages.home.summary, /finished woven/i);
  assert.match(landingPages.home.heroImage.alt, /finished fabric/i);
  assert.match(
    homeText,
    /We believe every successful collaboration begins with the belief that an idea is worth bringing to life\./
  );
  assert.match(
    homeText,
    /From an image, hand feel or garment brief, O'range Textile turns inspiration into premium finished fabric solutions through informed development, transparent communication and disciplined follow-through\./
  );
});

test("catalogue provenance is neutral in landing, hero, and category fallback copy", async () => {
  const { landingPages } = await import("../content/landing-pages.ts");
  const { publicFabricCategories } = await import("../lib/public-catalog.ts");
  const categoryRenderer = await readFile(
    new URL("../app/fabrics/[slug]/page.tsx", import.meta.url),
    "utf8"
  );
  const catalogueUiSources = await Promise.all(
    [
      "../components/FabricsPageIntro.tsx",
      "../components/geo/GeoHomePage.tsx",
      "../components/landing/ReadyStockLanding.tsx",
    ].map((relativePath) =>
      readFile(new URL(relativePath, import.meta.url), "utf8")
    )
  );

  assert.match(
    landingPages.readyStock.summary,
    /the supplied 104-record finished-fabric catalogue/i
  );
  assert.match(categoryRenderer, />Catalogue evidence boundary<\/h2>/);
  assert.match(
    categoryRenderer,
    /The supplied 104-record finished-fabric catalogue does not assign a specific article/
  );

  const buyerVisibleCopy = [
    landingPages.readyStock.summary,
    JSON.stringify(publicFabricCategories),
    categoryRenderer,
    ...catalogueUiSources,
  ].join("\n");
  assert.doesNotMatch(
    buyerVisibleCopy,
    /historical\/draft|(?:current\s+)?owner-confirmed|\bcurrent\s+(?:(?!(?:quotation|availability|confirmation)\b)[\w-]+\s+){0,4}(?:catalogue|records?|workbook)\b/i
  );
});

test("homepage hero uses the runtime catalogue provenance contract", async () => {
  const { heroContent } = await import("../lib/geo-content.ts");

  assert.match(heroContent.description, /finished knit/i);
  assert.match(heroContent.description, /finished woven/i);
  assert.match(
    heroContent.description,
    /supplied catalogue evidence/i
  );
});

test("landing copy reflects the supplied export, production and inquiry evidence", async () => {
  const { getPublicLandingPage, landingPages } = await import("../content/landing-pages.ts");

  const homeText = JSON.stringify(landingPages.home);
  assert.match(homeText, /greige fabric.*finished fabric.*finished garment/i);
  assert.match(homeText, /Bangladesh/i);
  assert.match(homeText, /Russia/i);
  assert.match(homeText, /Nepal/i);
  assert.match(homeText, /Europe/i);
  assert.match(homeText, /United States/i);
  assert.match(homeText, /South America/i);
  assert.match(homeText, /200\+ documented circular knitting machines/i);
  assert.match(homeText, /GRS documentation/i);
  assert.match(homeText, /applicable/i);

  const readyStockText = JSON.stringify(getPublicLandingPage("readyStock"));
  assert.match(readyStockText, /104 documented finished-fabric articles/i);
  assert.match(readyStockText, /greige fabric.*finished garment/i);
  assert.doesNotMatch(readyStockText, /dispatch timing|24-hour|stock update frequency/i);

  const customText = JSON.stringify(landingPages.customDevelopment);
  assert.match(customText, /email|WhatsApp|phone/i);
  assert.match(landingPages.customDevelopment.primaryCta.label, /inquiry/i);
  assert.match(landingPages.customDevelopment.primaryCta.href, /#contact|#inquiry-form/);
});

test("homepage renders its SEO H1, broad sourcing routes, and a contextual double-knit link", async () => {
  const geoHomeSource = await readFile(
    new URL("../components/geo/GeoHomePage.tsx", import.meta.url),
    "utf8"
  );
  const landingHeroSource = await readFile(
    new URL("../components/landing/LandingHero.tsx", import.meta.url),
    "utf8"
  );
  const landingRouteChooserSource = await readFile(
    new URL("../components/landing/LandingRouteChooser.tsx", import.meta.url),
    "utf8"
  );

  for (const component of [
    "LandingHero",
    "LandingProofStrip",
    "LandingRouteChooser",
    "LandingCtaBand",
  ]) {
    assert.match(geoHomeSource, new RegExp(component));
  }

  assert.doesNotMatch(geoHomeSource, /Entity facts for AI search/i);
  assert.match(
    geoHomeSource,
    /<LandingHero\s+page=\{page\}\s+h1=\{seo\.h1\}\s*\/>/
  );
  assert.match(
    landingHeroSource,
    /<h1\b[^>]*>\s*\{h1\}\s*<\/h1>/
  );
  assert.match(
    landingHeroSource,
    /<Image\b[^>]*\balt=\{page\.heroImage\.alt\}[^>]*\/>/
  );
  assert.match(
    landingRouteChooserSource,
    /<h2\b[^>]*>\s*choose a finished fabric sourcing route\s*<\/h2>/i
  );
  for (const routeTitle of [
    "Finished knit fabrics",
    "Finished woven fabrics",
    "Custom fabric development",
  ]) {
    assert.match(geoHomeSource, new RegExp(`title:\\s*"${routeTitle}"`, "i"));
  }
  assert.match(
    geoHomeSource,
    /(?:href:\s*|href=)"\/finished-double-knit-fabrics"/i
  );
});

test("shared homepage contact and footer copy support all finished fabrics", async () => {
  const [contactCardSource, siteFooterSource] = await Promise.all(
    [
      "../components/ContactCard.tsx",
      "../components/ui/SiteFooter.tsx",
    ].map((relativePath) =>
      readFile(new URL(relativePath, import.meta.url), "utf8")
    )
  );

  assert.match(contactCardSource, /Request Finished Fabric Samples/i);
  assert.match(contactCardSource, /Finished%20fabric%20sample%20request/i);
  assert.doesNotMatch(contactCardSource, /Request Knit Fabric Samples/i);
  assert.match(siteFooterSource, /premium finished knit and\s+woven fabric/i);
  assert.doesNotMatch(siteFooterSource, /Export-focused knit fabric sourcing/i);
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
  assert.match(readyStockLanding, /Before sending a finished-fabric RFQ/);
  assert.match(customLanding, /What the development brief should contain/);
  assert.match(customLanding, /How the private inquiry route works/);
  assert.notEqual(readyStockLanding, customLanding);
});

test("primary buyer navigation and discovery files expose all landing routes", async () => {
  const navigation = await readFile(
    new URL("../lib/navigation.ts", import.meta.url),
    "utf8"
  );
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
    assert.match(navigation, new RegExp(route));
  }

  assert.doesNotMatch(navbar, /navBadge24h/);
  assert.match(sitemap, /getAllPublicPageSeo/);
  assert.match(llms, /getAllPublicPageSeo/);
  assert.match(finishedPage, /page\.kind === "hub"/);
  assert.match(finishedPage, /LandingHero/);
  assert.match(finishedPage, /LandingProofStrip/);
});

test("public copy does not retain unsupported fixed capacity or timing promises", async () => {
  const i18n = await readFile(new URL("../lib/i18n.ts", import.meta.url), "utf8");
  const fabricsIntro = await readFile(
    new URL("../components/FabricsPageIntro.tsx", import.meta.url),
    "utf8"
  );
  const geoHome = await readFile(
    new URL("../components/geo/GeoHomePage.tsx", import.meta.url),
    "utf8"
  );
  const fabricCard = await readFile(
    new URL("../components/ui/FabricCard.tsx", import.meta.url),
    "utf8"
  );
  const source = `${i18n}\n${fabricsIntro}\n${geoHome}\n${fabricCard}`;

  for (const pattern of [
    /20,000 m2/i,
    /3000m MOQ/i,
    /OEKO-TEX ready/i,
    /within 24 hours/i,
    /48-hour sampling/i,
    /dispatch timing/i,
    /ships in 24h/i,
    /7-15 days lead time/i,
  ]) {
    assert.doesNotMatch(source, pattern);
  }
});

test("public catalogue uses the supplied 104 finished-fabric articles", async () => {
  const { getPublicFabrics } = await import("../lib/public-catalog.ts");
  const fabrics = getPublicFabrics();
  const source = JSON.stringify(fabrics);

  assert.equal(fabrics.length, 104);
  assert.equal(new Set(fabrics.map((fabric) => fabric.id)).size, 104);
  assert.match(source, /GD2515/);
  assert.match(source, /GD2672/);
  assert.match(source, /GD2590/);
  assert.match(source, /GD2579/);
  assert.doesNotMatch(source, /32S combed cotton single jersey/i);
  assert.doesNotMatch(source, /[\u3400-\u9fff]/u);
  assert.ok(fabrics.every((fabric) => fabric.stockStatus === "Available by inquiry"));
});
