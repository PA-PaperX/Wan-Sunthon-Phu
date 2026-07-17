import type { Metadata } from "next";
import "./globals.css";

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
      className={`h-full antialiased`}
    >
      <head>
        <link rel="preload" as="video" href="/videos/win_normal.mp4" type="video/mp4" />
        <link rel="preload" as="video" href="/videos/lose_normal.mp4" type="video/mp4" />
        <link rel="preload" as="font" href="/fonts/TorsilpThamnganMangThoe.ttf" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
