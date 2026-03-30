import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { InquiryProvider } from "@/components/InquiryProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "O'range Textile | 绍兴诗橙纺织品贸易公司",
  description: "Soft Touch from Shaoxing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <LocaleProvider>
          <InquiryProvider>{children}</InquiryProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
