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

function selfClosingTags(source, tagName) {
  return [...source.matchAll(new RegExp(`<${tagName}\\b[^>]*?\\/>`, "g"))].map(
    (match) => match[0]
  );
}

function functionCallArguments(source, functionName) {
  const calls = [];
  const matcher = new RegExp(`\\b${functionName}\\s*\\(`, "g");

  for (const match of source.matchAll(matcher)) {
    const openingParen = match.index + match[0].lastIndexOf("(");
    let depth = 0;
    let quote;

    for (let index = openingParen; index < source.length; index += 1) {
      const character = source[index];

      if (quote) {
        if (character === "\\\\") {
          index += 1;
        } else if (character === quote) {
          quote = undefined;
        }
        continue;
      }

      if (character === '"' || character === "'" || character === "`") {
        quote = character;
      } else if (character === "(") {
        depth += 1;
      } else if (character === ")") {
        depth -= 1;
        if (depth === 0) {
          calls.push(source.slice(openingParen + 1, index));
          break;
        }
      }
    }
  }

  return calls;
}

test("critical Hero images use responsive delivery and the approved mobile quality", async () => {
  const [config, landingHero, aboutPage] = await Promise.all([
    source("next.config.mjs"),
    source("components/landing/LandingHero.tsx"),
    source("components/company/AboutPage.tsx"),
  ]);

  assert.doesNotMatch(config, /unoptimized\s*:\s*true/);
  for (const component of [landingHero, aboutPage]) {
    const priorityImage = selfClosingTags(component, "Image").find((tag) =>
      /\bpriority\b/.test(tag)
    );
    assert.ok(priorityImage, "a priority Image tag is required");
    assert.match(priorityImage, /\bpriority\b/);
    assert.match(priorityImage, /\bsizes\s*=\s*["']100vw["']/);
    assert.match(priorityImage, /\bquality\s*=\s*\{\s*35\s*\}/);
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

  assert.doesNotMatch(contactCard, /^\s*["']use client["'];/m);
  assert.doesNotMatch(contactCard, /framer-motion|motion\.|useReducedMotion/);
  assert.doesNotMatch(
    inquiryProvider,
    /import\s*\{[^}]*\bInquiryModal\b[^}]*\}\s*from\s*["']@\/components\/ui\/InquiryModal["']/
  );
  const inquiryModalDynamicCall = functionCallArguments(
    inquiryProvider,
    "dynamic"
  ).find((call) =>
    /\bimport\s*\(\s*["']@\/components\/ui\/InquiryModal["']\s*\)/.test(call)
  );
  assert.ok(inquiryModalDynamicCall, "InquiryModal must load through dynamic()");
  assert.match(
    inquiryModalDynamicCall,
    /,\s*\{[\s\S]*\bssr\s*:\s*false\b[\s\S]*\}\s*$/
  );
  assert.match(inquiryProvider, /\bopen\s*\?\s*\(\s*<InquiryModal\b/);
  assert.match(stickyGate, /totalCount > 0 \? <StickyInquiryBar \/> : null/);
});
