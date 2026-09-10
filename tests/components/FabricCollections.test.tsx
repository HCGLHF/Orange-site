import React from "react";
import { renderToString } from "react-dom/server";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FabricCollections } from "@/components/collections/FabricCollections";
import { InquiryProvider } from "@/components/InquiryProvider";
import { useInquiryCart } from "@/components/InquiryCartProvider";
import { resetBatchInquiryStateForTests } from "@/components/InquiryBar";
import { LocaleProvider } from "@/components/LocaleProvider";
import { publicFabrics } from "@/lib/public-catalog";

const navigation = vi.hoisted(() => ({
  subscribers: new Set<() => void>(),
  suspend: false,
  pending: new Promise<never>(() => {}),
}));

vi.mock("next/navigation", async () => {
  const { useSyncExternalStore } = await import("react");
  return {
    usePathname: () => "/fabrics",
    useSearchParams: () => {
      const query = useSyncExternalStore(
        (listener) => {
          navigation.subscribers.add(listener);
          return () => navigation.subscribers.delete(listener);
        },
        () => window.location.search,
        () => "",
      );
      if (navigation.suspend) throw navigation.pending;
      return new URLSearchParams(query);
    },
  };
});

vi.mock("next/image", () => ({
  default: ({ priority: _priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => React.createElement("img", props),
}));

function CartProbe() {
  const { items } = useInquiryCart();
  return <output data-testid="cart-items">{JSON.stringify(items)}</output>;
}

function Catalogue() {
  return <LocaleProvider><InquiryProvider>
    <FabricCollections fabrics={publicFabrics} fontClassName="test-font" sourcingLinks={[{ href: "/finished-double-knit-fabrics", label: "Double-knit manufacturing" }]} />
    <CartProbe />
  </InquiryProvider></LocaleProvider>;
}

const searchName = "Search articles, series or composition";
const notifyNavigation = () => navigation.subscribers.forEach((listener) => listener());
const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal");
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");
const originalAnimate = Object.getOwnPropertyDescriptor(Element.prototype, "animate");
const originalFonts = Object.getOwnPropertyDescriptor(document, "fonts");
let reducedMotion = true;

beforeEach(() => {
  navigation.suspend = false;
  reducedMotion = true;
  window.history.replaceState(null, "", "/fabrics");
  const replaceState = window.history.replaceState.bind(window.history);
  const pushState = window.history.pushState.bind(window.history);
  // Next's App Router broadcasts native History API changes to useSearchParams.
  vi.spyOn(window.history, "replaceState").mockImplementation((...args) => { replaceState(...args); notifyNavigation(); });
  vi.spyOn(window.history, "pushState").mockImplementation((...args) => { pushState(...args); notifyNavigation(); });
  window.addEventListener("popstate", notifyNavigation);
  vi.stubGlobal("React", React);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    get matches() { return query === "(prefers-reduced-motion: reduce)" && reducedMotion; },
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })));
  Object.defineProperty(document, "fonts", { configurable: true, value: { ready: Promise.resolve() } });
  const openers = new WeakMap<HTMLDialogElement, Element | null>();
  // jsdom has no native dialog implementation. Model its synchronous focus
  // restoration and asynchronous close event; browser QA covers native trapping.
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: { configurable: true, value(this: HTMLDialogElement) {
      openers.set(this, document.activeElement);
      this.setAttribute("open", "");
      this.querySelector<HTMLButtonElement>("button")?.focus();
    } },
    close: { configurable: true, value(this: HTMLDialogElement) {
      if (!this.open) return;
      this.removeAttribute("open");
      const opener = openers.get(this);
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
      queueMicrotask(() => this.dispatchEvent(new Event("close")));
    } },
  });
});

afterEach(async () => {
  cleanup();
  await act(async () => { resetBatchInquiryStateForTests(); await Promise.resolve(); });
  window.removeEventListener("popstate", notifyNavigation);
  navigation.subscribers.clear();
  for (const [target, key, descriptor] of [
    [HTMLDialogElement.prototype, "showModal", originalShowModal],
    [HTMLDialogElement.prototype, "close", originalClose],
    [Element.prototype, "animate", originalAnimate],
    [document, "fonts", originalFonts],
  ] as const) {
    if (descriptor) Object.defineProperty(target, key, descriptor);
    else Reflect.deleteProperty(target, key);
  }
  vi.unstubAllGlobals();
});

describe("fabric collection catalogue", () => {
  it("server-renders the catalogue even while the query observer suspends", () => {
    navigation.suspend = true;
    const html = renderToString(<Catalogue />);
    expect(html).toContain("Finished knit fabrics.");
    expect(html).toContain('id="catalogue"');
    expect(html.match(/class="article-row"/g)).toHaveLength(8);
    expect(html).toContain("GD2515");
    expect(html).toContain("Double-knit manufacturing");
  });

  it("hydrates a collection URL and restores collection, search and page on Back/Forward", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/fabrics?collection=textured&utm_source=buyer");
    render(<Catalogue />);
    expect(screen.getByRole("button", { name: "Textured & brushed 17" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Showing 1–8 of 17 articles")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Showing 9–16 of 17 articles")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Soft-touch & wool-blend 42" }));
    await user.type(screen.getByRole("searchbox", { name: searchName }), "cashmere");
    expect(window.location.search).toContain("q=cashmere");
    expect(window.location.search).toContain("utm_source=buyer");

    act(() => window.history.back());
    await waitFor(() => expect(screen.getByRole("button", { name: "Textured & brushed 17" })).toHaveAttribute("aria-pressed", "true"));
    expect(screen.getByRole("searchbox", { name: searchName })).toHaveValue("");
    expect(screen.getByText("Showing 9–16 of 17 articles")).toBeInTheDocument();
    act(() => window.history.forward());
    await waitFor(() => expect(screen.getByRole("searchbox", { name: searchName })).toHaveValue("cashmere"));
    expect(screen.getByRole("button", { name: "Soft-touch & wool-blend 42" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  it("displays source confirmation labels in the row and article dialog", async () => {
    const user = userEvent.setup();
    render(<Catalogue />);
    await user.type(screen.getByRole("searchbox", { name: searchName }), "GD2591");
    const row = screen.getByRole("article", { name: "Article GD2591" });
    expect(row).toHaveTextContent("Confirm GSM");
    expect(row).toHaveTextContent("Confirm usable width");
    expect(row.textContent).not.toMatch(/\b0\s*(GSM|cm)\b/i);
    const opener = within(row).getByRole("button", { name: "GD2591" });
    await user.click(opener);
    const dialog = screen.getByRole("dialog", { name: "GD2591" });
    expect(dialog).toHaveTextContent("Confirm GSM");
    expect(dialog).toHaveTextContent("Confirm usable width");
    expect(within(dialog).getByRole("button", { name: "Close article details" })).toHaveFocus();
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "GD2591" })).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
    await user.click(opener);
    expect(screen.getByRole("dialog", { name: "GD2591" })).toBeInTheDocument();
  });

  it("combines collection, composition, series and weight filters, and resets empty results", async () => {
    const user = userEvent.setup();
    render(<Catalogue />);
    await user.click(screen.getByRole("button", { name: "Filters" }));
    await user.selectOptions(screen.getByLabelText("Composition"), "cashmere");
    expect(screen.getByText("Showing 1–6 of 6 articles")).toBeInTheDocument();
    for (const row of screen.getAllByRole("article")) expect(row.querySelector(".article-composition")).toHaveTextContent(/cashmere/i);
    await user.selectOptions(screen.getByLabelText("Fabric weight"), "over-350");
    expect(screen.getByText("Showing 0–0 of 0 articles")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Textured & brushed 17" }));
    expect(screen.getByLabelText("Composition")).toHaveValue("all");
    expect(screen.getByLabelText("Fabric weight")).toHaveValue("all");
    await user.selectOptions(screen.getByLabelText("Series"), "Raised-pile");
    expect(screen.getByText("Showing 1–2 of 2 articles")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: searchName }), "no-such-article");
    expect(screen.getByText("No articles match these details.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Clear search & filters" }));
    expect(screen.getByText("Showing 1–8 of 17 articles")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: searchName })).toHaveValue("");
    expect(screen.getByLabelText("Series")).toHaveValue("all");
  });

  it("exposes every source article exactly once across the 13 pages", async () => {
    const user = userEvent.setup();
    render(<Catalogue />);
    const articles: string[] = [];
    for (let page = 1; page <= 13; page++) {
      articles.push(...screen.getAllByRole("article").map((row) => row.getAttribute("aria-label")!));
      if (page < 13) await user.click(screen.getByRole("button", { name: "Next page" }));
    }
    expect(articles).toHaveLength(104);
    expect(new Set(articles).size).toBe(104);
    expect(new Set(articles)).toEqual(new Set(publicFabrics.map((fabric) => `Article ${fabric.articleNumber}`)));
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByText("Showing 97–104 of 104 articles")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: searchName }), "GD2591");
    expect(screen.getByText("Showing 1–1 of 1 articles")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  it("keeps a reopened filter panel mounted when its earlier close animation settles", async () => {
    reducedMotion = false;
    const pendingCloses: (() => void)[] = [];
    Object.defineProperty(Element.prototype, "animate", { configurable: true, value: vi.fn((_frames, options: KeyframeAnimationOptions) => ({
      cancel: vi.fn(),
      finished: options.duration === 130 ? new Promise<void>((resolve) => pendingCloses.push(resolve)) : Promise.resolve(),
    })) });
    const user = userEvent.setup();
    render(<Catalogue />);
    const toggle = screen.getByRole("button", { name: "Filters" });
    await user.click(toggle);
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("combobox", { name: "Series" })).not.toBeInTheDocument();
    await user.click(toggle);
    await act(async () => { pendingCloses.forEach((resolve) => resolve()); });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("combobox", { name: "Series" })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Series"), "Raised-pile");
    expect(screen.getByText("Showing 1–2 of 2 articles")).toBeInTheDocument();
  });

  it("shares selection with the real cart and hands article details to the batch inquiry", async () => {
    const user = userEvent.setup();
    render(<Catalogue />);
    await user.type(screen.getByRole("searchbox", { name: searchName }), "GD2591");
    await user.click(screen.getByRole("button", { name: "Add GD2591 to sample selection" }));
    const cart = JSON.parse(screen.getByTestId("cart-items").textContent!);
    const source = publicFabrics.find((fabric) => fabric.articleNumber === "GD2591")!;
    expect(cart).toEqual([expect.objectContaining({ id: source.id, composition: source.composition, weight: 0, weightLabel: "Confirm GSM", quantity: 100 })]);
    expect(screen.getByRole("button", { name: "Review selection (1)" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pending inquiry/i })).not.toBeInTheDocument();
    const articleOpener = screen.getByRole("button", { name: "GD2591" });
    await user.click(articleOpener);
    const detail = screen.getByRole("dialog", { name: "GD2591" });
    expect(within(detail).getByRole("button", { name: "Remove GD2591 from sample selection" })).toHaveAttribute("aria-pressed", "true");
    await user.click(within(detail).getByRole("button", { name: "Review sample selection" }));
    const batch = await screen.findByRole("dialog", { name: "Batch inquiry" });
    expect(screen.queryByRole("dialog", { name: "GD2591" })).not.toBeInTheDocument();
    expect(batch).toHaveTextContent("Confirm GSM");
    expect(batch.textContent).not.toMatch(/\b0\s*g(?:sm)?\b/i);
    expect(batch).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Batch inquiry" })).not.toBeInTheDocument());
    expect(articleOpener).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Remove GD2591 from sample selection" }));
    expect(JSON.parse(screen.getByTestId("cart-items").textContent!)).toEqual([]);
    expect(screen.getByRole("button", { name: "Request a sample" })).toBeInTheDocument();
  });
});
