/** 打开 InquiryBar 内批量询价弹窗 */
export const OPEN_BATCH_INQUIRY_EVENT = "orange-textile:open-batch-inquiry";

export function dispatchOpenBatchInquiry(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_BATCH_INQUIRY_EVENT));
}
