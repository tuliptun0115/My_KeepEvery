'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PromptRecord } from '@/lib/sheets';
import { PROMPT_CATEGORIES } from '@/lib/mock-prompts';
import { AddPromptModal } from '@/components/AddPromptModal';
import { EditPromptModal } from '@/components/EditPromptModal';

interface PromptListClientProps {
  initialRecords: PromptRecord[];
  totalCount: number;
}

export default function PromptListClient({ initialRecords, totalCount }: PromptListClientProps) {
  const [records, setRecords] = useState<PromptRecord[]>(initialRecords);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [toastMsg, setToastMsg] = useState('');

  // Context Menu 狀態
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptRecord | null>(null);

  // 刪除狀態
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMenuToggle = (id: string) => {
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setActiveMenuId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/prompts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTargetId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '刪除失敗');
      setRecords((prev) => prev.filter((r) => r.id !== deleteTargetId));
      showToast('🗑️ 指令已成功刪除！');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '刪除失敗，請稍後再試';
      showToast(`❌ ${message}`);
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

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

  // 篩選與搜尋
  const filteredRecords = records.filter((p) => {
    const hitCategory = selectedCategory === '全部' || p.prompt_category === selectedCategory;
    const hitKeyword = !keyword.trim() || 
      p.prompt_text.toLowerCase().includes(keyword.trim().toLowerCase()) || 
      (p.prompt_title || '').toLowerCase().includes(keyword.trim().toLowerCase()) || 
      p.prompt_category.toLowerCase().includes(keyword.trim().toLowerCase());
    return hitCategory && hitKeyword;
  });

  return (
    <>
      {/* SaaS 大標頭與功能按鈕 */}
      <section className="dashboard-header" style={{ padding: '24px 0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="dashboard-title" style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d2d2d' }}>所有指令列表</h1>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '4px', marginBottom: 0 }}>
            在此搜尋、過濾並瀏覽所有您收藏的 AI 提示詞與指令範本。
          </p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
          <Link href="/prompts" className="link-button subtle-button" style={{ textDecoration: 'none', margin: 0, padding: '10px 16px', fontSize: '13px' }}>
            回寶庫首頁
          </Link>
          <button className="link-button accent-button" onClick={() => setIsAddOpen(true)} style={{ margin: 0, padding: '10px 16px', fontSize: '13px' }}>
            ＋ 新增指令
          </button>
        </div>
      </section>

      {/* 搜尋與篩選列 */}
      <section className="controls toolbar-panel" style={{ marginTop: '24px' }}>
        <div className="toolbar-row toolbar-list-primary">
          <label className="search toolbar-search" style={{ flexGrow: 1 }}>
            <input 
              type="text" 
              placeholder="搜尋指令內容或分類..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </label>
        </div>
        <div className="categories-bar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
          <button 
            className={`category-filter-btn ${selectedCategory === '全部' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('全部')}
          >
            全部
          </button>
          {PROMPT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 搜尋統計顯示 */}
      <section className="notice toolbar-meta-panel" style={{ marginTop: '10px', padding: '12px 16px' }}>
        <div className="toolbar-row toolbar-summary-row">
          <div className="toolbar-result">
            目前顯示符合條件的 <strong>{filteredRecords.length}</strong> / <strong>{totalCount}</strong> 筆指令。
          </div>
        </div>
      </section>

      {/* 表格呈現列表 */}
      <section className="results" style={{ marginTop: '18px' }}>
        {filteredRecords.length === 0 ? (
          <div className="empty">目前沒有符合條件的指令。</div>
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
                {filteredRecords.map((p) => {
                  const dbIndex = records.findIndex(r => r.id === p.id);
                  const displaySerial = dbIndex !== -1 ? records.length - dbIndex : 1;
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
                            <button
                              onClick={() => handleDeleteClick(p.id)}
                              className="context-menu-item btn-menu"
                              style={{ color: '#e53e3e' }}
                            >
                              🗑️ 刪除指令
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

      {/* 刪除確認對話框 */}
      {deleteTargetId && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '420px', width: '90%' }}>
            <div className="modal-header">
              <span className="modal-title">🗑️ 確認刪除</span>
            </div>
            <div style={{ padding: '16px 0 8px', color: '#444', fontSize: '15px', lineHeight: '1.6' }}>
              此操作將從 Google Sheets 永久刪除該指令，且<strong>無法復原</strong>。確定要繼續嗎？
            </div>
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button
                className="link-button subtle-button modal-cancel-btn"
                onClick={() => setDeleteTargetId(null)}
                disabled={isDeleting}
              >
                取消
              </button>
              <button
                className="link-button"
                style={{ background: '#e53e3e', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.7 : 1 }}
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? '⏳ 刪除中...' : '確認刪除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      <div className={`toast ${toastMsg ? 'show' : ''}`}>
        {toastMsg}
      </div>
    </>
  );
}
