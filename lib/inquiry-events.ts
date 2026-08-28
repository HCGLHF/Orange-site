export const OPEN_BATCH_INQUIRY_EVENT = "orange-textile:open-batch-inquiry";

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
