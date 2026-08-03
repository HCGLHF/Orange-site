import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = "http://127.0.0.1:3100";

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function isServerReachable() {
  try {
    const response = await fetch(baseUrl, { redirect: "manual" });
    return response.status > 0;
  } catch {
    return false;
  }
}

async function waitForServer(server) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Production server exited before becoming ready (${server.exitCode}).`);
    }
    if (await isServerReachable()) return;
    await delay(250);
  }
  throw new Error(`Production server did not become ready at ${baseUrl}.`);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

if (await isServerReachable()) {
  throw new Error(`Port 3100 is already serving content; stop it before browser verification.`);
}

const buildStatus = run(process.execPath, ["node_modules/next/dist/bin/next", "build"]);
if (buildStatus !== 0) process.exit(buildStatus);

const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3100"],
  { cwd: projectRoot, env: process.env, stdio: "inherit" },
);

let testStatus = 1;
try {
  await waitForServer(server);
  testStatus = run(process.execPath, ["node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)]);
} finally {
  if (server.exitCode === null) {
    const serverExit = new Promise((resolve) => server.once("exit", resolve));
    server.kill();
    await Promise.race([serverExit, delay(5_000)]);
  }
}

process.exitCode = testStatus;
