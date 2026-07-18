import type { Metadata } from "next";
import { Sriracha } from "next/font/google";
import "./globals.css";

const sriracha = Sriracha({
  weight: "400",
  subsets: ["latin", "thai"],
  variable: "--font-sriracha",
});

export const metadata: Metadata = {
  title: "วันภาษาไทยแห่งชาติ",
  description: "แบบทดสอบคำผิด-คำถูก วันภาษาไทยแห่งชาติ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`h-full antialiased ${sriracha.variable}`}
    >
      <head>
        <link rel="preload" as="video" href="/videos/win_normal.mp4" type="video/mp4" />
        <link rel="preload" as="video" href="/videos/lose_normal.mp4" type="video/mp4" />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
