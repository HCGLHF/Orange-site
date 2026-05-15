"use client";

import { useLocale } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { useInquiry } from "@/components/InquiryProvider";

type SampleRequestCtaProps = {
  label?: string;
  className?: string;
};

export function SampleRequestCta({
  label,
  className = "mt-10",
}: SampleRequestCtaProps) {
  const { openInquiry } = useInquiry();
  const { t } = useLocale();

  return (
    <Button type="button" className={className} onClick={openInquiry}>
      {label ?? t("ctaButton")}
    </Button>
  );
}
