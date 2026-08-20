import {
  SEO_SITE_ORIGIN,
  getAllPublicPageSeo,
  toCanonicalUrl,
} from "./seo/site-seo.ts";

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_KEY = "7a1d92c6-dd96-4826-842f-cef86313cfd9";
export const INDEXNOW_KEY_LOCATION = `${SEO_SITE_ORIGIN}/${INDEXNOW_KEY}.txt`;

const allowedPaths = new Set(
  getAllPublicPageSeo().map((page) => page.path)
);

export type IndexNowPayload = {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
};

export type IndexNowSubmissionResult = {
  accepted: true;
  endpoint: string;
  status: 200 | 202;
  submittedAt: string;
  urlCount: number;
  response: string | null;
};

type FetchImplementation = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>;

type SubmitIndexNowOptions = {
  endpoint?: string;
  fetchImpl?: FetchImplementation;
  timeoutMs?: number;
};

function rejectUrl(value: string, reason: string): never {
  throw new Error(`IndexNow URL rejected (${reason}): ${value}`);
}

export function normalizeIndexNowUrls(values: readonly string[]): string[] {
  const canonicalUrls = [];
  const seen = new Set<string>();

  for (const value of values) {
    if (
      typeof value !== "string" ||
      value.length === 0 ||
      value !== value.trim()
    ) {
      rejectUrl(String(value), "invalid input");
    }
    if (!value.startsWith("/") && !URL.canParse(value)) {
      rejectUrl(value, "invalid URL");
    }

    let url: URL;
    try {
      url = new URL(value, `${SEO_SITE_ORIGIN}/`);
    } catch {
      rejectUrl(value, "invalid URL");
    }

    if (
      url.origin !== SEO_SITE_ORIGIN ||
      url.protocol !== "https:" ||
      url.username !== "" ||
      url.password !== ""
    ) {
      rejectUrl(value, "outside the canonical host");
    }
    if (url.search !== "" || url.hash !== "") {
      rejectUrl(value, "query strings and fragments are not canonical");
    }
    if (!allowedPaths.has(url.pathname)) {
      rejectUrl(value, "not an indexable public canonical route");
    }

    const canonicalUrl = toCanonicalUrl(url.pathname);
    if (!seen.has(canonicalUrl)) {
      seen.add(canonicalUrl);
      canonicalUrls.push(canonicalUrl);
    }
  }

  return canonicalUrls;
}

export function createIndexNowPayload(
  values: readonly string[]
): IndexNowPayload {
  const urlList = normalizeIndexNowUrls(values);
  if (urlList.length === 0) {
    throw new Error("IndexNow requires at least one URL.");
  }

  return {
    host: new URL(SEO_SITE_ORIGIN).hostname,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList,
  };
}

export async function submitIndexNow(
  values: readonly string[],
  options: SubmitIndexNowOptions = {}
): Promise<IndexNowSubmissionResult> {
  const endpoint = options.endpoint ?? INDEXNOW_ENDPOINT;
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 10_000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error("IndexNow timeout must be a positive number.");
  }

  const payload = createIndexNowPayload(values);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.ceil(timeoutMs));
  const submittedAt = new Date().toISOString();

  let response: Response;
  try {
    response = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`IndexNow request timed out after ${timeoutMs} ms.`, {
        cause: error,
      });
    }
    throw new Error(
      "IndexNow request failed before receiving an HTTP response.",
      { cause: error }
    );
  } finally {
    clearTimeout(timeout);
  }

  if (response.status !== 200 && response.status !== 202) {
    const qualifier = response.status === 429 ? " (rate limited)" : "";
    throw new Error(
      `IndexNow request failed with HTTP ${response.status}${qualifier}.`
    );
  }

  const responseText = (await response.text()).trim();
  return {
    accepted: true,
    endpoint,
    status: response.status,
    submittedAt,
    urlCount: payload.urlList.length,
    response: responseText === "" ? null : responseText.slice(0, 1_000),
  };
}
