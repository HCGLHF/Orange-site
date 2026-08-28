"use client";

import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic, { type DynamicOptionsLoadingProps } from "next/dynamic";
import {
  getOpenBatchInquiryOpeners,
  isUsableInquiryFocusTarget,
  OPEN_BATCH_INQUIRY_EVENT,
  restoreInquiryFocus,
  tryFocusInquiryTarget,
} from "@/lib/inquiry-events";

export function InquiryBarLoading({
  error,
  isLoading,
}: DynamicOptionsLoadingProps) {
  if (error) throw error;

  return isLoading ? (
    <p
      role="status"
      aria-live="polite"
      className="font-medium text-brand-charcoal"
    >
      Loading inquiry form…
    </p>
  ) : null;
}

function InquiryBarLoadError({ onRetry }: { onRetry: () => void }) {
  const retryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    retryRef.current?.focus();
  }, []);

  return (
    <div role="alert">
      <p className="font-medium text-brand-charcoal">
        The inquiry form could not load. Please try again.
      </p>
      <button
        ref={retryRef}
        type="button"
        className="mt-4 rounded-full bg-brand-orange px-5 py-2 font-semibold text-white"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  );
}

class InquiryBarLoadBoundary extends Component<
  { children: ReactNode; onRetry: () => void },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <InquiryBarLoadError onRetry={this.props.onRetry} />;
    }
    return this.props.children;
  }
}

const InquiryBar = dynamic(
  () => import("@/components/InquiryBar").then((module) => module.InquiryBar),
  { ssr: false, loading: InquiryBarLoading },
);

function createRetryableInquiryBar() {
  return dynamic(
    () => import("@/components/InquiryBar").then((module) => module.InquiryBar),
    { ssr: false, loading: InquiryBarLoading },
  );
}

type InitialOpenRequest = {
  opener: HTMLElement | null;
  fallbackOpener: HTMLElement | null;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function DeferredInquiryBarHost() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [initialRequest, setInitialRequest] = useState<InitialOpenRequest | null>(
    null,
  );
  const [ActiveInquiryBar, setActiveInquiryBar] = useState(() => InquiryBar);
  const [loadGeneration, setLoadGeneration] = useState(0);
  const [inquiryBarListening, setInquiryBarListening] = useState(false);
  const inquiryBarListeningRef = useRef(false);
  const loadStartedRef = useRef(false);
  const initialRequestRef = useRef<InitialOpenRequest | null>(null);
  const loadingPanelRef = useRef<HTMLDivElement>(null);

  const replaceWithFreshLoad = useCallback(() => {
    const NextInquiryBar = createRetryableInquiryBar();
    setActiveInquiryBar(() => NextInquiryBar);
    setLoadGeneration((generation) => generation + 1);
  }, []);

  const retryLoad = useCallback(() => {
    tryFocusInquiryTarget(loadingPanelRef.current);
    replaceWithFreshLoad();
  }, [replaceWithFreshLoad]);

  const cancelLoad = useCallback(() => {
    if (inquiryBarListeningRef.current) return;
    const request = initialRequestRef.current;
    initialRequestRef.current = null;
    loadStartedRef.current = false;
    setInitialRequest(null);
    setShouldLoad(false);
    replaceWithFreshLoad();
    restoreInquiryFocus(request?.opener, request?.fallbackOpener);
  }, [replaceWithFreshLoad]);

  useEffect(() => {
    if (inquiryBarListening) return;

    const handleOpen = (event: Event) => {
      if (inquiryBarListeningRef.current) return;
      const request = getOpenBatchInquiryOpeners(event);
      const alreadyStarted = loadStartedRef.current;
      initialRequestRef.current = request;
      loadStartedRef.current = true;
      setInitialRequest(request);
      setShouldLoad(true);
      if (alreadyStarted) replaceWithFreshLoad();
    };

    window.addEventListener(OPEN_BATCH_INQUIRY_EVENT, handleOpen);
    return () => {
      window.removeEventListener(OPEN_BATCH_INQUIRY_EVENT, handleOpen);
    };
  }, [inquiryBarListening, replaceWithFreshLoad]);

  useEffect(() => {
    if (!shouldLoad || inquiryBarListening) return;
    const panel = loadingPanelRef.current;
    if (!panel) return;

    const loadedDialog = panel.querySelector<HTMLElement>(
      '[role="dialog"][aria-modal="true"]',
    );
    if (!loadedDialog) tryFocusInquiryTarget(panel);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelLoad();
        return;
      }
      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(isUsableInquiryFocusTarget);
      if (focusableElements.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;
      if (
        event.shiftKey &&
        (activeElement === firstFocusable ||
          activeElement === panel ||
          !panel.contains(activeElement))
      ) {
        event.preventDefault();
        lastFocusable.focus();
        return;
      }
      if (
        !event.shiftKey &&
        (activeElement === lastFocusable ||
          activeElement === panel ||
          !panel.contains(activeElement))
      ) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [cancelLoad, inquiryBarListening, loadGeneration, shouldLoad]);

  useEffect(() => {
    return () => {
      if (inquiryBarListeningRef.current) return;
      const request = initialRequestRef.current;
      initialRequestRef.current = null;
      restoreInquiryFocus(request?.opener, request?.fallbackOpener);
    };
  }, []);

  const handleInquiryBarListening = useCallback(() => {
    inquiryBarListeningRef.current = true;
    initialRequestRef.current = null;
    setInquiryBarListening(true);
    setInitialRequest(null);
  }, []);

  return shouldLoad ? (
    <div
      role={inquiryBarListening ? undefined : "dialog"}
      aria-modal={inquiryBarListening ? undefined : true}
      aria-label={inquiryBarListening ? undefined : "Loading inquiry form"}
      className={
        inquiryBarListening
          ? "contents"
          : "fixed inset-0 z-[70] grid place-items-center bg-brand-charcoal/40 p-4"
      }
    >
      <div
        ref={loadingPanelRef}
        role={inquiryBarListening ? undefined : "document"}
        tabIndex={inquiryBarListening ? undefined : -1}
        className={
          inquiryBarListening
            ? "contents"
            : "w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl outline-none"
        }
      >
        <InquiryBarLoadBoundary
          key={loadGeneration}
          onRetry={retryLoad}
        >
          <ActiveInquiryBar
            initiallyOpen={initialRequest !== null}
            initialOpener={initialRequest?.opener ?? null}
            initialFallbackOpener={initialRequest?.fallbackOpener ?? null}
            onOpenListenerReady={handleInquiryBarListening}
          />
        </InquiryBarLoadBoundary>
        {!inquiryBarListening ? (
          <button
            type="button"
            className="mt-4 rounded-full border border-brand-charcoal/20 px-5 py-2 font-semibold text-brand-charcoal"
            onClick={cancelLoad}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  ) : null;
}
