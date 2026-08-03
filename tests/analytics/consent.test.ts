import { describe, expect, it, vi } from "vitest";

import { buildAnalyticsHeadScript, buildGtmBootstrap } from "@/lib/analytics/bootstrap";
import { getGtmContainerId } from "@/lib/analytics/config";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  parseConsentValue,
  readConsent,
  updateGoogleConsent,
  writeConsent,
} from "@/lib/analytics/consent";

type StorageDouble = Pick<Storage, "getItem" | "setItem">;

function asCall(item: unknown): unknown[] {
  return Array.from(item as ArrayLike<unknown>);
}

function executeHeadScript(storage: StorageDouble) {
  const scriptWindow: {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __orangeAnalyticsBootstrap?: unknown;
  } = {};

  Function("window", "localStorage", buildAnalyticsHeadScript())(scriptWindow, storage);
  return scriptWindow;
}

describe("parseConsentValue", () => {
  it.each(["granted", "denied"] as const)("accepts version 1 with analytics %s", (choice) => {
    expect(parseConsentValue(JSON.stringify({ version: 1, analytics: choice }))).toEqual({
      version: 1,
      analytics: choice,
    });
  });

  it.each([
    ["wrong version", '{"version":2,"analytics":"granted"}'],
    ["wrong choice", '{"version":1,"analytics":"yes"}'],
    ["malformed JSON", "{"],
    ["array", '[1,"granted"]'],
    ["null", "null"],
    ["missing analytics", '{"version":1}'],
    ["extra field", '{"version":1,"analytics":"granted","ads":"denied"}'],
  ])("rejects %s", (_label, value) => {
    expect(parseConsentValue(value)).toBeNull();
  });
});

describe("consent storage", () => {
  it("reads only the dedicated key and returns a valid saved choice", () => {
    const getItem = vi.fn(() => '{"version":1,"analytics":"granted"}');

    expect(readConsent({ getItem })).toEqual({ choice: "granted", error: null });
    expect(getItem).toHaveBeenCalledOnce();
    expect(getItem).toHaveBeenCalledWith(ANALYTICS_CONSENT_STORAGE_KEY);
  });

  it("returns no choice and no error when the key is missing", () => {
    expect(readConsent({ getItem: () => null })).toEqual({
      choice: null,
      error: null,
    });
  });

  it("fails closed for an invalid saved value", () => {
    expect(readConsent({ getItem: () => "not-json" })).toEqual({
      choice: null,
      error: "invalid_value",
    });
  });

  it("fails closed when storage cannot be read", () => {
    expect(
      readConsent({
        getItem: () => {
          throw new Error("blocked");
        },
      }),
    ).toEqual({ choice: null, error: "storage_unavailable" });
  });

  it.each(["granted", "denied"] as const)("writes exact minified JSON for %s", (choice) => {
    const setItem = vi.fn();

    expect(writeConsent({ setItem }, choice)).toEqual({ ok: true, error: null });
    expect(setItem).toHaveBeenCalledWith(
      ANALYTICS_CONSENT_STORAGE_KEY,
      `{"version":1,"analytics":"${choice}"}`,
    );
  });

  it("reports unavailable storage when writing throws", () => {
    expect(
      writeConsent(
        {
          setItem: () => {
            throw new Error("blocked");
          },
        },
        "denied",
      ),
    ).toEqual({ ok: false, error: "storage_unavailable" });
  });
});

describe("updateGoogleConsent", () => {
  it.each([
    ["granted", "granted"],
    ["denied", "denied"],
  ] as const)("updates analytics storage to %s while advertising remains denied", (choice, expected) => {
    const gtag = vi.fn();
    window.gtag = gtag;

    updateGoogleConsent(choice);

    expect(gtag).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: expected,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });
});

describe("getGtmContainerId", () => {
  it("accepts a valid public GTM container ID", () => {
    expect(getGtmContainerId("GTM-5FHDLXGV")).toBe("GTM-5FHDLXGV");
  });

  it.each([undefined, "", " GTM-5FHDLXGV", "GTM-5FHDLXGV ", "gtm-5FHDLXGV", "GTM-", "G-051YHED3HG"])(
    "rejects invalid explicit value %s",
    (value) => {
      expect(getGtmContainerId(value)).toBeNull();
    },
  );

  it("reads NEXT_PUBLIC_GTM_ID when called without an argument", () => {
    const previous = process.env.NEXT_PUBLIC_GTM_ID;
    process.env.NEXT_PUBLIC_GTM_ID = "GTM-5FHDLXGV";
    try {
      expect(getGtmContainerId()).toBe("GTM-5FHDLXGV");
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_GTM_ID;
      else process.env.NEXT_PUBLIC_GTM_ID = previous;
    }
  });
});

describe("buildAnalyticsHeadScript", () => {
  it("queues fail-closed consent and privacy settings before reading storage", () => {
    let callsAtRead: unknown[][] = [];
    const getItem = vi.fn(() => {
      callsAtRead = scriptWindow.dataLayer?.map(asCall) ?? [];
      return '{"version":1,"analytics":"granted"}';
    });
    const scriptWindow: {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
      __orangeAnalyticsBootstrap?: unknown;
    } = {};

    Function("window", "localStorage", buildAnalyticsHeadScript())(scriptWindow, {
      getItem,
      setItem: vi.fn(),
    });

    expect(callsAtRead).toEqual([
      ["consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      }],
      ["set", "allow_ad_personalization_signals", false],
      ["set", "ads_data_redaction", true],
    ]);
    expect(scriptWindow.dataLayer?.map(asCall)).toEqual([
      ...callsAtRead,
      ["consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      }],
    ]);
    expect(getItem).toHaveBeenCalledWith(ANALYTICS_CONSENT_STORAGE_KEY);
    expect(scriptWindow.__orangeAnalyticsBootstrap).toEqual({ choice: "granted", error: null });
  });

  it.each([
    ["missing", null, { choice: null, error: null }],
    ["malformed", "not-json", { choice: null, error: "invalid_value" }],
  ])("reports %s saved consent without queuing an update", (_label, value, status) => {
    const scriptWindow = executeHeadScript({ getItem: () => value, setItem: vi.fn() });

    expect(scriptWindow.dataLayer?.map(asCall)).toHaveLength(3);
    expect(scriptWindow.__orangeAnalyticsBootstrap).toEqual(status);
  });

  it("fails closed when localStorage throws", () => {
    const scriptWindow = executeHeadScript({
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: vi.fn(),
    });

    expect(scriptWindow.dataLayer?.map(asCall)).toHaveLength(3);
    expect(scriptWindow.__orangeAnalyticsBootstrap).toEqual({
      choice: null,
      error: "storage_unavailable",
    });
  });

  it("reads no unrelated storage keys and is deterministic without GA or GTM loaders", () => {
    const getItem = vi.fn(() => '{"version":1,"analytics":"denied"}');
    const storage = { getItem, setItem: vi.fn() };

    executeHeadScript(storage);

    expect(getItem).toHaveBeenCalledTimes(1);
    expect(getItem).toHaveBeenCalledWith(ANALYTICS_CONSENT_STORAGE_KEY);
    expect(buildAnalyticsHeadScript()).toBe(buildAnalyticsHeadScript());
    expect(buildAnalyticsHeadScript()).not.toMatch(/G-[A-Z0-9]+|gtag\/js|gtm\.js/);
  });
});

describe("buildGtmBootstrap", () => {
  it("emits one startup event and one GTM request for a validated ID without consent logic", () => {
    const script = buildGtmBootstrap("GTM-5FHDLXGV");

    expect(script.match(/gtm\.start/g)).toHaveLength(1);
    expect(script.match(/googletagmanager\.com\/gtm\.js/g)).toHaveLength(1);
    expect(script).toContain("GTM-5FHDLXGV");
    expect(script).not.toContain("consent");
  });

  it.each(["", " GTM-5FHDLXGV", "gtm-5FHDLXGV", "GTM-5FHDLXGV';alert(1)//"])(
    "throws rather than embedding unsafe ID %s",
    (id) => {
      expect(() => buildGtmBootstrap(id)).toThrow("Invalid GTM container ID");
    },
  );
});
