import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

beforeEach(() => {
  window.dataLayer = [];
  Reflect.deleteProperty(window, "__orangeAnalyticsBootstrap");
  Reflect.deleteProperty(window, "__orangeLastTrackedPath");
  Reflect.deleteProperty(window, "gtag");
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();

  Reflect.deleteProperty(window, "__orangeAnalyticsBootstrap");
  Reflect.deleteProperty(window, "__orangeLastTrackedPath");
  Reflect.deleteProperty(window, "dataLayer");
  Reflect.deleteProperty(window, "gtag");
});
