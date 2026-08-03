"use client";

import Link from "next/link";
import React, { type RefObject } from "react";

type AnalyticsConsentBannerProps = {
  error: boolean;
  headingRef: RefObject<HTMLHeadingElement>;
  onAccept: () => void;
  onDecline: () => void;
};

export function AnalyticsConsentBanner({
  error,
  headingRef,
  onAccept,
  onDecline,
}: AnalyticsConsentBannerProps) {
  return (
    <section
      aria-label="Analytics privacy choices"
      className="fixed inset-x-0 bottom-0 z-[120] max-h-[100dvh] overflow-y-auto border-t border-white/15 bg-[#24252a] text-white"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 lg:min-h-40 lg:flex-row lg:items-center lg:justify-between lg:gap-9 lg:px-8 lg:py-6">
        <div className="max-w-4xl">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-xs font-bold uppercase tracking-[0.16em] text-[#f0987e] outline-none"
          >
            Privacy &amp; analytics
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/90 sm:text-[15px]">
            We use basic cookieless measurement by default. Accepting enables analytics cookies
            for more complete traffic and conversion reporting. You can change your choice at any
            time through Privacy settings in the footer. Read our{" "}
            <Link href="/terms" className="underline underline-offset-4">
              terms
            </Link>
            .
          </p>
          {error ? (
            <p role="alert" className="mt-3 text-sm font-medium text-[#ffd5ca]">
              We could not save your analytics choice in this browser. Analytics cookies remain
              off; please try again.
            </p>
          ) : null}
        </div>

        <div className="grid shrink-0 grid-cols-1 gap-2.5 sm:grid-cols-2">
          <button
            type="button"
            aria-label="Decline analytics cookies"
            onClick={onDecline}
            className="min-h-12 min-w-32 rounded-lg border border-white bg-transparent px-6 font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0987e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#24252a]"
          >
            Decline
          </button>
          <button
            type="button"
            aria-label="Accept analytics cookies"
            onClick={onAccept}
            className="min-h-12 min-w-32 rounded-lg border border-white bg-white px-6 font-semibold text-[#24252a] hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0987e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#24252a]"
          >
            Accept
          </button>
        </div>
      </div>
    </section>
  );
}
