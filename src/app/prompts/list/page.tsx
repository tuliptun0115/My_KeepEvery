import React from 'react';
import { AnimatedClouds } from '@/components/AnimatedClouds';
import PromptListClient from './PromptListClient';
import { fetchPromptLibrary } from '@/lib/sheets';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '所有指令列表 - 指令寶庫',
  description: '搜尋、過濾並瀏覽所有可重複使用的 AI 提示詞範本。',
};

export default async function PromptsListPage() {
  const allPrompts = await fetchPromptLibrary();

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* 裝飾性背景元素 - 雲朵 */}
      <AnimatedClouds />
      <div className="sparkle sparkle-a" aria-hidden="true">✦</div>
      <div className="sparkle sparkle-b" aria-hidden="true">✦</div>

      <div className="shell" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <PromptListClient initialRecords={allPrompts} totalCount={allPrompts.length} />
      </div>
    </div>
  );
}
