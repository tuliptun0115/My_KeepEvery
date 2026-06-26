# TECH_DOC - 靈感收藏庫技術規格

## 1. 文件目的

本文件定義「靈感收藏庫 + 指令寶庫」的正式技術架構、資料模型、Webhook 輸入管線、Sheets / GAS 分工與前端路由責任，作為後續接手與維護的技術 SSOT。

---

## 2. 系統架構

```text
LINE 使用者
  -> LINE Messaging API
    -> Next.js API Route (Webhook)
      -> 輸入分流 (Prompt / 純文字 / 社群 URL / 一般 URL)
      -> 內容解析層 (extractor.ts)
      -> AI 整理與判斷層 (gemini.ts)
      -> Sheets 寫入層 (sheets.ts -> GAS Web App)
      -> LINE 回覆層 (line.ts)

Next.js 前端
  -> /                靈感首頁
  -> /list            靈感列表頁
  -> /detail          靈感詳細頁
  -> /prompts         指令寶庫首頁
  -> /prompts/list    指令寶庫列表頁
  -> /prompts/detail  指令寶庫詳情頁
```

---

## 3. 核心檔案責任

| 檔案 | 職責 |
|---|---|
| `src/app/api/webhook/line/route.ts` | LINE Webhook 主入口；進行簽章驗證、輸入判斷與 prompt / 靈感分流。 |
| `src/lib/extractor.ts` | 內容解析層，處理社群網址與一般網址擷取。 |
| `src/lib/gemini.ts` | AI 整理與判斷層；處理靈感摘要、prompt 偵測、prompt 分類。 |
| `src/lib/sheets.ts` | Google Sheets 讀寫層；分流 `library_v2` 與 `prompt_library`。 |
| `gas/程式碼.js` | GAS Web App；處理 `doGet` / `doPost`、sheet 建立、append、update。 |
| `src/lib/line.ts` | LINE Reply / Push 與簽章驗證封裝。 |
| `src/components/Sidebar.tsx` | 主站側邊欄入口，含首頁、靈感列表、指令寶庫。 |
| `src/app/page.tsx` / `LibraryHomeClient.tsx` | 靈感首頁。 |
| `src/app/list/page.tsx` / `LibraryListClient.tsx` | 靈感列表頁。 |
| `src/app/detail/page.tsx` / `LibraryDetailClient.tsx` | 靈感詳情頁。 |
| `src/app/prompts/page.tsx` / `PromptListClient.tsx` | 指令寶庫首頁。 |
| `src/app/prompts/list/page.tsx` / `PromptListClient.tsx` | 指令寶庫列表頁。 |
| `src/app/prompts/detail/page.tsx` / `PromptDetailClient.tsx` | 指令寶庫詳情頁。 |
| `src/components/AddPromptModal.tsx` / `EditPromptModal.tsx` | Prompt 新增與編輯 UI。 |
| `src/app/library.css` | 站內共用視覺樣式，含靈感與 prompt 頁面的樣式延伸。 |

---

## 4. 資料模型：`library_v2`

所有靈感資料統一持久化至 Google Sheets 的 `library_v2` 工作表。

| 欄位名稱 | 型別 | 說明 |
|---|---|---|
| `id` | string | UUID |
| `input_type` | string | `text` / `social_url` / `url` |
| `raw_input` | string | 使用者原始輸入 |
| `source_title` | string | 標題或截短文字 |
| `source_url` | string | 原始網址 |
| `created_at` | string | 台北時間 |
| `source_platform` | string | 來源平台 |
| `content_type` | string | `post` / `article` / `tool` / `video` / `note` |
| `summary` | string | 一句話摘要 |
| `key_points` | string[] / string | 重點整理；Sheets 內以 ` || ` 串接 |
| `tags` | string[] / string | 標籤；Sheets 內以 `, ` 串接 |
| `use_case` | string | 用途分類 |
| `topic_category` | string | 主題分類 |
| `confidence_level` | string | `high` / `medium` / `low` |
| `parse_status` | string | `complete` / `partial` / `failed` |

---

## 5. 資料模型：`prompt_library`

所有 prompt 資料獨立持久化至同一份 Google Sheets 的 `prompt_library` 工作表，不混入 `library_v2`。

| 欄位名稱 | 型別 | 說明 |
|---|---|---|
| `id` | string | UUID |
| `prompt_category` | string | 固定 5 類之一 |
| `prompt_text` | string | 完整 prompt 內容 |
| `created_at` | string | 首次建立時間 |
| `updated_at` | string | 最後更新時間 |
| `source_type` | string | `line` / `web` |

### Prompt 分類固定集合

- `寫作生成`
- `行銷文案`
- `工作效率`
- `開發技術`
- `其他`

---

## 6. Webhook 輸入分流

### 6.1 Prompt 路徑

- 若訊息中含有 URL，直接排除，不進 prompt。
- 若文字帶有 `/prompt` 前綴，直接視為 prompt。
- 若無 `/prompt` 前綴，則由 AI 判斷是否為 prompt。
- 若判定為 prompt：
  - AI 進行分類
  - 寫入 `prompt_library`
  - `source_type = line`

### 6.2 純文字靈感路徑

- 不含 URL
- 經 prompt 判定後確認不是 prompt
- 呼叫 `organizeTextInspiration()`
- 寫入 `library_v2`

### 6.3 社群 URL 路徑

- 網址屬於 Threads、Facebook、Instagram、X、LinkedIn
- 使用 `extractSocialContent()`
- 允許降級擷取與低信心收錄
- 寫入 `library_v2`

### 6.4 一般 URL 路徑

- 非社群平台的一般 HTTP/HTTPS 連結
- 使用 `extractGeneralContent()`
- 補抓正文、描述或片段
- 寫入 `library_v2`

---

## 7. AI 層責任

### 靈感整理

- `organizeTextInspiration()`
- `organizeSocialInspiration()`
- `organizeGeneralInspiration()`

### Prompt 判斷與分類

- `detectPromptIntent(text)`
  - 判斷內容是否屬於可直接驅動 AI 的 prompt / 指令
- `classifyPromptCategory(text)`
  - 將 prompt 分到固定 5 類之一

### Fallback 原則

- Prompt 判斷失敗時，預設不要誤寫入 `prompt_library`
- Prompt 分類失敗時，可回落為 `其他`
- 靈感整理維持既有保底 fallback，避免整條流程中斷

---

## 8. Google Apps Script / Sheets 分流

### `doGet`

- `sheet_name=library_v2`：回傳靈感收藏資料
- `sheet_name=prompt_library`：回傳 prompt 資料
- 未指定 `sheet_name`：維持既有舊工作表相容策略

### `doPost`

- `sheet_name=library_v2`
  - append 靈感資料
  - `action=update_row` 更新靈感資料
- `sheet_name=prompt_library`
  - append prompt 資料
  - `action=update_row` 更新 prompt 資料

### 建表與 Header 原則

- 若 sheet 不存在，自動建立
- `library_v2` 與 `prompt_library` 各自維持自己的 header 常數
- 不使用 active sheet 作為新模組落點

---

## 9. 前端頁面責任

### 靈感首頁 `/`

- 顯示最新靈感收藏與第一層回找入口

### 靈感列表頁 `/list`

- 提供搜尋、多重過濾、排序與分頁

### 靈感詳情頁 `/detail`

- 顯示單筆靈感完整內容與上下文導覽

### 指令寶庫首頁 `/prompts`

- 輕量化展示最新 5 筆指令，不含搜尋與篩選。
- 提供「看更多指令 →」連結跳轉至完整列表頁。

### 指令寶庫列表頁 `/prompts/list`

- 顯示分類、指令內容預覽、建立時間、更新時間
- 支援搜尋分類與指令內容
- 支援：
  - 一鍵複製
  - 直接編輯
  - 手動新增
  - 進入詳情頁

### 指令寶庫詳情頁 `/prompts/detail`

- 顯示完整 prompt
- 顯示分類、來源、建立時間、更新時間
- 支援編輯與複製

---

## 10. 文件與任務分工規則

- `PRD.md`：正式產品需求
- `TECH_DOC.md`：正式技術設計
- `plan.md`：整體進度與目前狀態
- `docs/tasks/*.md`：單一子功能的 task 拆解與執行清單

### 命名規則

- task 文件統一放在：`docs/tasks/`
- 檔名格式統一為：`YYYY-MM-DD-feature-slug.md`
- feature slug 統一使用小寫 `kebab-case`
- task 編號統一使用功能前綴，例如：
  - `PL-01`、`PL-02` for `prompt-library`
  - `RWD-01` for `mobile-rwd`

---

## 11. 驗證原則

- task 只存在 `docs/tasks/`，不塞進 `PRD.md` / `TECH_DOC.md`
- 靈感收藏與指令寶庫資料邊界需維持獨立
- 任何正式宣告完成前，都應至少有對應的 lint / build / smoke test 驗證
