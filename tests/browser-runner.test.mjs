import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("browser runner bounds every loopback readiness request", async () => {
  const source = await readFile(
    new URL("../scripts/run-browser-tests.mjs", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /fetch\(baseUrl,\s*\{[\s\S]*?signal:\s*AbortSignal\.timeout\([\d_]+\)[\s\S]*?\}\)/,
  );
});
