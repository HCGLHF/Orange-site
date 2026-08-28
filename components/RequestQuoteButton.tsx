"use client";

import type { ButtonHTMLAttributes } from "react";
import { useInquiryCart } from "@/components/InquiryCartProvider";
import { useInquiry } from "@/components/InquiryProvider";
import { dispatchOpenBatchInquiry } from "@/lib/inquiry-events";

type RequestQuoteButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "type"
> & {
  onBeforeOpen?: () => void;
};

export function RequestQuoteButton({
  children,
  className,
  onBeforeOpen,
  ...buttonProps
}: RequestQuoteButtonProps) {
  const { totalCount } = useInquiryCart();
  const { openInquiry } = useInquiry();

  const handleClick = () => {
    onBeforeOpen?.();

    if (totalCount > 0) {
      const activeElement = document.activeElement;
      dispatchOpenBatchInquiry(
        activeElement instanceof HTMLElement ? activeElement : undefined,
      );
      return;
    }

    openInquiry();
  };

  return (
    <button
      type="button"
      {...buttonProps}
      className={className}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
