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

function hasEnabledPriorityProp(tag) {
  return /(?:^|\s)priority\b(?:\s*=\s*\{\s*true\s*\}(?=\s|\/>)|(?!\s*=)(?=\s|\/>))/.test(
    tag
  );
}

function parenthesizedArguments(source, openingParen) {
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

    if (character === "/" && source[index + 1] === "/") {
      const lineEnd = source.indexOf("\n", index + 2);
      if (lineEnd === -1) return undefined;
      index = lineEnd;
      continue;
    }
    if (character === "/" && source[index + 1] === "*") {
      const commentEnd = source.indexOf("*/", index + 2);
      if (commentEnd === -1) return undefined;
      index = commentEnd + 1;
      continue;
    }

    if (character === '"' || character === "'" || character === "`") {
      quote = character;
    } else if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth -= 1;
      if (depth === 0) return source.slice(openingParen + 1, index);
    }
  }

  return undefined;
}

function dynamicCallArgumentsForBinding(source, binding) {
  const matcher = new RegExp(`\\bconst\\s+${binding}\\s*=\\s*dynamic\\s*\\(`, "g");

  return [...source.matchAll(matcher)]
    .map((match) => {
      const openingParen = match.index + match[0].lastIndexOf("(");
      return parenthesizedArguments(source, openingParen);
    })
    .filter(Boolean);
}

function assertDefaultDynamicImport(source) {
  assert.match(source, /\bimport\s+dynamic\s+from\s*["']next\/dynamic["']/);
}

function assertNoStaticValueImport(source, modulePath) {
  assert.doesNotMatch(
    source,
    new RegExp(
      `\\bimport(?!\\s*\\()(?:\\s+(?!type\\b)[^;]*?\\bfrom\\s*|\\s*)["']${modulePath}["']`
    )
  );
}

function assertContactCardStaysServerRendered(contactCard) {
  assert.doesNotMatch(
    contactCard,
    /^\s*(["'])use client\1;?\s*(?:\/\/.*)?$/m
  );
  assert.doesNotMatch(contactCard, /framer-motion|motion\.|useReducedMotion/);
}

function assertInquiryModalStaysLazy(inquiryProvider) {
  assertNoStaticValueImport(
    inquiryProvider,
    "@/components/ui/InquiryModal"
  );
  assertDefaultDynamicImport(inquiryProvider);
  const [inquiryModalDynamicCall] = dynamicCallArgumentsForBinding(
    inquiryProvider,
    "InquiryModal"
  );
  assert.ok(inquiryModalDynamicCall, "const InquiryModal = dynamic(...) is required");
  assert.match(
    inquiryModalDynamicCall,
    /\bimport\s*\(\s*["']@\/components\/ui\/InquiryModal["']\s*\)\s*\.then\s*\(\s*\(?\s*module\s*\)?\s*=>\s*module\.InquiryModal\s*\)/
  );
  assert.match(
    inquiryModalDynamicCall,
    /,\s*\{[\s\S]*\bssr\s*:\s*false\b[\s\S]*\}\s*$/
  );
  assert.match(inquiryProvider, /\bopen\s*\?\s*\(\s*<InquiryModal\b/);
}

function assertStickyInquiryBarStaysLazy(stickyGate) {
  assertDefaultDynamicImport(stickyGate);
  assertNoStaticValueImport(stickyGate, "@/components/StickyInquiryBar");
  const [stickyInquiryBarDynamicCall] = dynamicCallArgumentsForBinding(
    stickyGate,
    "StickyInquiryBar"
  );
  assert.ok(
    stickyInquiryBarDynamicCall,
    "const StickyInquiryBar = dynamic(...) is required"
  );
  assert.match(
    stickyInquiryBarDynamicCall,
    /\bimport\s*\(\s*["']@\/components\/StickyInquiryBar["']\s*\)/
  );
  assert.match(
    stickyInquiryBarDynamicCall,
    /,\s*\{[\s\S]*\bssr\s*:\s*false\b[\s\S]*\}\s*$/
  );
  assert.match(stickyGate, /totalCount > 0 \? <StickyInquiryBar \/> : null/);
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
      hasEnabledPriorityProp(tag)
    );
    assert.ok(priorityImage, "a priority Image tag is required");
    assert.ok(hasEnabledPriorityProp(priorityImage));
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

test("below-the-fold contact content stays out of initial client JS", async () => {
  const contactCard = await source("components/ContactCard.tsx");

  assertContactCardStaysServerRendered(contactCard);
});

test("inquiry modal loads from a lazy client-only chunk", async () => {
  const inquiryProvider = await source("components/InquiryProvider.tsx");

  assertInquiryModalStaysLazy(inquiryProvider);
});

test("deferred sticky inquiry bar loads from a lazy client-only chunk", async () => {
  const stickyGate = await source(
    "components/DeferredStickyInquiryBar.tsx"
  );

  assertStickyInquiryBarStaysLazy(stickyGate);
});

test("below-the-fold contact and inquiry overlays stay out of initial client JS", async () => {
  const [contactCard, inquiryProvider, stickyGate] = await Promise.all([
    source("components/ContactCard.tsx"),
    source("components/InquiryProvider.tsx"),
    source("components/DeferredStickyInquiryBar.tsx"),
  ]);

  assertContactCardStaysServerRendered(contactCard);
  assertInquiryModalStaysLazy(inquiryProvider);
  assertStickyInquiryBarStaysLazy(stickyGate);
});
