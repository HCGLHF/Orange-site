import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidencePath = path.join(root, "lib", "company-evidence.ts");

test("company evidence records the verified corporate and GRS facts", async () => {
  const evidence = await import(pathToFileURL(evidencePath).href);

  assert.equal(evidence.companyRelationship.exportCompany, "Shaoxing Shicheng Textile Products Co., Ltd.");
  assert.equal(evidence.companyRelationship.parentCompany, "Shaoxing Jingtian Textile Technology Co., Ltd.");
  assert.equal(evidence.certificationEvidence.holder, evidence.companyRelationship.parentCompany);
  assert.equal(evidence.certificationEvidence.standard, "Global Recycled Standard");
  assert.equal(evidence.certificationEvidence.shortName, "GRS");
  assert.equal(evidence.certificationEvidence.version, "4.0");
  assert.equal(evidence.certificationEvidence.certificationBody, "TÜV Rheinland (China) Ltd.");
  assert.equal(evidence.certificationEvidence.scopeCertificateNumber, "TRC-GRS-350849-00");
  assert.equal(evidence.certificationEvidence.productCategory, "Greige fabrics");
  assert.equal(evidence.certificationEvidence.productDetail, "Knitted fabrics");
  assert.equal(evidence.certificationEvidence.process, "Knitting");
  assert.equal(evidence.certificationEvidence.validUntil, "2027-04-19");
  assert.equal(
    evidence.certificationEvidence.qualification,
    "Scope certification does not prove that a delivered product is GRS certified. Shipment-level claims require a valid Transaction Certificate or equivalent supporting documentation for the applicable order."
  );
  assert.deepEqual(evidence.manufacturingScale.map(({ value, label }) => ({ value, label })), [
    { value: "200+", label: "circular knitting machines" },
    { value: "17", label: "machine configurations" },
    { value: "60+", label: "84-feeder double-knit machines" },
    { value: "40+", label: "72-feeder rib machines" },
    { value: "100+", label: "72-feeder double-knit machines" },
  ]);
});

test("company evidence excludes restricted source assets and production figures", () => {
  const source = readFileSync(evidencePath, "utf8");

  assert.doesNotMatch(source, /\.(?:pdf|jpg|jpeg|png)/i);
  assert.doesNotMatch(source, /\b(?:221|177|114|63|44)\b/);
  assert.doesNotMatch(source, /["'`]50\+["'`]/);
  assert.match(source, /Transaction Certificate/);

  const exportSections = source.split(/(?=export const )/);
  for (const contract of [
    "companyRelationship",
    "manufacturingScale",
    "certificationEvidence",
    "knittingDirections",
  ]) {
    const section = exportSections.find((entry) =>
      entry.startsWith(`export const ${contract} =`)
    );
    assert.ok(section, `${contract} export must exist`);
    assert.match(section, /as const;\s*$/);
  }
});

test("restricted evidence assets are absent from tracked files", () => {
  const trackedFiles = execFileSync("git", ["ls-files", "-z"], { cwd: root })
    .toString("utf8")
    .split("\0")
    .filter(Boolean);

  for (const restrictedPath of [
    /GRS2026/i,
    /针筒明细/i,
    /grs-certificate-source/i,
    /certificate-page/i,
    /codex-clipboard-98e654d6/i,
    /(?:^|\/)tmp\/pdfs\//i,
    /grs-certificate-(?:source|\d+)\.(?:pdf|png)/i,
  ]) {
    for (const trackedFile of trackedFiles) {
      assert.doesNotMatch(trackedFile, restrictedPath);
    }
  }
});

test("homepage renders a compact certificate summary linked to About", () => {
  const homepage = readFileSync(
    path.join(root, "components", "geo", "GeoHomePage.tsx"),
    "utf8"
  );
  const section = readFileSync(
    path.join(root, "components", "company", "HomeCertificateSection.tsx"),
    "utf8"
  );

  assert.match(homepage, /<HomeCertificateSection\s*\/>/);
  assert.match(section, /GRS Scope Documentation/);
  assert.match(section, /companyRelationship\.parentCompany/);
  assert.match(section, /certificationEvidence\.productCategory/);
  assert.match(section, /certificationEvidence\.productDetail/);
  assert.match(section, /certificationEvidence\.qualification/);
  assert.match(section, /href="\/about"/);
  assert.doesNotMatch(section, /<h1\b/i);
  assert.doesNotMatch(section, /download|\.pdf|<img\b/i);
});

test("About route uses unified metadata and one registry-owned H1", () => {
  const route = readFileSync(
    path.join(root, "app", "about", "page.tsx"),
    "utf8"
  );
  const component = readFileSync(
    path.join(root, "components", "company", "AboutPage.tsx"),
    "utf8"
  );

  assert.match(route, /getPublicPageSeo\(["']\/about["']\)/);
  assert.match(route, /createPageMetadata\(seo\)/);
  assert.match(route, /<AboutPage seo=\{seo\}\s*\/>/);
  assert.equal(component.match(/<h1\b/g)?.length, 1);
  assert.match(component, /<h1\b[^>]*>[\s\S]*?\{seo\.h1\}[\s\S]*?<\/h1>/);
  assert.match(component, /manufacturingScale\.map/);
  assert.match(component, /certificationEvidence\.qualification/);
  assert.doesNotMatch(component, /<img\b|\.pdf|download/i);
  assert.doesNotMatch(component, /<main\b/i);
  assert.doesNotMatch(
    component,
    /text-brand-charcoal\/(?:55|60|65|70)\b/
  );
  assert.match(
    component,
    /<dd\b[^>]*>[\s\S]*?\{metric\.value\}[\s\S]*?\{metric\.detail\}[\s\S]*?<\/dd>/
  );
  assert.doesNotMatch(
    component,
    /<\/dd>\s*<p\b[^>]*>[\s\S]*?\{metric\.detail\}/
  );
});

test("About schema identifies the parent without assigning its certificate to the subsidiary", () => {
  const source = readFileSync(
    path.join(root, "lib", "company-schema.ts"),
    "utf8"
  );

  assert.match(source, /["']@type["']:\s*["']AboutPage["']/);
  assert.match(source, /parentOrganization/);
  assert.match(source, /companyRelationship\.parentCompany/);
  assert.doesNotMatch(source, /certificationEvidence|scopeCertificateNumber/);
});

test("global shell exposes About without duplicating the homepage footer", () => {
  const shell = readFileSync(
    path.join(root, "components", "AppShell.tsx"),
    "utf8"
  );
  const footer = readFileSync(
    path.join(root, "components", "ui", "SiteFooter.tsx"),
    "utf8"
  );
  const homepage = readFileSync(
    path.join(root, "components", "geo", "GeoHomePage.tsx"),
    "utf8"
  );

  assert.match(shell, /<SiteFooter\s*\/>/);
  assert.match(footer, /href:\s*["']\/about["']/);
  assert.match(footer, /companyRelationship\.exportCompany/);
  assert.doesNotMatch(homepage, /<footer\b/i);
});

test("existing organization and AI discovery content use shared relationship facts", () => {
  const geo = readFileSync(
    path.join(root, "lib", "geo-content.ts"),
    "utf8"
  );
  const llms = readFileSync(
    path.join(root, "app", "llms.txt", "route.ts"),
    "utf8"
  );

  assert.match(geo, /companyRelationship\.exportCompany/);
  assert.match(geo, /parentOrganization/);
  assert.match(geo, /companyRelationship\.parentCompany/);
  assert.doesNotMatch(geo, /\b(?:221|177|114|63|44)\b/);

  assert.match(llms, /import\s*\{[\s\S]*companyRelationship[\s\S]*\}\s*from\s*["']@\/lib\/company-evidence["']/);
  assert.match(llms, /companyRelationship\.exportCompany/);
  assert.match(llms, /companyRelationship\.parentCompany/);
  assert.doesNotMatch(
    llms,
    /O'range Textile is a Shaoxing Keqiao knit fabric manufacturer/
  );
});
