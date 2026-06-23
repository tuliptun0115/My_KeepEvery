# TECH_DOC - 靈感收藏庫技術規格

## 1. 文件目的
本文件定義「靈感收藏庫」正式實作後的技術架構、資料模型、Webhook 輸入管線、遷移腳本與前端路由結構，作為後續接手與維護之技術 Single Source of Truth (SSOT)。

---

## 2. 系統架構與責任分工

```
LINE 使用者
  └─► LINE Messaging API
        └─► Next.js API Route (Webhook)
              ├─► 1. 輸入類型判斷與分流 (純文字、社群 URL、一般 URL)
              ├─► 2. 內容解析層 (extractor.ts)
              │     ├─► 社群網址降級擷取 (extractSocialContent)
              │     └─► 一般網址正文擷取 (extractGeneralContent)
              ├─► 3. AI 結構化整理 (gemini.ts)
              │     ├─► organizeTextInspiration
              │     ├─► organizeSocialInspiration
              │     └─► organizeGeneralInspiration
              ├─► 4. Sheets 寫入分流 (sheets.ts ──► GAS Web App)
              └─► LINE 訊息推送回復 (route.ts & line.ts)

Next.js 前端路由
  ├─► 首頁 (/) ──► LibraryHomeClient.tsx (最新 10 筆、關鍵字與用途即時過濾、快捷入口)
  ├─► 列表頁 (/list) ──► LibraryListClient.tsx (多欄位搜尋、多重進階過濾、3種排序、分頁)
  └─► 詳細頁 (/detail) ──► LibraryDetailClient.tsx (單筆細節展示、上下筆切換、無 ID 時之 Fallback)
```

### 核心檔案責任清單

| 檔案 | 職責與實作說明 |
|---|---|
| `src/app/api/webhook/line/route.ts` | LINE Webhook 主入口；進行簽章驗證、判斷輸入類型並分流呼叫對應之 AI 整理器，最後統一呼叫 `appendToLibraryV2` 並回覆使用者結構化重點。 |
| `src/lib/extractor.ts` | 內容解析層。提供社群網址解析 (`extractSocialContent`) 與一般網址解析 (`extractGeneralContent`)，支援 HTML Metadata 擷取與 oEmbed/Microlink API。 |
| `src/lib/gemini.ts` | AI 整理器。依據三種輸入流程使用特化 Prompt，呼叫 `gemini-2.5-flash` 產出摘要、重點、分類與標籤；內含保底 Try-Catch Fallback 降級處理。 |
| `src/lib/sheets.ts` | 資料讀寫層。包含寫入 `appendToLibraryV2`（帶 `sheet_name=library_v2`）與撈取 `fetchFromLibraryV2`。負責將 Array 欄位進行符號串接或解析。 |
| `src/lib/line.ts` | LINE 訊息通訊封裝。負責簽章驗證與 LINE 訊息回推 (Reply/Push)。 |
| `src/app/page.tsx` | 正式首頁伺服器元件。撈取 `fetchFromLibraryV2()` 並載入 `LibraryHomeClient`。 |
| `src/app/LibraryHomeClient.tsx` | 首頁客戶端元件。包含最新 10 筆收藏，支援即時過濾、搜尋，並提供用途快速入口。 |
| `src/app/list/page.tsx` & `LibraryListClient.tsx` | 列表頁路由與客戶端元件。提供多重篩選（用途、主題、來源、信心、時間）、3種排序（最新、最舊、高信心優先）與每頁 10 筆的分頁功能。 |
| `src/app/detail/page.tsx` & `LibraryDetailClient.tsx` | 詳細頁路由與客戶端元件。依 `?id=...` 渲染詳細卡片，支援「上一筆 / 下一筆」跳轉；無 `id` 時預設 fallback 渲染最新一筆。 |
| `src/app/library.css` | 收攏自 Demo 版的貼紙風、立體粗邊框陰影、雲朵裝飾之專屬全域 CSS 樣式。 |

---

## 3. 資料模型與 Schema (library_v2)

所有新版靈感資料統一持久化至 Google Sheets 的 `library_v2` 工作表。

### 欄位結構設計 (共 15 欄)

| 欄位名稱 | 資料型態 | Sheets 儲存格式與規則 |
|---|---|---|
| `id` | string | UUID (由 Next.js 端呼叫 `crypto.randomUUID()` 產生) |
| `input_type` | string | `text` (純文字) / `social_url` (社群) / `url` (一般網址) |
| `raw_input` | string | 使用者在 LINE 傳送的原始內容 (URL 或文字全文) |
| `source_title` | string | 網頁標題或文字片段擷取。純文字輸入預設為原文截短 (前30字) |
| `source_url` | string | 原始網址。純文字輸入時為空字串 `""` |
| `created_at` | string | 台北時間字串 (格式：`YYYY/MM/DD HH:mm:ss`) |
| `source_platform` | string | 識別來源：`threads`, `facebook`, `instagram`, `x`, `linkedin`, `web`, `LINE 文字` |
| `content_type` | string | 識別內容：`post` (貼文), `article` (文章), `tool` (工具), `video` (影片), `note` (隨手記) |
| `summary` | string | 一句話摘要 (字數限縮，用以第一層展示) |
| `key_points` | string | 重點整理。多個重點以 ` || ` 字元串接 (如：`重點1 || 重點2 || 重點3`) |
| `tags` | string | 分類標籤。以 `, ` 字元串接 (如：`tag1, tag2, tag3`) |
| `use_case` | string | 用途分類 (例如：`工具收藏`, `內容靈感`, `工作流程參考`, `產品研究`) |
| `topic_category` | string | 主題分類 (例如：`AI 工具`, `提示工程`, `社群行銷`, `程式開發`) |
| `confidence_level`| string | 理解信心度：`high` / `medium` / `low` (依正文擷取完整度判定) |
| `parse_status` | string | 解析狀態：`complete` / `partial` / `failed` |

---

## 4. Webhook 三分支輸入管線

Webhook 接收到 LINE 傳入的訊息後，區分三種輸入管線處理：

### 4.1. 純文字輸入路徑
- **判斷基準**：經正則表達式判定不包含 URL 之純文字。
- **內容解析**：不需擷取。直接呼叫 `organizeTextInspiration`。
- **寫入常數**：
  - `confidence_level = "high"`，`parse_status = "complete"`
  - `input_type = "text"`，`source_platform = "LINE 文字"`，`content_type = "note"`
  - `source_title` 採原始文字擷取前 30 字元加上 `...`。

### 4.2. 社群 URL 輸入路徑
- **判斷基準**：符合 Threads、Facebook、Instagram、X、LinkedIn 之網址。
- **內容解析 (`extractSocialContent`)**：
  1. 優先嘗試 oEmbed / Microlink API 擷取預覽或 JSON 片段。
  2. 若 API 遭防爬蟲阻擋，則降級為原生 HTML Metadata / Open Graph 擷取。
  3. 若均被阻擋，則保留網域降級，並自動標記為 `confidence_level = "low"`，`parse_status = "partial"`。
  4. 支援「使用者備註」：若訊息格式為 `URL 使用者註解`，則擷取註解，並將信心等級提昇為 `medium`。

### 4.3. 一般 URL 輸入路徑
- **判斷基準**：非上述社群平台之一般 HTTP/HTTPS 連結。
- **內容解析 (`extractGeneralContent`)**：
  1. 爬取原始 HTML，移除 script/style 標籤，擷取前 1000 個字元的正文片段。
  2. 輔以 Microlink API 擷取備援。
  3. 若擷取到足量正文，標記為 `high` 信心與 `complete` 狀態；若遭爬蟲防禦阻擋，則降級為 low/partial 收錄。
  4. 支援「使用者備註」整合：若攜帶備註，主動將信心提升一級（如 low 變 medium）。

---

## 5. Google Apps Script 整合與防崩潰

Google Apps Script (GAS) 代碼布署於版本 `@4`，透過 `clasp` 進行指令自動推送建置：

### doGet 參數化分流
GAS 端的 `doGet(e)` 支援 `e.parameter.sheet_name` 參數：
- 若未帶參數或參數非 `library_v2`，自動映射至**舊工作表** (`getLegacySheet()`)，維持舊版 API 向後相容。
- 若傳入 `?sheet_name=library_v2`，則讀取新工作表，自動依 header 標題動態組裝 JSON 物件數組回傳，免除硬編碼欄位索引之風險。

### doPost 分流寫入
- 依據 POST Payload 中的 `sheet_name` 參數決定寫入落點。
- 若工作表不存在，自動新建工作表並寫入 15 欄 Header，保證寫入安全性。

---

## 6. 舊資料清洗與批次遷移腳本 (`scripts/migrate_to_v2.js`)

為解決舊工作表與 `library_v2` 的資料整合，開發了高可靠遷移腳本。

### 強固設計細節
1. **Gemini Free Tier RPM 限制規避 (15 RPM 限額)**：
   - 每處理完一筆資料強制延遲 `4500ms`。
   - 若遭遇 `429 Too Many Requests` 頻率限制，觸發退避重試，自動延遲 `25000ms`，最多重試 3 次，失敗則寫入保底 fallback 值。
2. **防範 GAS 伺服器超載崩潰 (HTML Error Page)**：
   - GAS 因流量管制有時會回傳非 JSON 的 HTML 錯誤頁面。
   - 腳本中實作了 Try-Catch 捕獲，若解析 JSON 失敗會於 `10000ms` 後自動重試一次，若二次失敗則跳過該筆並寫入錯誤日誌，避免腳本中斷。
3. **Checkpoint 自動接續**：
   - 腳本在啟動時會先撈取 `library_v2` 所有已存在之資料，提取已有的原始輸入特徵進行比對。
   - 重新執行腳本時會自動跳過已遷移的記錄，支援斷點續傳。

---

## 7. 常見踩坑與解決紀錄

### 7-1. Next.js (Turbopack) 移除孤立路由後之 TypeScript 快取報錯
- **問題現象**：當手動刪除 `src/app/demo` 隔離目錄後，執行 `npm run build` 出現快取錯誤：
  `Cannot find module '../../../src/app/demo/library/detail/page.js' or its corresponding type declarations.`
- **問題根源**：Next.js 編譯器會在 `.next/dev/types/validator.ts` 留存動態路由之型別快取。移除實體檔案後，TypeScript check 仍會去掃描該快取檔而引發報錯。
- **修復方案**：在執行 `next build` 之前，必須先強制移除快取目錄：
  ```powershell
  Remove-Item -Path ".next" -Recurse -Force
  ```
