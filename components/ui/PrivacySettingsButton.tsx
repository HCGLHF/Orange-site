"use client";

import React from "react";

import { useAnalyticsConsent } from "@/components/analytics/AnalyticsConsentProvider";

export function PrivacySettingsButton() {
  const { open } = useAnalyticsConsent();

  return (
    <button type="button" className="sf-link" onClick={(event) => open(event.currentTarget)}>
      Privacy settings
    </button>
  );
}
