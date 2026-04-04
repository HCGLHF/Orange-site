import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { AppShell } from "@/components/AppShell";
import { InquiryProvider } from "@/components/InquiryProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
const GA_ID = "G-LXGZLVJXNP";

export const metadata: Metadata = {
  title: "O'range Textile | 绍兴诗橙纺织品有限公司",
  description: "绍兴诗橙纺织品有限公司 | Soft Touch from Shaoxing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${spaceGrotesk.variable} antialiased bg-gray-50`}>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>
        <LocaleProvider>
          <InquiryProvider>
            <AppShell>{children}</AppShell>
          </InquiryProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
