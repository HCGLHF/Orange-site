import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildAnalyticsHeadScript,
  buildGtmBootstrap,
  GTM_MAX_REQUEST_TIME_MS,
} from "@/lib/analytics/bootstrap";
import { getGtmContainerId } from "@/lib/analytics/config";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  parseConsentValue,
  readConsent,
  updateGoogleConsent,
  writeConsent,
} from "@/lib/analytics/consent";
import type {
  AnalyticsBootstrapStatus,
  AnalyticsDataLayer,
  GoogleTag,
} from "@/types/analytics";

type StorageDouble = Pick<Storage, "getItem" | "setItem">;

afterEach(() => vi.useRealTimers());

function asCall(item: unknown): unknown[] {
  return Array.from(item as unknown as ArrayLike<unknown>);
}

function runtimeQueueItems(dataLayer: AnalyticsDataLayer | undefined): unknown[] {
  return (dataLayer ?? []) as unknown as unknown[];
}

function executeHeadScript(storage: StorageDouble) {
  const scriptWindow: {
    dataLayer?: AnalyticsDataLayer;
    gtag?: GoogleTag;
    __orangeAnalyticsBootstrap?: AnalyticsBootstrapStatus;
    localStorage: StorageDouble;
  } = { localStorage: storage };

  Function("window", buildAnalyticsHeadScript())(scriptWindow);
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

  it("does not throw when the installed Google tag function throws", () => {
    window.gtag = vi.fn(() => {
      throw new Error("broken gtag");
    });

    expect(() => updateGoogleConsent("granted")).not.toThrow();
    expect(window.gtag).toHaveBeenCalledOnce();
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
  it("restores saved consent before queueing privacy settings", () => {
    let callsAtRead: unknown[][] = [];
    const getItem = vi.fn(() => {
      callsAtRead = runtimeQueueItems(scriptWindow.dataLayer).map(asCall);
      return '{"version":1,"analytics":"granted"}';
    });
    const scriptWindow: {
      dataLayer?: AnalyticsDataLayer;
      gtag?: GoogleTag;
      __orangeAnalyticsBootstrap?: AnalyticsBootstrapStatus;
      localStorage: StorageDouble;
    } = { localStorage: { getItem, setItem: vi.fn() } };

    Function("window", buildAnalyticsHeadScript())(scriptWindow);

    expect(callsAtRead).toEqual([
      ["consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      }],
    ]);
    expect(runtimeQueueItems(scriptWindow.dataLayer).map(asCall)).toEqual([
      ...callsAtRead,
      ["consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      }],
      ["set", "allow_ad_personalization_signals", false],
      ["set", "ads_data_redaction", true],
    ]);
    expect(getItem).toHaveBeenCalledWith(ANALYTICS_CONSENT_STORAGE_KEY);
    expect(scriptWindow.__orangeAnalyticsBootstrap).toEqual({ choice: "granted", error: null });
  });

  it.each([
    ["missing", null, { choice: null, error: null }],
    ["malformed", "not-json", { choice: null, error: "invalid_value" }],
  ])("reports %s saved consent without queuing an update", (_label, value, status) => {
    const scriptWindow = executeHeadScript({ getItem: () => value, setItem: vi.fn() });

    expect(runtimeQueueItems(scriptWindow.dataLayer).map(asCall)).toHaveLength(3);
    expect(scriptWindow.__orangeAnalyticsBootstrap).toEqual(status);
  });

  it("fails closed when localStorage throws", () => {
    const scriptWindow = executeHeadScript({
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: vi.fn(),
    });

    expect(runtimeQueueItems(scriptWindow.dataLayer).map(asCall)).toHaveLength(3);
    expect(scriptWindow.__orangeAnalyticsBootstrap).toEqual({
      choice: null,
      error: "storage_unavailable",
    });
  });

  it("queues default-denied and reports unavailable when localStorage property access throws", () => {
    const scriptWindow: {
      dataLayer?: AnalyticsDataLayer;
      gtag?: GoogleTag;
      __orangeAnalyticsBootstrap?: AnalyticsBootstrapStatus;
    } = {};
    Object.defineProperty(scriptWindow, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    });

    const globalStorageDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new Error("blocked before IIFE");
      },
    });

    try {
      expect(() => Function("window", buildAnalyticsHeadScript())(scriptWindow)).not.toThrow();
    } finally {
      if (globalStorageDescriptor) {
        Object.defineProperty(globalThis, "localStorage", globalStorageDescriptor);
      } else {
        Reflect.deleteProperty(globalThis, "localStorage");
      }
    }

    expect(runtimeQueueItems(scriptWindow.dataLayer).map(asCall)[0]).toEqual([
      "consent",
      "default",
      {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      },
    ]);
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
  function createRuntime(options: { existingExternal?: boolean } = {}) {
    const isolatedDocument = document.implementation.createHTMLDocument("analytics");
    const scriptWindow: {
      dataLayer?: AnalyticsDataLayer;
      // Retained so reverts to the retired delayed loader fail assertions, not harness errors.
      performance: { now(): number };
      setTimeout: typeof setTimeout;
      clearTimeout: typeof clearTimeout;
      addEventListener: (...args: any[]) => void;
      removeEventListener: (...args: any[]) => void;
    } = {
      performance: { now: () => Date.now() },
      setTimeout,
      clearTimeout,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    if (options.existingExternal) {
      const existing = isolatedDocument.createElement("script");
      existing.id = "google-tag-manager";
      isolatedDocument.head.append(existing);
    }
    return {
      isolatedDocument,
      scriptWindow,
      execute() {
        Function("window", "document", buildGtmBootstrap("GTM-5FHDLXGV"))(
          scriptWindow,
          isolatedDocument,
        );
      },
    };
  }

  function gtmScripts(documentUnderTest: Document) {
    return Array.from(documentUnderTest.scripts).filter(
      (script) => script.id === "google-tag-manager",
    );
  }

  it("queues startup immediately but keeps the GTM request off the critical path until the hard cap", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { execute, isolatedDocument, scriptWindow } = createRuntime();
    execute();

    expect(scriptWindow.dataLayer).toHaveLength(1);
    expect(scriptWindow.dataLayer?.[0]).toMatchObject({ "gtm.start": 0, event: "gtm.js" });
    expect(gtmScripts(isolatedDocument)).toHaveLength(0);

    vi.advanceTimersByTime(GTM_MAX_REQUEST_TIME_MS - 1);
    expect(gtmScripts(isolatedDocument)).toHaveLength(0);

    vi.advanceTimersByTime(1);
    const [script] = gtmScripts(isolatedDocument);
    expect(script).toMatchObject({
      id: "google-tag-manager",
      async: true,
      src: "https://www.googletagmanager.com/gtm.js?id=GTM-5FHDLXGV",
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does nothing when the GTM external script already exists", () => {
    vi.useFakeTimers();
    const { execute, isolatedDocument, scriptWindow } = createRuntime({ existingExternal: true });
    const [existing] = gtmScripts(isolatedDocument);
    execute();
    expect(gtmScripts(isolatedDocument)).toEqual([existing]);
    expect(runtimeQueueItems(scriptWindow.dataLayer)).toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("is idempotent when executed twice", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { execute, isolatedDocument, scriptWindow } = createRuntime();
    execute();
    execute();

    expect(runtimeQueueItems(scriptWindow.dataLayer)).toHaveLength(1);
    expect(gtmScripts(isolatedDocument)).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(1);

    vi.advanceTimersByTime(GTM_MAX_REQUEST_TIME_MS);
    expect(gtmScripts(isolatedDocument)).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("queues denied privacy settings before one immediate GTM startup event", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { execute, isolatedDocument, scriptWindow } = createRuntime();
    Object.assign(scriptWindow, { localStorage: { getItem: () => null, setItem: vi.fn() } });

    Function("window", buildAnalyticsHeadScript())(scriptWindow);
    execute();

    expect(runtimeQueueItems(scriptWindow.dataLayer).map(asCall).slice(0, 3)).toEqual([
      ["consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      }],
      ["set", "allow_ad_personalization_signals", false],
      ["set", "ads_data_redaction", true],
    ]);
    expect(runtimeQueueItems(scriptWindow.dataLayer)[3]).toMatchObject({ event: "gtm.js" });
    expect(gtmScripts(isolatedDocument)).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(1);

    vi.advanceTimersByTime(GTM_MAX_REQUEST_TIME_MS);
    expect(gtmScripts(isolatedDocument)).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("emits one startup event and one GTM request for a validated ID without consent logic", () => {
    const script = buildGtmBootstrap("GTM-5FHDLXGV");

    expect(script.match(/gtm\.start/g)).toHaveLength(1);
    expect(script.match(/googletagmanager\.com\/gtm\.js/g)).toHaveLength(1);
    expect(script).toContain("GTM-5FHDLXGV");
    expect(script).not.toContain("consent");
    expect(script).toContain("setTimeout");
    expect(script).toContain("PerformanceObserver");
    expect(script).toContain("largest-contentful-paint");
  });

  it.each(["", " GTM-5FHDLXGV", "gtm-5FHDLXGV", "GTM-5FHDLXGV';alert(1)//"])(
    "throws rather than embedding unsafe ID %s",
    (id) => {
      expect(() => buildGtmBootstrap(id)).toThrow("Invalid GTM container ID");
    },
  );
});
