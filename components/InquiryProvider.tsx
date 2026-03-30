"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { InquiryModal } from "@/components/ui/InquiryModal";

type InquiryContextValue = {
  openInquiry: () => void;
  closeInquiry: () => void;
};

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openInquiry = useCallback(() => setOpen(true), []);
  const closeInquiry = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openInquiry, closeInquiry }),
    [openInquiry, closeInquiry]
  );

  return (
    <InquiryContext.Provider value={value}>
      {children}
      <InquiryModal open={open} onClose={closeInquiry} />
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
