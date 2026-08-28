import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { restoreInquiryFocus } from "@/lib/inquiry-events";

type HideTarget = (
  primary: HTMLButtonElement,
  wrapper: HTMLDivElement,
) => void;

function renderFocusTargets() {
  render(
    <>
      <div data-testid="primary-wrapper">
        <button type="button">Primary opener</button>
      </div>
      <button type="button">Fallback opener</button>
    </>,
  );

  return {
    primary: screen.getByRole("button", {
      name: "Primary opener",
    }) as HTMLButtonElement,
    fallback: screen.getByRole("button", {
      name: "Fallback opener",
    }) as HTMLButtonElement,
    wrapper: screen.getByTestId("primary-wrapper") as HTMLDivElement,
  };
}

describe("inquiry focus restoration", () => {
  it.each<[string, HideTarget]>([
    [
      "disabled",
      (primary) => {
        primary.disabled = true;
      },
    ],
    [
      "aria-hidden",
      (_primary, wrapper) => {
        wrapper.setAttribute("aria-hidden", "true");
      },
    ],
    [
      "hidden",
      (_primary, wrapper) => {
        wrapper.hidden = true;
      },
    ],
    [
      "display none",
      (_primary, wrapper) => {
        wrapper.style.display = "none";
      },
    ],
    [
      "hidden visibility",
      (_primary, wrapper) => {
        wrapper.style.visibility = "hidden";
      },
    ],
    [
      "zero effective opacity",
      (_primary, wrapper) => {
        wrapper.style.opacity = "0";
      },
    ],
    [
      "disabled pointer events",
      (_primary, wrapper) => {
        wrapper.style.pointerEvents = "none";
      },
    ],
  ])("skips a %s primary target", (_label, hideTarget) => {
    const { primary, fallback, wrapper } = renderFocusTargets();
    hideTarget(primary, wrapper);

    restoreInquiryFocus(primary, fallback);

    expect(fallback).toHaveFocus();
    expect(document.body).not.toHaveFocus();
  });

  it("falls through when focus does not make the candidate active", () => {
    const { primary, fallback } = renderFocusTargets();
    vi.spyOn(primary, "focus").mockImplementation(() => undefined);

    restoreInquiryFocus(primary, fallback);

    expect(fallback).toHaveFocus();
  });
});
