import React from 'react';
import { AnimatedClouds } from '@/components/AnimatedClouds';
import PromptDetailClient from './PromptDetailClient';
import { fetchPromptLibrary } from '@/lib/sheets';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '指令詳情 - 提示詞範本管理',
  description: '閱讀與管理該 Prompt 詳細資訊，可直接點擊複製或對其進行編輯修改。',
};

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function PromptDetailPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const allRecords = await fetchPromptLibrary();

  const index = id ? allRecords.findIndex((p) => p.id === id) : 0;
  const currentRecord = index !== -1 ? allRecords[index] : (allRecords[0] ?? null);
  const prevPrompt = currentRecord && index < allRecords.length - 1 ? allRecords[index + 1] : null;
  const nextPrompt = currentRecord && index > 0 ? allRecords[index - 1] : null;
  const serial = currentRecord ? String(allRecords.length - index).padStart(2, '0') : '00';

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* 裝飾性背景元素 - 雲朵 */}
      <AnimatedClouds />
      <div className="sparkle sparkle-a" aria-hidden="true">✦</div>
      <div className="sparkle sparkle-b" aria-hidden="true">✦</div>

      <div className="shell" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <PromptDetailClient
          currentRecord={currentRecord}
          prevPrompt={prevPrompt}
          nextPrompt={nextPrompt}
          serial={serial}
        />
      </div>
    </div>
  );
}
