"use client";

import { useLocale } from "@/components/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { useInquiry } from "@/components/InquiryProvider";

export function SampleRequestCta() {
  const { openInquiry } = useInquiry();
  const { t } = useLocale();

  return (
    <Button type="button" className="mt-10" onClick={openInquiry}>
      {t("ctaButton")}
    </Button>
  );
}
