import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(root, "content", "seo-pages.json");
const brandName = "O'range Textile";

const expectedPublicRoutes = [
  "/",
  "/blog",
  "/blog/air-layer-knit-fabric-sourcing-guide",
  "/blog/brushed-and-pile-knit-fabric-finishes",
  "/blog/how-to-source-wool-blend-knit-fabric",
  "/blog/how-to-write-a-knit-fabric-rfq",
  "/blog/jacquard-knit-fabric-weight-and-width-guide",
  "/blog/jacquard-knit-vs-woven-jacquard",
  "/blog/knit-fabric-sourcing-questions",
  "/blog/what-is-double-knit-fabric",
  "/blog/what-is-interlock-fabric",
  "/blog/what-is-ponte-fabric",
  "/blog/what-is-rib-knit-fabric",
  "/blog/what-is-scuba-knit-fabric",
  "/custom-knit-fabric-development",
  "/fabrics",
  "/fabrics/cotton-jersey",
  "/fabrics/cotton-spandex-jersey",
  "/fabrics/fleece-french-terry",
  "/fabrics/interlock-fabric",
  "/fabrics/jacquard-knit-fabric",
  "/fabrics/ponte-roma-fabric",
  "/fabrics/rib-knit-fabric",
  "/fabrics/scuba-air-layer",
  "/fabrics/scuba-air-layer-fabric",
  "/fabrics/wool-blend-knit-fabric",
  "/finished-double-knit-fabrics",
  "/ready-stock-knit-fabrics",
];

function loadRegistry() {
  assert.ok(existsSync(registryPath), "content/seo-pages.json must exist");
  return JSON.parse(readFileSync(registryPath, "utf8"));
}

function occurrences(haystack, needle) {
  return haystack.toLowerCase().split(needle.toLowerCase()).length - 1;
}

test("SEO registry covers every public page exactly once", () => {
  const pages = loadRegistry();
  assert.equal(pages.length, expectedPublicRoutes.length);
  assert.deepEqual(
    pages.map((page) => page.path).sort(),
    [...expectedPublicRoutes].sort()
  );
  assert.equal(new Set(pages.map((page) => page.path)).size, pages.length);
});

test("every primary keyword has one destination and complete intent data", () => {
  const pages = loadRegistry();
  const primaryKeywords = pages.map((page) =>
    page.primaryKeyword.trim().toLowerCase()
  );

  assert.equal(new Set(primaryKeywords).size, pages.length);

  for (const page of pages) {
    assert.ok(page.primaryKeyword.trim(), `${page.path} needs a primary keyword`);
    assert.ok(
      page.secondaryKeywords.length >= 2 &&
        page.secondaryKeywords.length <= 5,
      `${page.path} needs two to five secondary keywords`
    );
    assert.match(
      page.searchIntent,
      /^(informational|commercial|transactional|navigational)$/,
      `${page.path} has an unsupported search intent`
    );
    assert.ok(page.topicCluster.trim(), `${page.path} needs a topic cluster`);
    assert.ok(page.targetPageType.trim(), `${page.path} needs a page type`);
    assert.match(
      page.lastModified,
      /^\d{4}-\d{2}-\d{2}$/,
      `${page.path} needs a real YYYY-MM-DD lastModified`
    );
  }
});

test("titles, descriptions and H1 values meet the mandatory keyword rules", () => {
  const pages = loadRegistry();
  const titles = new Set();
  const descriptions = new Set();

  for (const page of pages) {
    const keyword = page.primaryKeyword.toLowerCase();
    const title = page.metaTitle.trim();
    const description = page.metaDescription.trim();
    const h1 = page.h1.trim();

    assert.ok(
      title.toLowerCase().startsWith(keyword),
      `${page.path} title must start with "${page.primaryKeyword}"`
    );
    assert.ok(title.length <= 70, `${page.path} title exceeds 70 characters`);
    assert.ok(
      occurrences(title, brandName) <= 1,
      `${page.path} repeats the brand in its title`
    );
    assert.ok(!titles.has(title), `${page.path} duplicates a title`);
    titles.add(title);

    assert.ok(
      description.length >= 160 && description.length <= 300,
      `${page.path} description must be 160-300 characters, got ${description.length}`
    );
    assert.ok(
      description.toLowerCase().includes(keyword),
      `${page.path} description must contain "${page.primaryKeyword}"`
    );
    assert.ok(
      !descriptions.has(description),
      `${page.path} duplicates a description`
    );
    descriptions.add(description);

    assert.ok(
      h1.toLowerCase().includes(keyword),
      `${page.path} H1 must contain "${page.primaryKeyword}"`
    );
    assert.ok(page.socialImage.startsWith("/"), `${page.path} needs an image`);
    assert.ok(page.socialImageAlt.trim(), `${page.path} needs image ALT`);
    assert.ok(
      existsSync(path.join(root, "public", page.socialImage)),
      `${page.path} social image must exist: ${page.socialImage}`
    );
  }
});

test("one shared SEO entry powers metadata, H1, sitemap and final HTML checks", () => {
  const seoLibrary = readFileSync(path.join(root, "lib", "seo.ts"), "utf8");
  const sitemap = readFileSync(path.join(root, "app", "sitemap.ts"), "utf8");
  const verifier = path.join(root, "scripts", "verify-site-seo.mjs");
  const reportGenerator = path.join(
    root,
    "scripts",
    "generate-seo-deliverables.mjs"
  );
  const packageJson = JSON.parse(
    readFileSync(path.join(root, "package.json"), "utf8")
  );

  assert.match(seoLibrary, /buildSeoMetadata/);
  assert.match(seoLibrary, /getSeoPage/);
  assert.match(seoLibrary, /openGraph/);
  assert.match(seoLibrary, /twitter/);
  assert.match(sitemap, /getSeoPages/);
  assert.ok(existsSync(verifier), "scripts/verify-site-seo.mjs must exist");
  assert.match(
    readFileSync(verifier, "utf8"),
    /prerender-manifest\.json/
  );
  assert.match(readFileSync(verifier, "utf8"), /workspaceHash/);
  assert.match(readFileSync(verifier, "utf8"), /registryHash/);
  assert.ok(
    existsSync(reportGenerator),
    "scripts/generate-seo-deliverables.mjs must exist"
  );
  assert.equal(
    packageJson.scripts["report:seo"],
    "node scripts/generate-seo-deliverables.mjs"
  );
});
