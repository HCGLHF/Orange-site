import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.dirname(
  fileURLToPath(new URL("../package.json", import.meta.url))
);

async function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(absolute);
      return /\.(?:js|mjs|ts|tsx)$/.test(entry.name) ? [absolute] : [];
    })
  );
  return nested.flat();
}

test("critical Hero images use responsive Next image delivery", async () => {
  const [config, landingHero, aboutPage] = await Promise.all([
    source("next.config.mjs"),
    source("components/landing/LandingHero.tsx"),
    source("components/company/AboutPage.tsx"),
  ]);

  assert.doesNotMatch(config, /unoptimized\s*:\s*true/);
  for (const component of [landingHero, aboutPage]) {
    assert.match(
      component,
      /<Image\b[\s\S]*?\bpriority\b[\s\S]*?\bsizes="100vw"[\s\S]*?\/>/
    );
  }
});

test("the current application ships no video code or video URL", async () => {
  const files = (
    await Promise.all(
      ["app", "components", "lib"].map((directory) =>
        sourceFiles(path.join(root, directory))
      )
    )
  ).flat();
  const prohibited =
    /<video\b|<source\b|HTMLVideoElement|HTMLMediaElement|requestVideoFrameCallback|\.(?:mp4|webm|m3u8)(?:[?"'`]|$)/i;

  for (const file of files) {
    assert.doesNotMatch(
      await readFile(file, "utf8"),
      prohibited,
      path.relative(root, file)
    );
  }
});
