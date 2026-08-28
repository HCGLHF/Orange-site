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
  OPEN_BATCH_INQUIRY_EVENT,
} from "@/lib/inquiry-events";

export function InquiryBarLoading({
  error,
  isLoading,
}: DynamicOptionsLoadingProps) {
  if (error) throw error;

  return isLoading ? (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[70] grid place-items-center bg-brand-charcoal/40 p-4"
    >
      <p className="rounded-2xl bg-white px-6 py-4 font-medium text-brand-charcoal shadow-2xl">
        Loading inquiry form…
      </p>
    </div>
  ) : null;
}

function InquiryBarLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="fixed inset-0 z-[70] grid place-items-center bg-brand-charcoal/40 p-4"
    >
      <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
        <p className="font-medium text-brand-charcoal">
          The inquiry form could not load. Please try again.
        </p>
        <button
          type="button"
          className="mt-4 rounded-full bg-brand-orange px-5 py-2 font-semibold text-white"
          onClick={onRetry}
        >
          Retry
        </button>
      </div>
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

  const startFreshLoad = useCallback(() => {
    setActiveInquiryBar(() => createRetryableInquiryBar());
    setLoadGeneration((generation) => generation + 1);
  }, []);

  useEffect(() => {
    if (inquiryBarListening) return;

    const handleOpen = (event: Event) => {
      if (inquiryBarListeningRef.current) return;
      const alreadyStarted = loadStartedRef.current;
      loadStartedRef.current = true;
      setInitialRequest(getOpenBatchInquiryOpeners(event));
      setShouldLoad(true);
      if (alreadyStarted) startFreshLoad();
    };

    window.addEventListener(OPEN_BATCH_INQUIRY_EVENT, handleOpen);
    return () => {
      window.removeEventListener(OPEN_BATCH_INQUIRY_EVENT, handleOpen);
    };
  }, [inquiryBarListening, startFreshLoad]);

  const handleInquiryBarListening = useCallback(() => {
    inquiryBarListeningRef.current = true;
    setInquiryBarListening(true);
    setInitialRequest(null);
  }, []);

  return shouldLoad ? (
    <InquiryBarLoadBoundary
      key={loadGeneration}
      onRetry={startFreshLoad}
    >
      <ActiveInquiryBar
        initiallyOpen={initialRequest !== null}
        initialOpener={initialRequest?.opener ?? null}
        initialFallbackOpener={initialRequest?.fallbackOpener ?? null}
        onOpenListenerReady={handleInquiryBarListening}
      />
    </InquiryBarLoadBoundary>
  ) : null;
}
