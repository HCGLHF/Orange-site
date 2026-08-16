import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildAnalyticsHeadScript,
  buildGtmBootstrap,
  GTM_LCP_BUFFER_MS,
  GTM_MAX_REQUEST_TIME_MS,
  GTM_MIN_REQUEST_TIME_MS,
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
  function createRuntime(
    options: {
      performanceObserver?: "available" | "unavailable" | "observe-throws";
      now?: () => number;
      visibilityState?: "visible" | "hidden";
      existingExternal?: boolean;
    } = {},
  ) {
    const isolatedDocument = document.implementation.createHTMLDocument("analytics");
    let visibilityState = options.visibilityState ?? "visible";
    Object.defineProperty(isolatedDocument, "visibilityState", {
      configurable: true,
      get: () => visibilityState,
    });
    let lcpCallback:
      | ((entries: { getEntries(): Array<{ startTime: number }> }) => void)
      | undefined;
    const observers: Array<{ observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }> = [];
    const windowListeners = new Map<
      string,
      Array<{ callback: () => void; once: boolean }>
    >();
    class FakePerformanceObserver {
      constructor(callback: (entries: { getEntries(): Array<{ startTime: number }> }) => void) {
        lcpCallback = callback;
        observers.push({ observe: this.observe, disconnect: this.disconnect });
      }

      observe = vi.fn(() => {
        if (options.performanceObserver === "observe-throws") throw new Error("unsupported");
      });

      disconnect = vi.fn();
    }
    const scriptWindow: {
      dataLayer?: AnalyticsDataLayer;
      performance: { now(): number };
      setTimeout: typeof setTimeout;
      clearTimeout: typeof clearTimeout;
      addEventListener: (...args: any[]) => void;
      removeEventListener: (...args: any[]) => void;
      PerformanceObserver?: typeof FakePerformanceObserver;
    } = {
      performance: { now: options.now ?? (() => Date.now()) },
      setTimeout,
      clearTimeout,
      addEventListener: vi.fn((type: string, callback: () => void, eventOptions?: boolean | AddEventListenerOptions) => {
        const listeners = windowListeners.get(type) ?? [];
        listeners.push({
          callback,
          once: typeof eventOptions === "object" && eventOptions.once === true,
        });
        windowListeners.set(type, listeners);
      }),
      removeEventListener: vi.fn((type: string, callback: () => void) => {
        windowListeners.set(
          type,
          (windowListeners.get(type) ?? []).filter((listener) => listener.callback !== callback),
        );
      }),
      ...(options.performanceObserver === "unavailable"
        ? {}
        : { PerformanceObserver: FakePerformanceObserver }),
    };

    if (options.existingExternal) {
      const existing = isolatedDocument.createElement("script");
      existing.id = "google-tag-manager";
      isolatedDocument.head.append(existing);
    }
    Function("window", "document", buildGtmBootstrap("GTM-5FHDLXGV"))(
      scriptWindow,
      isolatedDocument,
    );

    return {
      isolatedDocument,
      scriptWindow,
      observers,
      emitLcp(startTime: number) {
        lcpCallback?.({ getEntries: () => [{ startTime }] });
      },
      emitInteraction(type: "pointerdown" | "keydown" | "touchstart" = "pointerdown") {
        const listeners = [...(windowListeners.get(type) ?? [])];
        for (const listener of listeners) {
          listener.callback();
          if (listener.once) {
            windowListeners.set(
              type,
              (windowListeners.get(type) ?? []).filter((item) => item.callback !== listener.callback),
            );
          }
        }
      },
      setVisibility(nextVisibilityState: "visible" | "hidden") {
        visibilityState = nextVisibilityState;
        isolatedDocument.dispatchEvent(new Event("visibilitychange"));
      },
      emitPageHide() {
        const listeners = [...(windowListeners.get("pagehide") ?? [])];
        for (const listener of listeners) listener.callback();
      },
    };
  }

  function gtmScripts(documentUnderTest: Document) {
    return Array.from(documentUnderTest.scripts).filter(
      (script) => script.id === "google-tag-manager",
    );
  }

  it("queues startup immediately but defers an unfinalized visible page until the hard cap", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { isolatedDocument, scriptWindow } = createRuntime();

    expect(scriptWindow.dataLayer).toHaveLength(1);
    expect(scriptWindow.dataLayer?.[0]).toMatchObject({ event: "gtm.js" });
    expect(gtmScripts(isolatedDocument)).toHaveLength(0);

    vi.advanceTimersByTime(GTM_MIN_REQUEST_TIME_MS);
    expect(gtmScripts(isolatedDocument)).toHaveLength(0);

    vi.advanceTimersByTime(GTM_MAX_REQUEST_TIME_MS - GTM_MIN_REQUEST_TIME_MS);
    const [script] = gtmScripts(isolatedDocument);
    expect(script).toMatchObject({
      id: "google-tag-manager",
      async: true,
      src: "https://www.googletagmanager.com/gtm.js?id=GTM-5FHDLXGV",
    });
    expect(script?.dataset.orangeLoadedAt).toBe(String(GTM_MAX_REQUEST_TIME_MS));
  });

  it("reschedules when the floor timer fires a fraction early", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    let now = 0;
    const { emitInteraction, isolatedDocument } = createRuntime({ now: () => now });
    emitInteraction();

    now = GTM_MIN_REQUEST_TIME_MS - 0.1;
    vi.advanceTimersByTime(GTM_MIN_REQUEST_TIME_MS);
    expect(gtmScripts(isolatedDocument)).toHaveLength(0);

    now = GTM_MIN_REQUEST_TIME_MS;
    vi.advanceTimersByTime(1);
    expect(gtmScripts(isolatedDocument)).toHaveLength(1);
  });

  it("reschedules when the latest LCP buffer timer fires a fraction early", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    let now = 0;
    const { emitInteraction, emitLcp, isolatedDocument } = createRuntime({ now: () => now });

    emitLcp(3500);
    emitInteraction();
    now = 4499.9;
    vi.advanceTimersByTime(4500);
    expect(gtmScripts(isolatedDocument)).toHaveLength(0);

    now = 4500;
    vi.advanceTimersByTime(1);
    expect(gtmScripts(isolatedDocument)).toHaveLength(1);
  });

  it("reschedules the request after a buffered LCP candidate", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { emitInteraction, emitLcp, isolatedDocument } = createRuntime();

    emitLcp(3500);
    emitInteraction();
    vi.advanceTimersByTime(4499);
    expect(gtmScripts(isolatedDocument)).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(gtmScripts(isolatedDocument)).toHaveLength(1);
    expect(gtmScripts(isolatedDocument)[0]?.dataset.orangeLoadedAt).toBe("4500");
  });

  it("uses the latest LCP candidate monotonically when rescheduling", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { emitInteraction, emitLcp, isolatedDocument } = createRuntime();

    emitLcp(3500);
    emitLcp(3200);
    emitLcp(4200);
    emitInteraction();
    vi.advanceTimersByTime(5199);
    expect(gtmScripts(isolatedDocument)).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(gtmScripts(isolatedDocument)).toHaveLength(1);
    expect(gtmScripts(isolatedDocument)[0]?.dataset.orangeLoadedAt).toBe("5200");
  });

  it("loads at the floor after a qualifying interaction", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { emitInteraction, isolatedDocument } = createRuntime();

    emitInteraction("keydown");
    vi.advanceTimersByTime(GTM_MIN_REQUEST_TIME_MS - 1);
    expect(gtmScripts(isolatedDocument)).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(gtmScripts(isolatedDocument)).toHaveLength(1);
  });

  it("waits for a late LCP candidate before loading after finalization", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { emitInteraction, emitLcp, isolatedDocument } = createRuntime();

    vi.advanceTimersByTime(4500);
    expect(gtmScripts(isolatedDocument)).toHaveLength(0);
    emitLcp(4500);
    emitInteraction();
    vi.advanceTimersByTime(999);
    expect(gtmScripts(isolatedDocument)).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(gtmScripts(isolatedDocument)[0]?.dataset.orangeLoadedAt).toBe("5500");
  });

  it("gives an initially hidden page a fresh hard cap after its first visible render", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { isolatedDocument, setVisibility } = createRuntime({ visibilityState: "hidden" });

    vi.advanceTimersByTime(GTM_MAX_REQUEST_TIME_MS + 1000);
    expect(gtmScripts(isolatedDocument)).toHaveLength(0);
    setVisibility("visible");
    vi.advanceTimersByTime(GTM_MAX_REQUEST_TIME_MS - 1);
    expect(gtmScripts(isolatedDocument)).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(gtmScripts(isolatedDocument)).toHaveLength(1);
  });

  it("documents that the hard cap may override a final-second LCP quiet buffer", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { emitLcp, isolatedDocument } = createRuntime();

    vi.advanceTimersByTime(GTM_MAX_REQUEST_TIME_MS - 100);
    emitLcp(GTM_MAX_REQUEST_TIME_MS - 100);
    vi.advanceTimersByTime(100);
    expect(gtmScripts(isolatedDocument)[0]?.dataset.orangeLoadedAt).toBe(
      String(GTM_MAX_REQUEST_TIME_MS),
    );
  });

  it("cleans up observers, timers, and listeners after inserting GTM", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { emitInteraction, isolatedDocument, observers, scriptWindow } = createRuntime();

    emitInteraction();
    vi.advanceTimersByTime(GTM_MIN_REQUEST_TIME_MS);
    expect(gtmScripts(isolatedDocument)).toHaveLength(1);
    expect(observers[0]?.disconnect).toHaveBeenCalledOnce();
    expect(scriptWindow.removeEventListener).toHaveBeenCalledTimes(4);
  });

  it.each(["unavailable", "observe-throws"] as const)(
    "uses the hard cap when PerformanceObserver is %s",
    (performanceObserver) => {
      vi.useFakeTimers();
      vi.setSystemTime(0);
      const { isolatedDocument } = createRuntime({ performanceObserver });

      vi.advanceTimersByTime(GTM_MAX_REQUEST_TIME_MS);
      expect(gtmScripts(isolatedDocument)).toHaveLength(1);
    },
  );

  it("does not append a duplicate request after repeated timer or observer activity", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { emitInteraction, emitLcp, isolatedDocument } = createRuntime();

    emitInteraction();
    vi.advanceTimersByTime(GTM_MIN_REQUEST_TIME_MS);
    emitLcp(6000);
    vi.advanceTimersByTime(10000);
    expect(gtmScripts(isolatedDocument)).toHaveLength(1);
  });

  it("respects an existing external GTM script ID", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { emitInteraction, isolatedDocument } = createRuntime({ existingExternal: true });
    const [existing] = gtmScripts(isolatedDocument);
    emitInteraction();
    vi.advanceTimersByTime(GTM_MIN_REQUEST_TIME_MS);
    expect(gtmScripts(isolatedDocument)).toEqual([existing]);
  });

  it("starts GTM once after the consent default in the shared data layer", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const scriptWindow: {
      dataLayer?: AnalyticsDataLayer;
      gtag?: GoogleTag;
      localStorage: StorageDouble;
      __orangeAnalyticsBootstrap?: AnalyticsBootstrapStatus;
    } = {
      localStorage: { getItem: () => null, setItem: vi.fn() },
    };
    const isolatedDocument = document.implementation.createHTMLDocument("analytics");

    Function("window", buildAnalyticsHeadScript())(scriptWindow);
    const bootstrapWindow = Object.assign(scriptWindow, {
      performance: { now: () => Date.now() },
      setTimeout,
      clearTimeout,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    });
    Function("window", "document", buildGtmBootstrap("GTM-5FHDLXGV"))(bootstrapWindow, isolatedDocument);
    vi.advanceTimersByTime(GTM_MAX_REQUEST_TIME_MS);

    const dataLayer = runtimeQueueItems(scriptWindow.dataLayer);
    const consentDefaultIndex = dataLayer.findIndex((item) => {
      const call = asCall(item);
      return call[0] === "consent" && call[1] === "default";
    });
    const gtmStartItems = dataLayer.filter(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "event" in item &&
        item.event === "gtm.js",
    );
    const gtmStartIndex = dataLayer.indexOf(gtmStartItems[0]);
    const gtmScripts = Array.from(isolatedDocument.scripts).filter(
      (script) =>
        script.src === "https://www.googletagmanager.com/gtm.js?id=GTM-5FHDLXGV",
    );

    expect(consentDefaultIndex).toBeGreaterThanOrEqual(0);
    expect(gtmStartItems).toHaveLength(1);
    expect(gtmStartIndex).toBeGreaterThan(consentDefaultIndex);
    expect(gtmScripts).toHaveLength(1);
  });

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
