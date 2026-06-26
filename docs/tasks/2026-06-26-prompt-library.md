# Prompt Library Task Plan

## 1. 功能定位

- 子功能名稱：`指令寶庫`
- feature slug：`prompt-library`
- task prefix：`PL`

## 2. 功能目標

- 在現有靈感收藏庫旁新增「指令寶庫」
- 支援同一個 LINE Bot 自動分流 prompt
- prompt 與靈感收藏共用同一份 Google Sheets，但使用獨立 `prompt_library` sheet
- 網站端支援新增、編輯、詳情查看與一鍵複製

## 3. 關鍵規則

- 若 LINE 訊息中含有 URL，該訊息一定不是 prompt
- 若訊息不含 URL 且帶有 `/prompt` 前綴，100% 視為 prompt
- 若訊息不含 URL 且沒有 `/prompt` 前綴，由 AI 判斷是否為 prompt
- 若 AI 判定不是 prompt，回到既有純文字靈感收藏流程

## 4. 建議最先開始的 Task

**建議起手：`PL-00 Prompt Library Demo 網頁製作`**

原因：
- 先透過靜態 HTML 頁面驗證與收斂 UI 佈局、分頁、搜尋、複製與編輯 Modal 的前端互動規格。
- 確保 Next.js / GAS 正式開發前，前後端對資料流與畫面欄位的期待完全一致。

## 5. Task 清單

### PL-00 Prompt Library Demo 網頁製作

**目標**
- 建立 `prompt_library` 靜態 HTML Demo 與樣式，驗證指令寶庫的 UI 佈局與前端交互。

**完成條件**
- 新增 `docs/demo/prompts.html`：指令寶庫列表頁，支援關鍵字搜尋、固定 5 類別篩選、一鍵複製、新增 Modal 模擬、編輯 Modal 模擬、以及進入詳情頁。
- 新增 `docs/demo/prompts-detail.html`：指令詳情頁，支援展示完整 prompt 內容與一鍵複製。
- 擴充 `docs/demo/library-data.js`：加入指令專用的 mock 數據。
- 擴充 `docs/demo/library-styles.css`：追加 Neobrutalist 風格的複製提示氣泡與相關 layout 樣式。

**依賴或前置順序**
- 無

### PL-01-1 雲端 Sheets 建立 prompt_library 工作表

**目標**
- 在雲端 Google Sheets 新增一個用於儲存指令的工作表，避免與靈感資料混合。

**完成條件**
- Google Sheets 檔案中出現 `prompt_library` 分頁。
- 首列具備 6 個 header：`id`, `prompt_category`, `prompt_text`, `created_at`, `updated_at`, `source_type`。

**依賴或前置順序**
- 無

### PL-01-2 Apps Script (GAS) doPost/doGet 分流與部署

**目標**
- 在 GAS 實作讀寫 `prompt_library` 的分流邏輯。

**完成條件**
- `gas/程式碼.js` 更新：在 `doGet` 支援讀取 `sheet_name=prompt_library`，在 `doPost` 支援寫入 `sheet_name=prompt_library` 且支援 `action=update_row` 更新行。
- 使用 `clasp push` 與 `clasp deploy` 將程式碼推送至雲端，維持原 Web App 網址與部署 ID 不變。

**依賴或前置順序**
- 依賴 `PL-01-1`

### PL-01-3 Next.js sheets.ts 的 PromptRecord 與 API 函數建立

**目標**
- 在 Next.js 專案內建立與 Sheets 對接的讀寫介面。

**完成條件**
- `src/lib/sheets.ts` 新增 `PromptRecord` 介面。
- 新增 `fetchPromptLibrary()`：支援 Fetch 雲端 `prompt_library` 資料。
- 新增 `appendToPromptLibrary(data)`：發送 POST 請求寫入新 Prompt。
- 新增 `updatePromptLibraryRecord(data)`：發送 POST 請求（帶 `action=update_row`）更新已有 Prompt。
- 通過 `npm run lint` 與 `npm run build`。

**依賴或前置順序**
- 依賴 `PL-01-2`

### PL-02 Gemini.ts 的 Prompt 判定與分類模型實作

**目標**
- 建立 AI 判斷一段文字是否為指令以及將其分類的能力。

**完成條件**
- `src/lib/gemini.ts` 新增 `detectPromptIntent(text: string): Promise<boolean>` 用於辨識指令意圖。
- 新增 `classifyPromptCategory(text: string): Promise<string>` 用於將指令分類至 `寫作生成`、`行銷文案`、`工作效率`、`開發技術`、`其他` 五類之一（失敗時回落至 `其他`）。

**依賴或前置順序**
- 無

### PL-03-1 LINE Webhook 訊息過濾與 Prompt 分流接線

**目標**
- 在 Webhook 入口實作 Prompt 與靈感的分流。

**完成條件**
- 修改 `src/app/api/webhook/line/route.ts`：
  - 若包含 URL，直接走舊靈感流。
  - 若以 `/prompt` 開頭，直接包裝為 Prompt 寫入雲端 `prompt_library`。
  - 若無前綴且無 URL，呼叫 `detectPromptIntent()`。判定為 Prompt 時寫入 `prompt_library`，否則退回靈感流寫入 `library_v2`。

**依賴或前置順序**
- 依賴 `PL-01-3`、`PL-02`

### PL-03-2 LINE Webhook Prompt 成功接收後的回覆模板與 Smoke Test

**目標**
- 回覆使用者 Prompt 已成功收錄，並利用腳本進行 Smoke Test。

**完成條件**
- LINE 回覆文字範本調整，明確告訴使用者「已成功收錄指令，類別為：XX」。
- 執行模擬 Webhook 測試腳本，驗證 LINE Webhook 能正確識別、分類並寫入雲端 `prompt_library` 工作表。

**依賴或前置順序**
- 依賴 `PL-03-1`

### PL-04-1 實作網頁端新增 API 路由 (/api/prompts/add)

**目標**
- 建立前端手動新增 Prompt 的後端 API。

**完成條件**
- 新增 `src/app/api/prompts/add/route.ts`：接收客戶端發送的 `prompt_text`，呼叫 `classifyPromptCategory()` 自動分類，並呼叫 `appendToPromptLibrary()` 寫入雲端 Sheets。

**依賴或前置順序**
- 依賴 `PL-01-3`、`PL-02`

### PL-04-2 實作網頁端更新 API 路由 (/api/prompts/update)

**目標**
- 建立前端編輯 Prompt 的後端 API。

**完成條件**
- 新增 `src/app/api/prompts/update/route.ts`：接收客戶端傳入的 Prompt 修改資料，呼叫 `updatePromptLibraryRecord()` 覆寫 Sheets 內對應資料並更新 `updated_at`。

**依賴或前置順序**
- 依賴 `PL-01-3`

### PL-05-1 重構指令寶庫首頁 (/prompts) 真實資料連通

**目標**
- 讓指令寶庫首頁載入 Google Sheets 的真實數據。

**完成條件**
- 修改 `src/app/prompts/page.tsx` 與 `src/app/prompts/PromptListClient.tsx`。
- 首頁使用 Server Component 形式在伺服器端抓取 `fetchPromptLibrary()` 的真實數據（限 5 筆），傳入 Client 渲染，移除 `localStorage` Mock 依賴。

**依賴或前置順序**
- 依賴 `PL-01-3`

### PL-05-2 重構列表頁 (/prompts/list) 真實資料連通與搜尋

**目標**
- 讓指令完整列表頁載入並搜尋真實 Sheets 數據。

**完成條件**
- 修改 `src/app/prompts/list/page.tsx` 與 `src/app/prompts/list/PromptListClient.tsx`。
- 改為 Server 端載入真實 Prompt 數據，前端支援對真實數據進行關鍵字搜尋與 5 大類別篩選。

**依賴或前置順序**
- 依賴 `PL-01-3`

### PL-05-3 重構詳情頁 (/prompts/detail) 真實資料連通與導覽

**目標**
- 詳情頁載入真資料，且返回列表、上一筆、下一筆均對接真資料。

**完成條件**
- 修改 `src/app/prompts/detail/page.tsx` 與 `src/app/prompts/detail/PromptDetailClient.tsx`。
- 透過 `?id=...` 載入 Sheets 內對應的 Prompt 資料，並修正上一筆/下一筆邏輯。

**依賴或前置順序**
- 依賴 `PL-01-3`

### PL-06-1 重構 AddPromptModal 連接實體 API

**目標**
- 將網頁端手動新增 Prompt 的 UI 連接到真實後端。

**完成條件**
- 修改 `src/components/AddPromptModal.tsx`，移除 localStorage 新增代碼，改為 POST 請求至 `/api/prompts/add`。新增成功後更新本地 UI state，不需整頁重新整理。

**依賴或前置順序**
- 依賴 `PL-04-1`

### PL-06-2 重構 EditPromptModal 連接實體 API

**目標**
- 將網頁端編輯 Prompt 的 UI 連接到真實後端。

**完成條件**
- 修改 `src/components/EditPromptModal.tsx`，移除 localStorage 修改代碼，改為 POST 請求至 `/api/prompts/update`。更新成功後即時更新 UI state。

**依賴或前置順序**
- 依賴 `PL-04-2`

### PL-07 專案樣式整合與完整性驗證

**目標**
- 確保指令寶庫真資料流上線後，全站運行無誤。

**完成條件**
- 確認 Sidebar 內「指令寶庫」點擊可正常跳轉首頁。
- 執行 `npm run lint` 通過。
- 執行 `npm run build` 通過。
- 更新 `docs/log.md`、`plan.md` 的完成進度。

**依賴或前置順序**
- 依賴上述所有 Task。

## 6. 建議執行順序

1. **優先起手**：`PL-01-1` (Sheets 建立 `prompt_library` 工作表)，因為它是所有後續資料流存儲的物理基石。
2. 進行後端與 API 路由部署：`PL-01-2` ➔ `PL-01-3`。
3. 實作分類 AI 與 Webhook 接線：`PL-02` ➔ `PL-03-1` ➔ `PL-03-2`（完成後即可透過 LINE 實測寫入真資料）。
4. 實作網頁端後端 API：`PL-04-1` ➔ `PL-04-2`。
5. 連通網頁前端新增與編輯：`PL-06-1` ➔ `PL-06-2`。
6. 連通網頁前端首頁、列表、詳情真資料：`PL-05-1` ➔ `PL-05-2` ➔ `PL-05-3`。
7. 進行整體樣式與編譯發布驗證：`PL-07`。
