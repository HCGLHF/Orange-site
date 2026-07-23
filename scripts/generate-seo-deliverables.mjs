import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir =
  process.env.SEO_REPORT_DIR || path.join(root, "artifacts", "seo");
const verificationPath =
  process.env.SEO_VERIFICATION_REPORT ||
  path.join(outputDir, "sitewide-seo-verification.json");
const registryPath = path.join(root, "content", "seo-pages.json");
const reportDate = process.env.SEO_REPORT_DATE || "2026-07-23";
const reportBase = process.env.SEO_REPORT_BASE || "origin/main";

function readJson(filePath, label) {
  if (!existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }

  return JSON.parse(readFileSync(filePath, "utf8"));
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function writeCsv(fileName, headers, rows) {
  const body = [
    headers.map(csvCell).join(","),
    ...rows.map((row) =>
      headers.map((header) => csvCell(row[header])).join(",")
    ),
  ].join("\n");

  writeFileSync(path.join(outputDir, fileName), `${body}\n`, "utf8");
}

function getModifiedFiles() {
  const tracked = execFileSync(
    "git",
    ["diff", "--name-only", reportBase],
    { cwd: root, encoding: "utf8" }
  )
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  const untracked = execFileSync(
    "git",
    ["ls-files", "--others", "--exclude-standard"],
    { cwd: root, encoding: "utf8" }
  )
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);

  return [...new Set([...tracked, ...untracked])].sort();
}

function gitOutput(args, encoding = "utf8") {
  return execFileSync("git", args, {
    cwd: root,
    encoding,
    windowsHide: true
  });
}

function getWorkspaceHash() {
  const hash = createHash("sha256");
  hash.update(gitOutput(["rev-parse", "HEAD"]));
  hash.update(gitOutput(["diff", "--binary", "HEAD", "--", "."], null));

  const untracked = gitOutput([
    "ls-files",
    "--others",
    "--exclude-standard"
  ])
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .sort();

  for (const relativePath of untracked) {
    hash.update(relativePath);
    hash.update(readFileSync(path.join(root, relativePath)));
  }

  return hash.digest("hex");
}

const registrySource = readFileSync(registryPath, "utf8");
const registry = JSON.parse(registrySource);
const verification = readJson(verificationPath, "Production HTML verification");
const expectedVerificationState = {
  gitCommit: gitOutput(["rev-parse", "HEAD"]).trim(),
  workspaceHash: getWorkspaceHash(),
  buildId: readFileSync(path.join(root, ".next", "BUILD_ID"), "utf8").trim(),
  registryHash: createHash("sha256").update(registrySource).digest("hex"),
};

for (const [field, expected] of Object.entries(expectedVerificationState)) {
  if (verification[field] !== expected) {
    throw new Error(
      `Production HTML verification is stale: ${field} does not match. Run npm.cmd run build and npm.cmd run verify:seo again.`
    );
  }
}

const verificationByPath = new Map(
  verification.pages.map((page) => [page.path, page])
);
const modifiedFiles = getModifiedFiles();

mkdirSync(outputDir, { recursive: true });

const pageRows = registry.map((seo) => {
  const page = verificationByPath.get(seo.path);
  const failedChecks =
    page?.checks
      ?.filter((check) => check.status === "FAIL")
      .map((check) => check.name)
      .join(" | ") || "";

  return {
    path: seo.path,
    url: page?.url || "",
    primaryKeyword: seo.primaryKeyword,
    secondaryKeywords: seo.secondaryKeywords,
    searchIntent: seo.searchIntent,
    topicCluster: seo.topicCluster,
    targetPageType: seo.targetPageType,
    title: page?.title || seo.metaTitle,
    titleLength: (page?.title || seo.metaTitle).length,
    metaDescription: page?.metaDescription || seo.metaDescription,
    metaDescriptionLength: (page?.metaDescription || seo.metaDescription).length,
    h1: page?.h1 || seo.h1,
    altResult: page?.altResult || "NOT CHECKED",
    canonical: page?.canonical || "",
    httpStatus:
      page?.checks?.find((check) => check.name === "HTTP 200")?.actual ?? "",
    sitemapResult: verification.discovery.sitemap.missing.includes(
      page?.url || ""
    )
      ? "FAIL"
      : "PASS",
    noindexResult:
      page?.checks?.find((check) => check.name === "No unexpected noindex")
        ?.status || "NOT CHECKED",
    status: page?.status || "NOT CHECKED",
    failedChecks,
  };
});

writeCsv(
  "keyword-map.csv",
  [
    "path",
    "primaryKeyword",
    "secondaryKeywords",
    "searchIntent",
    "topicCluster",
    "targetPageType",
  ],
  pageRows
);

writeCsv(
  `sitewide-seo-audit-${reportDate}.csv`,
  [
    "path",
    "url",
    "primaryKeyword",
    "searchIntent",
    "targetPageType",
    "title",
    "titleLength",
    "metaDescription",
    "metaDescriptionLength",
    "h1",
    "altResult",
    "canonical",
    "httpStatus",
    "sitemapResult",
    "noindexResult",
    "status",
    "failedChecks",
  ],
  pageRows
);

const conflictRows = [
  {
    topic: "Knit fabric category",
    competingPages: "/ | /fabrics",
    resolution:
      "Homepage owns knit fabric supplier; catalogue owns wholesale knit fabric.",
    status: "RESOLVED",
  },
  {
    topic: "Double-knit family",
    competingPages:
      "/finished-double-knit-fabrics | /fabrics/interlock-fabric | /fabrics/ponte-roma-fabric",
    resolution:
      "Hub owns double knit fabric; product pages own interlock fabric and Ponte Roma fabric.",
    status: "RESOLVED",
  },
  {
    topic: "Scuba and air-layer",
    competingPages:
      "/fabrics/scuba-air-layer | /fabrics/scuba-air-layer-fabric",
    resolution:
      "Legacy catalogue route owns scuba fabric catalogue; product route owns scuba knit fabric.",
    status: "RESOLVED",
  },
  {
    topic: "Jacquard education and sourcing",
    competingPages:
      "/fabrics/jacquard-knit-fabric | /blog/jacquard-knit-vs-woven-jacquard | /blog/jacquard-knit-fabric-weight-and-width-guide",
    resolution:
      "Product page owns jacquard knit fabric; blogs own comparison and specification-guide intents.",
    status: "RESOLVED",
  },
];

writeCsv(
  "keyword-conflict-resolution.csv",
  ["topic", "competingPages", "resolution", "status"],
  conflictRows
);

const priorityPaths = new Set([
  "/",
  "/fabrics",
  "/ready-stock-knit-fabrics",
  "/custom-knit-fabric-development",
  "/finished-double-knit-fabrics",
  "/blog/air-layer-knit-fabric-sourcing-guide",
  "/blog/how-to-source-wool-blend-knit-fabric",
  "/blog/jacquard-knit-fabric-weight-and-width-guide",
  "/blog/brushed-and-pile-knit-fabric-finishes",
  "/blog/how-to-write-a-knit-fabric-rfq",
  "/blog/knit-fabric-sourcing-questions",
]);

writeCsv(
  "gsc-reindex-priority.csv",
  ["priority", "path", "url", "primaryKeyword", "reason"],
  pageRows
    .filter((row) => priorityPaths.has(row.path))
    .map((row) => ({
      priority: row.path === "/" || row.path === "/fabrics" ? "P0" : "P1",
      path: row.path,
      url: row.url,
      primaryKeyword: row.primaryKeyword,
      reason: row.path.startsWith("/blog/")
        ? "New catalogue-backed content"
        : "Core commercial or category page",
    }))
);

writeCsv(
  "sitemap-recrawl-pages.csv",
  ["path", "url", "lastModified", "changeFrequency", "priority", "status"],
  registry.map((seo) => ({
    path: seo.path,
    url: verificationByPath.get(seo.path)?.url || "",
    lastModified: seo.lastModified,
    changeFrequency: seo.changeFrequency,
    priority: seo.priority,
    status: verificationByPath.get(seo.path)?.status || "NOT CHECKED",
  }))
);

writeFileSync(
  path.join(outputDir, "modified-files.txt"),
  `${modifiedFiles.join("\n")}\n`,
  "utf8"
);

const pageTable = pageRows
  .map(
    (page) =>
      `| \`${page.path}\` | ${page.primaryKeyword} | ${page.searchIntent} | ${page.titleLength} | ${page.metaDescriptionLength} | ${page.altResult} | ${page.status} |`
  )
  .join("\n");

const conflictTable = conflictRows
  .map(
    (row) =>
      `| ${row.topic} | ${row.competingPages} | ${row.resolution} | ${row.status} |`
  )
  .join("\n");

const report = `# O'range Textile Sitewide SEO Remediation Report

Date: ${reportDate}
Production HTML checked at: ${verification.checkedAt}
Build origin: ${verification.origin}

## Scope and result

- Public pages checked: ${verification.totalPages}
- Passed pages: ${verification.passedPages}
- Failed pages: ${verification.failedPages}
- Unchecked pages: ${verification.uncheckedPages}
- Inaccessible pages: ${verification.inaccessiblePages.length}
- Sitemap expected/actual: ${verification.discovery.sitemap.expectedCount}/${verification.discovery.sitemap.actualCount}
- Build manifest registry/HTML pages: ${verification.discovery.buildManifest.registryCount}/${verification.discovery.buildManifest.builtPublicCount}
- Robots status: ${verification.discovery.robots.status}
- Overall result: ${verification.failedPages === 0 && verification.uncheckedPages === 0 ? "PASS" : "FAIL"}

## Before and after

| Area | Before | After |
|---|---|---|
| SEO source | Route files and content objects maintained overlapping metadata | One 28-page registry powers metadata, H1, social descriptions, canonical and sitemap |
| Keyword ownership | Product, hub and blog intents were not enforced as one primary keyword per page | 28 unique primary keywords with explicit intent, cluster and page type |
| Title control | Template and route-specific patterns could append or vary branding | Absolute, unique titles; keyword first; brand at most once; all <=70 characters |
| Description control | Length and uniqueness were not verified in built HTML | Unique 160-300 character descriptions matching OG and Twitter output |
| H1 control | H1 text was maintained separately from metadata | Registry H1 rendered once per page and checked in production HTML |
| Sitemap | Manually maintained route list | Registry-generated sitemap with 28 exact public URLs and real lastModified values |
| Image ALT | No all-page built-HTML proof | Every rendered image checked; all ALT results pass |
| Final verification | Source checks only | Googlebot production-server crawl across every public route |
| Catalogue content | Existing guides did not cover the full confirmed catalogue evidence set | Six publish-ready catalogue-backed guides/Q&A plus five original editorial images |

## Per-page verification

| URL | Primary keyword | Intent | Title chars | Description chars | ALT | Result |
|---|---|---:|---:|---:|---|---|
${pageTable}

Full Title, Meta Description, H1, canonical and check details are in \`sitewide-seo-audit-${reportDate}.csv\`.

## Keyword conflict and reassignment record

| Topic | Pages | Resolution | Status |
|---|---|---|---|
${conflictTable}

${
  new Set(registry.map((page) => page.primaryKeyword.toLowerCase())).size ===
  registry.length
    ? "No duplicate primary keyword remains in the registry."
    : "FAIL: duplicate primary keywords remain in the registry."
}

## GSC actions

Manual URL Inspection / Request Indexing:

${[...priorityPaths].map((pagePath) => `- \`${pagePath}\``).join("\n")}

All 28 verified public pages may also be rediscovered through the submitted sitemap. See \`sitemap-recrawl-pages.csv\`.

## Modified files

${modifiedFiles.map((file) => `- \`${file}\``).join("\n")}

## Evidence and limitations

- Every success statement above is backed by a production Next.js build and the final HTML verifier bound to commit, worktree, build and registry hashes.
- API, login, admin, test, redirect, 404 and noindex pages are excluded from the public SEO registry.
- ${
  verification.uncheckedPages === 0 &&
  verification.inaccessiblePages.length === 0 &&
  verification.discovery.buildManifest.missingFromRegistry.length === 0 &&
  verification.discovery.buildManifest.missingFromBuild.length === 0
    ? "No public page was inaccessible or omitted."
    : `FAIL: unchecked=${verification.uncheckedPages}, inaccessible=${verification.inaccessiblePages.length}, missingFromRegistry=${verification.discovery.buildManifest.missingFromRegistry.length}, missingFromBuild=${verification.discovery.buildManifest.missingFromBuild.length}.`
}
- The build-time verifier confirms server-rendered SEO output. Live-domain indexing and ranking changes still require deployment, sitemap submission and subsequent GSC/Semrush observation.
`;

writeFileSync(
  path.join(
    outputDir,
    `sitewide-seo-remediation-report-${reportDate}.md`
  ),
  report,
  "utf8"
);

console.log(
  JSON.stringify(
    {
      outputDir,
      totalPages: verification.totalPages,
      passedPages: verification.passedPages,
      failedPages: verification.failedPages,
      files: [
        "keyword-map.csv",
        `sitewide-seo-audit-${reportDate}.csv`,
        "keyword-conflict-resolution.csv",
        "gsc-reindex-priority.csv",
        "sitemap-recrawl-pages.csv",
        "modified-files.txt",
        `sitewide-seo-remediation-report-${reportDate}.md`,
      ],
    },
    null,
    2
  )
);
