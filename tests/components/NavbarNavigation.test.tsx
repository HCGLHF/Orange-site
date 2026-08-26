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

describe("Navbar quote navigation", () => {
  beforeEach(() => {
    inquiryMocks.openInquiry.mockReset();
    inquiryMocks.totalCount = 0;
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
    vi.unstubAllGlobals();
  });

  it("renders desktop and compact quote CTAs as buttons while keeping the cart as a link", () => {
    render(<Navbar />);

    const desktopCta = screen.getByRole("button", { name: "Request a quote" });
    const compactCta = screen.getByRole("button", { name: "Quote" });
    const cartLink = screen.getByRole("link", { name: "Inquiry cart: 0 items" });

    expect(desktopCta).toHaveClass("gn-cta");
    expect(compactCta).toHaveClass("gn-quote");
    expect(desktopCta.closest("a")).toBeNull();
    expect(compactCta.closest("a")).toBeNull();
    expect(cartLink).toHaveAttribute("href", "/fabrics#inquiry-form");
    expect(cartLink).toHaveClass("gn-cart");
  });

  it("renders the drawer quote CTA as a button and keeps its cart navigation link", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: "Open navigation menu" }));

    const drawerCta = screen.getByRole("button", { name: "Request a Quote" });
    expect(drawerCta.closest("a")).toBeNull();
    expect(screen.getByRole("link", { name: "Inquiry cart" })).toHaveAttribute(
      "href",
      "/fabrics#inquiry-form",
    );
  });
});
