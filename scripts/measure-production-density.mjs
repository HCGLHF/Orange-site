import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const blogOutputDirectory = path.join(
  projectRoot,
  ".next",
  "server",
  "app",
  "blog"
);

const protectedGuideSlugs = new Set([
  "air-layer-knit-fabric-sourcing-guide",
  "brushed-and-pile-knit-fabric-finishes",
  "how-to-source-wool-blend-knit-fabric",
  "how-to-write-a-knit-fabric-rfq",
  "jacquard-knit-fabric-weight-and-width-guide",
  "jacquard-knit-vs-woven-jacquard",
  "knit-fabric-sourcing-questions",
  "what-is-double-knit-fabric",
  "what-is-interlock-fabric",
  "what-is-ponte-fabric",
  "what-is-rib-knit-fabric",
  "what-is-scuba-knit-fabric",
]);

function decodeHtmlEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, codePoint) =>
      String.fromCodePoint(Number(codePoint))
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, codePoint) =>
      String.fromCodePoint(Number.parseInt(codePoint, 16))
    );
}

function extractVisibleText(html) {
  return decodeHtmlEntities(
    html
      .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function inspectHtmlDensity(html) {
  const visibleText = extractVisibleText(html);
  const htmlCharacters = html.length;
  const textCharacters = visibleText.length;

  return {
    visibleText,
    textCharacters,
    htmlCharacters,
    ratio:
      htmlCharacters === 0
        ? 0
        : Number((textCharacters / htmlCharacters).toFixed(4)),
  };
}

export function inspectMarkedGlobalNavigation(html) {
  const containers = html.match(
    /<nav\b[^>]*data-global-navigation=(?:"true"|'true')[^>]*>[\s\S]*?<\/nav>/gi
  ) ?? [];
  const markedHtml = containers.join("");

  return {
    containerCount: containers.length,
    html: markedHtml,
    text: extractVisibleText(markedHtml),
    htmlCharacters: markedHtml.length,
  };
}

function collectHtmlFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectHtmlFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
  });
}

function getSlug(filePath) {
  return path.basename(filePath, ".html");
}

function runProductionCheck() {
  const files = collectHtmlFiles(blogOutputDirectory).filter((filePath) =>
    protectedGuideSlugs.has(getSlug(filePath))
  );

  if (files.length !== protectedGuideSlugs.size) {
    throw new Error(
      `Expected ${protectedGuideSlugs.size} protected guide outputs after build, found ${files.length}.`
    );
  }

  const results = files
    .map((filePath) => {
      const html = fs.readFileSync(filePath, "utf8");
      const density = inspectHtmlDensity(html);
      const navigation = inspectMarkedGlobalNavigation(html);

      return {
        slug: getSlug(filePath),
        ratio: density.ratio,
        htmlCharacters: density.htmlCharacters,
        textCharacters: density.textCharacters,
        navigationCharacters: navigation.htmlCharacters,
      };
    })
    .sort((left, right) => left.ratio - right.ratio);

  console.table(results);

  const lowDensityPages = results.filter((result) => result.ratio < 0.1);
  const oversizedNavigation = results.filter(
    (result) => result.navigationCharacters > 6500
  );

  if (lowDensityPages.length > 0 || oversizedNavigation.length > 0) {
    const failures = [
      ...lowDensityPages.map(
        (result) => `${result.slug}: ratio ${result.ratio} is below 0.1`
      ),
      ...oversizedNavigation.map(
        (result) =>
          `${result.slug}: navigation ${result.navigationCharacters} characters exceeds 6500`
      ),
    ];

    throw new Error(`Production HTML density checks failed:\n${failures.join("\n")}`);
  }

  console.log(
    `Production HTML density checks passed for ${results.length} buyer guides.`
  );
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  runProductionCheck();
}
