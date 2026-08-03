import type {
  AnalyticsDataLayerItem,
  InquiryFormName as AnalyticsInquiryFormName,
  OrangeGenerateLeadDataLayerItem,
  OrangePageViewDataLayerItem,
} from "@/types/analytics";

export type InquiryFormName = AnalyticsInquiryFormName;

type RuntimeAnalyticsDataLayer = AnalyticsDataLayerItem[];

function parsePathname(value: string): string | null {
  const boundary = [value.indexOf("?"), value.indexOf("#")]
    .filter((index) => index >= 0)
    .reduce((first, index) => Math.min(first, index), value.length);
  const pathname = value.slice(0, boundary);

  if (!/^\/(?!\/)/.test(pathname) || /[\u0000-\u0020\u007f\\]/.test(pathname)) {
    return null;
  }

  try {
    decodeURI(pathname);
    return pathname;
  } catch {
    return null;
  }
}

export function sanitizePathname(value: string): string {
  return parsePathname(value) ?? "/";
}

function absolutePageUrl(value: string, pathname: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return `${url.origin}${pathname}`;
  } catch {
    return null;
  }
}

function sanitizedReferrer(value: string): string | null {
  if (value === "") return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const pathname = parsePathname(url.pathname);
    return pathname === null ? null : `${url.origin}${pathname}`;
  } catch {
    return null;
  }
}

function runtimeDataLayer(): RuntimeAnalyticsDataLayer | null {
  if (window.dataLayer === undefined) {
    const dataLayer: RuntimeAnalyticsDataLayer = [];
    window.dataLayer = dataLayer;
    return dataLayer;
  }

  return Array.isArray(window.dataLayer)
    ? (window.dataLayer as unknown as RuntimeAnalyticsDataLayer)
    : null;
}

function createPageView(
  pagePath: string,
  pageLocation: string,
  pageReferrer: string | null,
): OrangePageViewDataLayerItem {
  if (pageReferrer === null) {
    return {
      event: "orange_page_view",
      page_path: pagePath,
      page_location: pageLocation,
    } as OrangePageViewDataLayerItem;
  }

  return {
    event: "orange_page_view",
    page_path: pagePath,
    page_location: pageLocation,
    page_referrer: pageReferrer,
  } as OrangePageViewDataLayerItem;
}

function createGenerateLead(formName: InquiryFormName): OrangeGenerateLeadDataLayerItem {
  return {
    event: "orange_generate_lead",
    form_name: formName,
  } as OrangeGenerateLeadDataLayerItem;
}

export function pushPageView(pathname: string, locationHref: string, referrer: string): void {
  if (typeof window === "undefined") return;

  const pagePath = sanitizePathname(pathname);
  const pageLocation = absolutePageUrl(locationHref, pagePath) ?? pagePath;
  runtimeDataLayer()?.push(createPageView(pagePath, pageLocation, sanitizedReferrer(referrer)));
}

export function pushGenerateLead(formName: InquiryFormName): void {
  if (typeof window === "undefined") return;
  runtimeDataLayer()?.push(createGenerateLead(formName));
}
