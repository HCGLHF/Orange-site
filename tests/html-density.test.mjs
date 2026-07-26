import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  inspectHtmlDensity,
  inspectMarkedGlobalNavigation,
} from "../scripts/measure-production-density.mjs";

test("density inspector measures visible text against raw HTML", () => {
  const html =
    '<html><head><style>.x{color:red}</style></head><body><p class="x">Buyer evidence</p><script>ignored()</script></body></html>';
  const result = inspectHtmlDensity(html);

  assert.equal(result.visibleText, "Buyer evidence");
  assert.equal(result.textCharacters, 14);
  assert.equal(result.htmlCharacters, html.length);
  assert.equal(
    result.ratio,
    Number((14 / html.length).toFixed(4))
  );
});

test("density inspector isolates the marked global navigation", () => {
  const html =
    '<nav data-global-navigation="true"><a href="/fabrics">Fabrics</a></nav><main>Body</main>';
  const result = inspectMarkedGlobalNavigation(html);

  assert.equal(result.containerCount, 1);
  assert.equal(
    result.html,
    '<nav data-global-navigation="true"><a href="/fabrics">Fabrics</a></nav>'
  );
  assert.equal(result.text, "Fabrics");
});

test("shared contact cards use compact classes that allow mobile text wrapping", async () => {
  const [source, styles] = await Promise.all([
    readFile(
      new URL("../components/ContactCard.tsx", import.meta.url),
      "utf8"
    ),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.equal(
    [...source.matchAll(/\bclassName=["']cc-card(?:\s[^"']*)?["']/g)]
      .length,
    4
  );
  assert.equal(
    [...source.matchAll(/\bclassName=["']cc-card-copy["']/g)].length,
    4
  );
  assert.match(
    styles,
    /\.cc-card\s*\{[\s\S]*?@apply[\s\S]*?\bmin-w-0\b/
  );
  assert.match(
    styles,
    /\.cc-card-copy\s*\{[\s\S]*?@apply\s+min-w-0/
  );
  assert.match(styles, /\.cc-value\s*\{[\s\S]*?overflow-wrap:\s*anywhere/);
});
