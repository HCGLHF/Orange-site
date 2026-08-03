import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layoutPath = new URL("../app/layout.tsx", import.meta.url);

test("root layout uses one consent-aware GTM loader and explicit route tracking", async () => {
  const source = await readFile(layoutPath, "utf8");

  for (const legacy of [
    "next/script",
    "G-LXGZLVJXNP",
    "googletagmanager.com/gtag/js",
    "ga4-init",
    "gtag('config'",
    'gtag("config"',
    "suppressHydrationWarning",
  ]) {
    assert.equal(source.includes(legacy), false, `legacy analytics fragment remains: ${legacy}`);
  }

  assert.match(source, /const gtmContainerId = getGtmContainerId\(\);/);
  assert.match(source, /<head>[\s\S]*id="analytics-consent-default"[\s\S]*buildAnalyticsHeadScript\(\)[\s\S]*id="google-tag-manager"[\s\S]*buildGtmBootstrap\(gtmContainerId\)[\s\S]*<\/head>/);

  const body = source.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1];
  assert.ok(body, "body JSX must remain explicit");
  assert.match(body, /^\s*{gtmContainerId \? \(\s*<noscript>/);
  assert.ok(
    body.indexOf("<noscript>") < body.indexOf("<AnalyticsConsentProvider>"),
    "GTM noscript must be the first application-owned body child",
  );
  assert.match(body, /https:\/\/www\.googletagmanager\.com\/ns\.html\?id=\$\{gtmContainerId\}/);
  assert.match(body, /<iframe[\s\S]*height="0"[\s\S]*width="0"[\s\S]*style={{ display: "none", visibility: "hidden" }}[\s\S]*title="Google Tag Manager"/);

  assert.equal((source.match(/<AnalyticsConsentProvider>/g) ?? []).length, 1);
  assert.equal((source.match(/<AnalyticsRouteTracker\s*\/>/g) ?? []).length, 1);
  assert.match(
    source,
    /<AnalyticsConsentProvider>[\s\S]*<AnalyticsRouteTracker\s*\/>[\s\S]*<LocaleProvider>[\s\S]*<InquiryProvider>[\s\S]*<AppShell>{children}<\/AppShell>[\s\S]*<\/InquiryProvider>[\s\S]*<\/LocaleProvider>[\s\S]*<\/AnalyticsConsentProvider>/,
  );
  assert.match(source, /<html lang="en">/);
  assert.match(source, /className={`\$\{spaceGrotesk\.variable\} antialiased bg-gray-50`}/);
  assert.match(source, /export const metadata: Metadata/);
});
