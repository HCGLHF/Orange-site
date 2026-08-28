"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import dynamic, { type DynamicOptionsLoadingProps } from "next/dynamic";
import { DeferredInquiryBarHost } from "@/components/DeferredInquiryBarHost";
import { DeferredStickyInquiryBar } from "@/components/DeferredStickyInquiryBar";
import { InquiryCartProvider } from "@/components/InquiryCartProvider";

type InquiryContextValue = {
  openInquiry: (initialFabricId?: string) => void;
  closeInquiry: () => void;
};

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryModalLoading({
  error,
  isLoading,
  retry,
  onClose,
}: DynamicOptionsLoadingProps & { onClose?: () => void }) {
  const [hasRetried, setHasRetried] = useState(false);

  if (error) {
    const canRetry = typeof retry === "function" && !hasRetried;
    const handleRetry = () => {
      if (!canRetry) return;
      setHasRetried(true);
      retry();
    };

    return (
      <div role="alert" className="fixed inset-0 z-[70] grid place-items-center bg-brand-charcoal/40 p-4">
        <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
          <p className="font-medium text-brand-charcoal">
            The inquiry form could not load. Please try again.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              className="rounded-full bg-brand-orange px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canRetry}
              onClick={handleRetry}
            >
              Retry
            </button>
            {onClose ? (
              <button
                type="button"
                className="rounded-full border border-brand-charcoal/20 px-5 py-2 font-semibold text-brand-charcoal"
                onClick={onClose}
              >
                Close
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-[70] grid place-items-center bg-brand-charcoal/40 p-4"
      >
        <p className="rounded-2xl bg-white px-6 py-4 font-medium text-brand-charcoal shadow-2xl">
          Loading inquiry form…
        </p>
      </div>
    );
  }

  return null;
}

export class InquiryModalLoadBoundary extends React.Component<
  {
    children: ReactNode;
    initialFabricId?: string;
    onClose: () => void;
    onRetry: () => void;
  },
  { error: Error | null; hasRetried: boolean }
> {
  state = { error: null, hasRetried: false };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  retry = () => {
    if (this.state.hasRetried) return;
    this.setState({ error: null, hasRetried: true });
    this.props.onRetry();
  };

  render() {
    if (this.state.error) {
      return (
        <InquiryModalLoading
          error={this.state.error}
          retry={this.state.hasRetried ? undefined : this.retry}
          onClose={this.props.onClose}
        />
      );
    }

    return this.props.children;
  }
}

const InquiryModal = dynamic(
  () =>
    import("@/components/ui/InquiryModal").then((module) => module.InquiryModal),
  { ssr: false, loading: InquiryModalLoading }
);

function createRetryableInquiryModal() {
  return dynamic(
    () =>
      import("@/components/ui/InquiryModal").then((module) => module.InquiryModal),
    { ssr: false, loading: InquiryModalLoading }
  );
}

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [ActiveInquiryModal, setActiveInquiryModal] = useState(() => InquiryModal);
  const [initialFabricId, setInitialFabricId] = useState<string | undefined>();
  const openInquiry = useCallback((fabricId?: string) => {
    setInitialFabricId(fabricId);
    setOpen(true);
  }, []);
  const closeInquiry = useCallback(() => {
    setOpen(false);
    setInitialFabricId(undefined);
  }, []);
  const retryInquiryModal = useCallback(() => {
    setActiveInquiryModal(() => createRetryableInquiryModal());
  }, []);

  const value = useMemo(
    () => ({ openInquiry, closeInquiry }),
    [openInquiry, closeInquiry]
  );

  return (
    <InquiryContext.Provider value={value}>
      <InquiryCartProvider>
        {children}
        <DeferredInquiryBarHost />
        <DeferredStickyInquiryBar />
        {open ? (
          <InquiryModalLoadBoundary
            initialFabricId={initialFabricId}
            onClose={closeInquiry}
            onRetry={retryInquiryModal}
          >
            <ActiveInquiryModal
              open
              onClose={closeInquiry}
              initialFabricId={initialFabricId}
            />
          </InquiryModalLoadBoundary>
        ) : null}
      </InquiryCartProvider>
    </InquiryContext.Provider>
  );
}

export function useInquiry() {
  const ctx = useContext(InquiryContext);
  if (!ctx) {
    throw new Error("useInquiry must be used within InquiryProvider");
  }
  return ctx;
}
