import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const expectedKey = "7a1d92c6-dd96-4826-842f-cef86313cfd9";
const moduleUrl = new URL("../lib/indexnow.ts", import.meta.url);
const keyRouteUrl = new URL(
  `../app/${expectedKey}.txt/route.ts`,
  import.meta.url
);

async function loadIndexNow() {
  assert.ok(existsSync(moduleUrl), "lib/indexnow.ts must exist");
  return import(moduleUrl.href);
}

test("IndexNow key uses the official format and its root key route is exact text", async () => {
  const { INDEXNOW_KEY, INDEXNOW_KEY_LOCATION } = await loadIndexNow();
  assert.equal(INDEXNOW_KEY, expectedKey);
  assert.match(INDEXNOW_KEY, /^[a-f0-9-]{8,128}$/);
  assert.equal(
    INDEXNOW_KEY_LOCATION,
    `https://orangetextiles.com/${expectedKey}.txt`
  );
  assert.ok(existsSync(keyRouteUrl), "the root IndexNow key route must exist");

  const { GET } = await import(keyRouteUrl.href);
  const response = GET();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/plain\b/);
  assert.equal(await response.text(), expectedKey);
});

test("canonical validation accepts only registered production URLs", async () => {
  const { normalizeIndexNowUrls } = await loadIndexNow();
  assert.deepEqual(
    normalizeIndexNowUrls([
      "/",
      "/about",
      "https://orangetextiles.com/blog/how-to-write-a-knit-fabric-rfq",
    ]),
    [
      "https://orangetextiles.com",
      "https://orangetextiles.com/about",
      "https://orangetextiles.com/blog/how-to-write-a-knit-fabric-rfq",
    ]
  );
});

test("cross-domain, query, fragment, redirect-style, noindex and invalid URLs are rejected", async () => {
  const { normalizeIndexNowUrls } = await loadIndexNow();
  const rejected = [
    "https://example.com/about",
    "http://orangetextiles.com/about",
    "https://www.orangetextiles.com/about",
    "https://orangetextiles.com/about?utm_source=test",
    "https://orangetextiles.com/about#team",
    "https://orangetextiles.com/about/",
    "/api/inquiry",
    "/admin",
    "/robots.txt",
    "/noindex-preview",
    "not a url",
  ];

  for (const value of rejected) {
    assert.throws(
      () => normalizeIndexNowUrls([value]),
      /IndexNow URL rejected/,
      value
    );
  }
});

test("payload contains the canonical host, public key location and deduplicated URLs", async () => {
  const { createIndexNowPayload, INDEXNOW_KEY } = await loadIndexNow();
  assert.deepEqual(createIndexNowPayload(["/about", "/about", "/"]), {
    host: "orangetextiles.com",
    key: INDEXNOW_KEY,
    keyLocation: `https://orangetextiles.com/${expectedKey}.txt`,
    urlList: [
      "https://orangetextiles.com/about",
      "https://orangetextiles.com",
    ],
  });
  assert.throws(() => createIndexNowPayload([]), /at least one URL/i);
});

test("submission accepts 200 and 202 without retrying", async () => {
  const { INDEXNOW_ENDPOINT, submitIndexNow } = await loadIndexNow();

  for (const status of [200, 202]) {
    let calls = 0;
    let capturedUrl;
    let capturedInit;
    const result = await submitIndexNow(["/", "/about", "/about"], {
      fetchImpl: async (url, init) => {
        calls += 1;
        capturedUrl = url;
        capturedInit = init;
        return new Response("", { status });
      },
    });

    assert.equal(calls, 1);
    assert.equal(capturedUrl, INDEXNOW_ENDPOINT);
    assert.equal(capturedInit.method, "POST");
    assert.equal(capturedInit.headers["content-type"], "application/json");
    assert.deepEqual(JSON.parse(capturedInit.body).urlList, [
      "https://orangetextiles.com",
      "https://orangetextiles.com/about",
    ]);
    assert.equal(result.status, status);
    assert.equal(result.urlCount, 2);
    assert.equal(result.accepted, true);
  }
});

test("rate limits and non-2xx responses fail once with sanitized errors", async () => {
  const { INDEXNOW_KEY, submitIndexNow } = await loadIndexNow();

  for (const [status, pattern] of [
    [429, /HTTP 429.*rate limit/i],
    [403, /HTTP 403/],
    [500, /HTTP 500/],
  ]) {
    let calls = 0;
    await assert.rejects(
      submitIndexNow(["/about"], {
        fetchImpl: async () => {
          calls += 1;
          return new Response(`upstream error ${INDEXNOW_KEY}`, { status });
        },
      }),
      (error) => {
        assert.match(error.message, pattern);
        assert.doesNotMatch(error.message, new RegExp(INDEXNOW_KEY));
        return true;
      }
    );
    assert.equal(calls, 1);
  }
});

test("timeouts abort once and do not expose the public key or request payload", async () => {
  const { INDEXNOW_KEY, submitIndexNow } = await loadIndexNow();
  let calls = 0;

  await assert.rejects(
    submitIndexNow(["/about"], {
      timeoutMs: 5,
      fetchImpl: async (_url, init) => {
        calls += 1;
        return new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => {
            reject(new DOMException("aborted", "AbortError"));
          });
        });
      },
    }),
    (error) => {
      assert.match(error.message, /timed out after 5 ms/i);
      assert.doesNotMatch(error.message, new RegExp(INDEXNOW_KEY));
      assert.doesNotMatch(error.message, /urlList|keyLocation/);
      return true;
    }
  );
  assert.equal(calls, 1);
});

test("IndexNow remains an explicit server-side workflow with no credential logging", async () => {
  const packageJson = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8")
  );
  const scriptUrl = new URL("../scripts/submit-indexnow.mjs", import.meta.url);
  assert.equal(
    packageJson.scripts["indexnow:submit"],
    "node scripts/submit-indexnow.mjs"
  );
  assert.ok(existsSync(scriptUrl), "scripts/submit-indexnow.mjs must exist");
  const script = readFileSync(scriptUrl, "utf8");
  assert.match(script, /process\.argv\.slice\(2\)/);
  assert.doesNotMatch(script, /NEXT_PUBLIC_|VERCEL_TOKEN|GITHUB_TOKEN|GH_TOKEN/);
  assert.doesNotMatch(script, /console\.(?:log|error)\([^\n]*(?:key|payload)/i);
});

test("the production SEO audit excludes the verification file from public HTML inventory", () => {
  const validator = readFileSync(
    new URL("../scripts/validate-production-seo.mjs", import.meta.url),
    "utf8"
  );
  assert.match(
    validator,
    /import\s*\{\s*INDEXNOW_KEY\s*\}\s*from\s*["']\.\.\/lib\/indexnow\.ts["']/
  );
  assert.match(validator, /`\/\$\{INDEXNOW_KEY\}\.txt`/);
});
