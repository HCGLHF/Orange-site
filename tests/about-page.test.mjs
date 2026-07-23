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

  for (const contract of [
    "companyRelationship",
    "manufacturingScale",
    "certificationEvidence",
    "knittingDirections",
  ]) {
    assert.match(source, new RegExp(`export const ${contract} = [\\s\\S]*? as const;`));
  }
});

test("restricted evidence assets are absent from tracked files", () => {
  const trackedFiles = execFileSync("git", ["ls-files"], {
    cwd: root,
    encoding: "utf8",
  });

  for (const restrictedName of [
    "GRS2026",
    "针筒明细",
    "grs-certificate-source",
    "certificate-page",
    "codex-clipboard-98e654d6",
  ]) {
    assert.doesNotMatch(trackedFiles, new RegExp(restrictedName, "i"));
  }
});
