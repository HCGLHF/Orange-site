import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const iconPath = path.join(repositoryRoot, "app", "icon.svg");
const legacyFaviconPath = path.join(repositoryRoot, "app", "favicon.ico");

test("uses the branded OrangeMark SVG favicon", () => {
  assert.equal(existsSync(iconPath), true, "app/icon.svg should exist");
  assert.equal(existsSync(legacyFaviconPath), false, "app/favicon.ico should not exist");

  const svg = readFileSync(iconPath, "utf8");

  assert.match(svg, /viewBox="0 0 32 32"/);
  assert.match(svg, /fill="#E07A5F"/);
  assert.match(svg, /fill="#5C9E6E"/);
  assert.match(svg, /<circle cx="16" cy="19" r="11"/);
});
