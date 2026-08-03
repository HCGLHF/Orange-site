import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

type AnalyticsTestWindow = Window & {
  __orangeAnalyticsBootstrap?: unknown;
  __orangeLastTrackedPath?: unknown;
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

beforeEach(() => {
  const analyticsWindow = window as AnalyticsTestWindow;
  analyticsWindow.dataLayer = [];
  Reflect.deleteProperty(analyticsWindow, "__orangeAnalyticsBootstrap");
  Reflect.deleteProperty(analyticsWindow, "__orangeLastTrackedPath");
  Reflect.deleteProperty(analyticsWindow, "gtag");
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();

  const analyticsWindow = window as AnalyticsTestWindow;
  Reflect.deleteProperty(analyticsWindow, "__orangeAnalyticsBootstrap");
  Reflect.deleteProperty(analyticsWindow, "__orangeLastTrackedPath");
  Reflect.deleteProperty(analyticsWindow, "dataLayer");
  Reflect.deleteProperty(analyticsWindow, "gtag");
});
