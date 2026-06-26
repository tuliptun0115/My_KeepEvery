'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PromptRecord } from '@/lib/sheets';
import { EditPromptModal } from '@/components/EditPromptModal';

interface PromptDetailClientProps {
  currentRecord: PromptRecord | null;
  prevPrompt: PromptRecord | null;
  nextPrompt: PromptRecord | null;
  serial: string;
}

export default function PromptDetailClient({
  currentRecord: initialRecord,
  prevPrompt,
  nextPrompt,
  serial,
}: PromptDetailClientProps) {
  const router = useRouter();
  const [currentRecord, setCurrentRecord] = useState<PromptRecord | null>(initialRecord);
  const [toastMsg, setToastMsg] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!currentRecord) {
    return (
      <div className="empty" style={{ marginTop: '24px' }}>
        <p>⚠️ 找不到該指令內容。</p>
        <Link href="/prompts/list" className="link-button" style={{ marginTop: '16px' }}>
          回指令列表
        </Link>
      </div>
    );
  }

  const handleEditSuccess = (updatedPrompt: PromptRecord) => {
    setCurrentRecord(updatedPrompt);
    showToast('✏️ 指令內容已成功更新！');
  };

  const handleDeleteConfirm = async () => {
    if (!currentRecord) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/prompts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentRecord.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '刪除失敗');
      router.push('/prompts/list');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '刪除失敗，請稍後再試';
      showToast(`❌ ${message}`);
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentRecord.prompt_text)
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

  let catClass = 'other';
  if (currentRecord.prompt_category === '文案寫作') catClass = 'write';
  else if (currentRecord.prompt_category === '圖像生成') catClass = 'marketing';
  else if (currentRecord.prompt_category === '工作效率') catClass = 'efficiency';
  else if (currentRecord.prompt_category === '開發技術') catClass = 'tech';

  return (
    <>
      {/* 內容區塊框框外的右上方輕量導航 */}
      <div className="detail-external-nav">
        <Link href="/prompts/list" className="ext-nav-link">
          ← 回指令列表
        </Link>
        {prevPrompt && (
          <>
            <span className="ext-nav-divider">|</span>
            <Link href={`/prompts/detail?id=${encodeURIComponent(prevPrompt.id)}`} className="ext-nav-link">
              上一筆
            </Link>
          </>
        )}
        {nextPrompt && (
          <>
            <span className="ext-nav-divider">|</span>
            <Link href={`/prompts/detail?id=${encodeURIComponent(nextPrompt.id)}`} className="ext-nav-link">
              下一筆
            </Link>
          </>
        )}
      </div>

      {/* SaaS 大標頭 */}
      <section className="dashboard-header" style={{ padding: '24px 0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 10 }}>
        <div>
          <h1 className="dashboard-title" style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d2d2d' }}>指令詳情</h1>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '4px', marginBottom: 0 }}>
            閱讀與管理該 Prompt 詳細資訊，可直接點擊複製或對其進行編輯修改。
          </p>
        </div>
      </section>

      <section className="results">
        <article className="prompt-detail-card">
          <div className="record-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="record-number">#{serial}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <span className="record-time">建立: {currentRecord.created_at}</span>
            </div>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2d2d2d', marginTop: '16px', marginBottom: '8px' }}>
            {currentRecord.prompt_title || '（未命名指令）'}
          </h2>
          
          <div className="prompt-detail-meta" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <span className={`prompt-badge ${catClass}`}>{currentRecord.prompt_category}</span>
            <span className="tag" style={{ border: 'none', background: '#f0f0f0', margin: 0 }}>
              {currentRecord.source_type === 'line' ? 'LINE 訊息' : '網頁端新增'}
            </span>
            <span className="prompt-card-time" style={{ marginLeft: 'auto' }}>
              最後更新: {currentRecord.updated_at}
            </span>
          </div>

          <div className="prompt-detail-text" style={{ marginTop: '20px' }}>
            <div className="prompt-copy-bubble">
              <button className="btn-icon" title="複製指令" onClick={handleCopy}>
                <svg viewBox="0 0 24 24">
                  <path 
                    d="M8 4v12h12V4H8Zm12-2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12ZM4 6h0.01M4 10h0.01M4 14h0.01M4 18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            {currentRecord.prompt_text}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button className="link-button accent-button" style={{ flexGrow: 1 }} onClick={handleCopy}>
              一鍵複製 Prompt
            </button>
            <button className="link-button subtle-button" style={{ flexGrow: 1 }} onClick={() => setIsEditOpen(true)}>
              編輯指令
            </button>
            <button
              className="link-button"
              style={{ background: '#fff0f0', color: '#e53e3e', border: '1px solid #fecaca', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              onClick={() => setIsDeleteOpen(true)}
            >
              🗑️ 刪除
            </button>
          </div>

          {/* 原本底部的 detail-nav 已移至內容框外右上角 */}
        </article>
      </section>

      {/* Edit Modal */}
      <EditPromptModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        prompt={currentRecord}
        onSuccess={handleEditSuccess}
      />

      {/* 刪除確認對話框 */}
      {isDeleteOpen && (
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
                onClick={() => setIsDeleteOpen(false)}
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
