# T05-6 純文字新版資料流驗證清單

## 目的

- 驗證 `LINE 純文字 -> Gemini 結構化整理 -> Google Sheets library_v2` 這條新版資料流是否真的可用。
- 本清單只針對 `T05` 的純文字路徑，不包含社群 URL、一般 URL 或正式首頁整併。

## 前置條件

- [ ] 已將 [scripts/google_sheets_gas.js](/C:/Users/8475/Desktop/AI%20Project/My_KeepEvery/scripts/google_sheets_gas.js) 最新內容貼到 Google Apps Script
- [ ] 已重新部署既有 Web App，而不是誤建新的正式 URL
- [ ] 若已知舊工作表名稱，已在 GAS 內填入 `LEGACY_SHEET_NAME`
- [ ] `GOOGLE_GAS_URL` 與 `GOOGLE_GAS_SECRET` 維持現行服務可用設定

## 部署後靜態確認

- [ ] 舊工作表仍存在
- [ ] `library_v2` 尚未建立也沒關係，因為它會在第一次新版寫入時自動建立
- [ ] 若 `LEGACY_SHEET_NAME` 留空，已確認試算表中第一張非 `library_v2` 的工作表就是舊資料流應寫入的位置

## 最小實測資料

建議從 LINE 傳這段純文字：

```text
看到一個把 AI 工作流拆成蒐集、整理、回找三層的做法，重點是先把原始素材存好，再做摘要與標籤，之後比較容易回頭重用。
```

## 實測步驟

- [ ] 從 LINE 傳 1 則純文字給 bot
- [ ] 等待 bot 回覆成功訊息
- [ ] 打開 Google Sheets
- [ ] 確認是否自動建立 `library_v2`
- [ ] 確認是否新增 1 筆資料列

## `library_v2` Header 驗證

第一列必須是以下 15 欄，順序不可錯：

1. `id`
2. `input_type`
3. `raw_input`
4. `source_title`
5. `source_url`
6. `created_at`
7. `source_platform`
8. `content_type`
9. `summary`
10. `key_points`
11. `tags`
12. `use_case`
13. `topic_category`
14. `confidence_level`
15. `parse_status`

## 單筆資料驗證

至少確認以下欄位：

- [ ] `input_type = text`
- [ ] `raw_input` 保留完整原文
- [ ] `source_title` 為原文截短版
- [ ] `source_url` 為空字串
- [ ] `source_platform = LINE 文字`
- [ ] `content_type = note`
- [ ] `summary` 為一句話
- [ ] `key_points` 有 2 到 3 條，並以 ` || ` 分隔
- [ ] `tags` 至少有 3 個，並以逗號分隔
- [ ] `use_case` 有值
- [ ] `topic_category` 有值
- [ ] `confidence_level = high`
- [ ] `parse_status = complete`

## 失敗時先查哪裡

### 1. Apps Script Execution

先看 Apps Script 的 `Execution` / `執行作業`，確認有沒有：

- 權限錯誤
- token 驗證失敗
- `appendRow` 寫入失敗
- 找不到工作表

### 2. Web App 部署是否正確

- 是否編輯的是既有 deployment
- 正式 Web App URL 是否改變
- 權限是否仍為 `Anyone`

### 3. 服務端設定是否對齊

- `GOOGLE_GAS_URL` 是否仍指向正確 Web App
- `GOOGLE_GAS_SECRET` 是否和 GAS 中的 `SECRET_TOKEN` 一致

### 4. 寫入位置是否正確

- 純文字應寫入 `library_v2`
- 舊 URL 流不應因 active sheet 改變而誤寫到 `library_v2`

## 驗證完成後要同步的文件

- [ ] 在 [plan.md](/C:/Users/8475/Desktop/AI%20Project/My_KeepEvery/plan.md) 勾選 `T05-6`
- [ ] 在 [docs/log.md](/C:/Users/8475/Desktop/AI%20Project/My_KeepEvery/docs/log.md) 補記：
  - GAS 已重新部署
  - `library_v2` 已建立
  - 已完成至少 1 筆純文字真實寫入
  - 驗證結果與任何例外現象
