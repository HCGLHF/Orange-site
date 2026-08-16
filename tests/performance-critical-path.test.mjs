import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.dirname(
  fileURLToPath(new URL("../package.json", import.meta.url))
);

async function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(absolute);
      return /\.(?:js|mjs|ts|tsx)$/.test(entry.name) ? [absolute] : [];
    })
  );
  return nested.flat();
}

test("critical Hero images use responsive delivery and the approved mobile quality", async () => {
  const [config, landingHero, aboutPage] = await Promise.all([
    source("next.config.mjs"),
    source("components/landing/LandingHero.tsx"),
    source("components/company/AboutPage.tsx"),
  ]);

  assert.doesNotMatch(config, /unoptimized\s*:\s*true/);
  for (const component of [landingHero, aboutPage]) {
    assert.match(
      component,
      /<Image\b[\s\S]*?\bpriority\b[\s\S]*?\bsizes="100vw"[\s\S]*?\/>/
    );
    assert.match(component, /\bquality=\{35\}/);
  }
});

test("initial-shell and above-the-fold secondary links do not auto-prefetch", async () => {
  const files = [
    "components/landing/LandingHero.tsx",
    "components/finished-fabric/FinishedFabricPage.tsx",
    "components/ui/Navbar.tsx",
    "components/ui/DesktopNavigation.tsx",
    "components/ui/MobileNavigationDrawer.tsx",
    "components/ui/BottomNav.tsx",
    "components/ui/SiteFooter.tsx",
    "components/analytics/AnalyticsConsentBanner.tsx",
  ];

  for (const file of files) {
    const text = await source(file);
    const linkCount = (text.match(/<Link\b/g) ?? []).length;
    const noPrefetchCount = (text.match(/\bprefetch=\{false\}/g) ?? []).length;
    assert.ok(linkCount > 0, `${file} must contain at least one Next Link`);
    assert.equal(
      noPrefetchCount,
      linkCount,
      `${file} contains an auto-prefetching Link`
    );
  }
});

test("the current application ships no video code or video URL", async () => {
  const files = (
    await Promise.all(
      ["app", "components", "lib"].map((directory) =>
        sourceFiles(path.join(root, directory))
      )
    )
  ).flat();
  const prohibited =
    /<video\b|<source\b|HTMLVideoElement|HTMLMediaElement|requestVideoFrameCallback|\.(?:mp4|webm|m3u8)(?:[?"'`]|$)/i;

  for (const file of files) {
    assert.doesNotMatch(
      await readFile(file, "utf8"),
      prohibited,
      path.relative(root, file)
    );
  }
});

test("below-the-fold contact and inquiry overlays stay out of initial client JS", async () => {
  const [contactCard, inquiryProvider, stickyGate] = await Promise.all([
    source("components/ContactCard.tsx"),
    source("components/InquiryProvider.tsx"),
    source("components/DeferredStickyInquiryBar.tsx"),
  ]);

  assert.doesNotMatch(contactCard, /^"use client";/m);
  assert.doesNotMatch(contactCard, /framer-motion|motion\.|useReducedMotion/);
  assert.doesNotMatch(
    inquiryProvider,
    /import \{ InquiryModal \} from "@\/components\/ui\/InquiryModal"/
  );
  assert.match(inquiryProvider, /dynamic\([\s\S]*InquiryModal[\s\S]*ssr:\s*false/);
  assert.match(inquiryProvider, /open \? \([\s\S]*<InquiryModal/);
  assert.match(stickyGate, /totalCount > 0 \? <StickyInquiryBar \/> : null/);
});
