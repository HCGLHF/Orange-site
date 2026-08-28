export const OPEN_BATCH_INQUIRY_EVENT = "orange-textile:open-batch-inquiry";

export type OpenBatchInquiryDetail = {
  opener?: HTMLElement;
};

function connectedElement(value: unknown): HTMLElement | null {
  return typeof HTMLElement !== "undefined" &&
    value instanceof HTMLElement &&
    value.isConnected
    ? value
    : null;
}

export function getOpenBatchInquiryOpener(event: Event): HTMLElement | null {
  const explicitOpener =
    typeof CustomEvent !== "undefined" && event instanceof CustomEvent
      ? connectedElement((event.detail as OpenBatchInquiryDetail | undefined)?.opener)
      : null;
  if (explicitOpener) return explicitOpener;

  return typeof document === "undefined"
    ? null
    : connectedElement(document.activeElement);
}

export function dispatchOpenBatchInquiry(opener?: HTMLElement): void {
  if (typeof window === "undefined") return;
  const stableOpener = connectedElement(opener);
  window.dispatchEvent(
    new CustomEvent<OpenBatchInquiryDetail>(OPEN_BATCH_INQUIRY_EVENT, {
      detail: stableOpener ? { opener: stableOpener } : {},
    }),
  );
}
