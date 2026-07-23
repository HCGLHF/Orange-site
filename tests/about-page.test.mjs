import assert from "node:assert/strict";
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
  assert.equal(evidence.certificationEvidence.version, "4.0");
  assert.equal(evidence.certificationEvidence.validUntil, "2027-04-19");
  assert.deepEqual(
    evidence.manufacturingScale.map((item) => item.value),
    ["200+", "17", "60+", "40+", "100+"]
  );
});

test("company evidence excludes restricted source assets and production figures", () => {
  const source = readFileSync(evidencePath, "utf8");

  assert.doesNotMatch(source, /\.(?:pdf|jpg|jpeg|png)/i);
  assert.doesNotMatch(source, /\b(?:221|177|114|63|44)\b/);
  assert.doesNotMatch(source, /["']50\+["']/);
  assert.match(source, /Transaction Certificate/);
});
