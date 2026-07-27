"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import StickyInquiryBar from "@/components/StickyInquiryBar";
import { InquiryCartProvider } from "@/components/InquiryCartProvider";
import { InquiryModal } from "@/components/ui/InquiryModal";

type InquiryContextValue = {
  openInquiry: (initialFabricId?: string) => void;
  closeInquiry: () => void;
};

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialFabricId, setInitialFabricId] = useState<string | undefined>();
  const openInquiry = useCallback((fabricId?: string) => {
    setInitialFabricId(fabricId);
    setOpen(true);
  }, []);
  const closeInquiry = useCallback(() => {
    setOpen(false);
    setInitialFabricId(undefined);
  }, []);

  const value = useMemo(
    () => ({ openInquiry, closeInquiry }),
    [openInquiry, closeInquiry]
  );

  return (
    <InquiryContext.Provider value={value}>
      <InquiryCartProvider>
        {children}
        <StickyInquiryBar />
        <InquiryModal
          open={open}
          onClose={closeInquiry}
          initialFabricId={initialFabricId}
        />
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
