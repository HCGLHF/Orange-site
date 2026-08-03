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
      className="fixed inset-x-0 bottom-0 z-[100] max-h-[100dvh] overflow-y-auto bg-[#24252a] pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 text-white shadow-[0_-8px_30px_rgba(0,0,0,0.2)]"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-8">
        <div className="min-w-0 max-w-4xl">
          <h2 ref={headingRef} tabIndex={-1} className="text-lg font-bold outline-none">
            Privacy &amp; analytics
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/85">
            We use basic cookieless measurement by default. Accepting enables analytics cookies
            for more complete traffic and conversion reporting. You can change your choice at any
            time through Privacy settings in the footer. Read our{" "}
            <Link
              href="/terms"
              className="font-semibold text-white underline decoration-white/70 underline-offset-4 outline-none hover:decoration-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#24252a]"
            >
              terms
            </Link>
            .
          </p>
          {error ? (
            <p role="alert" className="mt-2 text-sm font-semibold text-white">
              We could not save your analytics choice in this browser. Analytics cookies remain
              off; please try again.
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:justify-end">
          <button
            type="button"
            aria-label="Decline analytics cookies"
            onClick={onDecline}
            className="inline-flex min-h-12 items-center justify-center border border-white bg-transparent px-6 py-3 text-sm font-bold text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#24252a] motion-reduce:transition-none"
          >
            Decline
          </button>
          <button
            type="button"
            aria-label="Accept analytics cookies"
            onClick={onAccept}
            className="inline-flex min-h-12 items-center justify-center border border-white bg-white px-6 py-3 text-sm font-bold text-[#24252a] outline-none transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#24252a] motion-reduce:transition-none"
          >
            Accept
          </button>
        </div>
      </div>
    </section>
  );
}
