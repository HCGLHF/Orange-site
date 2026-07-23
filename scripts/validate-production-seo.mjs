import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NAVIGATION_DISCOVERY_HREFS } from "../lib/navigation.ts";
import {
  SEO_SITE_ORIGIN,
  getAllPublicPageSeo,
  toCanonicalUrl,
} from "../lib/seo/site-seo.ts";

const baseUrl = (
  process.env.SEO_AUDIT_BASE_URL || SEO_SITE_ORIGIN
).replace(/\/$/, "");
const googlebot =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const reportUrl = new URL(
  "../reports/seo/production-html-audit.json",
  import.meta.url
);
const reportPath =
  process.env.SEO_AUDIT_REPORT_PATH || fileURLToPath(reportUrl);

function getBuildPublicRoutes() {
  const manifest = JSON.parse(
    readFileSync(
      new URL("../.next/prerender-manifest.json", import.meta.url),
      "utf8"
    )
  );
  const excludedRoutes = new Set([
    "/_not-found",
    "/icon.svg",
    "/llms.txt",
    "/robots.txt",
    "/sitemap.xml",
  ]);

  return Object.keys(manifest.routes)
    .filter(
      (route) => !route.startsWith("/api/") && !excludedRoutes.has(route)
    )
    .sort();
}

function decodeHtml(value = "") {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"',
  };
  return value.replace(
    /&(#x[0-9a-f]+|#\d+|amp|apos|gt|lt|quot);/gi,
    (_, entity) => {
      if (entity[0] === "#") {
        const hex = entity[1]?.toLowerCase() === "x";
        const number = Number.parseInt(
          entity.slice(hex ? 2 : 1),
          hex ? 16 : 10
        );
        return Number.isFinite(number)
          ? String.fromCodePoint(number)
          : _;
      }
      return named[entity.toLowerCase()] ?? _;
    }
  );
}

function getAttribute(tag, name) {
  const match = tag.match(
    new RegExp(
      `(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
      "i"
    )
  );
  if (!match) return null;
  return decodeHtml(match[1] ?? match[2] ?? match[3] ?? "");
}

function cleanText(value = "") {
  return decodeHtml(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function collectTags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

function hasAttribute(tag, name) {
  return new RegExp(
    `(?:^|\\s)${name}(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+))?(?=\\s|\\/?>)`,
    "i"
  ).test(tag);
}

function findMarkedGlobalNavigation(html) {
  const navigationTagPattern = /<\/?nav\b[^>]*>/gi;
  let depth = 0;
  let markedDepth = null;
  let markedStart = null;
  let markedHtml = null;
  let globalNavigationContainerCount = 0;

  for (const match of html.matchAll(navigationTagPattern)) {
    const tag = match[0];
    const isClosingTag = /^<\//.test(tag);

    if (!isClosingTag) {
      depth += 1;
      if (hasAttribute(tag, "data-global-navigation")) {
        globalNavigationContainerCount += 1;
        if (globalNavigationContainerCount === 1) {
          markedDepth = depth;
          markedStart = match.index + tag.length;
        }
      }
      continue;
    }

    if (
      markedHtml === null &&
      markedStart !== null &&
      depth === markedDepth
    ) {
      markedHtml = html.slice(markedStart, match.index);
    }
    depth = Math.max(0, depth - 1);
  }

  return {
    globalNavigationContainerCount,
    markedHtml:
      globalNavigationContainerCount === 1 ? markedHtml : null,
  };
}

export function inspectGlobalNavigation(html) {
  const { globalNavigationContainerCount, markedHtml } =
    findMarkedGlobalNavigation(html);
  const navigationHrefs = collectTags(markedHtml ?? "", "a")
    .map((tag) => getAttribute(tag, "href"))
    .filter((href) => href !== null);
  const missingNavigationLinks = NAVIGATION_DISCOVERY_HREFS.filter(
    (href) => !navigationHrefs.includes(href)
  );

  return {
    globalNavigationContainerCount,
    navigationHrefs,
    missingNavigationLinks,
    navigationLinksPresent:
      globalNavigationContainerCount === 1 &&
      markedHtml !== null &&
      missingNavigationLinks.length === 0,
  };
}

function collectElementText(html, name) {
  return [
    ...html.matchAll(
      new RegExp(
        `<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`,
        "gi"
      )
    ),
  ].map((match) => cleanText(match[1]));
}

function findMetaValues(html, attribute, expected) {
  return collectTags(html, "meta")
    .filter(
      (tag) =>
        getAttribute(tag, attribute)?.toLocaleLowerCase("en-US") ===
        expected.toLocaleLowerCase("en-US")
    )
    .map((tag) => getAttribute(tag, "content") ?? "");
}

function findCanonicalValues(html) {
  return collectTags(html, "link")
    .filter((tag) =>
      (getAttribute(tag, "rel") ?? "")
        .toLocaleLowerCase("en-US")
        .split(/\s+/)
        .includes("canonical")
    )
    .map((tag) => getAttribute(tag, "href") ?? "");
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

export async function runProductionSeoAudit() {
const buildId = readFileSync(
  new URL("../.next/BUILD_ID", import.meta.url),
  "utf8"
).trim();
const gitCommit = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
  windowsHide: true,
}).trim();
const registryHash = createHash("sha256")
  .update(
    readFileSync(new URL("../lib/seo/site-seo.ts", import.meta.url))
  )
  .digest("hex");
const expectedPages = getAllPublicPageSeo();
const expectedPaths = expectedPages.map((page) => page.path).sort();
const builtPublicRoutes = getBuildPublicRoutes();
const missingFromRegistry = builtPublicRoutes.filter(
  (route) => !expectedPaths.includes(route)
);
const missingFromBuild = expectedPaths.filter(
  (route) => !builtPublicRoutes.includes(route)
);
const expectedCanonicalUrls = expectedPages.map((page) =>
  toCanonicalUrl(page.path)
);
const requestHeaders = { "user-agent": googlebot };

const robotsResponse = await fetch(`${baseUrl}/robots.txt`, {
  headers: requestHeaders,
  redirect: "manual",
});
const robotsText = await robotsResponse.text();
const allowsGooglebot =
  robotsResponse.status === 200 &&
  !/user-agent:\s*googlebot[\s\S]*?disallow:\s*\/\s*(?:\r?\n|$)/i.test(
    robotsText
  );

const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`, {
  headers: requestHeaders,
  redirect: "manual",
});
const sitemapText = await sitemapResponse.text();
const sitemapUrls = [
  ...sitemapText.matchAll(/<loc>([\s\S]*?)<\/loc>/gi),
].map((match) => decodeHtml(match[1].trim()));
const sitemapMatchesRegistry =
  JSON.stringify(sorted(sitemapUrls)) ===
  JSON.stringify(sorted(expectedCanonicalUrls));

const pageResults = [];

for (const page of expectedPages) {
  const failures = [];
  const expectedCanonical = toCanonicalUrl(page.path);
  const requestUrl = `${baseUrl}${page.path === "/" ? "" : page.path}`;

  try {
    const response = await fetch(requestUrl, {
      headers: requestHeaders,
      redirect: "manual",
    });
    const html = await response.text();
    const titles = collectElementText(html, "title");
    const descriptions = findMetaValues(html, "name", "description");
    const ogDescriptions = findMetaValues(
      html,
      "property",
      "og:description"
    );
    const twitterDescriptions = findMetaValues(
      html,
      "name",
      "twitter:description"
    );
    const canonicalValues = findCanonicalValues(html);
    const h1Values = collectElementText(html, "h1");
    const imageTags = collectTags(html, "img");
    const imagesMissingAlt = imageTags.filter(
      (tag) => getAttribute(tag, "alt") === null
    );
    const {
      globalNavigationContainerCount,
      missingNavigationLinks,
      navigationLinksPresent,
    } = inspectGlobalNavigation(html);
    const robotsValues = findMetaValues(html, "name", "robots");
    const noindex = robotsValues.some((value) =>
      /\bnoindex\b/i.test(value)
    );
    const sitemapPresent = sitemapUrls.includes(expectedCanonical);

    if (response.status !== 200) failures.push(`HTTP ${response.status}`);
    if (
      !(response.headers.get("content-type") ?? "").includes("text/html")
    ) {
      failures.push("response is not HTML");
    }
    if (titles.length !== 1) {
      failures.push(`title count ${titles.length}`);
    }
    if (titles[0] !== page.metaTitle) failures.push("title mismatch");
    if (descriptions.length !== 1) {
      failures.push(`description count ${descriptions.length}`);
    }
    if (descriptions[0] !== page.metaDescription) {
      failures.push("description mismatch");
    }
    if (
      ogDescriptions.length !== 1 ||
      ogDescriptions[0] !== page.metaDescription
    ) {
      failures.push("Open Graph description mismatch");
    }
    if (
      twitterDescriptions.length !== 1 ||
      twitterDescriptions[0] !== page.metaDescription
    ) {
      failures.push("Twitter description mismatch");
    }
    if (h1Values.length !== 1) {
      failures.push(`H1 count ${h1Values.length}`);
    }
    if (h1Values[0] !== page.h1) failures.push("H1 mismatch");
    if (canonicalValues.length !== 1) {
      failures.push(`canonical count ${canonicalValues.length}`);
    }
    if (canonicalValues[0] !== expectedCanonical) {
      failures.push("canonical mismatch");
    }
    if (imagesMissingAlt.length > 0) {
      failures.push(`${imagesMissingAlt.length} images missing ALT`);
    }
    if (noindex) failures.push("unexpected noindex");
    if (!sitemapPresent) failures.push("missing from sitemap");
    if (!allowsGooglebot) {
      failures.push("Googlebot blocked by robots.txt");
    }
    if (globalNavigationContainerCount !== 1) {
      failures.push(
        `global navigation container count ${globalNavigationContainerCount}`
      );
    }
    if (!navigationLinksPresent) {
      failures.push(
        `missing navigation links: ${missingNavigationLinks.join(", ")}`
      );
    }

    pageResults.push({
      url: expectedCanonical,
      path: page.path,
      primaryKeyword: page.primaryKeyword,
      secondaryKeywords: page.secondaryKeywords,
      searchIntent: page.searchIntent,
      topicCluster: page.topicCluster,
      targetPageType: page.targetPageType,
      title: titles[0] ?? "",
      metaDescription: descriptions[0] ?? "",
      h1: h1Values[0] ?? "",
      h1Count: h1Values.length,
      imageCount: imageTags.length,
      imageAltResult:
        imagesMissingAlt.length === 0
          ? "PASS"
          : `FAIL: ${imagesMissingAlt.length} missing`,
      canonical: canonicalValues[0] ?? "",
      statusCode: response.status,
      sitemapPresent,
      noindex,
      globalNavigationContainerCount,
      navigationLinksPresent,
      missingNavigationLinks,
      inaccessible: false,
      result: failures.length === 0 ? "PASS" : "FAIL",
      failures,
    });
  } catch (error) {
    pageResults.push({
      url: expectedCanonical,
      path: page.path,
      primaryKeyword: page.primaryKeyword,
      secondaryKeywords: page.secondaryKeywords,
      searchIntent: page.searchIntent,
      topicCluster: page.topicCluster,
      targetPageType: page.targetPageType,
      title: "",
      metaDescription: "",
      h1: "",
      h1Count: 0,
      imageCount: 0,
      imageAltResult: "FAIL: inaccessible",
      canonical: "",
      statusCode: null,
      sitemapPresent: sitemapUrls.includes(expectedCanonical),
      noindex: false,
      globalNavigationContainerCount: 0,
      navigationLinksPresent: false,
      missingNavigationLinks: [...NAVIGATION_DISCOVERY_HREFS],
      inaccessible: true,
      result: "FAIL",
      failures: [
        error instanceof Error ? error.message : String(error),
      ],
    });
  }
}

const inaccessible = pageResults.filter(
  (page) => page.inaccessible
).length;
const passed = pageResults.filter(
  (page) => page.result === "PASS"
).length;
const failed = pageResults.filter(
  (page) => page.result === "FAIL"
).length;
const checked = pageResults.length - inaccessible;
const unchecked = expectedPages.length - pageResults.length;
const globalFailures = [];

if (robotsResponse.status !== 200) {
  globalFailures.push(`robots.txt HTTP ${robotsResponse.status}`);
}
if (!allowsGooglebot) {
  globalFailures.push("robots.txt blocks Googlebot");
}
if (sitemapResponse.status !== 200) {
  globalFailures.push(`sitemap.xml HTTP ${sitemapResponse.status}`);
}
if (!sitemapMatchesRegistry) {
  globalFailures.push("sitemap URL set does not match the SEO registry");
}
if (missingFromRegistry.length > 0) {
  globalFailures.push(
    `build routes missing from SEO registry: ${missingFromRegistry.join(", ")}`
  );
}
if (missingFromBuild.length > 0) {
  globalFailures.push(
    `SEO registry routes missing from build: ${missingFromBuild.join(", ")}`
  );
}

const report = {
  generatedAt: new Date().toISOString(),
  gitCommit,
  buildId,
  registryHash,
  baseUrl,
  productionOrigin: SEO_SITE_ORIGIN,
  summary: {
    total: expectedPages.length,
    checked,
    passed,
    failed,
    unchecked,
    inaccessible,
  },
  robots: {
    status: robotsResponse.status,
    allowsGooglebot,
    sitemap: `${SEO_SITE_ORIGIN}/sitemap.xml`,
  },
  sitemap: {
    status: sitemapResponse.status,
    urlCount: sitemapUrls.length,
    matchesRegistry: sitemapMatchesRegistry,
  },
  discovery: {
    registryCount: expectedPaths.length,
    builtPublicCount: builtPublicRoutes.length,
    missingFromRegistry,
    missingFromBuild,
  },
  globalFailures,
  pages: pageResults,
};

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(
  reportPath,
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8"
);

console.log(`Total: ${report.summary.total}`);
console.log(`Checked: ${report.summary.checked}`);
console.log(`Passed: ${report.summary.passed}`);
console.log(`Failed: ${report.summary.failed}`);
console.log(`Unchecked: ${report.summary.unchecked}`);
console.log(`Inaccessible: ${report.summary.inaccessible}`);

for (const page of pageResults.filter(
  (item) => item.result === "FAIL"
)) {
  console.error(`${page.path}: ${page.failures.join("; ")}`);
}
for (const failure of globalFailures) console.error(failure);

if (
  globalFailures.length > 0 ||
  failed > 0 ||
  unchecked > 0 ||
  inaccessible > 0
) {
  process.exitCode = 1;
}
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isDirectExecution) {
  await runProductionSeoAudit();
}
