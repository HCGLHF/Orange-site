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
