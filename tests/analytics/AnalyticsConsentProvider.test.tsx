import React, { useRef } from "react";
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
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: ANALYTICS_CONSENT_STORAGE_KEY,
      newValue,
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

  it("uses the approved distinct primary and secondary action hierarchy", async () => {
    renderProvider();
    const accept = await screen.findByRole("button", { name: "Accept analytics cookies" });
    const decline = screen.getByRole("button", { name: "Decline analytics cookies" });

    expect(accept).toHaveClass("min-h-12", "bg-white", "text-[#24252a]");
    expect(decline).toHaveClass("min-h-12", "border", "bg-transparent", "text-white");
    expect(accept.className).not.toBe(decline.className);
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

    await user.click(await screen.findByRole("button", { name: "Accept analytics cookies" }));

    expect(screen.getByRole("region", { name: "Analytics privacy choices" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(PERSISTENCE_ERROR);
    expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
    expect(gtag).not.toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "granted" }),
    );
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
    renderProvider();

    dispatchConsentStorage(null);

    expect(await screen.findByRole("region", { name: "Analytics privacy choices" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
  });

  it("reopens fail-closed with a warning when another tab writes invalid consent", async () => {
    window.__orangeAnalyticsBootstrap = { choice: "granted", error: null };
    const gtag = vi.fn();
    window.gtag = gtag;
    renderProvider();

    dispatchConsentStorage("not-json");

    expect(await screen.findByRole("alert")).toHaveTextContent(PERSISTENCE_ERROR);
    expect(screen.getByRole("region", { name: "Analytics privacy choices" })).toBeInTheDocument();
    expect(gtag).toHaveBeenCalledWith("consent", "update", DENIED_UPDATE);
  });

  it("ignores unrelated storage events", async () => {
    window.__orangeAnalyticsBootstrap = { choice: "granted", error: null };
    const gtag = vi.fn();
    window.gtag = gtag;
    renderProvider();

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
