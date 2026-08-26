"use client";

import type { ReactNode } from "react";
import { useInquiryCart } from "@/components/InquiryCartProvider";
import { useInquiry } from "@/components/InquiryProvider";
import { OPEN_BATCH_INQUIRY_EVENT } from "@/lib/inquiry-events";

type RequestQuoteButtonProps = {
  children: ReactNode;
  className?: string;
  onBeforeOpen?: () => void;
};

export function RequestQuoteButton({
  children,
  className,
  onBeforeOpen,
}: RequestQuoteButtonProps) {
  const { totalCount } = useInquiryCart();
  const { openInquiry } = useInquiry();

  const handleClick = () => {
    onBeforeOpen?.();

    if (totalCount > 0) {
      window.dispatchEvent(new Event(OPEN_BATCH_INQUIRY_EVENT));
      return;
    }

    openInquiry();
  };

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
