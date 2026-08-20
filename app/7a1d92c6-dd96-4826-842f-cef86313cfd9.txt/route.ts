import { INDEXNOW_KEY } from "../../lib/indexnow.ts";

export function GET(): Response {
  return new Response(INDEXNOW_KEY, {
    status: 200,
    headers: {
      "cache-control": "public, max-age=3600",
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
