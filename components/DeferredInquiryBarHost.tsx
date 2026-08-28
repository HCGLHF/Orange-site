"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  getOpenBatchInquiryOpener,
  OPEN_BATCH_INQUIRY_EVENT,
} from "@/lib/inquiry-events";

const InquiryBar = dynamic(
  () => import("@/components/InquiryBar").then((module) => module.InquiryBar),
  { ssr: false },
);

type InitialOpenRequest = {
  opener: HTMLElement | null;
};

export function DeferredInquiryBarHost() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [initialRequest, setInitialRequest] = useState<InitialOpenRequest | null>(
    null,
  );
  const [inquiryBarListening, setInquiryBarListening] = useState(false);
  const inquiryBarListeningRef = useRef(false);

  useEffect(() => {
    if (inquiryBarListening) return;

    const handleOpen = (event: Event) => {
      if (inquiryBarListeningRef.current) return;
      setInitialRequest({ opener: getOpenBatchInquiryOpener(event) });
      setShouldLoad(true);
    };

    window.addEventListener(OPEN_BATCH_INQUIRY_EVENT, handleOpen);
    return () => {
      window.removeEventListener(OPEN_BATCH_INQUIRY_EVENT, handleOpen);
    };
  }, [inquiryBarListening]);

  const handleInquiryBarListening = useCallback(() => {
    inquiryBarListeningRef.current = true;
    setInquiryBarListening(true);
    setInitialRequest(null);
  }, []);

  return shouldLoad ? (
    <InquiryBar
      initiallyOpen={initialRequest !== null}
      initialOpener={initialRequest?.opener ?? null}
      onOpenListenerReady={handleInquiryBarListening}
    />
  ) : null;
}
