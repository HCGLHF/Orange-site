import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentPath = path.join(root, "content", "finished-fabrics.json");

const requiredRoutes = [
  "/finished-double-knit-fabrics",
  "/fabrics/interlock-fabric",
  "/fabrics/ponte-roma-fabric",
  "/fabrics/scuba-air-layer-fabric",
  "/fabrics/jacquard-knit-fabric",
  "/fabrics/wool-blend-knit-fabric",
  "/fabrics/rib-knit-fabric",
  "/blog",
  "/blog/what-is-double-knit-fabric",
  "/blog/what-is-interlock-fabric",
  "/blog/what-is-ponte-fabric",
  "/blog/what-is-scuba-knit-fabric",
  "/blog/what-is-rib-knit-fabric",
  "/blog/jacquard-knit-vs-woven-jacquard",
  "/blog/air-layer-knit-fabric-sourcing-guide",
  "/blog/how-to-source-wool-blend-knit-fabric",
  "/blog/jacquard-knit-fabric-weight-and-width-guide",
  "/blog/brushed-and-pile-knit-fabric-finishes",
  "/blog/how-to-write-a-knit-fabric-rfq",
  "/blog/knit-fabric-sourcing-questions",
];

function loadPages() {
  assert.ok(existsSync(contentPath), "finished-fabrics.json must exist");
  return JSON.parse(readFileSync(contentPath, "utf8"));
}

function wordCount(page) {
  const text = JSON.stringify(page)
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^A-Za-z0-9'-]+/g, " ");
  return text.trim().split(/\s+/).filter(Boolean).length;
}

test("content registry contains every approved finished-fabric route", () => {
  const pages = loadPages();
  assert.equal(pages.length, requiredRoutes.length);
  assert.deepEqual(
    pages.map((page) => page.url).sort(),
    [...requiredRoutes].sort()
  );
});

test("every page has answer-first copy, FAQs and internal routes", () => {
  const pages = loadPages();

  for (const page of pages) {
    assert.ok(page.opening.length >= 120, `${page.url} needs an opening answer`);
    assert.ok(page.sections.length >= 3, `${page.url} needs at least three sections`);
    assert.ok(page.faq.length >= 3, `${page.url} needs at least three FAQs`);
    assert.ok(page.relatedLinks.length >= 5, `${page.url} needs five internal routes`);
    assert.ok(
      page.relatedLinks.every((link) => link.href !== page.url),
      `${page.url} must not link to itself`
    );
    assert.ok(wordCount(page) >= 650, `${page.url} needs publishable content depth`);
  }
});

test("content stays inside the verified finished-fabric evidence boundary", () => {
  const pages = loadPages();
  const source = JSON.stringify(pages);
  const forbidden = [
    /guaranteed lead time/i,
    /fixed moq/i,
    /certified organic/i,
    /(?:contains|made (?:with|from)|includes) cashmere fibre/i,
    /(?:all|every) air-layer fabrics? (?:are|is) (?:a )?spacer/i,
    /greige fabric supplier/i,
  ];

  for (const pattern of forbidden) {
    assert.doesNotMatch(source, pattern);
  }
});

test("finished-fabric hub uses supplied catalogue series and representative articles", () => {
  const pages = loadPages();
  const hub = pages.find((page) => page.url === "/finished-double-knit-fabrics");
  const source = JSON.stringify(hub);

  assert.match(source, /11 (?:documented )?finished-fabric series/i);
  for (const article of ["GD2515", "GD2672", "6128", "GD2502", "2552", "GD2712", "GD2590", "GD2579"]) {
    assert.match(source, new RegExp(article));
  }
  assert.match(source, /160 cm/i);
  assert.match(source, /300 GSM/i);
});

test("finished-fabric hub links every commercial fabric route", () => {
  const pages = loadPages();
  const hub = pages.find((page) => page.url === "/finished-double-knit-fabrics");
  const productRoutes = pages
    .filter((page) => page.kind === "product")
    .map((page) => page.url);
  const hubRoutes = new Set(hub.relatedLinks.map((link) => link.href));

  for (const route of productRoutes) {
    assert.ok(hubRoutes.has(route), `hub must link ${route}`);
  }
});

test("catalogue guides use approved article and specification evidence", () => {
  const pages = loadPages();
  const routes = [
    "/blog/air-layer-knit-fabric-sourcing-guide",
    "/blog/how-to-source-wool-blend-knit-fabric",
    "/blog/jacquard-knit-fabric-weight-and-width-guide",
    "/blog/brushed-and-pile-knit-fabric-finishes",
    "/blog/how-to-write-a-knit-fabric-rfq",
    "/blog/knit-fabric-sourcing-questions",
  ];
  const source = JSON.stringify(
    pages.filter((page) => routes.includes(page.url))
  );

  for (const signal of [
    "GD2515",
    "GD2672",
    "GD2579",
    "GD2683",
    "260 GSM",
    "300 GSM",
    "160 cm",
    "160-165 cm",
    "usable width",
    "sample approval",
    "commercial confirmation",
  ]) {
    assert.match(source, new RegExp(signal, "i"));
  }
});

test("new catalogue guides have at least three contextual inbound routes", () => {
  const pages = loadPages();
  const targets = [
    "/blog/how-to-source-wool-blend-knit-fabric",
    "/blog/jacquard-knit-fabric-weight-and-width-guide",
    "/blog/brushed-and-pile-knit-fabric-finishes",
  ];

  for (const target of targets) {
    const registryEntries = pages.filter((page) =>
      page.relatedLinks.some((link) => link.href === target)
    );
    assert.ok(
      registryEntries.length >= 2,
      `${target} needs two contextual entries in addition to the blog index`
    );
  }
});

test("catalogue-derived guides publish unique evidence snapshots", () => {
  const pages = loadPages();
  const guideRoutes = [
    "/blog/air-layer-knit-fabric-sourcing-guide",
    "/blog/how-to-source-wool-blend-knit-fabric",
    "/blog/jacquard-knit-fabric-weight-and-width-guide",
    "/blog/brushed-and-pile-knit-fabric-finishes",
    "/blog/how-to-write-a-knit-fabric-rfq",
    "/blog/knit-fabric-sourcing-questions",
  ];
  const guides = pages.filter((page) => guideRoutes.includes(page.url));

  assert.equal(guides.length, guideRoutes.length);
  assert.equal(
    new Set(guides.map((page) => page.evidenceSnapshot?.heading)).size,
    guideRoutes.length
  );

  for (const page of guides) {
    assert.ok(page.evidenceSnapshot, `${page.url} needs an evidence snapshot`);
    assert.ok(
      page.evidenceSnapshot.summary.length >= 180,
      `${page.url} needs a substantive evidence summary`
    );
    assert.ok(
      page.evidenceSnapshot.items.length >= 3,
      `${page.url} needs at least three evidence decisions`
    );
  }
});

test("Next.js exposes the hub, blog, product routes and machine-readable discovery", () => {
  const requiredFiles = [
    "app/finished-double-knit-fabrics/page.tsx",
    "app/blog/page.tsx",
    "app/blog/[slug]/page.tsx",
    "components/finished-fabric/FinishedFabricPage.tsx",
    "lib/finished-fabric-content.ts",
  ];

  for (const relativePath of requiredFiles) {
    assert.ok(existsSync(path.join(root, relativePath)), `${relativePath} must exist`);
  }

  const sitemap = readFileSync(path.join(root, "app/sitemap.ts"), "utf8");
  const llms = readFileSync(path.join(root, "app/llms.txt/route.ts"), "utf8");
  assert.match(sitemap, /getAllPublicPageSeo/);
  assert.match(llms, /getAllPublicPageSeo/);
});

test("the native pages use the real inquiry modal and bundled visual assets", () => {
  const component = readFileSync(
    path.join(root, "components/finished-fabric/FinishedFabricPage.tsx"),
    "utf8"
  );
  assert.match(component, /SampleRequestCta/);
  assert.match(component, /next\/image/);

  const images = [
    "finished-double-knit-factory.webp",
    "double-knit-interlock-comparison.webp",
    "ponte-scuba-apparel-development.webp",
    "jacquard-wool-blend-swatches.webp",
    "finished-fabric-sample-inspection.webp",
    "air-layer-material-study.webp",
    "wool-blend-material-study.webp",
    "jacquard-knit-material-study.webp",
    "brushed-pile-knit-finishes.webp",
    "knit-fabric-rfq-specification.webp",
  ];
  for (const image of images) {
    assert.ok(
      existsSync(path.join(root, "public/images/finished-fabrics", image)),
      `${image} must be bundled`
    );
  }
});

test("the inquiry modal offers finished-fabric development directions", () => {
  const modal = readFileSync(
    path.join(root, "components/ui/InquiryModal.tsx"),
    "utf8"
  );
  const data = readFileSync(path.join(root, "lib/data.ts"), "utf8");
  assert.match(modal, /finishedFabricInquiryOptions/);
  assert.doesNotMatch(modal, /fabrics\.map/);
  assert.match(data, /Air-layer finished knit fabric/);
  assert.match(data, /Cashmere-blend finished knit fabric/);
  assert.match(data, /Greige fabric requirement/);
  assert.match(data, /Finished garment requirement/);
});
