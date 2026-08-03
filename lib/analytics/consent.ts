export const ANALYTICS_CONSENT_STORAGE_KEY = "orange-textile.analytics-consent";
export const ANALYTICS_CONSENT_VERSION = 1 as const;

export type AnalyticsConsentChoice = "granted" | "denied";
export type StoredAnalyticsConsent = {
  version: 1;
  analytics: AnalyticsConsentChoice;
};

type ConsentReader = Pick<Storage, "getItem">;
type ConsentWriter = Pick<Storage, "setItem">;
type ConsentStorageError = "invalid_value" | "storage_unavailable";

export function parseConsentValue(value: string): StoredAnalyticsConsent | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;

    const keys = Object.keys(parsed);
    if (keys.length !== 2 || !keys.includes("version") || !keys.includes("analytics")) return null;

    const candidate = parsed as { version?: unknown; analytics?: unknown };
    if (
      candidate.version !== ANALYTICS_CONSENT_VERSION ||
      (candidate.analytics !== "granted" && candidate.analytics !== "denied")
    ) {
      return null;
    }

    return { version: ANALYTICS_CONSENT_VERSION, analytics: candidate.analytics };
  } catch {
    return null;
  }
}

export function readConsent(storage: ConsentReader): {
  choice: AnalyticsConsentChoice | null;
  error: ConsentStorageError | null;
} {
  try {
    const value = storage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    if (value === null) return { choice: null, error: null };

    const consent = parseConsentValue(value);
    return consent
      ? { choice: consent.analytics, error: null }
      : { choice: null, error: "invalid_value" };
  } catch {
    return { choice: null, error: "storage_unavailable" };
  }
}

export function writeConsent(
  storage: ConsentWriter,
  choice: AnalyticsConsentChoice,
): { ok: true; error: null } | { ok: false; error: "storage_unavailable" } {
  try {
    storage.setItem(
      ANALYTICS_CONSENT_STORAGE_KEY,
      JSON.stringify({ version: ANALYTICS_CONSENT_VERSION, analytics: choice }),
    );
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: "storage_unavailable" };
  }
}

export function updateGoogleConsent(choice: AnalyticsConsentChoice): void {
  window.gtag?.("consent", "update", {
    analytics_storage: choice,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}
