const LEGACY_INQUIRY_STORAGE_KEY = "orange-textile-inquiries";

type BrowserStorageHost = {
  localStorage: Pick<Storage, "removeItem">;
};

export function clearLegacyInquiryStorage(host: BrowserStorageHost): void {
  try {
    host.localStorage.removeItem(LEGACY_INQUIRY_STORAGE_KEY);
  } catch {
    // Storage can be blocked; cleanup is best effort and must not break the site.
  }
}
