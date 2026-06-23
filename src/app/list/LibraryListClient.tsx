'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { LibraryRecordV2 } from '@/lib/sheets';
import { AddInspirationModal } from '@/components/AddInspirationModal';
import { EditInspirationModal } from '@/components/EditInspirationModal';

interface LibraryListClientProps {
  initialRecords: LibraryRecordV2[];
}

export default function LibraryListClient({ initialRecords }: LibraryListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 靈感資料 State
  const [records, setRecords] = useState<LibraryRecordV2[]>(initialRecords || []);

  // 取得 URL 初始參數
  const initKeyword = searchParams.get('keyword') || '';
  const initUseCase = searchParams.get('use_case') || '全部用途';
  const initTopic = searchParams.get('topic') || '全部主題';
  const initSort = searchParams.get('sort') || 'latest';
  const initPlatform = searchParams.get('platform') || '全部來源';
  const initConfidence = searchParams.get('confidence') || '全部信心';
  const initParseStatus = searchParams.get('parse_status') || '全部狀態';
  const initTime = searchParams.get('time') || '全部時間';
  const initPage = parseInt(searchParams.get('page') || '1', 10);

  // React States
  const [keyword, setKeyword] = useState(initKeyword);
  const [useCase, setUseCase] = useState(initUseCase);
  const [topic, setTopic] = useState(initTopic);
  const [sort, setSort] = useState(initSort);
  const [platform, setPlatform] = useState(initPlatform);
  const [confidence, setConfidence] = useState(initConfidence);
  const [parseStatus, setParseStatus] = useState(initParseStatus);
  const [time, setTime] = useState(initTime);
  const [page, setPage] = useState(initPage);

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
  const ITEMS_PER_PAGE = 10;

  const handleEditSuccess = (updatedRecord: LibraryRecordV2) => {
    setRecords((prev) => prev.map((r) => r.id === updatedRecord.id ? updatedRecord : r));
    setToastMsg('📋 靈感已成功更新！');
    setTimeout(() => setToastMsg(''), 2000);
  };

  // 當 URL 參數變動時同步狀態
  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setUseCase(searchParams.get('use_case') || '全部用途');
    setTopic(searchParams.get('topic') || '全部主題');
    setSort(searchParams.get('sort') || 'latest');
    setPlatform(searchParams.get('platform') || '全部來源');
    setConfidence(searchParams.get('confidence') || '全部信心');
    setParseStatus(searchParams.get('parse_status') || '全部狀態');
    setTime(searchParams.get('time') || '全部時間');
    setPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

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

  // 動態篩選清單
  const useCaseOptions = Array.from(new Set(orderedRecords.map((r) => r.use_case).filter(Boolean)));

  // 清除條件
  const handleClearFilters = () => {
    setKeyword('');
    setUseCase('全部用途');
    setTopic('全部主題');
    setSort('latest');
    setPlatform('全部來源');
    setConfidence('全部信心');
    setParseStatus('全部狀態');
    setTime('全部時間');
    setPage(1);
    router.replace('/list');
  };

  // 同步狀態至 URL 參數
  const updateUrl = (updates: Record<string, string | number>) => {
    const nextParams = new URLSearchParams();
    
    // 目前最新 state 合併 updates
    const current = {
      keyword,
      useCase,
      topic,
      sort,
      platform,
      confidence,
      parseStatus,
      time,
      page,
      ...updates
    };

    if (current.keyword.trim()) nextParams.set('keyword', current.keyword.trim());
    if (current.useCase !== '全部用途') nextParams.set('use_case', current.useCase);
    if (current.topic !== '全部主題') nextParams.set('topic', current.topic);
    if (current.sort !== 'latest') nextParams.set('sort', current.sort);
    if (current.platform !== '全部來源') nextParams.set('platform', current.platform);
    if (current.confidence !== '全部信心') nextParams.set('confidence', current.confidence);
    if (current.parseStatus !== '全部狀態') nextParams.set('parse_status', current.parseStatus);
    if (current.time !== '全部時間') nextParams.set('time', current.time);
    if (current.page > 1) nextParams.set('page', String(current.page));

    const query = nextParams.toString();
    router.replace(query ? `/list?${query}` : '/list');
  };

  // 時間範圍篩選邏輯 (相對於最新一筆的時間)
  const isWithinTimeRange = (item: LibraryRecordV2) => {
    if (time === '全部時間') return true;
    if (orderedRecords.length === 0) return true;

    try {
      const formatTime = (t: string) => t.replace(/\//g, '-').replace(' ', 'T');
      const recordDate = new Date(formatTime(item.created_at));
      const latestDate = new Date(formatTime(orderedRecords[0].created_at));
      
      const diffMs = latestDate.getTime() - recordDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (time === '最近 3 天') return diffDays <= 3;
      if (time === '最近 7 天') return diffDays <= 7;
    } catch {
      // ignore
    }
    return true;
  };

  // 1. 執行過濾
  const filtered = orderedRecords.filter((item) => {
    const searchString = [
      item.summary,
      item.source_title,
      ...(item.tags || []),
      ...(item.key_points || []),
      item.use_case,
      item.topic_category
    ]
      .join(' ')
      .toLowerCase();

    const hitKeyword = !keyword.trim() || searchString.includes(keyword.trim().toLowerCase());
    const hitUseCase = useCase === '全部用途' || item.use_case === useCase;
    const hitTopic = topic === '全部主題' || item.topic_category === topic;
    const hitPlatform = platform === '全部來源' || item.source_platform === platform;
    const hitConfidence = confidence === '全部信心' || item.confidence_level === confidence;
    const hitParseStatus = parseStatus === '全部狀態' || item.parse_status === parseStatus;
    const hitTime = isWithinTimeRange(item);

    return hitKeyword && hitUseCase && hitTopic && hitPlatform && hitConfidence && hitParseStatus && hitTime;
  });

  // 2. 執行排序
  const sorted = [...filtered];
  if (sort === 'oldest') {
    sorted.reverse();
  } else if (sort === 'high_confidence') {
    const rank: Record<string, number> = { high: 0, medium: 1, low: 2 };
    sorted.sort((a, b) => {
      const aLevel = rank[a.confidence_level] !== undefined ? rank[a.confidence_level] : 9;
      const bLevel = rank[b.confidence_level] !== undefined ? rank[b.confidence_level] : 9;
      const byConfidence = aLevel - bLevel;
      return byConfidence !== 0 ? byConfidence : b.created_at.localeCompare(a.created_at);
    });
  }

  // 3. 處理分頁
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const safePage = Math.min(Math.max(1, page), totalPages || 1);
  const startOffset = (safePage - 1) * ITEMS_PER_PAGE;
  const pageRecords = sorted.slice(startOffset, startOffset + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl({ page: newPage });
  };

  const handleFilterChange = (field: string, val: string) => {
    const updates: Record<string, string | number> = { page: 1 };
    
    if (field === 'keyword') {
      setKeyword(val);
      updates.keyword = val;
    } else if (field === 'useCase') {
      setUseCase(val);
      updates.useCase = val;
    }

    updateUrl(updates);
  };

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

  // 生成過濾狀態提示文字
  const activeFilters = [
    keyword.trim() ? `關鍵字「${keyword.trim()}」` : '',
    useCase !== '全部用途' ? `用途「${useCase}」` : '',
    confidence !== '全部信心' ? `信心「${confidence}」` : '',
    parseStatus !== '全部狀態' ? `狀態「${parseStatus}」` : ''
  ].filter(Boolean);

  const filterSummary = activeFilters.length
    ? `找到 ${sorted.length} 筆符合 ${activeFilters.join('、')} 條件的收藏。`
    : `共 ${sorted.length} 筆收藏。`;

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
          <h1 className="dashboard-title" style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d2d2d' }}>所有靈感列表</h1>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
            在此搜尋並多重過濾篩選您收藏的靈感與筆記。
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
        </div>
      </section>

      {/* 搜尋與過濾工具列（簡化為與首頁一致，只保留關鍵字 + 用途） */}
      <section className="notice toolbar-panel" style={{ marginTop: '16px' }}>
        <div className="toolbar-row toolbar-home-row">
          <div className="search toolbar-search" style={{ flex: '1' }}>
            <input
              type="search"
              placeholder="搜尋摘要、標題、標籤或重點"
              value={keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={useCase}
            onChange={(e) => handleFilterChange('useCase', e.target.value)}
          >
            <option value="全部用途">全部用途</option>
            {useCaseOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button onClick={handleClearFilters} className="text-action section-action" style={{ marginLeft: '12px' }}>
            清除條件
          </button>
        </div>
      </section>

      {/* 搜尋結果數量 */}
      <section className="results" style={{ marginTop: '24px' }}>
        <div className="section-meta-row" style={{ marginBottom: '16px' }}>
          <div className="section-subtitle toolbar-result">
            {filterSummary} 當前顯示第 {safePage} / {totalPages || 1} 頁。
          </div>
        </div>

        {/* 表格化呈現列表 (Table Layout) */}
        <div className="table-responsive">
          {pageRecords.length > 0 ? (
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
                {pageRecords.map((item) => {
                  const dbIndex = initialRecords.findIndex(r => r.id === item.id);
                  const displaySerial = dbIndex !== -1 ? initialRecords.length - dbIndex : 1;
                  const isMenuOpen = activeMenuId === item.id;
                  const hasUrl = !!item.source_url;

                  return (
                    <tr key={item.id}>
                      <td className="rwd-hide"><input type="checkbox" disabled /></td>
                      <td data-label="序號">
                        <span className="table-number">
                          {String(displaySerial).padStart(2, '0')}
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
              沒有找到符合當前篩選條件的靈感收藏，請試試調整您的關鍵字或過濾條件。
            </div>
          )}
        </div>

        {/* 分頁器 */}
        {totalPages > 1 && (
          <div className="pagination" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => handlePageChange(1)}
              disabled={safePage === 1}
              className={`pager-link ${safePage === 1 ? 'faux-button' : ''}`}
              style={{ opacity: safePage === 1 ? 0.5 : 1, padding: '11px 12px' }}
              title="回到第一頁"
            >
              « 最前頁
            </button>
            <button
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage === 1}
              className={`pager-link ${safePage === 1 ? 'faux-button' : ''}`}
              style={{ opacity: safePage === 1 ? 0.5 : 1, padding: '11px 12px' }}
            >
              ‹ 上一頁
            </button>
            <span className="page-state" style={{ margin: '0 8px' }}>
              第 {safePage} / {totalPages} 頁
            </span>
            <button
              onClick={() => handlePageChange(safePage + 1)}
              disabled={safePage === totalPages}
              className={`pager-link ${safePage === totalPages ? 'faux-button' : ''}`}
              style={{ opacity: safePage === totalPages ? 0.5 : 1, padding: '11px 12px' }}
            >
              下一頁 ›
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={safePage === totalPages}
              className={`pager-link ${safePage === totalPages ? 'faux-button' : ''}`}
              style={{ opacity: safePage === totalPages ? 0.5 : 1, padding: '11px 12px' }}
              title="前往最後一頁"
            >
              最後頁 »
            </button>
          </div>
        )}
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
