import type {
  AnalyticsDataLayerItem,
  InquiryFormName as AnalyticsInquiryFormName,
  OrangeGenerateLeadDataLayerItem,
  OrangePageViewDataLayerItem,
} from "@/types/analytics";
import { isTrackablePublicPath } from "@/lib/analytics/public-paths";

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

type SanitizedLocation = {
  pageLocation: string;
  origin: string | null;
};

function sanitizedLocation(value: string, pathname: string): SanitizedLocation {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { pageLocation: pathname, origin: null };
    }
    return { pageLocation: `${url.origin}${pathname}`, origin: url.origin };
  } catch {
    return { pageLocation: pathname, origin: null };
  }
}

function sanitizedReferrer(value: string, currentOrigin: string | null): string | null {
  if (value === "") return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const pathname = parsePathname(url.pathname);
    if (
      currentOrigin !== null &&
      url.origin === currentOrigin &&
      pathname !== null &&
      isTrackablePublicPath(pathname)
    ) {
      return `${url.origin}${pathname}`;
    }
    return url.origin;
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

  const pagePath = parsePathname(pathname);
  if (pagePath === null || !isTrackablePublicPath(pagePath)) return;

  const location = sanitizedLocation(locationHref, pagePath);
  runtimeDataLayer()?.push(
    createPageView(
      pagePath,
      location.pageLocation,
      sanitizedReferrer(referrer, location.origin),
    ),
  );
}

export function pushGenerateLead(formName: InquiryFormName): void {
  if (typeof window === "undefined") return;
  runtimeDataLayer()?.push(createGenerateLead(formName));
}
