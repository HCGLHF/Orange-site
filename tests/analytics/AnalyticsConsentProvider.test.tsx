import React, { act, useRef } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AnalyticsConsentProvider,
  useAnalyticsConsent,
} from "@/components/analytics/AnalyticsConsentProvider";
import { PrivacySettingsButton } from "@/components/ui/PrivacySettingsButton";
import { ANALYTICS_CONSENT_STORAGE_KEY } from "@/lib/analytics/consent";

const BODY =
  "We use basic cookieless measurement by default. Accepting enables analytics cookies for more complete traffic and conversion reporting. You can change your choice at any time through Privacy settings in the footer. Read our terms.";
const PERSISTENCE_ERROR =
  "We could not save your analytics choice in this browser. Analytics cookies remain off; please try again.";
const DENIED_UPDATE = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};

function renderProvider(children: React.ReactNode = <PrivacySettingsButton />) {
  return render(<AnalyticsConsentProvider>{children}</AnalyticsConsentProvider>);
}

function dispatchConsentStorage(newValue: string | null) {
  if (newValue === null) {
    window.localStorage.removeItem(ANALYTICS_CONSENT_STORAGE_KEY);
  } else {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, newValue);
  }

  window.dispatchEvent(
    new StorageEvent("storage", {
      key: ANALYTICS_CONSENT_STORAGE_KEY,
      newValue,
      storageArea: window.localStorage,
    }),
  );
}

function dispatchConsentClear() {
  window.localStorage.clear();
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: null,
      newValue: null,
      storageArea: window.localStorage,
    }),
  );
}

function ManualTrigger() {
  const { open } = useAnalyticsConsent();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <button ref={triggerRef} type="button" onClick={() => open(triggerRef.current)}>
      Custom privacy trigger
    </button>
  );
}

function ChoiceProbe() {
  const { choice } = useAnalyticsConsent();
  return <output aria-label="Current analytics choice">{choice ?? "none"}</output>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AnalyticsConsentProvider", () => {
  it("shows the complete privacy choices on a first visit without stealing focus", async () => {
    const before = document.createElement("button");
    before.textContent = "Existing focus";
    document.body.append(before);
    before.focus();

    renderProvider();

    const region = await screen.findByRole("region", { name: "Analytics privacy choices" });
    expect(within(region).getByRole("heading", { level: 2, name: "Privacy & analytics" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
    expect(region).toHaveTextContent(BODY);
    const links = within(region).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName("terms");
    expect(links[0]).toHaveAttribute("href", "/terms");
    expect(within(region).getByRole("button", { name: "Decline analytics cookies" })).toHaveTextContent(
      "Decline",
    );
    expect(within(region).getByRole("button", { name: "Accept analytics cookies" })).toHaveTextContent(
      "Accept",
    );
    expect(before).toHaveFocus();
    before.remove();
  });

  it("renders exactly two actions and no close control", async () => {
    renderProvider();
    const region = await screen.findByRole("region", { name: "Analytics privacy choices" });

    expect(within(region).getAllByRole("button")).toHaveLength(2);
    expect(within(region).queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
    expect(within(region).queryByText(/^close$/i)).not.toBeInTheDocument();
  });

  it("uses the exact approved visual contract", async () => {
    renderProvider();
    const accept = await screen.findByRole("button", { name: "Accept analytics cookies" });
    const decline = screen.getByRole("button", { name: "Decline analytics cookies" });
    const region = screen.getByRole("region", { name: "Analytics privacy choices" });
    const inner = region.firstElementChild;
    const heading = screen.getByRole("heading", { level: 2, name: "Privacy & analytics" });
    const actions = accept.parentElement;

    expect(region).toHaveAttribute(
      "class",
      "fixed inset-x-0 bottom-0 z-[120] max-h-[100dvh] overflow-y-auto border-t border-white/15 bg-[#24252a] text-white",
    );
    expect(inner).toHaveAttribute(
      "class",
      "mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 lg:min-h-40 lg:flex-row lg:items-center lg:justify-between lg:gap-9 lg:px-8 lg:py-6",
    );
    expect(inner?.firstElementChild).toHaveAttribute("class", "max-w-4xl");
    expect(heading).toHaveAttribute(
      "class",
      "text-xs font-bold uppercase tracking-[0.16em] text-[#f0987e] outline-none",
    );
    expect(heading.nextElementSibling).toHaveAttribute(
      "class",
      "mt-2 text-sm leading-6 text-white/90 sm:text-[15px]",
    );
    expect(screen.getByRole("link", { name: "terms" })).toHaveAttribute(
      "class",
      "underline underline-offset-4",
    );
    expect(actions).toHaveAttribute(
      "class",
      "grid shrink-0 grid-cols-1 gap-2.5 sm:grid-cols-2",
    );
    expect(decline).toHaveAttribute(
      "class",
      "min-h-12 min-w-32 rounded-lg border border-white bg-transparent px-6 font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0987e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#24252a]",
    );
    expect(accept).toHaveAttribute(
      "class",
      "min-h-12 min-w-32 rounded-lg border border-white bg-white px-6 font-semibold text-[#24252a] hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0987e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#24252a]",
    );
  });

  it("omits the banner on the server and hydrates without a mismatch before showing it", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const ui = (
      <AnalyticsConsentProvider>
        <span>Hydration child</span>
      </AnalyticsConsentProvider>
    );
    const markup = renderToString(ui);
    expect(markup).toContain("Hydration child");
    expect(markup).not.toContain("Analytics privacy choices");
    container.innerHTML = markup;
    const actEnvironment = globalThis as typeof globalThis & {
      IS_REACT_ACT_ENVIRONMENT?: boolean;
    };
    const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    let root: Root | undefined;

    try {
      await act(async () => {
        root = hydrateRoot(container, ui);
      });

      const mismatchErrors = consoleError.mock.calls.filter((call) =>
        call.some(
          (value) =>
            typeof value === "string" &&
            /hydration failed|did not match|server html|while hydrating/i.test(value),
        ),
      );
      expect(mismatchErrors).toHaveLength(0);
      expect(
        within(container).getByRole("region", { name: "Analytics privacy choices" }),
      ).toBeInTheDocument();
    } finally {
      await act(async () => root?.unmount());
      if (previousActEnvironment === undefined) {
        delete actEnvironment.IS_REACT_ACT_ENVIRONMENT;
      } else {
        actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
      }
      container.remove();
    }
  });

  it("persists granted consent before updating Google and then hides", async () => {
    const user = userEvent.setup();
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const gtag = vi.fn();
    window.gtag = gtag;
    renderProvider();

    const accept = await screen.findByRole("button", { name: "Accept analytics cookies" });
    gtag.mockClear();
    await user.click(accept);

    expect(setItem).toHaveBeenCalledWith(
      ANALYTICS_CONSENT_STORAGE_KEY,
      '{"version":1,"analytics":"granted"}',
    );
    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      ...DENIED_UPDATE,
      analytics_storage: "granted",
    });
    expect(setItem.mock.invocationCallOrder[0]).toBeLessThan(gtag.mock.invocationCallOrder[0]);
    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "Analytics privacy choices" })).not.toBeInTheDocument(),
    );
  });

  it("persists denied consent before keeping all Google consent denied and then hides", async () => {
    const user = userEvent.setup();
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const gtag = vi.fn();
    window.gtag = gtag;
    renderProvider();

    const decline = await screen.findByRole("button", { name: "Decline analytics cookies" });
    gtag.mockClear();
    await user.click(decline);

    expect(setItem).toHaveBeenCalledWith(
      ANALYTICS_CONSENT_STORAGE_KEY,
      '{"version":1,"analytics":"denied"}',
    );
    expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
    expect(setItem.mock.invocationCallOrder[0]).toBeLessThan(gtag.mock.invocationCallOrder[0]);
    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "Analytics privacy choices" })).not.toBeInTheDocument(),
    );
  });

  it("fails closed and remains open when consent cannot be saved", async () => {
    const user = userEvent.setup();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const gtag = vi.fn();
    window.gtag = gtag;
    renderProvider();

    const accept = await screen.findByRole("button", { name: "Accept analytics cookies" });
    gtag.mockClear();
    await user.click(accept);

    expect(screen.getByRole("region", { name: "Analytics privacy choices" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(PERSISTENCE_ERROR);
    expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
    expect(gtag).not.toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "granted" }),
    );
  });

  it.each([
    ["Accept", "Accept analytics cookies"],
    ["Decline", "Decline analytics cookies"],
  ] as const)(
    "removes a stale persisted grant when %s cannot be saved and remounts denied",
    async (_label, actionName) => {
      localStorage.setItem(
        ANALYTICS_CONSENT_STORAGE_KEY,
        '{"version":1,"analytics":"granted"}',
      );
      window.__orangeAnalyticsBootstrap = { choice: "granted", error: null };
      const gtag = vi.fn();
      window.gtag = gtag;
      const user = userEvent.setup();
      const firstRender = renderProvider();

      await user.click(screen.getByRole("button", { name: "Privacy settings" }));
      const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("blocked");
      });
      const removeItem = vi.spyOn(Storage.prototype, "removeItem");
      const clear = vi.spyOn(Storage.prototype, "clear");
      gtag.mockClear();

      await user.click(screen.getByRole("button", { name: actionName }));

      expect(removeItem).toHaveBeenCalledWith(ANALYTICS_CONSENT_STORAGE_KEY);
      expect(clear).not.toHaveBeenCalled();
      expect(localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)).toBeNull();
      expect(screen.getByRole("alert")).toHaveTextContent(PERSISTENCE_ERROR);
      expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
      expect(gtag).not.toHaveBeenCalledWith(
        "consent",
        "update",
        expect.objectContaining({ analytics_storage: "granted" }),
      );

      firstRender.unmount();
      Reflect.deleteProperty(window, "__orangeAnalyticsBootstrap");
      setItem.mockRestore();
      removeItem.mockRestore();
      clear.mockRestore();
      gtag.mockClear();
      renderProvider();

      expect(
        await screen.findByRole("region", { name: "Analytics privacy choices" }),
      ).toBeInTheDocument();
      expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
    },
  );

  it("remains denied and open when both persistence and stale-key removal throw", async () => {
    localStorage.setItem(
      ANALYTICS_CONSENT_STORAGE_KEY,
      '{"version":1,"analytics":"granted"}',
    );
    window.__orangeAnalyticsBootstrap = { choice: "granted", error: null };
    const gtag = vi.fn();
    window.gtag = gtag;
    const user = userEvent.setup();
    renderProvider();
    await user.click(screen.getByRole("button", { name: "Privacy settings" }));
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked write");
    });
    const removeItem = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked removal");
    });
    gtag.mockClear();

    await user.click(screen.getByRole("button", { name: "Accept analytics cookies" }));

    expect(removeItem).toHaveBeenCalledWith(ANALYTICS_CONSENT_STORAGE_KEY);
    expect(screen.getByRole("region", { name: "Analytics privacy choices" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(PERSISTENCE_ERROR);
    expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
  });

  it.each(["invalid_value", "storage_unavailable"] as const)(
    "shows a persistence warning and fails closed for initial bootstrap error %s",
    async (error) => {
      window.__orangeAnalyticsBootstrap = { choice: null, error };
      const gtag = vi.fn();
      window.gtag = gtag;

      renderProvider();

      expect(await screen.findByRole("alert")).toHaveTextContent(PERSISTENCE_ERROR);
      expect(screen.getByRole("region", { name: "Analytics privacy choices" })).toBeInTheDocument();
      expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
    },
  );

  it.each(["granted", "denied"] as const)(
    "hides after mount for fallback storage choice %s and updates Google once",
    async (choice) => {
      localStorage.setItem(
        ANALYTICS_CONSENT_STORAGE_KEY,
        JSON.stringify({ version: 1, analytics: choice }),
      );
      const gtag = vi.fn();
      window.gtag = gtag;

      renderProvider();

      await waitFor(() =>
        expect(screen.queryByRole("region", { name: "Analytics privacy choices" })).not.toBeInTheDocument(),
      );
      expect(gtag).toHaveBeenCalledTimes(1);
      expect(gtag).toHaveBeenCalledWith("consent", "update", {
        ...DENIED_UPDATE,
        analytics_storage: choice,
      });
    },
  );

  it("ignores same-key storage events from sessionStorage", async () => {
    localStorage.setItem(
      ANALYTICS_CONSENT_STORAGE_KEY,
      '{"version":1,"analytics":"granted"}',
    );
    window.__orangeAnalyticsBootstrap = { choice: "granted", error: null };
    const gtag = vi.fn();
    window.gtag = gtag;
    renderProvider(<button type="button">Page control</button>);
    const pageControl = screen.getByRole("button", { name: "Page control" });
    pageControl.focus();
    sessionStorage.setItem(
      ANALYTICS_CONSENT_STORAGE_KEY,
      '{"version":1,"analytics":"denied"}',
    );

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: ANALYTICS_CONSENT_STORAGE_KEY,
        newValue: '{"version":1,"analytics":"denied"}',
        storageArea: window.sessionStorage,
      }),
    );

    await waitFor(() => expect(gtag).not.toHaveBeenCalled());
    expect(screen.queryByRole("region", { name: "Analytics privacy choices" })).not.toBeInTheDocument();
    expect(localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)).toBe(
      '{"version":1,"analytics":"granted"}',
    );
    expect(pageControl).toHaveFocus();
  });

  it("uses a valid bootstrap without reading localStorage again", async () => {
    window.__orangeAnalyticsBootstrap = { choice: "granted", error: null };
    const getItem = vi.spyOn(Storage.prototype, "getItem");

    renderProvider();

    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "Analytics privacy choices" })).not.toBeInTheDocument(),
    );
    expect(getItem).not.toHaveBeenCalled();
  });

  it("warns and fails closed for an invalid fallback stored value", async () => {
    localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, "not-json");
    const gtag = vi.fn();
    window.gtag = gtag;

    renderProvider();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(PERSISTENCE_ERROR);
    expect(alert).toHaveAttribute("class", "mt-3 text-sm font-medium text-[#ffd5ca]");
    expect(screen.getByRole("region", { name: "Analytics privacy choices" })).toBeInTheDocument();
    expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
  });

  it("warns and fails closed when fallback localStorage property access throws", async () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
    const gtag = vi.fn();
    window.gtag = gtag;

    try {
      renderProvider();
    } finally {
      if (descriptor) Object.defineProperty(window, "localStorage", descriptor);
    }

    expect(await screen.findByRole("alert")).toHaveTextContent(PERSISTENCE_ERROR);
    expect(screen.getByRole("region", { name: "Analytics privacy choices" })).toBeInTheDocument();
    expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
  });

  it("stays open when fail-closed consent encounters a throwing Google tag", async () => {
    window.gtag = vi.fn(() => {
      throw new Error("broken gtag");
    });

    expect(() => renderProvider()).not.toThrow();

    expect(
      await screen.findByRole("region", { name: "Analytics privacy choices" }),
    ).toBeInTheDocument();
  });

  it("closes, persists, and restores focus when Google tag throws after a successful save", async () => {
    window.__orangeAnalyticsBootstrap = { choice: "denied", error: null };
    window.gtag = vi.fn(() => {
      throw new Error("broken gtag");
    });
    const user = userEvent.setup();
    renderProvider(<ManualTrigger />);
    const trigger = screen.getByRole("button", { name: "Custom privacy trigger" });

    await user.click(trigger);
    await user.click(await screen.findByRole("button", { name: "Accept analytics cookies" }));

    expect(localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)).toBe(
      '{"version":1,"analytics":"granted"}',
    );
    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "Analytics privacy choices" })).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("initializes fallback consent once in Strict Mode and keeps one working storage listener", async () => {
    localStorage.setItem(
      ANALYTICS_CONSENT_STORAGE_KEY,
      '{"version":1,"analytics":"granted"}',
    );
    const gtag = vi.fn();
    window.gtag = gtag;

    render(
      <React.StrictMode>
        <AnalyticsConsentProvider>
          <ChoiceProbe />
        </AnalyticsConsentProvider>
      </React.StrictMode>,
    );

    await waitFor(() =>
      expect(screen.getByRole("status", { name: "Current analytics choice" })).toHaveTextContent(
        "granted",
      ),
    );
    expect(gtag).toHaveBeenCalledTimes(1);
    gtag.mockClear();

    dispatchConsentStorage('{"version":1,"analytics":"denied"}');

    await waitFor(() =>
      expect(screen.getByRole("status", { name: "Current analytics choice" })).toHaveTextContent(
        "denied",
      ),
    );
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
  });

  it("does not duplicate the consent update already queued by a valid bootstrap", async () => {
    window.__orangeAnalyticsBootstrap = { choice: "granted", error: null };
    const gtag = vi.fn();
    window.gtag = gtag;

    renderProvider();

    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "Analytics privacy choices" })).not.toBeInTheDocument(),
    );
    expect(gtag).not.toHaveBeenCalled();
  });

  it("the footer control reopens the choices and moves focus to the heading", async () => {
    window.__orangeAnalyticsBootstrap = { choice: "denied", error: null };
    const user = userEvent.setup();
    renderProvider();
    const trigger = screen.getByRole("button", { name: "Privacy settings" });

    await user.click(trigger);

    const heading = await screen.findByRole("heading", { level: 2, name: "Privacy & analytics" });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveClass("sf-link");
  });

  it("returns focus to the exact manual trigger after a successful choice", async () => {
    window.__orangeAnalyticsBootstrap = { choice: "denied", error: null };
    const user = userEvent.setup();
    renderProvider(<ManualTrigger />);
    const trigger = screen.getByRole("button", { name: "Custom privacy trigger" });

    await user.click(trigger);
    await user.click(await screen.findByRole("button", { name: "Accept analytics cookies" }));

    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it.each(["granted", "denied"] as const)(
    "synchronizes a valid cross-tab %s without stealing focus",
    async (choice) => {
      window.__orangeAnalyticsBootstrap = { choice: "denied", error: null };
      const user = userEvent.setup();
      const gtag = vi.fn();
      window.gtag = gtag;
      renderProvider();
      const trigger = screen.getByRole("button", { name: "Privacy settings" });
      await user.click(trigger);
      const accept = await screen.findByRole("button", { name: "Accept analytics cookies" });
      accept.focus();

      dispatchConsentStorage(JSON.stringify({ version: 1, analytics: choice }));

      await waitFor(() =>
        expect(screen.queryByRole("region", { name: "Analytics privacy choices" })).not.toBeInTheDocument(),
      );
      expect(trigger).not.toHaveFocus();
      expect(gtag).toHaveBeenCalledWith("consent", "update", {
        ...DENIED_UPDATE,
        analytics_storage: choice,
      });
    },
  );

  it("reopens fail-closed without an error when another tab removes consent", async () => {
    window.__orangeAnalyticsBootstrap = { choice: "granted", error: null };
    const gtag = vi.fn();
    window.gtag = gtag;
    renderProvider(<button type="button">Page control</button>);
    const pageControl = screen.getByRole("button", { name: "Page control" });
    pageControl.focus();

    dispatchConsentStorage(null);

    expect(await screen.findByRole("region", { name: "Analytics privacy choices" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
    expect(pageControl).toHaveFocus();
  });

  it("treats a localStorage clear event as consent removal without stealing focus", async () => {
    localStorage.setItem(
      ANALYTICS_CONSENT_STORAGE_KEY,
      '{"version":1,"analytics":"granted"}',
    );
    window.__orangeAnalyticsBootstrap = { choice: "granted", error: null };
    const gtag = vi.fn();
    window.gtag = gtag;
    renderProvider(<button type="button">Page control</button>);
    const pageControl = screen.getByRole("button", { name: "Page control" });
    pageControl.focus();

    dispatchConsentClear();

    expect(
      await screen.findByRole("region", { name: "Analytics privacy choices" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)).toBeNull();
    expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
    expect(pageControl).toHaveFocus();
  });

  it("fails closed when localStorage access throws while handling a storage event", async () => {
    window.__orangeAnalyticsBootstrap = { choice: "granted", error: null };
    const gtag = vi.fn();
    window.gtag = gtag;
    renderProvider(<button type="button">Page control</button>);
    const pageControl = screen.getByRole("button", { name: "Page control" });
    pageControl.focus();
    const descriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });

    try {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: null,
          newValue: null,
          storageArea: null,
        }),
      );
    } finally {
      if (descriptor) Object.defineProperty(window, "localStorage", descriptor);
    }

    expect(await screen.findByRole("alert")).toHaveTextContent(PERSISTENCE_ERROR);
    expect(screen.getByRole("region", { name: "Analytics privacy choices" })).toBeInTheDocument();
    expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
    expect(pageControl).toHaveFocus();
  });

  it("reopens fail-closed with a warning when another tab writes invalid consent", async () => {
    window.__orangeAnalyticsBootstrap = { choice: "granted", error: null };
    const gtag = vi.fn();
    window.gtag = gtag;
    renderProvider(<button type="button">Page control</button>);
    const pageControl = screen.getByRole("button", { name: "Page control" });
    pageControl.focus();

    dispatchConsentStorage("not-json");

    expect(await screen.findByRole("alert")).toHaveTextContent(PERSISTENCE_ERROR);
    expect(screen.getByRole("region", { name: "Analytics privacy choices" })).toBeInTheDocument();
    expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
    expect(pageControl).toHaveFocus();
  });

  it("ignores unrelated storage events", async () => {
    window.__orangeAnalyticsBootstrap = { choice: "granted", error: null };
    const gtag = vi.fn();
    window.gtag = gtag;
    renderProvider();

    localStorage.setItem("orange-textile-inquiries", "not-json");

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "orange-textile-inquiries",
        newValue: "not-json",
        storageArea: window.localStorage,
      }),
    );

    await waitFor(() => expect(gtag).not.toHaveBeenCalled());
    expect(screen.queryByRole("region", { name: "Analytics privacy choices" })).not.toBeInTheDocument();
  });

  it("throws a clear error when the hook is used outside its provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    function Consumer() {
      useAnalyticsConsent();
      return null;
    }

    expect(() => render(<Consumer />)).toThrow(
      "useAnalyticsConsent must be used within an AnalyticsConsentProvider",
    );
  });
});
