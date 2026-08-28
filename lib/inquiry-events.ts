export const OPEN_BATCH_INQUIRY_EVENT = "orange-textile:open-batch-inquiry";
const DESKTOP_INQUIRY_FALLBACK_QUERY = "(min-width: 1280px)";
const INQUIRY_FALLBACK_OPENER_ATTRIBUTE = "data-inquiry-fallback-opener";

export type OpenBatchInquiryDetail = {
  opener?: HTMLElement;
  fallbackOpener?: HTMLElement;
};

export type OpenBatchInquiryOpeners = {
  opener: HTMLElement | null;
  fallbackOpener: HTMLElement | null;
};

function connectedElement(value: unknown): HTMLElement | null {
  return typeof HTMLElement !== "undefined" &&
    value instanceof HTMLElement &&
    value.isConnected
    ? value
    : null;
}

function currentFallbackVariant(): "compact" | "desktop" {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(DESKTOP_INQUIRY_FALLBACK_QUERY).matches
    ? "desktop"
    : "compact";
}

export function isUsableInquiryFocusTarget(
  value: unknown,
): value is HTMLElement {
  const element = connectedElement(value);
  if (
    !element ||
    typeof document === "undefined" ||
    element === document.body ||
    element === document.documentElement
  ) {
    return false;
  }

  if (
    element.getAttribute("aria-disabled") === "true" ||
    element.matches(":disabled")
  ) {
    return false;
  }

  const fallbackVariant = element.getAttribute(
    INQUIRY_FALLBACK_OPENER_ATTRIBUTE,
  );
  if (
    (fallbackVariant === "compact" || fallbackVariant === "desktop") &&
    fallbackVariant !== currentFallbackVariant()
  ) {
    return false;
  }

  let effectiveOpacity = 1;
  for (
    let current: HTMLElement | null = element;
    current;
    current = current.parentElement
  ) {
    if (
      current.hidden ||
      current.hasAttribute("inert") ||
      current.getAttribute("aria-hidden") === "true"
    ) {
      return false;
    }

    const style = window.getComputedStyle(current);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.visibility === "collapse" ||
      style.pointerEvents === "none"
    ) {
      return false;
    }

    const opacity = Number.parseFloat(style.opacity);
    if (Number.isFinite(opacity)) effectiveOpacity *= opacity;
    if (effectiveOpacity <= 0) return false;
  }

  return true;
}

export function tryFocusInquiryTarget(value: unknown): value is HTMLElement {
  if (!isUsableInquiryFocusTarget(value)) return false;
  try {
    value.focus();
  } catch {
    return false;
  }
  return document.activeElement === value;
}

export function getCurrentInquiryFallbackOpener(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const variant = currentFallbackVariant();
  const candidates = document.querySelectorAll<HTMLElement>(
    `[${INQUIRY_FALLBACK_OPENER_ATTRIBUTE}="${variant}"]`,
  );
  return Array.from(candidates).find(isUsableInquiryFocusTarget) ?? null;
}

export function restoreInquiryFocus(
  opener?: HTMLElement | null,
  fallbackOpener?: HTMLElement | null,
): HTMLElement | null {
  const candidates = [
    opener,
    fallbackOpener,
    getCurrentInquiryFallbackOpener(),
  ];
  const attempted = new Set<HTMLElement>();
  for (const candidate of candidates) {
    if (!candidate || attempted.has(candidate)) continue;
    attempted.add(candidate);
    if (tryFocusInquiryTarget(candidate)) return candidate;
  }
  return null;
}

export function getOpenBatchInquiryOpeners(
  event: Event,
): OpenBatchInquiryOpeners {
  const detail =
    typeof CustomEvent !== "undefined" && event instanceof CustomEvent
      ? (event.detail as OpenBatchInquiryDetail | undefined)
      : undefined;
  const explicitOpener = connectedElement(detail?.opener);
  const fallbackOpener = connectedElement(detail?.fallbackOpener);
  const activeOpener =
    typeof document === "undefined"
      ? null
      : connectedElement(document.activeElement);

  return {
    opener: explicitOpener ?? activeOpener,
    fallbackOpener,
  };
}

export function getOpenBatchInquiryOpener(event: Event): HTMLElement | null {
  return getOpenBatchInquiryOpeners(event).opener;
}

export function dispatchOpenBatchInquiry(
  opener?: HTMLElement,
  fallbackOpener?: HTMLElement,
): void {
  if (typeof window === "undefined") return;
  const stableOpener = connectedElement(opener);
  const stableFallbackOpener = connectedElement(fallbackOpener);
  const detail: OpenBatchInquiryDetail = {};
  if (stableOpener) detail.opener = stableOpener;
  if (stableFallbackOpener) detail.fallbackOpener = stableFallbackOpener;
  window.dispatchEvent(
    new CustomEvent<OpenBatchInquiryDetail>(OPEN_BATCH_INQUIRY_EVENT, {
      detail,
    }),
  );
}
