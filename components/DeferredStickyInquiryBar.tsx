"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useInquiryCart } from "@/components/InquiryCartProvider";

const StickyInquiryBar = dynamic(
  () => import("@/components/StickyInquiryBar"),
  { ssr: false }
);

export function DeferredStickyInquiryBar() {
  const { totalCount } = useInquiryCart();
  const pathname = usePathname();

  // Collections has inline selection review and the global header cart.
  return totalCount > 0 && pathname !== "/fabrics" ? <StickyInquiryBar /> : null;
}
