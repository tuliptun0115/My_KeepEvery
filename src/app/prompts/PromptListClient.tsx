'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PromptRecord } from '@/lib/sheets';
// PROMPT_CATEGORIES not needed on home page
import { AddPromptModal } from '@/components/AddPromptModal';
import { EditPromptModal } from '@/components/EditPromptModal';

interface PromptListClientProps {
  initialRecords: PromptRecord[];
  totalCount: number;
}

export default function PromptListClient({ initialRecords, totalCount }: PromptListClientProps) {
  const [records, setRecords] = useState<PromptRecord[]>(initialRecords);
  const [toastMsg, setToastMsg] = useState('');

  // Context Menu 狀態
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptRecord | null>(null);

  // 點擊外部關閉 Context Menu
  const handleMenuToggle = (id: string) => {
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  const totalFromServer = totalCount;
  const lineCount = records.filter((r) => r.source_type === 'line').length;
  const webCount = records.filter((r) => r.source_type === 'web').length;

  const handleAddSuccess = (newPrompt: PromptRecord) => {
    setRecords((prev) => [newPrompt, ...prev]);
    showToast('💡 新指令已成功建立！');
  };

  const handleEditSuccess = (updatedPrompt: PromptRecord) => {
    setRecords((prev) => prev.map((r) => r.id === updatedPrompt.id ? updatedPrompt : r));
    showToast('✏️ 指令修改已儲存！');
  };

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text)
      .then(() => showToast('📋 指令已成功複製到剪貼簿！'))
      .catch((err) => {
        console.error(err);
        showToast('❌ 複製失敗，請手動複製');
      });
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleEditClick = (prompt: PromptRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPrompt(prompt);
    setIsEditOpen(true);
  };

  return (
    <>
      {/* SaaS 大標頭與功能按鈕 */}
      <section className="dashboard-header" style={{ padding: '24px 0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 10 }}>
        <div>
          <h1 className="dashboard-title" style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d2d2d' }}>指令寶庫</h1>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '4px', marginBottom: 0 }}>
            收納可重複使用的 AI 提示詞範本。此處僅顯示最新 5 筆收藏。
          </p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
          <button className="link-button accent-button" onClick={() => setIsAddOpen(true)} style={{ margin: 0, padding: '10px 16px', fontSize: '13px' }}>
            ＋ 新增指令
          </button>
        </div>
      </section>

      {/* 數據統計列 */}
      <div className="hero-stats" style={{ marginTop: '8px', marginBottom: '16px', position: 'relative', zIndex: 10 }}>
        <span>✦ 總指令數: <strong>{totalFromServer}</strong> 筆</span>
        <span>✦ LINE 同步: <strong>{lineCount}</strong> 筆</span>
        <span>✦ 網頁新增: <strong>{webCount}</strong> 筆</span>
      </div>

      {/* 搜尋結果與查看更多 */}
      <section className="notice toolbar-meta-panel" style={{ marginTop: '16px', padding: '12px 16px' }}>
        <div className="toolbar-row toolbar-summary-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="toolbar-result" style={{ fontWeight: '600' }}>
            目前顯示最新 {records.length} / {totalFromServer} 筆指令。
          </div>
          <Link href="/prompts/list" className="text-action search-all-link" style={{ fontSize: '13px', textDecoration: 'none' }}>
            看更多指令 →
          </Link>
        </div>
      </section>

      {/* 表格呈現列表 (Table Layout) */}
      <section className="results" style={{ marginTop: '18px' }}>
        {records.length === 0 ? (
          <div className="empty">目前沒有任何指令。</div>
        ) : (
          <div className="table-responsive">
            <table className="inspiration-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }} className="rwd-hide"><input type="checkbox" disabled /></th>
                  <th style={{ width: '60px' }}>序號</th>
                  <th>指令標題 / 內容</th>
                  <th style={{ width: '140px' }}>指令分類</th>
                  <th style={{ width: '120px' }}>來源平台</th>
                  <th style={{ width: '150px' }}>收藏時間</th>
                  <th style={{ width: '60px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((p, index) => {
                  const displaySerial = totalFromServer - index;
                  const isMenuOpen = activeMenuId === p.id;
                  let catClass = 'other';
                  if (p.prompt_category === '文案寫作') catClass = 'write';
                  else if (p.prompt_category === '圖像生成') catClass = 'marketing';
                  else if (p.prompt_category === '工作效率') catClass = 'efficiency';
                  else if (p.prompt_category === '開發技術') catClass = 'tech';

                  return (
                    <tr key={p.id}>
                      <td className="rwd-hide"><input type="checkbox" disabled /></td>
                      <td data-label="序號">
                        <span className="table-number">
                          {String(displaySerial).padStart(2, '0')}
                        </span>
                      </td>
                      <td data-label="指令內容">
                        <div className="table-summary-cell" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <Link href={`/prompts/detail?id=${encodeURIComponent(p.id)}`} className="table-summary-link" style={{ fontWeight: '600', color: '#2d2d2d', fontSize: '15px', display: 'block' }}>
                            {p.prompt_title || '（未命名指令）'}
                          </Link>
                          <span style={{ fontSize: '13px', color: '#666', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' }}>
                            {p.prompt_text}
                          </span>
                        </div>
                      </td>
                      <td data-label="指令分類">
                        <span className={`prompt-badge ${catClass}`}>
                          {p.prompt_category}
                        </span>
                      </td>
                      <td data-label="來源平台">
                        <span className="tag" style={{ border: 'none', background: '#f0f0f0', margin: 0, padding: '4px 8px' }}>
                          {p.source_type === 'line' ? 'LINE 訊息' : '網頁端'}
                        </span>
                      </td>
                      <td data-label="收藏時間">
                        <span className="table-time">
                          {p.created_at.split(' ')[0]}
                        </span>
                      </td>
                      <td style={{ position: 'relative' }}>
                        <button
                          className="table-action-dots"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuToggle(p.id);
                          }}
                        >
                          •••
                        </button>
                        
                        {/* 浮動 Context Menu */}
                        {isMenuOpen && (
                          <div className="context-menu" ref={menuRef} onClick={(e) => e.stopPropagation()} style={{ right: '0', top: '100%', minWidth: '130px' }}>
                            <Link href={`/prompts/detail?id=${encodeURIComponent(p.id)}`} className="context-menu-item">
                              👁️ 查看詳情
                            </Link>
                            <button 
                              onClick={(e) => {
                                handleCopy(p.prompt_text, e);
                                setActiveMenuId(null);
                              }} 
                              className="context-menu-item btn-menu"
                            >
                              📋 複製指令
                            </button>
                            <button
                              onClick={(e) => {
                                handleEditClick(p, e);
                                setActiveMenuId(null);
                              }}
                              className="context-menu-item btn-menu"
                            >
                              ✏️ 編輯指令
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modals */}
      <AddPromptModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSuccess={handleAddSuccess}
      />

      <EditPromptModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        prompt={selectedPrompt}
        onSuccess={handleEditSuccess}
      />

      {/* Toast Alert */}
      <div className={`toast ${toastMsg ? 'show' : ''}`}>
        {toastMsg}
      </div>
    </>
  );
}
