import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = async (relativePath) => {
  const url = new URL(`../${relativePath}`, import.meta.url);
  assert.ok(existsSync(url), `${relativePath} must exist`);
  return readFile(url, "utf8");
};

const staticRoutes = [
  "app/page.tsx",
  "app/fabrics/page.tsx",
  "app/ready-stock-knit-fabrics/page.tsx",
  "app/finished-double-knit-fabrics/page.tsx",
  "app/custom-knit-fabric-development/page.tsx",
  "app/blog/page.tsx",
];

test("all static pages use createPageMetadata", async () => {
  for (const route of staticRoutes) {
    const source = await readSource(route);
    assert.match(source, /createPageMetadata/);
    assert.doesNotMatch(source, /export const metadata:\s*Metadata\s*=\s*\{/);
  }
});

test("dynamic routes resolve shared metadata by final path", async () => {
  for (const route of [
    "app/fabrics/[slug]/page.tsx",
    "app/blog/[slug]/page.tsx",
  ]) {
    const source = await readSource(route);
    assert.match(source, /createPageMetadata/);
    assert.match(source, /getPublicPageSeo/);
  }
});

test("root layout cannot append a duplicate brand or root canonical", async () => {
  const source = await readSource("app/layout.tsx");
  assert.doesNotMatch(source, /template:\s*["'`]%s/);
  assert.doesNotMatch(source, /canonical:\s*["'`]\/["'`]/);
});

test("metadata adapter aligns descriptions and uses absolute titles", async () => {
  const source = await readSource("lib/seo/metadata.ts");
  assert.match(source, /title:\s*\{\s*absolute:\s*page\.metaTitle/);
  assert.match(source, /description:\s*page\.metaDescription/);
  assert.match(
    source,
    /const openGraph[\s\S]+description:\s*page\.metaDescription/
  );
  assert.match(source, /openGraph,/);
  assert.match(
    source,
    /twitter:[\s\S]+description:\s*page\.metaDescription/
  );
  assert.match(source, /canonical:\s*page\.path/);
});

test("shared H1 components accept the SEO registry value", async () => {
  const landingHero = await readSource("components/landing/LandingHero.tsx");
  const fabricsIntro = await readSource("components/FabricsPageIntro.tsx");
  const finishedPage = await readSource(
    "components/finished-fabric/FinishedFabricPage.tsx"
  );

  assert.match(landingHero, /h1:\s*string/);
  assert.match(landingHero, /\{h1\}/);
  assert.match(fabricsIntro, /h1:\s*string/);
  assert.match(fabricsIntro, /\{h1\}/);
  assert.match(finishedPage, /seo:\s*PublicPageSeo/);
  assert.match(finishedPage, /\{seo\.h1\}/);
});

test("finished content no longer owns metadata or H1 fields", async () => {
  const content = JSON.parse(
    await readSource("content/finished-fabrics.json")
  );
  for (const page of content) {
    assert.equal("title" in page, false, `${page.url} title`);
    assert.equal("description" in page, false, `${page.url} description`);
    assert.equal("h1" in page, false, `${page.url} h1`);
    assert.equal("primaryKeyword" in page, false, `${page.url} keyword`);
  }
});

test("legacy categories no longer own a second meta description", async () => {
  const source = await readSource("lib/public-catalog.ts");
  assert.doesNotMatch(source, /metaDescription:/);
  assert.doesNotMatch(source, /metaDescription:\s*string/);
});

test("schema and llms discovery consume the SEO registry", async () => {
  const schema = await readSource("lib/finished-fabric-schema.ts");
  const llms = await readSource("app/llms.txt/route.ts");
  assert.match(schema, /seo:\s*PublicPageSeo/);
  assert.match(schema, /seo\.h1/);
  assert.match(schema, /seo\.metaDescription/);
  assert.match(llms, /getAllPublicPageSeo/);
  assert.match(llms, /page\.h1/);
  assert.match(llms, /page\.metaDescription/);
});

test("sitemap comes only from the unified public inventory", async () => {
  const source = await readSource("app/sitemap.ts");
  assert.match(source, /getAllPublicPageSeo/);
  assert.match(source, /page\.updatedAt/);
  assert.doesNotMatch(source, /new Date\(\)/);
  assert.doesNotMatch(
    source,
    /getFinishedFabricPages|getPublicFabricCategories/
  );
});
