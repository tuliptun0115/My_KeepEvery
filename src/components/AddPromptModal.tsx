'use client';

import React, { useState } from 'react';
import { PromptRecord } from '@/lib/sheets';
import { PROMPT_CATEGORIES } from '@/lib/mock-prompts';

interface AddPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPrompt: PromptRecord) => void;
}

export function AddPromptModal({ isOpen, onClose, onSuccess }: AddPromptModalProps) {
  const [promptTitle, setPromptTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) {
      setErrorMsg('請輸入指令內容');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/prompts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_title: promptTitle.trim(),
          prompt_text: promptText.trim()
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || '新增失敗');
      }

      onSuccess(data.prompt as PromptRecord);
      setPromptTitle('');
      setPromptText('');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '新增失敗，請稍後再試';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '600px', width: '90%' }}>
        {/* 標頭 */}
        <div className="modal-header">
          <span className="modal-title">💡 新增提示詞指令</span>
          <button className="modal-close-btn" onClick={onClose} disabled={isLoading}>
            ✕
          </button>
        </div>

        {/* 表單 */}
        <form onSubmit={handleSubmit} className="modal-form">
          {errorMsg && (
            <div className="modal-error-bar">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="add-prompt-title">
              指令標題 (選填)
            </label>
            <input
              id="add-prompt-title"
              type="text"
              className="filter-select"
              style={{ width: '100%', padding: '10px 12px', border: '2px solid #2d2d2d', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box' }}
              placeholder="請輸入簡短指令標題...（留空將由 AI 自動生成）"
              value={promptTitle}
              onChange={(e) => setPromptTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              指令分類
            </label>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '4px', marginBottom: 0 }}>
              🤖 將由 AI 自動判斷分類（{PROMPT_CATEGORIES.join('、')}）
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              指令內容 (Prompt) <span className="required-star">*</span>
            </label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '200px', fontFamily: 'var(--font-geist-mono), monospace', fontSize: '14px' }}
              placeholder="請輸入您希望 AI 執行的具體 Prompt 或指令範本..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* 按鈕 */}
          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="link-button subtle-button modal-cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className="link-button accent-button modal-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? '🤖 AI 分類中...' : '確認送出'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
