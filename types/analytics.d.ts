export type AnalyticsConsentChoice = "granted" | "denied";
export type InquiryFormName = "single_inquiry" | "batch_inquiry";

export type OrangePageViewDataLayerItem = {
  event: "orange_page_view";
  page_path: string;
  page_location: string;
  page_referrer?: string;
};

export type OrangeGenerateLeadDataLayerItem = {
  event: "orange_generate_lead";
  form_name: InquiryFormName;
};

export type GtmStartDataLayerItem = {
  "gtm.start": number;
  event: "gtm.js";
};

export type AnalyticsDataLayerItem =
  | OrangePageViewDataLayerItem
  | OrangeGenerateLeadDataLayerItem
  | GtmStartDataLayerItem
  | IArguments;

export type AnalyticsDataLayer = AnalyticsDataLayerItem[];

export type GoogleConsentDefault = {
  analytics_storage: "denied";
  ad_storage: "denied";
  ad_user_data: "denied";
  ad_personalization: "denied";
};

export type GoogleConsentUpdate = {
  analytics_storage: AnalyticsConsentChoice;
  ad_storage: "denied";
  ad_user_data: "denied";
  ad_personalization: "denied";
};

export interface GoogleTag {
  (command: "consent", action: "default", consent: GoogleConsentDefault): void;
  (command: "consent", action: "update", consent: GoogleConsentUpdate): void;
  (command: "set", field: "allow_ad_personalization_signals", value: false): void;
  (command: "set", field: "ads_data_redaction", value: true): void;
}

export type AnalyticsBootstrapStatus = {
  choice: AnalyticsConsentChoice | null;
  error: "invalid_value" | "storage_unavailable" | null;
};

declare global {
  interface Window {
    dataLayer?: AnalyticsDataLayer;
    gtag?: GoogleTag;
    __orangeAnalyticsBootstrap?: AnalyticsBootstrapStatus;
    __orangeLastTrackedPath?: string;
  }
}
