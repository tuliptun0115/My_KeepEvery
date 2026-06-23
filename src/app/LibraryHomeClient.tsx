'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { LibraryRecordV2 } from '@/lib/sheets';
import { AddInspirationModal } from '@/components/AddInspirationModal';
import { EditInspirationModal } from '@/components/EditInspirationModal';

interface LibraryHomeClientProps {
  initialRecords: LibraryRecordV2[];
}

export default function LibraryHomeClient({ initialRecords }: LibraryHomeClientProps) {
  // 靈感資料 State
  const [records, setRecords] = useState<LibraryRecordV2[]>(initialRecords || []);

  // Modal 狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LibraryRecordV2 | null>(null);
  
  // Context Menu 狀態
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Toast 狀態
  const [toastMsg, setToastMsg] = useState('');

  const menuRef = useRef<HTMLDivElement | null>(null);

  // 調整 state 當 props 改變 (避免在 useEffect 內呼叫 setState)
  const [prevInitialRecords, setPrevInitialRecords] = useState(initialRecords);
  if (initialRecords !== prevInitialRecords) {
    setRecords(initialRecords || []);
    setPrevInitialRecords(initialRecords);
  }

  const orderedRecords = records;

  const handleEditSuccess = (updatedRecord: LibraryRecordV2) => {
    setRecords((prev) => prev.map((r) => r.id === updatedRecord.id ? updatedRecord : r));
    setToastMsg('📋 靈感已成功更新！');
    setTimeout(() => setToastMsg(''), 2000);
  };
  const HOME_LATEST_LIMIT = 10;
  
  // 取得最新 10 筆
  const latestRecords = orderedRecords.slice(0, HOME_LATEST_LIMIT);
  
  // 統計數據
  const highCount = orderedRecords.filter((item) => item.confidence_level === 'high').length;
  const partialCount = orderedRecords.filter((item) => item.parse_status === 'partial').length;
  const latestUpdate = orderedRecords.length > 0 ? orderedRecords[0].created_at : '無';

  // 點擊外部關閉 Context Menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }

    if (activeMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);

  // 不需要首頁過濾，直接顯示最新 10 筆

  const handleCopySummary = (summary: string) => {
    navigator.clipboard.writeText(summary)
      .then(() => {
        setToastMsg('📋 已成功複製摘要內容！');
        setActiveMenuId(null);
        setTimeout(() => setToastMsg(''), 2000);
      })
      .catch((err) => {
        console.error('複製失敗:', err);
      });
  };

  const handleDeletePrompt = () => {
    alert('🔐 本系統 Google Sheets 資料庫目前為唯讀狀態。\n若需刪除此筆記錄，請至 Google Sheets 試算表中進行編輯。');
    setActiveMenuId(null);
  };

  const summaryLabel = `目前顯示最新 ${latestRecords.length} / ${orderedRecords.length} 筆收藏。`;

  return (
    <main className="frame shell" style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Toast 提示通知 */}
      {toastMsg && (
        <div className="toast-notification">
          {toastMsg}
        </div>
      )}

      {/* SaaS 大標頭與功能按鈕 */}
      <section className="dashboard-header" style={{ padding: '24px 0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="dashboard-title" style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d2d2d' }}>首頁</h1>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
            讓每筆收藏能被快速理解、有效找回，並逐步累積成可再利用的個人內容資產。
          </p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="link-button accent-button"
            style={{ cursor: 'pointer' }}
          >
            ➕ 手動新增靈感
          </button>
          <a 
            href="https://docs.google.com/spreadsheets/d/1MvGR7l1gBAZRjCQr9VkVsePoL1qxS3DeZyguRJtj2U0/edit?gid=1533933858#gid=1533933858" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="link-button subtle-button"
          >
            📊 開啟試算表
          </a>
        </div>
      </section>

      {/* 橫向並排的 4 個 SaaS 數據統計卡，將卡片全部設為可點擊 */}
      <section className="stats-grid">
        <Link href="/list" className="stat-card link-card" title="查看所有靈感列表">
          <div className="stat-card-label">靈感總數</div>
          <div className="stat-card-value">{orderedRecords.length}</div>
          <div className="stat-card-trend trend-neutral">已成功清洗</div>
        </Link>
        <Link href="/list?confidence=high" className="stat-card link-card" title="篩選高品質內容">
          <div className="stat-card-label">高品質 AI 整理</div>
          <div className="stat-card-value">{highCount}</div>
          <div className="stat-card-trend trend-positive">高信心解析</div>
        </Link>
        <Link href="/list?parse_status=partial" className="stat-card link-card" title="篩選部分解析內容">
          <div className="stat-card-label">部分解析與歸檔</div>
          <div className="stat-card-value">{partialCount}</div>
          <div className="stat-card-trend trend-negative">等待手動補全</div>
        </Link>
        <div className="stat-card">
          <div className="stat-card-label">最新更新時間</div>
          <div className="stat-card-value-small" style={{ fontSize: '14px', fontWeight: '600', height: '40px', display: 'flex', alignItems: 'center' }}>
            {latestUpdate.split(' ')[0]}
          </div>
          <div className="stat-card-trend trend-neutral">最新紀錄</div>
        </div>
      </section>

      {/* 收藏結果表格區塊 */}
      <section className="results">
        <div className="section-head">
          <div className="section-title">最新收藏</div>
        </div>
        <div className="section-meta-row">
          <div className="section-subtitle">{summaryLabel}</div>
          <Link href="/list" className="text-action section-action section-action-large">
            看更多收藏
          </Link>
        </div>

        {/* 表格排版 (Table Layout) */}
        <div className="table-responsive">
          {latestRecords.length > 0 ? (
            <table className="inspiration-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }} className="rwd-hide"><input type="checkbox" disabled /></th>
                  <th style={{ width: '60px' }}>序號</th>
                  <th>摘要與原始標題</th>
                  <th style={{ width: '140px' }}>主題分類</th>
                  <th style={{ width: '140px' }}>用途分類</th>
                  <th style={{ width: '150px' }}>收藏時間</th>
                  <th style={{ width: '60px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {latestRecords.map((item, index) => {
                  const isMenuOpen = activeMenuId === item.id;
                  const hasUrl = !!item.source_url;

                  return (
                    <tr key={item.id}>
                      <td className="rwd-hide"><input type="checkbox" disabled /></td>
                      <td data-label="序號">
                        <span className="table-number">
                          {String(orderedRecords.length - index).padStart(2, '0')}
                        </span>
                      </td>
                      <td data-label="摘要與標題">
                        <div className="table-summary-cell">
                          <Link href={`/detail?id=${encodeURIComponent(item.id)}`} className="table-summary-link">
                            {item.summary}
                          </Link>
                        </div>
                        <div className="table-title-cell" title={item.source_title}>
                          {item.source_title}
                        </div>
                      </td>
                      <td data-label="主題分類">
                        <span className="badge-tag topic-tag">
                          {item.topic_category || '無'}
                        </span>
                      </td>
                      <td data-label="用途分類">
                        <span className="badge-tag usecase-tag">
                          {item.use_case || '無'}
                        </span>
                      </td>
                      <td data-label="收藏時間">
                        <span className="table-time">
                          {item.created_at.split(' ')[0]}
                        </span>
                      </td>
                      <td style={{ position: 'relative' }}>
                        <button
                          className="table-action-dots"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : item.id);
                          }}
                        >
                          •••
                        </button>
                        
                        {/* 浮動 Context Menu */}
                        {isMenuOpen && (
                          <div className="context-menu" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                            <Link href={`/detail?id=${encodeURIComponent(item.id)}`} className="context-menu-item">
                              👁️ 查看詳情
                            </Link>
                            {hasUrl ? (
                              <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="context-menu-item">
                                🔗 打開原文
                              </a>
                            ) : (
                              <span className="context-menu-item disabled" title="此筆收藏無外部連結">
                                🔗 無原文連結
                              </span>
                            )}
                            <button onClick={() => handleCopySummary(item.summary)} className="context-menu-item btn-menu">
                              📋 複製摘要
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRecord(item);
                                setIsEditModalOpen(true);
                                setActiveMenuId(null);
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty">
              暫無任何靈感收藏紀錄，請使用 LINE 或手動新增。
            </div>
          )}
        </div>
      </section>

      {/* 手動新增靈感 Modal */}
      <AddInspirationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* 編輯靈感 Modal */}
      <EditInspirationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={selectedRecord}
        onSuccess={handleEditSuccess}
      />
    </main>
  );
}
