export type AnalyticsConsentChoice = "granted" | "denied";
export type InquiryFormName = "single_inquiry" | "batch_inquiry";

declare const controlledAnalyticsDataLayerItem: unique symbol;

type ControlledAnalyticsDataLayerItem = {
  readonly [controlledAnalyticsDataLayerItem]: true;
};

export type OrangePageViewDataLayerItem = {
  event: "orange_page_view";
  page_path: string;
  page_location: string;
  page_referrer?: string;
} & ControlledAnalyticsDataLayerItem;

export type OrangeGenerateLeadDataLayerItem = {
  event: "orange_generate_lead";
  form_name: InquiryFormName;
} & ControlledAnalyticsDataLayerItem;

export type GtmStartDataLayerItem = {
  "gtm.start": number;
  event: "gtm.js";
} & ControlledAnalyticsDataLayerItem;

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

export type GoogleConsentDefaultCommand = readonly [
  "consent",
  "default",
  GoogleConsentDefault,
];

export type GoogleConsentUpdateCommand = readonly [
  "consent",
  "update",
  GoogleConsentUpdate,
];

export type GoogleAllowAdPersonalizationSignalsCommand = readonly [
  "set",
  "allow_ad_personalization_signals",
  false,
];

export type GoogleAdsDataRedactionCommand = readonly ["set", "ads_data_redaction", true];

export type GoogleQueuedCommand =
  | GoogleConsentDefaultCommand
  | GoogleConsentUpdateCommand
  | GoogleAllowAdPersonalizationSignalsCommand
  | GoogleAdsDataRedactionCommand;

export type AnalyticsDataLayerItem =
  | OrangePageViewDataLayerItem
  | OrangeGenerateLeadDataLayerItem
  | GtmStartDataLayerItem
  | GoogleQueuedCommand;

/**
 * Application code must use the controlled event API added in Task 5.
 * Generated inline Google code owns runtime queue mutation.
 */
export interface AnalyticsDataLayer {
  readonly length: number;
  readonly [index: number]: AnalyticsDataLayerItem;
}

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
