import React from 'react';
import { fetchFromLibraryV2 } from '@/lib/sheets';
import { AnimatedClouds } from '@/components/AnimatedClouds';
import LibraryDetailClient from './LibraryDetailClient';

export const dynamic = 'force-dynamic';

export default async function LibraryDetail() {
  // 在伺服器端撈取新版 V2 資料
  const records = await fetchFromLibraryV2();

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* 裝飾性背景元素 - 雲朵 */}
      <AnimatedClouds />
      <div className="sparkle sparkle-a" aria-hidden="true">✦</div>
      <div className="sparkle sparkle-b" aria-hidden="true">✦</div>

      <React.Suspense fallback={<div className="shell empty">正在載入詳細內容...</div>}>
        <LibraryDetailClient initialRecords={records} />
      </React.Suspense>
    </div>
  );
}
