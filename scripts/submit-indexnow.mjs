import {
  INDEXNOW_ENDPOINT,
  createIndexNowPayload,
  submitIndexNow,
} from "../lib/indexnow.ts";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const urls = args.filter((value) => value !== "--dry-run");

if (urls.length === 0) {
  console.error(
    "Usage: npm run indexnow:submit -- [--dry-run] <canonical-path-or-url> [...]"
  );
  process.exitCode = 2;
} else if (dryRun) {
  const request = createIndexNowPayload(urls);
  console.log(
    JSON.stringify(
      {
        dryRun: true,
        endpoint: INDEXNOW_ENDPOINT,
        urlCount: request.urlList.length,
        urls: request.urlList,
      },
      null,
      2
    )
  );
} else {
  try {
    const result = await submitIndexNow(urls);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
