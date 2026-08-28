import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const inquiryMocks = vi.hoisted(() => ({
  openInquiry: vi.fn(),
  totalCount: 0,
}));

vi.mock("next/link", async () => {
  const ReactModule = await import("react");
  return {
    default: ReactModule.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }>(
      function MockLink({ children, prefetch: _prefetch, ...props }, ref) {
        return <a ref={ref} {...props}>{children}</a>;
      },
    ),
  };
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
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

vi.mock("@/components/ui/DesktopNavigation", () => ({
  DesktopNavigation: () => <div data-testid="desktop-navigation" />,
}));

import { Navbar } from "@/components/ui/Navbar";
import { OPEN_BATCH_INQUIRY_EVENT } from "@/lib/inquiry-events";

describe("Navbar quote navigation", () => {
  let listenerController: AbortController;

  beforeEach(() => {
    inquiryMocks.openInquiry.mockReset();
    inquiryMocks.totalCount = 0;
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
});
