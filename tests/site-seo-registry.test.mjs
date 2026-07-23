import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const moduleUrl = new URL("../lib/seo/site-seo.ts", import.meta.url);
const loadSeo = async () => {
  assert.ok(existsSync(moduleUrl), "lib/seo/site-seo.ts must exist");
  return import(moduleUrl.href);
};

const allowedIntents = new Set([
  "informational",
  "commercial",
  "transactional",
  "navigational",
]);
const allowedPageTypes = new Set(["homepage", "service", "guide", "blog"]);
const allowedChangeFrequencies = new Set(["daily", "weekly", "monthly"]);

const includesFolded = (text, keyword) =>
  text
    .toLocaleLowerCase("en-US")
    .includes(keyword.toLocaleLowerCase("en-US"));

test("SEO registry owns exactly 28 normalized public pages", async () => {
  const { getAllPublicPageSeo } = await loadSeo();
  const pages = getAllPublicPageSeo();
  assert.equal(pages.length, 28);
  assert.equal(new Set(pages.map((page) => page.path)).size, pages.length);
  for (const page of pages) {
    assert.match(page.path, /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/);
  }
});

test("every public page has one unique keyword assignment", async () => {
  const { getAllPublicPageSeo } = await loadSeo();
  const pages = getAllPublicPageSeo();
  assert.equal(
    new Set(
      pages.map((page) =>
        page.primaryKeyword.toLocaleLowerCase("en-US")
      )
    ).size,
    pages.length
  );

  for (const page of pages) {
    assert.ok(page.primaryKeyword.trim(), `${page.path} primary keyword`);
    assert.ok(
      page.secondaryKeywords.length >= 2 &&
        page.secondaryKeywords.length <= 5,
      `${page.path} secondary keyword count`
    );
    assert.ok(allowedIntents.has(page.searchIntent), `${page.path} intent`);
    assert.ok(page.topicCluster.trim(), `${page.path} topic cluster`);
    assert.ok(
      allowedPageTypes.has(page.targetPageType),
      `${page.path} page type`
    );
  }
});

test("titles satisfy prefix, length, uniqueness, and brand rules", async () => {
  const { SEO_BRAND_NAME, getAllPublicPageSeo } = await loadSeo();
  const pages = getAllPublicPageSeo();
  assert.equal(new Set(pages.map((page) => page.metaTitle)).size, pages.length);

  for (const page of pages) {
    assert.ok(
      page.metaTitle
        .toLocaleLowerCase("en-US")
        .startsWith(page.primaryKeyword.toLocaleLowerCase("en-US")),
      `${page.path} title must start with its primary keyword`
    );
    assert.ok(page.metaTitle.length <= 70, `${page.path} title length`);
    assert.ok(
      page.metaTitle.split(SEO_BRAND_NAME).length - 1 <= 1,
      `${page.path} brand count`
    );
  }
});

test("descriptions and H1 values contain the complete primary keyword", async () => {
  const { getAllPublicPageSeo } = await loadSeo();
  const pages = getAllPublicPageSeo();
  assert.equal(
    new Set(pages.map((page) => page.metaDescription)).size,
    pages.length
  );

  for (const page of pages) {
    assert.ok(
      page.metaDescription.length >= 160 &&
        page.metaDescription.length <= 300,
      `${page.path} description length ${page.metaDescription.length}`
    );
    assert.ok(
      includesFolded(page.metaDescription, page.primaryKeyword),
      `${page.path} description keyword`
    );
    assert.ok(
      includesFolded(page.h1, page.primaryKeyword),
      `${page.path} H1 keyword`
    );
  }
});

test("crawl fields use the production origin and stable valid values", async () => {
  const { SEO_SITE_ORIGIN, getAllPublicPageSeo } = await loadSeo();
  const pages = getAllPublicPageSeo();
  assert.equal(SEO_SITE_ORIGIN, "https://orangetextiles.com");

  for (const page of pages) {
    assert.match(page.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(
      new Date(`${page.updatedAt}T00:00:00.000Z`)
        .toISOString()
        .slice(0, 10),
      page.updatedAt
    );
    assert.ok(allowedChangeFrequencies.has(page.changeFrequency));
    assert.ok(page.priority >= 0 && page.priority <= 1);
  }
});

test("canonical URLs normalize the homepage and sitemap through one helper", async () => {
  const { toCanonicalUrl } = await loadSeo();
  const sitemap = readFileSync(
    new URL("../app/sitemap.ts", import.meta.url),
    "utf8"
  );

  assert.equal(toCanonicalUrl("/"), "https://orangetextiles.com");
  assert.equal(
    toCanonicalUrl("/blog/how-to-write-a-knit-fabric-rfq"),
    "https://orangetextiles.com/blog/how-to-write-a-knit-fabric-rfq"
  );
  assert.match(sitemap, /url: toCanonicalUrl\(page\.path\)/);
});
