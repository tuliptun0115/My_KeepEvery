# log.md (工作日誌)

## 歷程更新與實作詳細記錄

### v1.1.26 — 2026-06-23
- **[Mobile RWD Sidebar & Scroll Fix]** 手機版 RWD 側邊欄隱藏遮擋與滾動性修復：
  - **CSS 樣式加載收攏**：將 `library.css` 統一在根佈局 `src/app/layout.tsx` 最上方引入，並移除 `src/app/page.tsx`、`src/app/list/page.tsx`、`src/app/detail/page.tsx` 中重複的 CSS 引入。這保證了全站佈局元件（尤其是 Layout 中的常駐 `Sidebar`）能獲得一致的 RWD 渲染樣式。
  - **手機版選單隱藏強固**：在手機版 RWD（`@media (max-width: 768px)`）下，為 `.sidebar` 的 `transform: translateX(-100%)` 與 `.sidebar.mobile-open` 的 `transform: translateX(0)` 加上 `!important` 宣告，徹底阻斷 Tailwind 或其他外部樣式干擾造成的選單默認遮擋問題。
  - **主內容容器防禦性高度與滾動**：為主內容容器 `div` 加上 `main-content` 類名，並在手機版媒體查詢下強制設定高度為 `100vh !important` 且 `overflow-y: auto !important`，搭配 `-webkit-overflow-scrolling: touch`，確保在 `body` 設有 `overflow-hidden` 時主內容仍能獨立且流暢地滾動。
  - **首頁統計卡片全卡點擊優化**：將首頁控制台的 4 個數據統計卡片全部重構為 Link 連結，在 `library.css` 新增 `.stat-card.link-card` 樣式配合 hover 位移與陰影，顯著放大了點擊熱區，不再局限於點擊數字。
  - **最新更新時間卡片還原**：將最新更新時間統計卡片改回純展示的 `div` 容器，移除 Link 點擊行為。
  - **單則頁上一筆/下一筆邏輯修正**：將上一筆與下一筆的邏輯判定對調。現在最新第一筆僅會顯示「下一筆」（點擊跳往較舊的第 2 筆），最後最舊的一筆僅會顯示「上一筆」，完全符合直覺。
  - **單文頁操作選單功能與標準日期**：
    - 在單文詳細頁面中，加入與列表頁相同的 Dots「操作」按鈕和浮動選單，提供複製摘要、刪除收藏（唯讀提示）與打開原文功能。
    - 實作 `formatDateTime` 函數將日期時間顯示改為標準的 `YYYY-MM-DD HH:mm:ss`（年月日 時分秒）格式呈顯。
  - **試算表連結修正**：將首頁右上角「開啟試算表」按鈕的連結更新為帶有指定工作表分頁參數 (gid=1533933858) 的新 URL。
  - **首頁搜尋工具列移除**：移除了首頁控制台的搜尋與過濾 Form 表單元件，保持控制台的簡潔功能；同時清理了無用的 state、 helper 與 `useRouter`、`useCases` 匯入，將最新收藏改為直接且固定渲染最新 10 筆資料 (`latestRecords`)。
  - **本地建置與驗證**：通過 `npm run lint` (0 errors) 與 `npm run build` 動態路由、API 生產建置打包驗證。

### v1.1.25 — 2026-06-23
- **[SaaS UI Refinement & RWD Optimization]** 介面精簡、小字放大與 RWD 調優：
  - **全站與側邊欄精簡**：移除頂部導覽列 `<TopNav />`；移除側邊欄底部的 LINE 掃碼收藏卡片；同時為左側快速入口的主題分類加上自訂優先排序，確保 Prompt 和 AI 工具永遠顯示在最上方。
  - **表格欄位精簡與 RWD 卡片化**：移除首頁與列表頁表格中的「來源平台」與「解析狀態」欄位。針對手機版（`< 768px`），實作 CSS Table-to-Card 自適應佈局，將 Table 轉換為 Neobrutalism 卡片流，確保在手機上瀏覽無爆版。
  - **詳細頁 Hero 移除與右上導航**：刪除單文詳細頁頂部的 Hero 區塊與底部 detail-nav，於卡片框外右上方加上輕量文字導航：`← 回列表頁 | 上一筆 | 下一筆`。同時將單文頁大框寬度限制調整為與首頁/列表頁完全一致的 1200px (maxWidth: '1200px')，達成視覺寬度的一致性。
  - **雲朵防阻礙與小字放大**：設定裝飾雲朵為 `pointer-events-none z-[-10] opacity-20`，避免遮擋文字與滑鼠事件；將全站小字體（原 10px ~ 13px）統一放大 1 級；並將 `.shell` padding-bottom 覆寫為 100px，為首頁、列表頁與詳細頁留出充足的底端視覺留白。
  - **點擊統計數字過濾**：將首頁統計數據卡片中的高品質數值與部分解析數值包裝為連結，點擊即可跳轉至列表頁，列表頁加入對應 state 與 url 過濾。列表頁搜尋工具列改為與首頁一致的簡單過濾。

### v1.1.24 — 2026-06-23
- **[SaaS Page & Table Layout Refactor]** 網頁配置 SaaS 化與表格化重構：
  - **頂部導覽列 (TopNav)**：新增 `src/components/TopNav.tsx`，在主內容區上方常駐顯示 active 頁籤（控制台概覽、所有靈感列表）、系統通知鈴鐺、管理員頭像與姓名。
  - **手動新增靈感 API 與 Modal**：新增 `/api/inspiration/add` API 路由與 `src/components/AddInspirationModal.tsx` 彈窗元件，使使用者可於網頁端手動貼上靈感正文或網址並即時觸發 AI 解析與 Sheets 寫入，重用 webhook 所有管線邏輯。
  - **大表格與 Context Menu**：重構 `src/app/LibraryHomeClient.tsx` (首頁) 與 `src/app/list/LibraryListClient.tsx` (列表頁) 為 Table 表格排版，橫向呈現勾選框、序號、平台、摘要與原標題、主題、用途、解析狀態與收藏時間。每行最右側實作 Context Menu，點擊 `...` 彈出，支援詳情跳轉、原文外連、複製摘要至剪貼簿與刪除唯讀提示。
  - **CSS 樣式與打包驗證**：在 `src/app/library.css` 追加 TopNav、Modal、Table、ContextMenu 和 Toast 的 Neobrutalism 樣式。本地執行 `npm run lint` (0 errors, 14 warnings) 與 `npm run build` 通過編譯建置。

### v1.1.23 — 2026-06-23
- **[Layout Refactor]** SaaS 雙欄佈局重構與儀表板美化：
  - **常駐側邊欄 (Sidebar)**：新增 `src/components/Sidebar.tsx` 元件，將主題分類選單常駐於左側邊欄，支援 ✦ Logo 動態旋轉動畫、總量實時統計，並在底部配備 LINE 機器人好友掃碼收藏指南卡片。
  - **全站雙欄 Layout 整合**：重構 `src/app/layout.tsx` 為 Server Component，直接在 Server 端撈取主題列表，動態渲染側邊欄，並與右側主內容區流暢整合。
  - **首頁儀表板控制台 (Dashboard)**：修改 `src/app/LibraryHomeClient.tsx`，移除舊有 Hero 與首頁快速入口（已轉移至側邊欄），改用橫向並排的 **4 個 SaaS 數據統計卡**（總收藏數、高品質 AI 整理、部分解析數、最新更新時間），並對齊列表頁簡約卡片風格，隱藏分類晶片與標籤晶片。
  - **CSS 樣式追加**：在 `src/app/library.css` 追加側邊欄、SaaS 統計卡等專屬樣式，維持 Neobrutalism Neubrutalist 粗邊框與立體陰影科技美學。

### v1.1.22 — 2026-06-23
- **[UI Tweak]** 列表頁與首頁卡片 UI 簡化：
  - 依據使用者反饋，將列表頁 (`/list` 路由) 與首頁 (`/` 路由) 的最新收藏卡片中，主題分類、用途分類晶片以及下方的標籤 tags 區塊移除，使列表排版更加簡潔，提升掃描與閱讀效率。
- **[Sheet Sync]** 執行 Google Sheets `library_v2` 歷史資料雙重清洗與重新歸類：
  - **用途分類收斂限制 (8大類別)**：在 `src/lib/gemini.ts` 內將 `use_case` 限制在 8 大核心類別內（Prompt、內容靈感、工具收藏、工作流程參考、技術參考、產品研究、商業與市場、待分類）。
  - **自動化清洗與同步**：升級並執行 `scripts/clean_v2_categories.js` 腳本，除主題外，亦對 101 筆歷史資料之 `use_case` 進行重新評估洗滌。11 筆 prompt 相關資料自動且固定歸為 `Prompt` (主題與用途均對齊)，其餘 50 筆不合規的舊用途分類成功透過 AI 重分類收斂，最終全量 101 筆資料皆成功且安全地覆寫同步至雲端 Google Sheets，完全對齊新標準。
  - **GAS 批次覆寫 API 擴充**：在 `gas/程式碼.js` (與 `scripts/google_sheets_gas.js`) 內的 `doPost` 函式中新增對 `action === "overwrite_sheet"` 的支援。該 API 能清空特定分頁（保留 Header）並使用 `setValues()` 一次性批次覆寫多筆資料。使用 `clasp` 將 Apps Script 更新部署至版本 `@5`。

### v1.1.21 — 2026-06-23
- **[Dev]** 限制與整合主題分類 `topic_category` 最多不超過 10 個：
  - 規劃並實施了 10 個主題分類：`Prompt`、`AI 工具`、`社群行銷`、`產品設計`、`前端開發`、`工作流程`、`商業策略`、`內容創作`、`日常隨筆`、`其他`。
  - 在 `src/lib/gemini.ts` 內修改 `organizeTextInspiration`、`organizeSocialInspiration` 和 `organizeGeneralInspiration` 三個函式中的 Prompt，限制 AI 只能從上述 10 個收斂的主題分類中進行選擇。
- **[Dev]** 加強 Prompt 內容自動歸類：
  - 在 Prompt 的限制規則中特別加強引導：若使用者收藏的內容屬於 prompt 指令（提示詞範本）或 prompt 教學、心得時，`topic_category` 與 `use_case` 均必須固定分類為 `Prompt`，確保資料落點的語意一致性。
- **[Verification]** ESLint 與建置驗證：
  - 執行 `npm run lint` 通過，專案無任何 ESLint Error。

### v1.1.20 — 2026-06-23
- **[Dev]** 實作 `T12 Demo 頁面轉正與整合驗證`：
  - 正式將 `/demo/library` 下的所有隔離元件與樣式複製轉正為正式路由。
  - 正式首頁：`src/app/page.tsx` 替換為新版收藏庫首頁，對接 `fetchFromLibraryV2()` 並渲染 `LibraryHomeClient`。
  - 正式列表頁：建立 `src/app/list/page.tsx` 與 `LibraryListClient.tsx`，支援完整搜尋、多重過濾與排序。
  - 正式詳細頁：建立 `src/app/detail/page.tsx` 與 `LibraryDetailClient.tsx`，支援 `?id=...` 與上一筆/下一筆跳轉。
  - 將轉正後的所有連結網址修復，移除 `/demo/library` 前綴。
- **[UI Tweak]** 調整首頁快速檢索入口：
  - 將首頁搜尋框下方的「用途入口」改為「主題入口」，改為遍歷 `topic_categories` 並攜帶 `topic` 參數跳轉列表頁，提升回找檢索體驗。
- **[Cleanup]** 清理舊版資源與隔離目錄：
  - 刪除整個隔離開發使用的 `src/app/demo` 目錄，維護 Workspace 乾淨。
  - 刪除舊 Bento 牆已不再引用的孤立元件 `src/components/InspirationGrid.tsx`。
- **[Build & Cache Fix]** 解決 TypeScript 宣告殘留問題：
  - 移除了 demo 目錄後，TypeScript 編譯因為 `.next` 快取中仍有 `AppPageConfig<"/demo/library/detail">` 快取宣告檔案而報錯。
  - 透過 `Remove-Item -Path ".next" -Recurse -Force` 清理編譯快取，重跑建置後順利修復。
- **[Verification]** ESLint 與 Production Build 驗證：
  - 執行 `npm run lint` 通過，專案核心代碼 0 Error (僅餘 15 warnings，無 errors)。
  - 執行 `npm run build` 通過，正確編譯生成並打包 `/`、`/list`、`/detail` 等正式路由。
- **[Database & Migration Quota Fix]** 舊資料遷移 API 額度超限踩坑與修正：
  - 遇到 `generativelanguage.googleapis.com/generate_content_free_tier_requests` 每日 20 次 Quota 超限問題，導致中途遷移之資料退化成 fallback 寫入。
  - **優化腳本**：修改 `scripts/migrate_to_v2.js`，取消 fallback 寫入機制，改為在遇到 Gemini API 429 或連線異常時，主動中斷腳本安全退出 (`process.exit(1)`)，以防低質量空白資料污染試算表。
  - **清理與重啟**：指引使用者手動清理試算表中第 23 列（含）之後的 fallback 行，並更換 `.env.local` 內新的 `GEMINI_API_KEY`。
  - **遷移結果**：重新執行後順利續傳，成功以高品質 AI 整理完成全量 88 筆舊資料的遷移歸檔（成功遷移 80 筆，跳過重複 8 筆），無縫回寫 `library_v2`。

### v1.1.19 — 2026-06-22
- **[Dev]** 實作 `T09 首頁資訊架構與 layout 重做` & `T10 搜尋、篩選與排序升級` 前端對接與 Apps Script doGet 參數改良。
- **[Dev]** 修改 `gas/程式碼.js` 的 `doGet(e)`：
  - 新增對 `e.parameter.sheet_name` 的判斷，支援從 `library_v2` 撈取新版 15 欄位資料。
  - 使用 `clasp push` 與 `clasp deploy` 部署至版本 `@4`，Web App 網址維持不變。
- **[Dev]** 在 `src/lib/sheets.ts` 新增 `fetchFromLibraryV2()` 函數，讀取真實 V2 資料並轉換為 `LibraryRecordV2[]`。
- **[Dev]** 在隔離 Demo 路由 `/demo/library` 下實作新前端網頁：
  - `page.tsx` & `LibraryHomeClient.tsx`：新版收藏庫首頁，對接真實 `library_v2` 資料，最新顯示 10 筆，並支援首頁即時搜尋與用途快速入口。
  - `list/page.tsx` & `LibraryListClient.tsx`：新版收藏庫列表頁，支援多重過濾篩選（相對時間、信心、來源平台）、3 種排序、10筆/頁分頁。
  - `detail/page.tsx` & `LibraryDetailClient.tsx`：新版詳細頁，讀取 URL `?id=...` 展示摘要與 2-3 個重點，支援上一筆/下一筆快速切換。
  - 拷貝 `docs/demo/library-styles.css` 至 `src/app/demo/library/library.css` 引入。
- **[Dev]** 實作 `T11 舊資料相容與回填策略` 的批次清洗遷移腳本 `scripts/migrate_to_v2.js`：
  - 讀取舊資料後，依據 URL 特徵自動判斷 `input_type`。
  - 呼叫 Gemini AI (`gemini-2.5-flash`) 對舊有的標題與標籤進行結構化摘要、主題與用途推導，免除爬取失效網頁問題。
  - **強固重試與 Rate Limit**：預設每筆延遲 4.5 秒（以符合 15 RPM 限額），若遇 429 錯誤自動延遲 25 秒並重試最多 3 次，最後 fallback 至預設值，高可靠性安全回填資料。
  - **HTML 防崩潰機制**：若 GAS 超載返回 HTML 格式錯誤頁面，腳本會捕獲錯誤並於 10 秒後重試一次，若再次失敗則跳過該筆，保證遷移程序不崩潰中斷。
- **[Verification]** ESLint 語法檢查與 Next.js 打包建置：
  - 修復了 prefer-const、`any[]` 轉換等 ESLint 錯誤，`npm run lint` 通過且為 0 errors。
  - `npm run build` Turbopack 打包順利成功，生成 `/demo/library` 等 3 個 dynamic 路由。

### v1.0.0 — 2026-04-26
- **[Dev]** 實作 LINE Bot Webhook 接收與處理使用者傳送的靈感訊息（文字與 URL）。
- **[Dev]** 串接 Gemini 2.5 Flash API 自動生成 3 個繁體中文標籤分類。
- **[Dev]** 透過 Google Apps Script 將靈感寫入 Google Sheets 持久化儲存。
- **[Dev]** Next.js 儀表板架構建立，支援 Bento Grid 佈局、搜尋與標籤篩選。
- **[Dev]** 實作 Docker 容器化打包配置。
- **[Docs]** 完成 API 驗證手冊與 Cloud Run 部署指南。

### v1.1.0-planning — 2026-06-20
- **[Review]** 重新檢視使用者提供的 `AI Intelligence Hub 專案計畫書.docx`，並與現有 `My_KeepEvery` 專案現況比對。
- **[Finding]** 初步曾判斷 docx 偏向團隊知識平台，但經使用者澄清後，確認真實目標不是團隊協作，而是解決「現在雖然收得到，但幾乎無法使用」的個人收藏痛點。
- **[Decision]** 不重建新專案，改採「在現有 repo 上進行中度偏重構升級」策略。
- **[Decision]** 產品定位由偏展示感的「靈感收藏盒」調整為「靈感收藏庫」。
- **[Decision]** 內容範圍不鎖死 AI；雖然 AI 內容會是主要收藏類型，但需保留非 AI 收藏內容的彈性。
- **[Decision]** 使用者確認摘要形式採 `混合型`：一句摘要 + 2-3 個重點。
- **[Decision]** 使用者最常收藏的是 `社群 URL`，且通常只貼網址，不會附註解；因此系統不能假設使用者會補上下文。
- **[Decision]** 對抓不到完整內容的社群連結，採 `低信心收錄`，而不是直接丟棄。
- **[Decision]** 使用者回找資料時的主要心智順序是：`主題 -> 用途 -> 來源 -> 模糊印象`。
- **[Decision]** 首頁 layout 改為 `混合式`，預設清單檢視，可切換卡片檢視；每筆第一層資訊以 `一句摘要 / 用途分類 / 原始標題 / 標籤` 為主。
- **[Decision]** 第一階段優先順序確認為：`內容解析層 -> 混合型摘要 -> 搜尋/篩選 -> 新首頁 layout`。
- **[Design]** 新版收藏單位的 MVP 欄位確認為：
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
- **[Design]** 三種輸入流程方向確認：
  - 純文字：直接做完整 AI 整理
  - 社群 URL：做可降級內容解析
  - 一般 URL：補正文或替代內容擷取後再整理
- **[Design]** 現有技術骨架可沿用：LINE webhook、Gemini 串接、Google Sheets、Next.js 專案骨架。
- **[Design]** 應重做或重構的區塊：資料欄位模型、內容解析流程、首頁 layout、搜尋/篩選、產品文件敘事。
- **[Plan]** 已將本次結論整理為正式升級計劃書寫入 `plan.md`，並拆解成 12 個最小可執行 task。
- **[Plan]** 建議下一步先從 `T01 產品與資料模型定稿` 開始，先對齊 `PRD.md` 與 `TECH_DOC.md`，再進入實作。
- **[Verification]** 本次僅進行文件分析、程式結構閱讀與計劃書撰寫，未執行 build、test 或部署。

### v1.1.1-planning — 2026-06-20
- **[Docs]** 完成 `T01 產品與資料模型定稿`，已重寫 `PRD.md` 與 `TECH_DOC.md`，正式改用「靈感收藏庫」敘事。
- **[Decision]** `PRD.md` 正式確認三種輸入流程：純文字、社群 URL、一般 URL。
- **[Decision]** `PRD.md` / `TECH_DOC.md` 正式確認新版欄位語意：`summary`、`key_points`、`use_case`、`topic_category`、`confidence_level`、`parse_status`。
- **[Decision]** 正式納入 `demo 先行` 與 `避免直接改壞線上` 原則，作為後續首頁優化與正式整併的 gating 規則。

### v1.1.2-planning — 2026-06-20
- **[Review]** 執行 `T02 現有資料流與檔案責任盤點`，完成目前核心檔案責任檢視。
- **[Finding]** `src/app/api/webhook/line/route.ts` 目前同時承擔輸入判斷、標題擷取、AI 標籤、資料寫入與 LINE 回覆，責任過重，但仍可保留為正式 webhook 入口。
- **[Finding]** `src/lib/extractor.ts` 目前本質仍是「標題提取器」，雖有 oEmbed、Microlink 與 HTML 備援，但尚不足以支撐新版社群 URL / 一般 URL 的內容解析層。
- **[Finding]** `src/lib/gemini.ts` 目前只輸出 3 個標籤與可選 `real_title`，無法支撐新版收藏單位所需的摘要、重點、用途、主題、信心與狀態。
- **[Finding]** `src/lib/sheets.ts` 目前 schema 仍是 `time/title/tags/source`，且夾帶前端展示用的 `color` / `size` 衍生資料，顯示資料層與 UI 展示耦合。
- **[Finding]** `src/app/page.tsx` + `src/components/InspirationGrid.tsx` 目前仍是展示型 Bento Grid + 簡易搜尋，不符合新版「回找導向」首頁。
- **[Decision]** 可沿用骨架：LINE webhook 入口、LINE 封裝、Next.js 首頁入口、基礎 URL 擷取能力、Google Sheets 串接管道。
- **[Decision]** 優先重構區塊：Gemini 輸出契約、Sheets schema、URL 解析層、首頁主展示元件。
- **[Docs]** 已將 T02 的檔案責任盤點正式寫入 `TECH_DOC.md`，作為後續 `T03` 與 demo 規劃的基礎。
- **[Verification]** 本次僅進行檔案閱讀與文件更新，未執行 build、test 或部署。

### v1.1.3-planning — 2026-06-20
- **[Review]** 執行 `T03 Google Sheets 欄位升級設計`，補讀現有 `scripts/google_sheets_gas.js` 與 `src/lib/sheets.ts`，確認舊版實際 schema 為 4 欄：`time / title / tags / source`。
- **[Finding]** 目前 GAS `doGet` / `doPost` 都使用固定欄位索引與固定欄位順序，擴充性不足，若直接加欄位而不重構，未來很容易讀寫錯位。
- **[Decision]** 第一階段新版工作表欄位順序正式定為：
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
- **[Decision]** 第一階段採「新資料用新版 schema、舊資料保留但允許留空」策略，不立即做批次回填。
- **[Decision]** 舊資料映射原則先採保守策略：`summary` 暫以舊 `title` 代替、`confidence_level = low`、`parse_status = partial`，避免假裝舊資料已被完整理解。
- **[Decision]** `key_points` 第一階段先以單欄字串保存，建議分隔格式為 `重點1 || 重點2 || 重點3`；`tags` 先以逗號分隔字串保存，降低 Sheets / GAS 改造成本。
- **[Decision]** `src/lib/sheets.ts` 後續應移除 `color` / `size` 這類 UI 衍生欄位，回歸為新版收藏資料介面；視覺屬性改在前端展示層處理。
- **[Docs]** 已將 T03 的新版 schema、欄位排序原則、舊資料相容策略與 `src/lib/sheets.ts` 介面方向寫入 `TECH_DOC.md`。
- **[Verification]** 本次僅進行檔案閱讀與文件更新，未執行 build、test 或部署。

### v1.1.4-handoff — 2026-06-20
- **[Docs]** 依使用者要求整理本輪對話的總結報告與交接摘要，並同步回寫 `plan.md` 與 `docs/log.md`。
- **[Summary]** 本輪已完成 Phase 0 的前三個前置 task：
  - `T01 產品與資料模型定稿`
  - `T02 現有資料流與檔案責任盤點`
  - `T03 Google Sheets 欄位升級設計`
- **[Decision]** 第一階段正式以 `demo 先行` 為 gating 規則；在 demo 未確認前，不直接覆蓋現有首頁或正式資料流。
- **[Decision]** 下一步明確指定為 `T04 Demo 網頁規格與隔離式驗證頁製作`，應先做獨立 route 與 mock data / 轉接資料驗證。
- **[Handoff]** 下一個接手 AI 不需要重做產品方向判斷；應直接以 `PRD.md`、`TECH_DOC.md`、`plan.md` 當前內容為 SSOT，從 `T04` 開始。
- **[Verification]** 本次總結與交接回寫僅涉及文件更新，未執行 build、test 或部署。

### v1.1.5-demo — 2026-06-20
- **[Dev]** 開始執行 `T04 Demo 網頁規格與隔離式驗證頁製作`，採用使用者已確認的方向：`接近真實產品流程驗證 + 新版視覺方向驗證`。
- **[Decision]** demo 資料來源採 `純 mock data`，避免在 T04 提前碰正式 Sheets、webhook 或首頁資料流。
- **[Decision]** demo 形式採 `單一路由 demo + 單頁切換`，路徑定為 `src/app/demo/library/page.tsx`。
- **[Dev]** 新增 `src/lib/demo-library-data.ts`，建立符合新版 schema 精神的 mock 收藏資料，涵蓋：
  - 純文字
  - 社群 URL
  - 一般 URL
  - 高 / 中 / 低信心
  - `complete` / `partial`
- **[Dev]** 新增 `src/components/demo/LibraryDemo.tsx`，實作：
  - 清單 / 卡片切換
  - 搜尋框
  - 用途篩選
  - 來源篩選
  - 信心等級篩選
  - mock data 狀態提示
  - 第一層資訊展示：`summary / use_case / source_title / tags`
- **[Decision]** T04 不直接覆蓋現有 `src/app/page.tsx`，也不修改既有 `InspirationGrid`，以維持線上首頁隔離。
- **[Docs]** 已把 demo route 與 mock data 策略補寫進 `TECH_DOC.md` 與 `plan.md`。
- **[Verification]** 本次未執行 `dev`、`build`、`lint` 或其他測試命令；原因是專案規則要求需取得使用者明確同意後才能執行 build / dev / test。此次僅完成檔案實作與文件同步。

### v1.1.6-demo-pivot — 2026-06-20
- **[Finding]** 以 Next.js dev server 驗證 demo 時，持續遭遇本地啟動不穩、workspace root 誤判與 in-app browser 對 localhost / network URL 連線不穩定問題，造成驗證成本過高。
- **[Decision]** 依使用者要求，T04 不再以 Next.js route 作為主要 demo 交付方式，改為純 HTML 單檔 demo。
- **[Dev]** 刪除先前的 Next demo 檔案：
  - `src/app/demo/library/page.tsx`
  - `src/components/demo/LibraryDemo.tsx`
  - `src/lib/demo-library-data.ts`
- **[Dev]** 新增 `docs/demo/library-demo.html`，將 mock data、清單 / 卡片切換、搜尋、用途篩選、來源篩選、信心等級篩選全部收斂進單一 HTML 檔。
- **[Decision]** 後續使用者驗證 T04 時，直接開啟 `docs/demo/library-demo.html` 即可，不再要求啟動 `npm run dev`。
- **[Docs]** 已同步更新 `plan.md` 與 `TECH_DOC.md`，將 T04 的主要 demo 形式改為純 HTML。
- **[Verification]** 本次未執行 build、test 或 browser automation；已完成檔案改寫與正式文件同步。

### v1.1.7-demo-structure — 2026-06-20
- **[Decision]** 使用者確認後，T04 demo 不再停留在單檔驗證，而是升級為「純 HTML 多頁架構」，用來先驗證未來正式版的頁面分工與獨立網址方向。
- **[Decision]** 多頁 demo 的責任分配正式定為：
  - `library-demo.html`：首頁，只顯示最新 5 筆，強調第一層摘要資訊與用途入口
  - `list.html`：列表頁，負責搜尋、分類篩選與每頁 10 筆分頁
  - `detail.html`：單筆頁，負責完整內容與上一筆 / 下一筆切換
- **[Decision]** 首頁不再承擔大量資料瀏覽責任，未來正式版也應朝「首頁輕量、列表頁承接大量資料、單筆頁承接完整內容」的結構前進。
- **[Decision]** 使用者要求頁面文案改為正式版語氣，因此移除頁面上 `DEMO ONLY` 與其他 demo 字樣，只保留隔離實作事實於文件中記錄。
- **[Design]** 視覺風格回對現有首頁語言，保留粉白漸層、貼紙感、粗邊框、立體陰影與雲朵元素，避免做成與原站完全斷裂的新風格。
- **[Design]** 依使用者要求，移除首頁上方三張統計卡，改把資訊整合進單一提示區塊，並加入貼紙式用途入口，包含 `Prompt` 類別。
- **[Design]** 依使用者要求，單筆卡片移除 `高信心 / 完整解析 / LINE 文字` 等角標，改以更乾淨的主資訊呈現；每筆資料另補上序號，讓列表掃描更穩定。
- **[Dev]** 新增 / 重構以下 demo 檔案：
  - `docs/demo/library-demo.html`
  - `docs/demo/list.html`
  - `docs/demo/detail.html`
  - `docs/demo/library-data.js`
  - `docs/demo/library-styles.css`
- **[Verification]** 本次確認上述五個 demo 檔案均已存在並完成內容落地；未執行 build、test、browser automation 或正式部署驗證。

### v1.1.8-demo-polish-and-handoff — 2026-06-20
- **[Finding]** 使用者直接以檔案方式開啟 `detail.html` 時，若網址未帶 `?id=...`，頁面會落到「找不到這筆收藏」，不利於直接預覽與交接。
- **[Decision]** 單筆頁調整為更耐用的 fallback 行為：若未帶 `id`，預設顯示最新一筆；只有帶了不存在的 `id` 時，才顯示找不到。
- **[Decision]** 單筆頁導覽語意重新校正：
  - 左上入口改為 `回首頁`
  - 卡片右上入口改為 `回收藏列表`
  - 底部切換改為 `上一筆 / 下一筆`
- **[Design]** 此次調整的目的是讓「頁面返回路徑」與「資料前後瀏覽」分開，避免把列表返回與內容切換混成同一種導覽語意。
- **[Dev]** 已更新 `docs/demo/detail.html`，完成上述 fallback 與導覽位置 / 文案調整。
- **[Docs]** 已同步更新 `plan.md` 的目前狀態、下一步建議與接手摘要，避免仍停留在「單檔 demo 待確認」的舊敘述。
- **[Handoff]** 下一個接手 AI 應以目前 `docs/demo/` 這套多頁純 HTML 架構為 T04 完成版，不需要再回頭處理 Next.js demo 或 localhost 啟動問題。
- **[Verification]** 本次僅進行靜態檔案修正與文件同步；未執行 build、test、browser automation 或正式部署驗證。

### v1.1.9-demo-ui-polish — 2026-06-21
- **[Review]** 依使用者逐步檢視 `docs/demo/library-demo.html` 與 `docs/demo/list.html` 的畫面，持續收斂首頁與列表頁的資訊密度、查找效率與視覺噪音。
- **[Decision]** 首頁不再偏展示型大卡片，而是正式收斂成「輕量工具列 + 緊湊橫向卡片清單」；列表頁同步改為同語言呈現，避免首頁與列表頁像兩個不同產品。
- **[Decision]** 搜尋 / 篩選區改為同語言工具列：
  - 首頁：搜尋框 + 用途 + 主題 + `查詢`
  - 列表頁：搜尋框 + 用途 + 主題 + 排序，第二列補來源 / 信心 / 時間 / 清除條件
- **[Decision]** 搜尋輸入框與下拉選單統一改為扁平、低陰影樣式；工具列搜尋框未輸入與 focus 狀態都不再帶陰影，以避免看起來像厚重按鈕。
- **[Decision]** 首頁統計資訊 `收藏總數 / 高信心內容 / 部分解析 / 最新更新` 移至 hero 文案正下方，作為輔助資訊列，不再佔用搜尋區。
- **[Decision]** 首頁 `最新收藏` 區塊調整為：
  - `目前顯示最新 X / Y 筆收藏` 靠左
  - `看更多收藏` 靠右
  - `看更多收藏` 保持文字動作型態，不再做成主按鈕
- **[Decision]** 首頁與列表頁的記錄卡片統一採：
  - 緊湊橫向卡片
  - 第一層只顯示序號、用途、主題、摘要、原標題、最多 4 個 tag
  - `查看內容` 保留圓型提示按鈕樣式
  - 卡片整張可點
- **[Decision]** 編號、分類、tag 由圓滾滾貼紙語言改成較輕的資訊標示；用途入口由按鈕列改成更像文字篩選列。
- **[Decision]** 首頁最新收藏展示數由先前的 5 筆擴充為 8 筆，以提高同一屏可掃描內容量。
- **[Dev]** 本輪主要修改檔案：
  - `docs/demo/library-demo.html`
  - `docs/demo/list.html`
  - `docs/demo/library-styles.css`
- **[Handoff]** 若下一個接手 AI 還要再微調 demo，應以「維持首頁與列表頁同語言」為優先原則，不要再把列表頁改回大卡片或把首頁改回展示型 hero 卡牆。
- **[Verification]** 本輪僅進行靜態檔案修改與多次檔案層確認，未執行 build、test、browser automation 或正式部署驗證。

### v1.1.10-t05-planning-and-home-tweak — 2026-06-22
- **[Decision]** 依使用者要求，首頁 `最新收藏` 展示數由 8 筆調整為 10 筆，僅修改 `docs/demo/library-demo.html`，不動列表頁、正式首頁或正式資料流。
- **[Decision]** 使用者確認 T04 demo 方向已可接受，正式進入 `T05 純文字輸入整理流程升級` 的規劃階段。
- **[Decision]** T05 採最小垂直切片策略：本輪只升級「LINE 純文字 -> Gemini 結構化整理 -> Google Sheets 新版 schema」這一條資料流，不同時重構社群 URL、一般 URL 或正式首頁。
- **[Decision]** 新版純文字資料先寫入同一份 Google Sheets 檔案中的新工作表 `library_v2`，舊工作表保留不動，避免直接覆寫既有資料。
- **[Decision]** 純文字 `source_title` 採原始全文截短策略；`raw_input` 保留完整原文；`summary` 承擔第一層快速理解責任。
- **[Decision]** T05 的純文字預設欄位固定為：
  - `input_type = text`
  - `source_url = ""`
  - `source_platform = LINE 文字`
  - `content_type = note`
  - `confidence_level = high`
  - `parse_status = complete`
- **[Decision]** `use_case` 與 `topic_category` 在 prompt 與資料契約上必須明確分開；`confidence_level` 與 `parse_status` 不交由 Gemini 判斷，而由程式端依純文字路徑直接給定。
- **[Design]** 已定稿 `library_v2` 的 15 欄 header 順序：
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
- **[Design]** 已定稿 T05 的實作切面與檔案責任：
  - `scripts/google_sheets_gas.js`：支援 `sheet_name = library_v2` 的新版寫入分流
  - `src/lib/sheets.ts`：新增 `LibraryRecordV2` 與新版寫入方法
  - `src/lib/gemini.ts`：新增純文字專用整理器
  - `src/app/api/webhook/line/route.ts`：只切換純文字分支到新版資料流
- **[Plan]** 已將 `T05` 進一步拆為 `T05-1` 到 `T05-6` 六個最小可執行子 task，並寫回 `plan.md`：
  - `T05-1 library_v2 工作表與欄位骨架建立`
  - `T05-2 Google Apps Script 新版寫入分流`
  - `T05-3 src/lib/sheets.ts 新版寫入介面補齊`
  - `T05-4 src/lib/gemini.ts 純文字整理器升級`
  - `T05-5 webhook 純文字分支切換到新版資料流`
  - `T05-6 純文字新版資料流最小驗證與文件同步`
- **[Handoff]** 下一個接手 AI 不需要再重做 T05 的方向判斷；應直接依 `plan.md` 中 `T05-1` 到 `T05-6` 的順序往下執行，並優先從 `T05-1 library_v2 工作表與欄位骨架建立` 開始。
- **[Verification]** 本輪僅進行規劃、文件同步與 `docs/demo/library-demo.html` 的靜態修改；未執行 build、test、browser automation、webhook 實測或 Google Sheets / GAS 寫入驗證。

### v1.1.11-t05-text-v2-implementation — 2026-06-22
- **[Dev]** 完成 `T05-1` 到 `T05-5` 的程式碼落地，將純文字新版資料流接到 `library_v2`。
- **[Dev]** 更新 `scripts/google_sheets_gas.js`：
  - 新增 `library_v2` 工作表名稱與 15 欄 header 常數
  - 新增 `getOrCreateSheetByName()` 與 `ensureLibraryV2Headers()`
  - `doPost` 可依 `sheet_name = library_v2` 分流新版寫入
  - 舊版 active sheet 寫入流程保留不動
- **[Dev]** 更新 `src/lib/sheets.ts`：
  - 新增 `LibraryRecordV2`
  - 新增 `appendToLibraryV2()`
  - 新版 payload 會帶 `sheet_name = library_v2`
  - `key_points` 以 ` || ` 分隔字串寫入；`tags` 以逗號分隔字串寫入
- **[Dev]** 更新 `src/lib/gemini.ts`：
  - 新增 `organizeTextInspiration()`
  - 純文字可輸出 `summary / key_points / tags / use_case / topic_category`
  - 補上 fallback，避免 Gemini 回傳不完整 JSON 時完全無法寫入
- **[Dev]** 更新 `src/app/api/webhook/line/route.ts`：
  - 僅切換純文字分支到新版資料流
  - `source_title` 改為原文截短
  - `raw_input` 保留完整原文
  - 固定值由程式端指定：
    - `input_type = text`
    - `source_url = ""`
    - `source_platform = LINE 文字`
    - `content_type = note`
    - `confidence_level = high`
    - `parse_status = complete`
  - URL 分支維持舊流程，不在本輪重構
- **[Verification]** 已執行本地驗證：
  - `npm run lint`：通過，僅剩既有 warning，無 error
  - `npm run build`：通過
- **[Verification]** 尚未完成外部驗證：
  - 尚未重新部署 Google Apps Script，因此 `library_v2` 是否真正在雲端建立仍未確認
  - 尚未完成至少 1 筆 LINE 純文字寫入 `library_v2` 的真實驗證
- **[Decision]** 在外部驗證完成前，`T05-6` 只能視為「本地程式碼與建置驗證已完成」，不能宣告整條資料流已正式可用。

### v1.1.12-gas-legacy-sheet-safety-fix — 2026-06-22
- **[Finding]** `scripts/google_sheets_gas.js` 在先前版本中，舊資料流仍使用 `getActiveSheet()`；若部署後使用者把 `library_v2` 切成 active sheet，舊版 URL 流可能誤寫進 `library_v2`。
- **[Dev]** 已新增 `LEGACY_SHEET_NAME` 與 `getLegacySheet()`：
  - 若已知舊工作表名稱，可直接在 GAS 內指定
  - 若未指定，會自動選第一張非 `library_v2` 的工作表作為舊資料流落點
- **[Dev]** `doGet` 與舊版 `doPost` 分支都已改為使用 `getLegacySheet()`，不再直接依賴目前 active sheet。
- **[Decision]** 這個修正的目的是先把「部署後因切換 active sheet 造成舊流誤寫」的風險壓低，再讓使用者進行 GAS 重部署與 `library_v2` 外部驗證。
- **[Verification]** 已重新執行 `npm run lint`，結果為通過；目前仍只有既有 warning，無新增 error。

### v1.1.13-t05-doc-sync-and-t06-prep — 2026-06-22
- **[Docs]** 已更新 `TECH_DOC.md`，同步目前真實實作狀態：
  - 補上 `T05` 已落地的 `library_v2` 寫入切面
  - 修正 Gemini 實際輸出契約，明確排除 `confidence_level` / `parse_status` 由模型生成
  - 補上目前已完成的本地驗證與仍未完成的外部驗證邊界
- **[Docs]** 已新增 `docs/t05-text-v2-verification-checklist.md`，整理 `T05-6` 的外部驗證步驟、header 檢查點、欄位檢查點與失敗排查順序。
- **[Dev]** 已對 `src/app/api/webhook/line/route.ts` 做 `T06` 前置整理：
  - 抽出 `extractFirstUrl()`
  - 抽出 `getTaipeiTimestamp()`
  - 抽出 `handleUrlMessage()`
  - 抽出 `handleTextMessage()`
- **[Decision]** 這次前置整理的目標是先把純文字新版資料流與舊 URL 流的責任邊界拆乾淨，讓後續 `social_url / url` 分流時不需要再回頭混改純文字主線。
- **[Verification]** 已重新執行：
  - `npm run lint`：通過，僅剩既有 warning
  - `npm run build`：通過

### v1.1.14-conversation-summary-and-handoff — 2026-06-22
- **[Summary]** 本輪對話已完成 `T05` 純文字新版資料流的主要程式碼落地，範圍包含：
  - `scripts/google_sheets_gas.js`
  - `src/lib/sheets.ts`
  - `src/lib/gemini.ts`
  - `src/app/api/webhook/line/route.ts`
- **[Summary]** 本輪也完成了與實作一致的文件同步：
  - `plan.md`
  - `TECH_DOC.md`
  - `docs/log.md`
  - `docs/t05-text-v2-verification-checklist.md`
- **[Decision]** 為降低 GAS 重部署風險，舊資料流已不再依賴 `getActiveSheet()`；改為透過 `LEGACY_SHEET_NAME` 或自動挑選第一張非 `library_v2` 工作表作為舊流落點。
- **[Decision]** 在使用者尚未重部署 GAS 前，不把 `T05-6` 宣告完成；目前只能確認本地 `lint` / `build` 已通過，外部真實寫入尚未驗證。
- **[Handoff]** 下一個接手 AI 應優先確認使用者是否已完成 GAS 重部署：
  - 若已完成，先照 `docs/t05-text-v2-verification-checklist.md` 執行 `T05-6`
  - 若未完成，可先開始 `T06` task 拆解與社群 URL 流程設計

### v1.1.15-t05-validation-and-clasp-deploy — 2026-06-22
- **[Dev]** 依使用者要求，引導並使用 Google 官方 `clasp` CLI 完成 GAS 雲端自動部署。
- **[Dev]** 建立獨立 `gas/` 資料夾，拉取 (pull) 雲端原有的 `appsscript.json` 與 `程式碼.js`，防止 Next.js 大量無效檔案被推送。
- **[Dev]** 將最新 `scripts/google_sheets_gas.js` 覆寫入 `gas/程式碼.js`，刪除多餘的 `gas/Code.js`。
- **[Dev]** 執行 `clasp push` 與 `clasp deploy`。利用原有 Web App 的部署 ID `AKfycbzZGoeND8gr4W14TA1jrKkcCi05yAJLDLkpxgftV-zwEXh7STj1jFMAC5kgPzN0f45fWQ` 更新為版本 `@3`，成功達成「免手動複製貼上」自動更新 GAS，且**維持原有 Web App 網址不變**。
- **[Verification]** 建立本地測試寫入腳本 `scratch/test_write.js`，直接向 GAS Web App 發送新版 V2 寫入請求，GAS 回應 `200 OK` 且 `result: success`，順利在雲端自動建立 `library_v2` 工作表並成功寫入首筆包含 15 欄 Header 的測試資料。
- **[Verification]** 端到端 Webhook 本地模擬實測：
  - 本地啟動 `npm run dev` 伺服器。
  - 建立 `scratch/simulate_line_webhook.js`，讀取 `LINE_CHANNEL_SECRET` 並算出 HMAC-SHA256 簽章以通過 Security Check，向 `localhost:3000/api/webhook/line` 發送模擬 LINE 文字 Webhook。
  - Next.js Webhook 順利收到請求，Gemini 成功呼叫並回傳結構化整理資料（`summary`, `key_points`, `tags`, `use_case`, `topic_category`），隨後呼叫 GAS 並以 `200 OK` 完成處理，完成端到端資料流實測。
- **[Decision]** 由於 clasp 部署與本地端到端模擬 Webhook 均告成功，正式將 `T05` 與 `T05-6` 標記為完成。下一步將正式展開 `T06` 的設計與開發。

### v1.1.16-t06-social-url-pipeline — 2026-06-22
- **[Dev]** 實作 `T06 社群 URL 內容解析管線`。在 `src/lib/extractor.ts` 中新增 `extractSocialContent()`。使用分層策略（oEmbed -> Microlink API -> HTML Metadata -> Fallback）處理 Threads, Facebook, Instagram, X, LinkedIn，在遭遇爬蟲防禦阻擋時，實施防擋降級，設定為低信心與部分解析狀態收錄。
- **[Dev]** 在 `src/lib/gemini.ts` 中新增 `organizeSocialInspiration()`。使用社群專用 Prompt 整理 15 欄位新規格，對降級標題自動生成直白的一句話摘要，明確切開用途分類與主題分類。
- **[Dev]** 在 `src/app/api/webhook/line/route.ts` 中完成 `social_url` 與 `url` 的分流。社群網址寫入 `library_v2`（帶有 platform、信心等級與狀態），一般網址維持舊流程寫入舊工作表，保持完全相容。
- **[Verification]** 本地自動建置測試：
  - `npm run lint` 通過。
  - `npm run build` 通過。
- **[Verification]** 執行 `scratch/simulate_line_webhook.js` 發送 4 種模擬 Webhook 情境，結果皆成功返回 200 OK：
  - 情境 1 (Threads URL 正常解析寫入 `library_v2`)
  - 情境 2 (FB URL 防擋降級為 low 信心 / partial 狀態寫入 `library_v2`)
  - 情境 3 (FB URL 防擋 + 使用者備註，信心升級為 medium 寫入 `library_v2`)
  - 情境 4 (一般 URL 走舊流程寫入舊工作表相容性)
- **[Decision]** 由於 4 種模擬測試與 build/lint 皆成功，宣告 `T06` 任務順利完成。下一步將正式前進到 `T07 一般 URL 內容擷取與整理`。

### v1.1.17-t07-general-url-pipeline — 2026-06-22
- **[Dev]** 實作 `T07 一般 URL 內容擷取與整理`。
  - 在 `src/lib/extractor.ts` 中新增 `extractGeneralContent()`。以原生 HTML 爬取、Microlink API 與網域降級三層設計，抓取標題、描述、並過濾 HTML tags 提取前 1000 個字元正文。
  - 在 `src/lib/gemini.ts` 中新增 `organizeGeneralInspiration()`。針對一般 URL 調優 Prompt，生成一句摘要、重點、用途分類、主題分類，並具備 Gemini 503 時的強固 try-catch fallback 降級寫入機制。
  - 在 `src/app/api/webhook/line/route.ts` 中將一般 URL 處理完全切換到新版 V2 流程，寫入新工作表 `library_v2`，信心等級依正文完整度判定，且支援備註加權與 V2 訊息回覆。
- **[Verification]** 本地建置測試：
  - `npm run lint` 通過。
  - `npm run build` 通過。
- **[Verification]** 建立 `scratch/simulate_line_webhook.js` 並執行 5 種 Webhook 模擬情境，結果皆成功返回 200 OK 且正確寫入/分流：
  - 情境 1 (一般 URL `react.dev` 正常解析並高信心寫入 `library_v2`)
  - 情境 2 (一般 URL 爬蟲防擋，且 Gemini 503 時，觸發 AI 整理器 try-catch fallback，仍順利降級寫入 `library_v2`)
  - 情境 3 (一般 URL 降級 + 使用者備註，信心主動升級為 medium 且融入備註整理寫入 `library_v2`)
  - 情境 4 (社群 URL Zuck Threads 貼文回歸測試寫入 `library_v2`)
  - 情境 5 (純文字寫入 `library_v2` 回歸測試)
- **[Decision]** 由於 5 種情境、回歸測試與 build/lint皆成功通過，宣告 `T07` 任務順利完成。下一步將正式展開 `T08 webhook 與 AI 整理流程整併`。

### v1.1.18-t08-pipeline-integration — 2026-06-22
- **[Dev]** 實作 `T08 webhook 與 AI 整理流程整併`。
  - 在 `src/app/api/webhook/line/route.ts` 中新增 `formatReplyMessage()`，統一文字、社群與一般網頁在成功收錄後向使用者推送的回覆文案格式，清楚顯示類型、標題、摘要、重點與信心狀態。
  - 重構 `route.ts` 合流 `handleUrlMessage()` 邏輯，大幅減少 URL 流程的重複代碼。
  - 進行廢棄代碼大掃除，移除了 `sheets.ts`、`extractor.ts` 及 `route.ts` 中所有廢棄無用的過渡期匯入與函式（如 `appendToSheet`、`extractTitle`、`tryHtmlParse`、`trySocialApi`），達成核心程式 lint 0 warning 警告的乾淨指標。
- **[Verification]** 本地建置測試：
  - `npm run lint` 通過。
  - `npm run build` 通過。
- **[Verification]** 啟動本地 `npm run dev` 並執行 3 種 Webhook 模擬情境，結果皆成功返回 200 OK 且推播格式完全統一：
  - 情境 1 (一般 URL `react.dev` 收錄並統一格式推播)
  - 情境 2 (社群 URL Zuck Threads 貼文收錄回歸測試)
  - 情境 3 (純文字靈感收錄回歸測試)
- **[Decision]** 由於 Webhook 管線整合、代碼清理與模擬重測皆成功，宣告 `T08` 任務順利完成。下一步將進入 Phase 2 開發階段，啟動 `T09 首頁資訊架構與 layout 重做`。

### v1.1.19-inspiration-edit-and-style-tuning — 2026-06-23
- **[Dev]** 實作 Google Sheets 編輯修改與前端同步管線：
  - 在 `gas/程式碼.js` doPost 中擴充 `action === "update_row"`，用以在 Google Sheets 依 ID 精準更新指定 Row 的 15 個欄位值。
  - 執行 `clasp push` 與 `clasp deploy` 將 GAS 變更同步至雲端，完美更新現有 deployment 版本。
  - 在 `src/lib/sheets.ts` 新增 `updateLibraryV2Record`。
  - 建立 Next.js 後端更新 API 路由 `/api/inspiration/update`。
  - 建立 Neobrutalist 風格的 `EditInspirationModal.tsx` 編輯視窗元件。
  - 在首頁列表、所有列表頁和單文頁中，整合該 Modal 編輯功能，並將 UI 的 records 資料改由 client-side useState 管理，使儲存成功後能即時無刷更新 UI 狀態。
- **[Dev]** 調優與更改字重/文字：
  - 微調列表頁分頁按鈕文字為 `« 最前頁` 與 `最後頁 »`。
  - 將首頁左上的標題「控制台概覽」修改為「首頁」。
  - 移除 `.table-summary-cell` 的 `font-weight: 700` (Bold) 改為 `500` (Medium)，實現「列表跟首頁列表的標題不要加粗」需求。
- **[Dev]** Eslint 錯誤與警告修復：
  - 修復了 `react-hooks/set-state-in-effect` 造成的編譯失敗，全數改為 render 階段同步 props 狀態。
  - 將 `EditInspirationModal` 中的 `USE_CASE_OPTIONS` 靜態常數移出元件外部，修復 Hook dependency warning。
- **[Verification]** 本地建置與檢查：
  - 執行 `npm run lint`：通過，0 Errors。
  - 執行 `npm run build`：通過，Next.js 順利編譯。

### v1.1.20-production-deployment-cloud-run — 2026-06-23
- **[Deploy]** 「靈感收藏庫 V2 版」正式部署至 Google Cloud Run：
  - **ESLint 忽略設定優化**：為防範 Next.js ESLint 檢查到非應用程式代碼（如 GAS 原始碼、批次遷移與清理腳本等）導致編譯阻擋，在 `eslint.config.mjs` 中將 `scratch/**`、`gas/**`、`docs/**`、`scripts/**` 加入 `globalIgnores` 忽略設定。
  - **Unused Warning 清除**：修復了 `src/app/list/LibraryListClient.tsx` 中 `catch (_)` 無綁定 catch 變數警告，達成 0 Errors & 0 Warnings 建置目標。
  - **Git 提交與 Push**：將本地所有開發變更與 GAS 代碼提交並推送到 GitHub `main` 分支，成功觸發 Google Cloud Build 自動化建置部署流程（Build ID: `36ef3d7f-c365-40c5-98d5-a64ad5e2f7db`）。
  - **Cloud Run 環境變數對齊與更新**：Cloud Run 的 `GOOGLE_GAS_URL` 在舊版本中仍指向舊版 Apps Script Web App。我們使用 `gcloud run services update` 命令，將其環境變數手動更新為最新 Apps Script 版本 `@6` 的 URL：`https://script.google.com/macros/s/AKfycbzZGoeND8gr4W14TA1jrKkcCi05yAJLDLkpxgftV-zwEXh7STj1jFMAC5kgPzN0f45fWQ/exec`。這確保了線上版 Next.js `/api/inspiration/update` 後端與 Apps Script `update_row` 功能完美對接。
  - **正式環境驗證 (Smoke Test)**：使用網頁存取工具驗證線上首頁 `/` 與列表頁 `/list` 皆可正常開啟且無 500 錯誤。統計卡片與最新筆數正常載入，分頁按鈕文字已改為 `« 最前頁` 與 `最後頁 »`。
  - **LINE Webhook Endpoint 設定錯位排查與更新**：正式部署上線後，使用者測試發現 LINE 機器人無回應且無寫入。調閱 Cloud Run 日誌發現沒有任何來自 LINE 的 POST 請求。我們使用 LINE Messaging API 查詢目前 Bot 的 Webhook 真值，發現其仍配置在舊的 `https://inspiration-box-l7qdepde6a-de.a.run.app/api/webhook/line`。在取得使用者授權後，使用 Node.js 腳本發送 `PUT` 請求，成功將 LINE 官方後台的 Webhook 網址更新為新部署服務的 URL：`https://my-keepevery-41418623586.europe-west1.run.app/api/webhook/line`。經 API 再次驗證狀態為 `active: true`，成功打通 LINE 到 Cloud Run 的端到端請求。

