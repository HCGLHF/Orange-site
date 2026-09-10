import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const inquiryMocks = vi.hoisted(() => ({
  openInquiry: vi.fn(),
  totalCount: 0,
  pathname: "/",
  search: "",
  searchUnavailable: false,
}));

vi.mock("next/link", async () => {
  const ReactModule = await import("react");
  return {
    default: ReactModule.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }>(
      function MockLink({ children, prefetch: _prefetch, ...props }, ref) {
        void _prefetch;
        return <a ref={ref} {...props}>{children}</a>;
      },
    ),
  };
});

vi.mock("next/navigation", () => ({
  usePathname: () => inquiryMocks.pathname,
  useSearchParams: () => {
    if (inquiryMocks.searchUnavailable) throw new Promise(() => {});
    return new URLSearchParams(inquiryMocks.search);
  },
}));

vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => ({
    t: (key: string) => {
      if (key === "navCtaInquiry") return "Request a quote";
      if (key === "navAria") return "Main navigation";
      if (key === "heroTitle") return "O'range Textile";
      if (key === "navHome") return "Home";
      return key;
    },
  }),
}));

vi.mock("@/components/InquiryProvider", () => ({
  useInquiry: () => ({ openInquiry: inquiryMocks.openInquiry }),
}));

vi.mock("@/components/InquiryCartProvider", () => ({
  useInquiryCart: () => ({ totalCount: inquiryMocks.totalCount }),
}));

vi.mock("@/components/OrangeMark", () => ({
  OrangeMark: () => <span aria-hidden="true" />,
}));

import { Navbar } from "@/components/ui/Navbar";
import { OPEN_BATCH_INQUIRY_EVENT } from "@/lib/inquiry-events";

describe("Navbar quote navigation", () => {
  let listenerController: AbortController;

  beforeEach(() => {
    inquiryMocks.openInquiry.mockReset();
    inquiryMocks.totalCount = 0;
    inquiryMocks.pathname = "/";
    inquiryMocks.search = "";
    inquiryMocks.searchUnavailable = false;
    listenerController = new window.AbortController();
    vi.stubGlobal("React", React);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    listenerController.abort();
    vi.unstubAllGlobals();
  });

  it("opens the selected desktop inquiry cart instead of navigating to an empty anchor", async () => {
    inquiryMocks.totalCount = 2;
    const onBatchOpen = vi.fn();
    window.addEventListener(OPEN_BATCH_INQUIRY_EVENT, onBatchOpen, {
      signal: listenerController.signal,
    });
    const user = userEvent.setup();
    render(<Navbar />);

    const desktopCta = screen.getByRole("button", { name: "Request a quote" });
    const compactCta = screen.getByRole("button", { name: "Quote" });
    const cartButton = screen.getByRole("button", { name: "Inquiry cart: 2 items" });

    expect(desktopCta).toHaveClass("gn-cta");
    expect(compactCta).toHaveClass("gn-quote");
    expect(desktopCta.closest("a")).toBeNull();
    expect(compactCta.closest("a")).toBeNull();
    expect(cartButton).toHaveClass("gn-cart");

    await user.click(cartButton);

    expect(onBatchOpen).toHaveBeenCalledOnce();
    expect(inquiryMocks.openInquiry).not.toHaveBeenCalled();
  });

  it("opens the selected drawer inquiry cart instead of navigating to an empty anchor", async () => {
    inquiryMocks.totalCount = 2;
    const onBatchOpen = vi.fn();
    window.addEventListener(OPEN_BATCH_INQUIRY_EVENT, onBatchOpen, {
      signal: listenerController.signal,
    });
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: "Open navigation menu" }));

    const drawerCta = screen.getByRole("button", { name: "Request a Quote" });
    expect(drawerCta.closest("a")).toBeNull();
    const drawerCart = screen.getByRole("button", { name: "Inquiry cart" });

    await user.click(drawerCart);

    expect(onBatchOpen).toHaveBeenCalledOnce();
    expect(inquiryMocks.openInquiry).not.toHaveBeenCalled();
  });

  it("exposes the three collection links and keeps desktop keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const trigger = screen.getByRole("button", { name: "Products" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    const menu = screen.getByRole("menu", { name: "Products" });
    const links = within(menu).getAllByRole("menuitem");
    expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Air-Layer & Structured Knits", "/fabrics?collection=structured"],
      ["Soft-Touch & Wool-Blend Knits", "/fabrics?collection=soft-touch"],
      ["Textured & Brushed Knits", "/fabrics?collection=textured"],
      ["View All Fabrics", "/fabrics"],
    ]);
    expect(links[0]).toHaveFocus();
    await user.keyboard("{End}");
    expect(links[3]).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(links[0]).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps the header and discovery links rendered while query state suspends", () => {
    inquiryMocks.searchUnavailable = true;
    const { container } = render(<Navbar />);
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Products" })).toBeInTheDocument();
    expect(container.querySelector('a[href="/fabrics?collection=structured"]')).toBeInTheDocument();
  });

  it.each([
    ["structured", "Air-Layer & Structured Knits"],
    ["soft-touch", "Soft-Touch & Wool-Blend Knits"],
    ["textured", "Textured & Brushed Knits"],
    ["unknown", "View All Fabrics"],
  ])("marks only the %s collection destination current on desktop and mobile", async (collection, name) => {
    inquiryMocks.pathname = "/fabrics";
    inquiryMocks.search = `collection=${collection}&q=wool`;
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(screen.getByRole("button", { name: "Products" }));
    const menu = screen.getByRole("menu", { name: "Products" });
    expect(within(menu).getByRole("menuitem", { name })).toHaveAttribute("aria-current", "page");
    expect(menu.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Open navigation menu" }));
    const drawer = screen.getByRole("dialog");
    expect(within(drawer).getByRole("link", { name })).toHaveAttribute("aria-current", "page");
    expect(drawer.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  });

  it("closes open navigation when a same-path collection query changes", async () => {
    inquiryMocks.pathname = "/fabrics";
    inquiryMocks.search = "collection=structured";
    const user = userEvent.setup();
    const { rerender } = render(<Navbar />);
    await user.click(screen.getByRole("button", { name: "Products" }));
    inquiryMocks.search = "collection=textured";
    rerender(<Navbar />);
    expect(screen.getByRole("button", { name: "Products" })).toHaveAttribute("aria-expanded", "false");
    await user.click(screen.getByRole("button", { name: "Open navigation menu" }));
    inquiryMocks.search = "collection=soft-touch";
    rerender(<Navbar />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
