import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Poochandi Official | Parenting Tips & Custom Child Requests",
  description: "Official portal of Poochandi.in and Poochandi Varaan. Submit child name requests, watch trending reels, and read modern parenting tips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;
  const adsenseEnabled = !!adsenseClient && adsenseClient !== 'ca-pub-0000000000000000' && adsenseClient !== 'ca-pub-XXXXXXXXXXXXXXXX';

  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-[#0b051b] text-slate-100`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-37K1D73DXL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-37K1D73DXL');
          `}
        </Script>
        {adsenseEnabled ? (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
        {children}
      </body>
    </html>
  );
}
