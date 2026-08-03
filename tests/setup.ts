import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

type AnalyticsTestWindow = Window & {
  __orangeAnalyticsBootstrap?: unknown;
  __orangeLastTrackedPath?: unknown;
  dataLayer?: unknown[];
};

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();

  const analyticsWindow = window as AnalyticsTestWindow;
  Reflect.deleteProperty(analyticsWindow, "__orangeAnalyticsBootstrap");
  Reflect.deleteProperty(analyticsWindow, "__orangeLastTrackedPath");
  analyticsWindow.dataLayer = [];
});
