import React from 'react';
import { AnimatedClouds } from '@/components/AnimatedClouds';
import PromptListClient from './PromptListClient';
import { fetchPromptLibrary } from '@/lib/sheets';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '指令寶庫 - 提示詞範本管理',
  description: '收納可重複使用的 AI 提示詞範本。支援關鍵字搜尋、一鍵複製與即時編輯修改。',
};

export default async function PromptsPage() {
  const allPrompts = await fetchPromptLibrary();
  // 首頁僅顯示最新 5 筆
  const latestPrompts = allPrompts.slice(0, 5);

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* 裝飾性背景元素 - 雲朵 */}
      <AnimatedClouds />
      <div className="sparkle sparkle-a" aria-hidden="true">✦</div>
      <div className="sparkle sparkle-b" aria-hidden="true">✦</div>

      <div className="shell" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <PromptListClient initialRecords={latestPrompts} totalCount={allPrompts.length} />
      </div>
    </div>
  );
}
