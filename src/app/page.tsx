import React from 'react';
import { Cloud, Sparkles } from 'lucide-react';
import { fetchFromSheet } from '@/lib/sheets';
import InspirationGrid from '@/components/InspirationGrid';
import { AnimatedClouds } from '@/components/AnimatedClouds';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // 在伺服器端抓取資料，並套用 revalidate: 60 (定義在 fetchFromSheet)
  const inspirations = await fetchFromSheet();

  return (
    <div className="min-h-screen bg-[#FFF0F3] bg-gradient-to-b from-[#FFE4E9] to-white text-[#4A4A4A] font-sans p-6 md:p-12 relative overflow-hidden">
      
      {/* 裝飾性背景元素 - 雲朵 (提取至獨立客戶端元件以保持動畫) */}
      <AnimatedClouds />

      {/* 裝飾性花瓣/星星 */}
      <Sparkles className="absolute bottom-32 left-8 md:bottom-20 md:left-20 text-[#FFD700] opacity-50 animate-pulse hidden sm:block" size={32} />
      <div className="absolute bottom-32 right-8 md:bottom-10 md:right-10 hidden sm:flex gap-2">
        <div className="w-8 h-8 rounded-full bg-[#FFB6C1] border-2 border-[#4A4A4A] shadow-[4px_4px_0px_#4A4A4A]" />
        <div className="w-8 h-8 rounded-full bg-[#B2F5EA] border-2 border-[#4A4A4A] shadow-[4px_4px_0px_#4A4A4A]" />
      </div>

      <InspirationGrid initialData={inspirations} />
    </div>
  );
}
