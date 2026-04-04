export const INQUIRY_STORAGE_KEY = "orange-textile-inquiries";

export type InquiryRecord = {
  name: string;
  email: string;
  company: string;
  fabric: string;
  quantity: string;
  createdAt: string;
};

export const FORMSPREE_INQUIRY_ENDPOINT = "https://formspree.io/f/mojpdwdg";

export function appendInquiryRecord(
  entry: Omit<InquiryRecord, "createdAt">
): InquiryRecord {
  const full: InquiryRecord = {
    ...entry,
    createdAt: new Date().toISOString(),
  };
  if (typeof window === "undefined") return full;
  const raw = window.localStorage.getItem(INQUIRY_STORAGE_KEY);
  const list: InquiryRecord[] = raw ? JSON.parse(raw) : [];
  list.push(full);
  window.localStorage.setItem(INQUIRY_STORAGE_KEY, JSON.stringify(list));
  return full;
}
