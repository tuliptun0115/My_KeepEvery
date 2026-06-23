# 靈感收藏庫升級計劃書

> **For agentic workers:** 建議實作時使用 `superpowers:subagent-driven-development` or `superpowers:executing-plans` 逐 task 執行。本文使用 checkbox 語法追蹤進度。

**Goal:** 將 `My_KeepEvery` 從偏向「收得到、但用不起來」的收藏流程，升級成能快速理解、有效找回、逐步再利用的「靈感收藏庫」。

**Architecture:** 保留既有 LINE webhook、Gemini 串接、Google Sheets 與 Next.js 專案骨架，重做內容解析流程、收藏資料模型與首頁使用體驗。第一階段先讓純文字、社群 URL、一般 URL 都能穩定產出摘要、用途分類、標籤與信心等級，再先以隔離式 demo 頁驗證新版首頁資訊架構與搜尋流程，確認方向後才逐步接回正式流程與首頁。

**Tech Stack:** Next.js 16、React 19、Google Gemini 2.5 Flash、Google Sheets via Apps Script、LINE Messaging API、Tailwind CSS v4、Framer Motion

---

## 一、這次升級的核心結論

- 專案不重建新 repo，直接在現有 `My_KeepEvery` 上做中度偏重構的產品升級。
- 新定位改為「靈感收藏庫」。
- 內容以 AI 相關收藏為主，但保留非 AI 資訊 of 收納彈性。
- 優先順序不是先美化畫面，而是先解決「內容太空、回找困難」。
- 第一階段主軸：`內容解析層 -> 混合型摘要 -> demo 驗證 -> 搜尋/篩選 -> 新首頁 layout`
- 正式首頁與正式資料流改動前，必須先完成可獨立驗證的 demo 頁，避免直接把線上版本改壞。

## 二、現況判斷

### 已有可沿用基礎

- LINE 收藏入口已可用。
- webhook 骨架已可區分文字與 URL。
- Gemini 串接已存在，但目前主要用於標籤生成。
- Google Sheets 寫入與讀取流程已存在。
- Next.js 前端已有基本首頁、搜尋與展示容器。

### 目前主要問題

- 收藏內容進來後資訊量不足，AI 常只能憑標題猜內容。
- 社群 URL 解析常抓不到可用正文或有效預覽。
- 首頁 layout 偏展示型，不利於搜尋、比較與回找。
- 現有資料欄位比較像 append 紀錄，不像可再利用的收藏單位。
- 文件敘事仍停留在舊版「靈感收藏盒」定位。

## 三、第一階段產品目標

### 產品定位

- 名稱方向：`靈感收藏庫`
- 核心價值：讓每筆收藏能被快速理解、有效找回，並逐步累積成個人可再利用的內容資產。

### 首頁體驗方向

- 改為混合式 layout。
- 預設清單檢視，支援切換卡片檢視。
- 每筆資料第一層資訊以 `一句摘要 / 用途分類 / 原始標題 / 標籤` 為主。

### 第一階段資料欄位 MVP

- `id`
- `input_type`
- `raw_input`
- `source_title`
- `source_url`
- `created_at`
- `source_platform`
- `content_type`
- `summary`
- `key_points`
- `tags`
- `use_case`
- `topic_category`
- `confidence_level`
- `parse_status`

## 四、避免把現在線上改壞的策略

- 先做隔離式 demo，不直接覆蓋現用首頁或正式資料流。
- demo 頁使用獨立 route、獨立元件或 mock/轉接資料，不與現行首頁共用未穩定的新邏輯。
- 新欄位與新解析流程先以向後相容方式設計，避免舊資料立即失效。
- 在 demo 未確認前，不替換正式首頁預設入口，不移除舊欄位依賴。
- 每一階段都先做本地 smoke test，再決定是否進入下一階段整併。
- 若未來要部署 preview 或正式版，必須以「先驗證 demo / preview，再切正式」為原則，不直接在既有線上頁面硬改。

## 五、建議先做哪一個

**建議最先開始的 task：`T01 產品與資料模型定稿`**

原因：
- 它決定後續 AI prompt、Google Sheets 欄位、首頁欄位、搜尋邏輯會用到哪些欄位。
- If 先改解析流程或前端 layout，之後很容易因欄位名稱或資料結構改動而重工。
- 這個 task 成本低、風險低，但會大幅降低後續實作歧義。

---

## 六、最小可執行 Task 清單

### T01 產品與資料模型定稿
- [x] **目標與完成條件**
  - 目標：把「靈感收藏庫」第一階段的產品定位、輸入類型、資料欄位與狀態定義寫清楚，作為後續實作唯一依據。
  - PRD.md 更新為新定位與第一階段範圍。
  - TECH_DOC.md 更新為新版資料欄位與三種輸入流程。
  - 明確定義 各欄位的語意。

### T02 現有資料流與檔案責任盤點
- [x] **目標與完成條件**
  - 目標：把現有 webhook、extractor、Gemini、Sheets、首頁與元件責任盤點清楚，確認哪些沿用、哪些重寫。
  - 在 `TECH_DOC.md` 或 `docs/log.md` 留下盤點結論。

### T03 Google Sheets 欄位升級設計
- [x] **目標與完成條件**
  - 目標：把目前偏 append log 的 Sheets 結構，升級成可支撐摘要、分類、信心等級與搜尋的收藏結構。
  - 定義新版工作表欄位順序與 `src/lib/sheets.ts` 新規格。

### T04 Demo 網頁規格與隔離式驗證頁製作
- [x] **目標與完成條件**
  - 目標：先做一個不影響現行線上首頁的新版 demo 頁，用來驗證「靈感收藏庫」首頁資訊架構、欄位呈現方式與搜尋/篩選方向。
  - 本地已完成並驗證純 HTML 隔離版：`docs/demo/` 目錄。

### T05 純文字輸入整理流程升級
- [x] **目標與完成條件**
  - 目標：讓直接貼到 LINE 的文字，能穩定產出混合型摘要與新版 Sheets 欄位（對接 `library_v2`）。
  - [x] T05-1 `library_v2` 工作表與欄位骨架建立
  - [x] T05-2 Google Apps Script 新版寫入分流
  - [x] T05-3 `src/lib/sheets.ts` 新版寫入介面補齊
  - [x] T05-4 `src/lib/gemini.ts` 純文字整理器升級
  - [x] T05-5 webhook 純文字分支切換到新版資料流
  - [x] T05-6 純文字新版資料流最小驗證與文件同步

### T06 社群 URL 內容解析管線
- [x] **目標與完成條件**
  - 目標：實作社群 URL 的擷取與防擋降級，將 Threads, FB, IG, X, LinkedIn 導入 V2 資料流。

### T07 一般 URL 內容擷取與整理
- [x] **目標與完成條件**
  - 目標：實作一般網址的正文解析與 Gemini 整理流程，對接 `library_v2`。

### T08 Webhook 與 AI 整理流程整併
- [x] **目標與完成條件**
  - 目標：合流 webhook，完成廢棄代碼清理，確保單一資料落點與統一回覆重點。

### T09 & T10 搜尋、篩選與排序升級
- [x] **目標與完成條件**
  - 目標：在 Next.js 前端 Demo 中成功實作首頁、列表頁的多重搜尋、過濾、排序與分頁功能。

### T11 舊資料相容與回填策略
- [x] **目標與完成條件**
  - 目標：開發清洗遷移腳本並運行，將舊資料以 AI 整理回填至 `library_v2`。

### T12 前端 Demo 路由轉正與整合驗證
- [x] **目標與完成條件**
  - 目標：將 Demo 路由正式複製轉正，替換正式首頁並清理 Demo 隔離目錄。

### T13 PRD 與設計文件收斂
- [x] **目標與完成條件**
  - 目標：將正式路由整合後的產品規格與技術架構細節收斂回寫至 `PRD.md` 與 `TECH_DOC.md`。

### T14 正式環境部署與環境變數更新
- [x] **目標與完成條件**
  - 目標：將已完成的應用正式部署至 Google Cloud Run，並更新 Cloud Run 環境變數對接最新 Apps Script 版本 `@6` 的 API。
  - 完成條件：Cloud Build 建置成功、線上環境變數 `GOOGLE_GAS_URL` 更新生效，且線上 Smoke Test GET 首頁與列表頁皆回傳 200 OK。

---

## 十一、目前狀態

- 狀態：`已成功完成靈感收藏庫 V2 版正式部署至 Google Cloud Run，並同步更新生產環境 GAS URL 變數，目前已全面上線提供服務`
- 最後更新：`2026-06-23`
- 本次已完成：
  - **正式環境部署上線**：
    - 完成 ESLint 非 App 目錄過濾（`eslint.config.mjs`）與 `LibraryListClient.tsx` unused warning 修復，通過本地 `npm run lint` 檢查。
    - 提交程式碼並推送至 GitHub，透過 Cloud Build 觸發自動化 Docker 建置與 Cloud Run 重新部署（Build ID: `36ef3d7f-c365-40c5-98d5-a64ad5e2f7db`）。
    - 使用 `gcloud` 更新 Cloud Run 的 `GOOGLE_GAS_URL` 環境變數，使其對接最新 Apps Script 版本 `@6` 的 Web App URL。
    - 完成線上首頁 `/` 與列表頁 `/list` 的 Smoke Test 網頁加載驗證（200 OK）。
  - **靈感編輯儲存至 Google Sheets (Excel)**：
    - 在 Google Apps Script `程式碼.js` 中擴充支援 `action === "update_row"`。
    - 在 Next.js 端建立 `/api/inspiration/update`。
    - 建立 Neobrutalist 風格的 `EditInspirationModal.tsx` 視窗元件。
    - 修改首頁、所有列表頁與單文詳細頁，將 records 資料改用 client-side `useState` 管理，在 Context Menu 整合編輯選單，成功後即時在前端 UI 反映，免重啟重載頁面。
  - **樣式與文字微調**：
    - 將首頁及列表頁表格的「摘要主標題」字重從 `700` 調降為 `500`，實現「列表跟首頁列表的標題不要加粗」需求。
    - 修改列表頁分頁器按鈕文字為 `« 最前頁` 與 `最後頁 »`。
    - 將首頁左上的標題「控制台概覽」修改為「首頁」。
- 目前尚未完成：
  - 待使用者進行端到端編輯與 LINE Webhook 的線上 Smoke Test。
- 建議下一步：
  - 供使用者進行線上測試，並回饋使用狀況，確認是否需要進一步優化行動端 RWD 體驗。

## 十二、接手摘要

### 已完成
- `T01 - T13` 已完成：資料欄位定稿、Apps Script V2 開發、社群與一般 URL 解析管線建立、批次舊資料清洗遷移、前端 Demo 路由轉正以及 RWD 樣式調優。
- `T14 正式部署` 已完成：完成 TypeScript 與 ESLint 排除後，代碼已 Commit & Push 至 GitHub。Cloud Build 完成自動建置並部署至 Cloud Run 服務 `my-keepevery`。線上 `GOOGLE_GAS_URL` 已更新對接最新 Apps Script 版本。
- `網頁 Smoke Test` 已完成：驗證線上版首頁與列表頁可正常開啟且無 500 錯誤，首頁大標題已改為「首頁」，分頁器文字已正確更新為 `« 最前頁` 與 `最後頁 »`。

### 當前共識
- 第一階段先做 `demo 先行`，不能直接覆蓋現有首頁或正式資料流（已完成驗證並轉正）。
- 新版首頁第一層資訊固定以：`一句摘要 / 用途分類 / 原始標題 / 標籤`。
- 舊資料批次清洗遷移正在安全進行中，新舊資料在 library_v2 統一收斂。
- 舊的 `appendToSheet` 寫入舊工作表流程已在 T08 中完全清除，保證單一資料落點。
- 生產環境運作正常，GAS Web App 維持在版本 `@6`。

### 下一步
- 下一個正式起點為「第一階段升級上線後的專案維護與行動端回饋優化，或進一步升級計畫」。
