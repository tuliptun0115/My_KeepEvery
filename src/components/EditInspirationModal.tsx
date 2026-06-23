'use client';

import React, { useState, useEffect } from 'react';
import { LibraryRecordV2 } from '@/lib/sheets';
import { useRouter } from 'next/navigation';

// 常見的用途分類選項
const USE_CASE_OPTIONS = [
  'Prompt',
  '工作流程參考',
  '內容靈感',
  '技術參考',
  '工具收藏',
  '寫作素材',
  '產業研究'
];

// 常見的主題分類選項
const TOPIC_OPTIONS = [
  '未分類',
  'Prompt',
  'AI 工具',
  '社群行銷',
  '產品設計',
  '前端開發',
  '工作流程',
  '商業策略',
  '內容創作',
  '日常隨筆',
  '其他'
];

interface EditInspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: LibraryRecordV2 | null;
  onSuccess: (updatedRecord: LibraryRecordV2) => void;
}

export function EditInspirationModal({ isOpen, onClose, record, onSuccess }: EditInspirationModalProps) {
  const router = useRouter();
  const [summary, setSummary] = useState('');
  const [useCase, setUseCase] = useState('');
  const [customUseCase, setCustomUseCase] = useState('');
  const [isCustomUseCase, setIsCustomUseCase] = useState(false);
  const [topicCategory, setTopicCategory] = useState('');
  const [customTopicCategory, setCustomTopicCategory] = useState('');
  const [isCustomTopicCategory, setIsCustomTopicCategory] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [keyPoint1, setKeyPoint1] = useState('');
  const [keyPoint2, setKeyPoint2] = useState('');
  const [keyPoint3, setKeyPoint3] = useState('');
  const [rawInput, setRawInput] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 當 record 改變時，初始化狀態
  useEffect(() => {
    if (record) {
      setSummary(record.summary || '');
      setRawInput(record.raw_input || '');
      
      // 主題處理
      const topicVal = record.topic_category || '未分類';
      if (TOPIC_OPTIONS.includes(topicVal)) {
        setTopicCategory(topicVal);
        setIsCustomTopicCategory(false);
      } else {
        setTopicCategory('自訂輸入');
        setCustomTopicCategory(topicVal);
        setIsCustomTopicCategory(true);
      }
      
      // 標籤處理：以逗號與空格連接
      setTagsInput(record.tags ? record.tags.join(', ') : '');

      // 用途處理：如果是在選項中就選取，否則開啟自訂輸入
      const val = record.use_case || '';
      if (USE_CASE_OPTIONS.includes(val)) {
        setUseCase(val);
        setIsCustomUseCase(false);
      } else {
        setUseCase('自訂輸入');
        setCustomUseCase(val);
        setIsCustomUseCase(true);
      }

      // 重點處理：拆分成 3 個獨立輸入
      const points = record.key_points || [];
      setKeyPoint1(points[0] || '');
      setKeyPoint2(points[1] || '');
      setKeyPoint3(points[2] || '');
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleUseCaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setUseCase(val);
    if (val === '自訂輸入') {
      setIsCustomUseCase(true);
    } else {
      setIsCustomUseCase(false);
    }
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setTopicCategory(val);
    if (val === '自訂輸入') {
      setIsCustomTopicCategory(true);
    } else {
      setIsCustomTopicCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      setErrorMsg('請輸入摘要內容');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    // 用途分類真值
    const finalUseCase = isCustomUseCase ? customUseCase.trim() : useCase;
    if (!finalUseCase) {
      setErrorMsg('請選擇或輸入用途分類');
      setIsLoading(false);
      return;
    }

    // 主題分類真值
    const finalTopic = isCustomTopicCategory ? customTopicCategory.trim() : topicCategory;

    // 標籤拆分與清理
    const finalTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    // 重點過濾空值
    const finalKeyPoints = [keyPoint1.trim(), keyPoint2.trim(), keyPoint3.trim()].filter(Boolean);

    // 建立 Payload
    const updatedRecord: LibraryRecordV2 = {
      ...record,
      summary: summary.trim(),
      use_case: finalUseCase,
      topic_category: finalTopic || '未分類',
      tags: finalTags,
      key_points: finalKeyPoints,
      raw_input: rawInput,
    };

    try {
      const response = await fetch('/api/inspiration/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRecord),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.record);
        onClose();
        router.refresh();
      } else {
        setErrorMsg(result.error || '儲存修改失敗，請稍後再試');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('連線失敗，請檢查網路設定');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* 標頭 */}
        <div className="modal-header">
          <span className="modal-title">✏️ 編輯靈感收藏</span>
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
            <label className="form-label">
              一句話摘要 <span className="required-star">*</span>
            </label>
            <input
              type="text"
              maxLength={90}
              className="form-input"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={isLoading}
              required
              placeholder="輸入此靈感的一句話總結（90字內）"
            />
            <span style={{ fontSize: '12px', color: '#888', display: 'block', marginTop: '4px' }}>
              已輸入 {summary.length}/90 字
            </span>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                用途分類 <span className="required-star">*</span>
              </label>
              <select
                className="filter-select"
                value={useCase}
                onChange={handleUseCaseChange}
                disabled={isLoading}
                style={{ width: '100%', padding: '10px 12px' }}
              >
                {USE_CASE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="自訂輸入">✏️ 自訂輸入...</option>
              </select>
              {isCustomUseCase && (
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: '8px' }}
                  placeholder="輸入自訂用途分類"
                  value={customUseCase}
                  onChange={(e) => setCustomUseCase(e.target.value)}
                  disabled={isLoading}
                  required
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                主題分類 <span className="required-star">*</span>
              </label>
              <select
                className="filter-select"
                value={topicCategory}
                onChange={handleTopicChange}
                disabled={isLoading}
                style={{ width: '100%', padding: '10px 12px' }}
              >
                {TOPIC_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="自訂輸入">✏️ 自訂輸入...</option>
              </select>
              {isCustomTopicCategory && (
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: '8px' }}
                  placeholder="輸入自訂主題分類"
                  value={customTopicCategory}
                  onChange={(e) => setCustomTopicCategory(e.target.value)}
                  disabled={isLoading}
                  required
                />
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              標籤 <span className="optional-tag">（以逗號分隔）</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="#標籤1, #標籤2, #標籤3"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              2-3 個重點
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="重點 1"
                value={keyPoint1}
                onChange={(e) => setKeyPoint1(e.target.value)}
                disabled={isLoading}
              />
              <input
                type="text"
                className="form-input"
                placeholder="重點 2 (選填)"
                value={keyPoint2}
                onChange={(e) => setKeyPoint2(e.target.value)}
                disabled={isLoading}
              />
              <input
                type="text"
                className="form-input"
                placeholder="重點 3 (選填)"
                value={keyPoint3}
                onChange={(e) => setKeyPoint3(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              原始內容
            </label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '100px' }}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              disabled={isLoading}
              placeholder="這筆收藏的原始正文或備註"
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
              {isLoading ? (
                <>
                  <span className="spinner-icon">⏳</span> 儲存中...
                </>
              ) : (
                '確認儲存'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
