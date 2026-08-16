"use client";

import dynamic from "next/dynamic";
import { useInquiryCart } from "@/components/InquiryCartProvider";

const StickyInquiryBar = dynamic(
  () => import("@/components/StickyInquiryBar"),
  { ssr: false }
);

export function DeferredStickyInquiryBar() {
  const { totalCount } = useInquiryCart();

  return totalCount > 0 ? <StickyInquiryBar /> : null;
}
