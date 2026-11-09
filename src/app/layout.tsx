import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poochandi Official | Parenting Tips & Custom Child Requests",
  description: "Official portal of Poochandi.in and Poochandi Varaan. Submit child name requests, watch trending reels, and read modern parenting tips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0b051b] text-slate-100">
        {children}
      </body>
    </html>
  );
}
