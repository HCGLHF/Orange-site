import assert from "node:assert/strict";
import test from "node:test";

const analyticsPathsUrl = new URL("../lib/analytics/public-paths.ts", import.meta.url);
const seoUrl = new URL("../lib/seo/site-seo.ts", import.meta.url);

test("analytics public paths exactly match the current SEO registry", async () => {
  const [{ TRACKABLE_PUBLIC_PATHS, isTrackablePublicPath }, { getAllPublicPageSeo }] =
    await Promise.all([import(analyticsPathsUrl.href), import(seoUrl.href)]);
  const analyticsPaths = [...TRACKABLE_PUBLIC_PATHS].sort();
  const seoPaths = getAllPublicPageSeo()
    .map((page) => page.path)
    .sort();

  assert.deepEqual(analyticsPaths, seoPaths);
  assert.equal(new Set(analyticsPaths).size, analyticsPaths.length);
  for (const path of seoPaths) assert.equal(isTrackablePublicPath(path), true, path);
  assert.equal(isTrackablePublicPath("/blog/buyer%40example.com"), false);
});
