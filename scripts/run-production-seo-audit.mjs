import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const port = process.env.SEO_AUDIT_PORT || "3210";
const baseUrl = `http://127.0.0.1:${port}`;
const nextCli = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);
const validator = fileURLToPath(
  new URL("./validate-production-seo.mjs", import.meta.url)
);

if (!existsSync(nextCli)) {
  throw new Error(`Next.js CLI not found at ${nextCli}`);
}

const server = spawn(
  process.execPath,
  [nextCli, "start", "-p", port],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  }
);

server.stdout.on("data", (chunk) => process.stdout.write(chunk));
server.stderr.on("data", (chunk) => process.stderr.write(chunk));

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(
        `Next.js exited early with code ${server.exitCode}`
      );
    }
    try {
      const response = await fetch(baseUrl, {
        redirect: "manual",
      });
      if (response.status > 0) return;
    } catch {
      // The server socket is not ready yet.
    }
    await delay(250);
  }
  throw new Error(`Next.js did not become ready at ${baseUrl}`);
}

async function runValidator() {
  const child = spawn(process.execPath, [validator], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      SEO_AUDIT_BASE_URL: baseUrl,
    },
    stdio: "inherit",
  });
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
}

async function stopServer() {
  if (server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    delay(5_000),
  ]);
  if (server.exitCode === null) server.kill("SIGKILL");
}

let exitCode = 1;
try {
  await waitForServer();
  exitCode = await runValidator();
} finally {
  await stopServer();
}

process.exitCode = exitCode;
