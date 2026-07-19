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

test("every page has unique metadata, answer-first copy, FAQs and internal routes", () => {
  const pages = loadPages();
  assert.equal(new Set(pages.map((page) => page.title)).size, pages.length);
  assert.equal(new Set(pages.map((page) => page.description)).size, pages.length);

  for (const page of pages) {
    assert.ok(page.title.length <= 65, `${page.url} title is too long`);
    assert.ok(page.description.length >= 120, `${page.url} description is too short`);
    assert.ok(page.description.length <= 165, `${page.url} description is too long`);
    assert.ok(page.opening.length >= 120, `${page.url} needs an opening answer`);
    assert.ok(page.sections.length >= 3, `${page.url} needs at least three sections`);
    assert.ok(page.faq.length >= 3, `${page.url} needs at least three FAQs`);
    assert.ok(page.relatedLinks.length >= 5, `${page.url} needs five internal routes`);
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
  assert.match(sitemap, /getFinishedFabricPages/);
  assert.match(llms, /getFinishedFabricPages/);
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
