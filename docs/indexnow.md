# IndexNow operations

O'range Textile exposes its public verification key at:

`https://orangetextiles.com/7a1d92c6-dd96-4826-842f-cef86313cfd9.txt`

Submit only canonical pages that were added or materially updated. The
command rejects URLs outside `orangetextiles.com`, query strings, fragments,
redirect-style paths, API/admin paths, and pages outside the public SEO registry.

Validate a proposed batch without sending it:

```bash
npm run indexnow:submit -- --dry-run / /about
```

Submit the explicit batch after the matching production deployment is Ready:

```bash
npm run indexnow:submit -- / /about
```

The command sends one server-side POST to `https://api.indexnow.org/indexnow`,
deduplicates URLs, times out after 10 seconds, and does not retry automatically.
HTTP 200 means the URLs were received. HTTP 202 means they were received while
key validation is pending. Neither response guarantees crawling, indexing, or
rankings.

IndexNow submission is intentionally not part of `build` or deployment. A failed
submission must be investigated separately and must not make the website build
or production deployment fail.

Protocol reference: <https://www.indexnow.org/documentation>
