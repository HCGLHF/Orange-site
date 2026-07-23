import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const registryPath = path.join(root, "content", "seo-pages.json");
const registrySource = readFileSync(registryPath, "utf8");
const registry = JSON.parse(registrySource);
const port = Number(process.env.SEO_VERIFY_PORT || 4317);
const origin = process.env.VERIFY_BASE_URL || `http://127.0.0.1:${port}`;
const canonicalOrigin =
  process.env.VERIFY_SITE_URL || "https://orangetextiles.com";
const reportDirectory =
  process.env.SEO_REPORT_DIR || path.join(root, "artifacts", "seo");

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

function getBuildPublicRoutes() {
  const manifestPath = path.join(root, ".next", "prerender-manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const excludedRoutes = new Set([
    "/_not-found",
    "/icon.svg",
    "/llms.txt",
    "/robots.txt",
    "/sitemap.xml"
  ]);

  return Object.keys(manifest.routes)
    .filter(
      (route) => !route.startsWith("/api/") && !excludedRoutes.has(route)
    )
    .sort();
}

function decodeHtml(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, number) =>
      String.fromCodePoint(Number.parseInt(number, 10))
    )
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function getAttribute(tag, name) {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i")
  );
  return match ? decodeHtml(match[1] ?? match[2] ?? "") : undefined;
}

function getTags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

function getMetaContent(html, key, value) {
  const matches = getTags(html, "meta").filter(
    (tag) => getAttribute(tag, key)?.toLowerCase() === value.toLowerCase()
  );
  return {
    count: matches.length,
    value: matches.length ? getAttribute(matches[0], "content") ?? "" : ""
  };
}

function getLinkHref(html, rel) {
  const matches = getTags(html, "link").filter((tag) =>
    (getAttribute(tag, "rel") ?? "")
      .toLowerCase()
      .split(/\s+/)
      .includes(rel.toLowerCase())
  );
  return {
    count: matches.length,
    value: matches.length ? getAttribute(matches[0], "href") ?? "" : ""
  };
}

function getElementText(html, tagName) {
  const matches = [
    ...html.matchAll(
      new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi")
    )
  ];
  return {
    count: matches.length,
    value: matches.length
      ? decodeHtml(matches[0][1].replace(/<[^>]+>/g, "").trim())
      : ""
  };
}

function expectedCanonical(pagePath) {
  return pagePath === "/" ? canonicalOrigin : `${canonicalOrigin}${pagePath}`;
}

function addCheck(checks, name, passed, actual, expected) {
  checks.push({
    name,
    status: passed ? "PASS" : "FAIL",
    actual,
    expected
  });
}

async function waitForServer() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/robots.txt`);
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Timed out waiting for ${origin}`);
}

async function verifyPage(page) {
  const response = await fetch(`${origin}${page.path}`, {
    redirect: "manual",
    headers: { "user-agent": "Googlebot" }
  });
  const html = await response.text();
  const checks = [];
  const title = getElementText(html, "title");
  const h1 = getElementText(html, "h1");
  const description = getMetaContent(html, "name", "description");
  const ogDescription = getMetaContent(html, "property", "og:description");
  const twitterDescription = getMetaContent(
    html,
    "name",
    "twitter:description"
  );
  const canonical = getLinkHref(html, "canonical");
  const robots = getMetaContent(html, "name", "robots");
  const images = getTags(html, "img");
  const imagesWithoutAlt = images.filter(
    (tag) => getAttribute(tag, "alt") === undefined
  );

  addCheck(checks, "HTTP 200", response.status === 200, response.status, 200);
  addCheck(
    checks,
    "HTML content type",
    (response.headers.get("content-type") ?? "").includes("text/html"),
    response.headers.get("content-type"),
    "text/html"
  );
  addCheck(checks, "One title", title.count === 1, title.count, 1);
  addCheck(
    checks,
    "Title matches registry",
    title.value === page.metaTitle,
    title.value,
    page.metaTitle
  );
  addCheck(
    checks,
    "Title starts with primary keyword",
    title.value.toLowerCase().startsWith(page.primaryKeyword.toLowerCase()),
    title.value,
    page.primaryKeyword
  );
  addCheck(
    checks,
    "Title <= 70 characters",
    title.value.length <= 70,
    title.value.length,
    "<=70"
  );
  addCheck(
    checks,
    "One meta description",
    description.count === 1,
    description.count,
    1
  );
  addCheck(
    checks,
    "Meta description matches registry",
    description.value === page.metaDescription,
    description.value,
    page.metaDescription
  );
  addCheck(
    checks,
    "Meta description 160-300 characters",
    description.value.length >= 160 && description.value.length <= 300,
    description.value.length,
    "160-300"
  );
  addCheck(checks, "One H1", h1.count === 1, h1.count, 1);
  addCheck(
    checks,
    "H1 matches registry",
    h1.value === page.h1,
    h1.value,
    page.h1
  );
  addCheck(
    checks,
    "H1 contains primary keyword",
    h1.value.toLowerCase().includes(page.primaryKeyword.toLowerCase()),
    h1.value,
    page.primaryKeyword
  );
  addCheck(
    checks,
    "One canonical",
    canonical.count === 1,
    canonical.count,
    1
  );
  addCheck(
    checks,
    "Canonical is correct",
    canonical.value === expectedCanonical(page.path),
    canonical.value,
    expectedCanonical(page.path)
  );
  addCheck(
    checks,
    "No unexpected noindex",
    !robots.value.toLowerCase().includes("noindex") &&
      !(response.headers.get("x-robots-tag") ?? "")
        .toLowerCase()
        .includes("noindex"),
    robots.value || response.headers.get("x-robots-tag") || "indexable",
    "indexable"
  );
  addCheck(
    checks,
    "Open Graph description matches",
    ogDescription.count === 1 && ogDescription.value === page.metaDescription,
    ogDescription.value,
    page.metaDescription
  );
  addCheck(
    checks,
    "Twitter description matches",
    twitterDescription.count === 1 &&
      twitterDescription.value === page.metaDescription,
    twitterDescription.value,
    page.metaDescription
  );
  addCheck(
    checks,
    "Every image has ALT",
    imagesWithoutAlt.length === 0,
    `${images.length - imagesWithoutAlt.length}/${images.length}`,
    `${images.length}/${images.length}`
  );

  return {
    url: `${canonicalOrigin}${page.path === "/" ? "" : page.path}`,
    path: page.path,
    primaryKeyword: page.primaryKeyword,
    searchIntent: page.searchIntent,
    title: title.value,
    metaDescription: description.value,
    h1: h1.value,
    altResult:
      imagesWithoutAlt.length === 0
        ? `PASS (${images.length}/${images.length})`
        : `FAIL (${imagesWithoutAlt.length} missing)`,
    canonical: canonical.value,
    status: checks.every((check) => check.status === "PASS") ? "PASS" : "FAIL",
    checks
  };
}

async function verifyDiscovery(results) {
  const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
  const sitemapText = await sitemapResponse.text();
  const sitemapUrls = [
    ...sitemapText.matchAll(/<loc>([\s\S]*?)<\/loc>/g)
  ].map((match) => decodeHtml(match[1]));
  const expectedUrls = registry.map((page) => expectedCanonical(page.path));
  const robotsResponse = await fetch(`${origin}/robots.txt`);
  const robotsText = await robotsResponse.text();
  const builtPublicRoutes = getBuildPublicRoutes();
  const registryRoutes = registry.map((page) => page.path).sort();

  return {
    buildManifest: {
      registryCount: registryRoutes.length,
      builtPublicCount: builtPublicRoutes.length,
      missingFromRegistry: builtPublicRoutes.filter(
        (route) => !registryRoutes.includes(route)
      ),
      missingFromBuild: registryRoutes.filter(
        (route) => !builtPublicRoutes.includes(route)
      )
    },
    sitemap: {
      status: sitemapResponse.status,
      expectedCount: expectedUrls.length,
      actualCount: sitemapUrls.length,
      missing: expectedUrls.filter((url) => !sitemapUrls.includes(url)),
      unexpected: sitemapUrls.filter((url) => !expectedUrls.includes(url))
    },
    robots: {
      status: robotsResponse.status,
      allowsPublicPages: !/Disallow:\s*\/\s*$/im.test(robotsText),
      disallowsApi: /Disallow:\s*\/api\//i.test(robotsText),
      hasSitemap: robotsText.includes(`${canonicalOrigin}/sitemap.xml`)
    },
    failedPages: results
      .filter((result) => result.status === "FAIL")
      .map((result) => result.path)
  };
}

async function run() {
  let server;
  if (!process.env.VERIFY_BASE_URL) {
    const nextBin = path.join(
      root,
      "node_modules",
      "next",
      "dist",
      "bin",
      "next"
    );
    if (!existsSync(path.join(root, ".next", "BUILD_ID"))) {
      throw new Error("Production build is missing. Run npm.cmd run build first.");
    }
    server = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
      cwd: root,
      env: { ...process.env, NODE_ENV: "production" },
      stdio: ["ignore", "pipe", "pipe"]
    });
    server.stdout.on("data", (chunk) => process.stdout.write(chunk));
    server.stderr.on("data", (chunk) => process.stderr.write(chunk));
  }

  try {
    await waitForServer();
    const results = [];
    for (const page of registry) {
      results.push(await verifyPage(page));
    }
    const discovery = await verifyDiscovery(results);
    const passedPages = results.filter((result) => result.status === "PASS");
    const buildId = readFileSync(
      path.join(root, ".next", "BUILD_ID"),
      "utf8"
    ).trim();
    const summary = {
      checkedAt: new Date().toISOString(),
      origin,
      canonicalOrigin,
      gitCommit: gitOutput(["rev-parse", "HEAD"]).trim(),
      workspaceHash: getWorkspaceHash(),
      buildId,
      registryHash: createHash("sha256")
        .update(registrySource)
        .digest("hex"),
      totalPages: registry.length,
      passedPages: passedPages.length,
      failedPages: results.length - passedPages.length,
      uncheckedPages: 0,
      inaccessiblePages: results
        .filter(
          (result) =>
            result.checks.find((check) => check.name === "HTTP 200")?.status ===
            "FAIL"
        )
        .map((result) => result.path),
      discovery,
      pages: results
    };

    if (reportDirectory) {
      mkdirSync(reportDirectory, { recursive: true });
      writeFileSync(
        path.join(reportDirectory, "sitewide-seo-verification.json"),
        `${JSON.stringify(summary, null, 2)}\n`
      );
    }

    console.log(JSON.stringify(summary, null, 2));
    if (
      summary.failedPages > 0 ||
      discovery.sitemap.missing.length > 0 ||
      discovery.sitemap.unexpected.length > 0 ||
      discovery.buildManifest.missingFromRegistry.length > 0 ||
      discovery.buildManifest.missingFromBuild.length > 0 ||
      !discovery.robots.allowsPublicPages ||
      !discovery.robots.disallowsApi ||
      !discovery.robots.hasSitemap
    ) {
      process.exitCode = 1;
    }
  } finally {
    if (server) {
      server.kill();
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 3000);
        server.once("exit", () => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
  }
}

await run();
