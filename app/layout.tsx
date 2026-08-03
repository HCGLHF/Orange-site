import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { InquiryProvider } from "@/components/InquiryProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import { AnalyticsConsentProvider } from "@/components/analytics/AnalyticsConsentProvider";
import { AnalyticsRouteTracker } from "@/components/analytics/AnalyticsRouteTracker";
import { buildAnalyticsHeadScript, buildGtmBootstrap } from "@/lib/analytics/bootstrap";
import { getGtmContainerId } from "@/lib/analytics/config";
import { SEO_SITE_ORIGIN } from "@/lib/seo/site-seo";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(SEO_SITE_ORIGIN),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmContainerId = getGtmContainerId();

  return (
    <html lang="en">
      <head>
        <script
          id="analytics-consent-default"
          dangerouslySetInnerHTML={{ __html: buildAnalyticsHeadScript() }}
        />
        {gtmContainerId ? (
          <script
            id="google-tag-manager"
            dangerouslySetInnerHTML={{ __html: buildGtmBootstrap(gtmContainerId) }}
          />
        ) : null}
      </head>
      <body className={`${spaceGrotesk.variable} antialiased bg-gray-50`}>
        {gtmContainerId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmContainerId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <AnalyticsConsentProvider>
          <AnalyticsRouteTracker />
          <LocaleProvider>
            <InquiryProvider>
              <AppShell>{children}</AppShell>
            </InquiryProvider>
          </LocaleProvider>
        </AnalyticsConsentProvider>
      </body>
    </html>
  );
}
