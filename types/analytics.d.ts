export {};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    __orangeAnalyticsBootstrap?: {
      choice: "granted" | "denied" | null;
      error: "invalid_value" | "storage_unavailable" | null;
    };
    __orangeLastTrackedPath?: string;
  }
}
