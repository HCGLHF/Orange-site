"use client";

import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { AnalyticsConsentBanner } from "@/components/analytics/AnalyticsConsentBanner";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  type AnalyticsConsentChoice,
  parseConsentValue,
  readConsent,
  updateGoogleConsent,
  writeConsent,
} from "@/lib/analytics/consent";

export type AnalyticsConsentContextValue = {
  choice: AnalyticsConsentChoice | null;
  isOpen: boolean;
  open: (trigger?: HTMLElement | null) => void;
};

const AnalyticsConsentContext = createContext<AnalyticsConsentContextValue | undefined>(undefined);

type AnalyticsConsentProviderProps = {
  children: ReactNode;
};

export function AnalyticsConsentProvider({ children }: AnalyticsConsentProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [choice, setChoice] = useState<AnalyticsConsentChoice | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasPersistenceError, setHasPersistenceError] = useState(false);
  const [focusRequest, setFocusRequest] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const shouldFocusHeadingRef = useRef(false);
  const shouldReturnFocusRef = useRef(false);
  const initializedRef = useRef(false);

  const failClosed = useCallback((showError: boolean) => {
    updateGoogleConsent("denied");
    setChoice(null);
    setHasPersistenceError(showError);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    setMounted(true);
    if (initializedRef.current) return;
    initializedRef.current = true;

    const bootstrap = window.__orangeAnalyticsBootstrap;
    if (bootstrap !== undefined) {
      if (bootstrap.choice !== null && bootstrap.error === null) {
        setChoice(bootstrap.choice);
        setHasPersistenceError(false);
        setIsOpen(false);
      } else {
        failClosed(bootstrap.error !== null);
      }
    } else {
      let saved: ReturnType<typeof readConsent>;
      try {
        saved = readConsent(window.localStorage);
      } catch {
        saved = { choice: null, error: "storage_unavailable" };
      }

      if (saved.choice !== null) {
        updateGoogleConsent(saved.choice);
        setChoice(saved.choice);
        setHasPersistenceError(false);
        setIsOpen(false);
      } else {
        failClosed(saved.error !== null);
      }
    }
  }, [failClosed]);

  useEffect(() => {
    const syncConsent = (event: StorageEvent) => {
      if (event.key !== ANALYTICS_CONSENT_STORAGE_KEY && event.key !== null) return;

      let storage: Storage;
      try {
        storage = window.localStorage;
      } catch {
        shouldFocusHeadingRef.current = false;
        shouldReturnFocusRef.current = false;
        returnFocusRef.current = null;
        failClosed(true);
        return;
      }

      if (event.storageArea !== null && event.storageArea !== storage) return;

      shouldFocusHeadingRef.current = false;
      shouldReturnFocusRef.current = false;
      returnFocusRef.current = null;

      if (event.key === null || event.newValue === null) {
        failClosed(false);
        return;
      }

      const stored = parseConsentValue(event.newValue);
      if (stored === null) {
        failClosed(true);
        return;
      }

      updateGoogleConsent(stored.analytics);
      setChoice(stored.analytics);
      setHasPersistenceError(false);
      setIsOpen(false);
    };

    window.addEventListener("storage", syncConsent);
    return () => window.removeEventListener("storage", syncConsent);
  }, [failClosed]);

  const open = useCallback((trigger?: HTMLElement | null) => {
    returnFocusRef.current = trigger ?? null;
    shouldFocusHeadingRef.current = true;
    shouldReturnFocusRef.current = false;
    setIsOpen(true);
    setFocusRequest((request) => request + 1);
  }, []);

  useEffect(() => {
    if (!mounted || !isOpen || !shouldFocusHeadingRef.current) return;
    headingRef.current?.focus();
    shouldFocusHeadingRef.current = false;
  }, [focusRequest, isOpen, mounted]);

  useEffect(() => {
    if (!mounted || isOpen || !shouldReturnFocusRef.current) return;
    returnFocusRef.current?.focus();
    shouldReturnFocusRef.current = false;
    returnFocusRef.current = null;
  }, [isOpen, mounted]);

  const saveChoice = useCallback(
    (nextChoice: AnalyticsConsentChoice) => {
      let result: ReturnType<typeof writeConsent>;
      let storage: Storage | null = null;
      try {
        storage = window.localStorage;
        result = writeConsent(storage, nextChoice);
      } catch {
        result = { ok: false, error: "storage_unavailable" };
      }

      if (!result.ok) {
        try {
          (storage ?? window.localStorage).removeItem(ANALYTICS_CONSENT_STORAGE_KEY);
        } catch {
          // The runtime denial below remains authoritative when cleanup is blocked.
        }
        shouldReturnFocusRef.current = false;
        failClosed(true);
        return;
      }

      updateGoogleConsent(nextChoice);
      setChoice(nextChoice);
      setHasPersistenceError(false);
      shouldReturnFocusRef.current = returnFocusRef.current !== null;
      setIsOpen(false);
    },
    [failClosed],
  );

  return (
    <AnalyticsConsentContext.Provider value={{ choice, isOpen, open }}>
      {children}
      {mounted && isOpen ? (
        <AnalyticsConsentBanner
          error={hasPersistenceError}
          headingRef={headingRef}
          onAccept={() => saveChoice("granted")}
          onDecline={() => saveChoice("denied")}
        />
      ) : null}
    </AnalyticsConsentContext.Provider>
  );
}

export function useAnalyticsConsent(): AnalyticsConsentContextValue {
  const context = useContext(AnalyticsConsentContext);
  if (context === undefined) {
    throw new Error("useAnalyticsConsent must be used within an AnalyticsConsentProvider");
  }
  return context;
}
