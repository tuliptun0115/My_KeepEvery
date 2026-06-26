import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./library.css";
import { Sidebar } from "@/components/Sidebar";
import { fetchFromLibraryV2 } from "@/lib/sheets";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "靈感收藏庫 - 概覽控制台",
  description: "一款專為靈感與知識打造的輕量化收藏工具",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22 fill=%22%232d2d2d%22>✦</text></svg>",
    apple: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22 fill=%22%232d2d2d%22>✦</text></svg>",
  },
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 全站 Server-side 撈取主題，以動態渲染常駐側邊欄
  const records = await fetchFromLibraryV2();
  const topicCategories = Array.from(
    new Set(records.map((r) => r.topic_category).filter(Boolean))
  );

  return (
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex overflow-hidden bg-[#fafafa]">
        <Sidebar topicCategories={topicCategories} totalCount={records.length} />
        <div className="main-content flex-1 overflow-y-auto min-w-0 relative">
          {children}
        </div>
      </body>
    </html>
  );
}
