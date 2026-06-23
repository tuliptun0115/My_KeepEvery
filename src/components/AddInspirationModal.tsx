'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AddInspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddInspirationModal({ isOpen, onClose, onSuccess }: AddInspirationModalProps) {
  const router = useRouter();
  const [rawInput, setRawInput] = useState('');
  const [userNote, setUserNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) {
      setErrorMsg('請輸入有效的內容');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/inspiration/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw_input: rawInput,
          user_note: userNote,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setRawInput('');
        setUserNote('');
        onClose();
        
        // 觸發重新整理資料
        router.refresh();
        if (onSuccess) {
          onSuccess();
        } else {
          // 若無另外定義 toast 則直接 reload
          window.location.reload();
        }
      } else {
        setErrorMsg(result.error || '新增失敗，請稍後再試');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('連線失敗，請檢查網路後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        {/* 標頭 */}
        <div className="modal-header">
          <span className="modal-title">➕ 手動新增靈感</span>
          <button className="modal-close-btn" onClick={onClose} disabled={isLoading}>
            ✕
          </button>
        </div>

        {/* 內容 */}
        <form onSubmit={handleSubmit} className="modal-form">
          {errorMsg && (
            <div className="modal-error-bar">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              靈感正文或網址 <span className="required-star">*</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="貼上您的純文字想法，或輸入一般 URL 網址 / 社群 URL 網址（Threads、FB、IG、X、LinkedIn）"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              補充備註 <span className="optional-tag">（選填）</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="加上額外補充說明（會提供給 Gemini 進行整合分析，並能提高理解信心等級）"
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* 按鈕 */}
          <div className="modal-actions">
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
              {isLoading ? (
                <>
                  <span className="spinner-icon">⏳</span> 正在解析與整理...
                </>
              ) : (
                '確認送出'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
