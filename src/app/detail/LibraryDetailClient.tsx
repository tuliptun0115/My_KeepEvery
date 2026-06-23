'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LibraryRecordV2 } from '@/lib/sheets';
import { EditInspirationModal } from '@/components/EditInspirationModal';

interface LibraryDetailClientProps {
  initialRecords: LibraryRecordV2[];
}

// 標準年月日時分秒轉換函數
function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return dateStr;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

export default function LibraryDetailClient({ initialRecords }: LibraryDetailClientProps) {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // 靈感資料 State
  const [records, setRecords] = useState<LibraryRecordV2[]>(initialRecords || []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 調整 state 當 props 改變 (避免在 useEffect 內呼叫 setState)
  const [prevInitialRecords, setPrevInitialRecords] = useState(initialRecords);
  if (initialRecords !== prevInitialRecords) {
    setRecords(initialRecords || []);
    setPrevInitialRecords(initialRecords);
  }

  const handleEditSuccess = (updatedRecord: LibraryRecordV2) => {
    setRecords((prev) => prev.map((r) => r.id === updatedRecord.id ? updatedRecord : r));
    setToastMsg('📋 靈感已成功更新！');
    setTimeout(() => setToastMsg(''), 2000);
  };

  // 點擊外部關閉選單
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleCopySummary = (summary: string) => {
    navigator.clipboard.writeText(summary)
      .then(() => {
        setToastMsg('📋 已成功複製摘要內容！');
        setIsMenuOpen(false);
        setTimeout(() => setToastMsg(''), 2000);
      })
      .catch((err) => {
        console.error('複製失敗:', err);
      });
  };

  const handleDeletePrompt = () => {
    alert('🔐 本系統 Google Sheets 資料庫目前為唯讀狀態。\n若需刪除此筆記錄，請至 Google Sheets 試算表中進行編輯。');
    setIsMenuOpen(false);
  };

  const orderedRecords = records;
  
  // 決定顯示哪一筆 record
  let record: LibraryRecordV2 | undefined;
  if (!id) {
    record = orderedRecords[0];
  } else {
    record = orderedRecords.find((r) => r.id === id);
  }

  if (!record) {
    return (
      <main className="frame shell" style={{ position: 'relative', zIndex: 10 }}>
        <div className="detail-external-nav" style={{ justifyContent: 'flex-start' }}>
          <Link href="/list" className="ext-nav-link">
            ← 回列表頁
          </Link>
        </div>
        <div className="empty">找不到這筆收藏。</div>
      </main>
    );
  }

  // 計算上一筆/下一筆 (最新排最前，故上一筆為 index-1，下一筆為 index+1)
  const index = orderedRecords.findIndex((r) => r.id === record!.id);
  const prevRecord = index > 0 ? orderedRecords[index - 1] : null;
  const nextRecord = index < orderedRecords.length - 1 ? orderedRecords[index + 1] : null;
  const serial = String(orderedRecords.length - index).padStart(2, '0');

  return (
    <main className="frame shell" style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '24px 18px 44px' }}>
      
      {/* Toast 提示通知 */}
      {toastMsg && (
        <div className="toast-notification">
          {toastMsg}
        </div>
      )}

      {/* 內容區塊框框外的右上方輕量導航 */}
      <div className="detail-external-nav">
        <Link href="/list" className="ext-nav-link">
          ← 回列表頁
        </Link>
        {prevRecord && (
          <>
            <span className="ext-nav-divider">|</span>
            <Link href={`/detail?id=${encodeURIComponent(prevRecord.id)}`} className="ext-nav-link">
              上一筆
            </Link>
          </>
        )}
        {nextRecord && (
          <>
            <span className="ext-nav-divider">|</span>
            <Link href={`/detail?id=${encodeURIComponent(nextRecord.id)}`} className="ext-nav-link">
              下一筆
            </Link>
          </>
        )}
      </div>

      {/* 詳細內容卡片區 */}
      <section className="results" style={{ marginTop: '12px' }}>
        <article className="record" style={{ background: 'rgba(255, 255, 255, 0.94)' }}>
          <div className="record-top">
            <span className="record-number">{serial}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end', position: 'relative' }}>
              <span className="record-time">{formatDateTime(record.created_at)}</span>
              
              <button
                className="table-action-dots"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                style={{ cursor: 'pointer', padding: '4px 8px' }}
              >
                ••• 操作
              </button>

              {isMenuOpen && (
                <div className="context-menu" ref={menuRef} onClick={(e) => e.stopPropagation()} style={{ right: '0', top: '32px' }}>
                  {record.source_url ? (
                    <a href={record.source_url} target="_blank" rel="noopener noreferrer" className="context-menu-item">
                      🔗 打開原文
                    </a>
                  ) : (
                    <span className="context-menu-item disabled" title="此筆收藏無外部連結">
                      🔗 無原文連結
                    </span>
                  )}
                  <button onClick={() => handleCopySummary(record.summary)} className="context-menu-item btn-menu">
                    📋 複製摘要
                  </button>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="context-menu-item btn-menu"
                  >
                    ✏️ 編輯靈感
                  </button>
                  <button onClick={handleDeletePrompt} className="context-menu-item btn-menu text-danger">
                    ❌ 刪除收藏
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="summary" style={{ marginTop: '16px' }}>{record.summary}</div>
          
          <div className="meta-row" style={{ marginTop: '12px' }}>
            <span className="chip">{record.use_case}</span>
            <span className="chip topic">{record.topic_category}</span>
            <span className="chip topic" style={{ borderLeftColor: '#f3b0c3' }}>{record.source_platform}</span>
          </div>
          
          <div className="title" style={{ marginTop: '14px' }}>{record.source_title}</div>
          
          <div className="tags" style={{ marginTop: '14px' }}>
            {record.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag.replace('#', '')}
              </span>
            ))}
          </div>
          
          <div className="detail-panel" style={{ marginTop: '18px' }}>
            <div className="detail-label">2-3 個重點</div>
            <ul className="points" style={{ marginTop: '12px' }}>
              {record.key_points && record.key_points.length > 0 ? (
                record.key_points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))
              ) : (
                <li>暫無重點分析</li>
              )}
            </ul>
          </div>
          
          <div className="detail-panel" style={{ marginTop: '18px' }}>
            <div className="detail-label">原始內容</div>
            <p className="detail-full" style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
              {record.raw_input || '這筆收藏沒有額外原始文字。'}
            </p>
            {record.source_url && (
              <p className="detail-full" style={{ marginTop: '14px' }}>
                <a className="link-button" href={record.source_url} target="_blank" rel="noreferrer">
                  查看來源
                </a>
              </p>
            )}
          </div>
        </article>
      </section>

      {/* 編輯靈感 Modal */}
      <EditInspirationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={record}
        onSuccess={handleEditSuccess}
      />
    </main>
  );
}
