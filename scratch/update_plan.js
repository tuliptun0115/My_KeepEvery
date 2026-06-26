const fs = require('fs');
const path = require('path');

const planPath = path.join(__dirname, '..', 'plan.md');
console.log('Reading plan.md from:', planPath);
let content = fs.readFileSync(planPath, 'utf8');

const targetStr = `## 十一、目前狀態`;
const targetIndex = content.indexOf(targetStr);

if (targetIndex === -1) {
  console.error('Could not find target string: ## 十一、目前狀態');
  process.exit(1);
}

// 擷取目標字串前的所有內容
const preserveContent = content.substring(0, targetIndex);

const newStatus = `## 十一、目前狀態

- 狀態：\`已完成全站靈感編輯功能（對接 Google Sheets）、修改分頁器文字與標題字重，並修復了 react-hooks 相關 ESLint 警告，專案建置完全成功\`
- 最後更新：\`2026-06-23\`
- 本次已完成：
  - **靈感編輯儲存至 Google Sheets (Excel)**：
    - 在 Google Apps Script \`程式碼.js\` 中擴充支援 \`action === "update_row"\`。
    - 在 Next.js 端建立 \`/api/inspiration/update\`。
    - 建立 Neobrutalist 風格的 \`EditInspirationModal.tsx\` 視窗元件。
    - 修改首頁、所有列表頁與單文詳細頁，將 records 資料改用 client-side \`useState\` 管理，在 Context Menu 整合編輯選單，成功後即時在前端 UI 反映，免重啟重載頁面。
  - **樣式與文字微調**：
    - 將首頁及列表頁表格的「摘要主標題」字重從 \`700\` 調降為 \`500\`，實現「列表跟首頁列表的標題不要加粗」需求。
    - 修改列表頁分頁器按鈕文字為 \`« 最前頁\` 與 \`最後頁 »\`。
    - 將首頁左上的標題「控制台概覽」修改為「首頁」。
  - **專案強固性優化**：
    - 修復了 \`react-hooks/set-state-in-effect\` 造成的編譯失敗，全數改為 render 階段同步 props 狀態。
    - 透過 \`clasp push\` 與 \`clasp deploy\` 將 GAS 變更同步至雲端，完美更新現有 deployment。
- 目前尚未完成：
  - 無 (所有優化與新增需求已全數完成)
- 建議下一步：
  - 供使用者測試編輯修改與分頁功能，若無其他需求則完成本次對話。

## 十二、接手摘要

### 已完成

- \`編輯與儲存回 Excel\` 已完成：Apps Script、Next.js API、前端 Edit Modal 以及首頁、列表、詳情三頁面的狀態整合已全數開發並部署完成。
- \`分頁文字與標題字重微調\` 已完成：\`« 最前頁\`、\`最後頁 »\` 與非粗體摘要標題已上線。
- \`T01\` 已完成：\`PRD.md\`、\`TECH_DOC.md\` 已改為「靈感收藏庫」正式敘事。
- \`T02\` 已完成：現有核心檔案責任、沿用骨架與優先重構區塊已盤點完成。
- \`T03\` 已完成：Google Sheets 新版 15 欄 schema、舊資料相容策略與 \`src/lib/sheets.ts\` 未來資料介面已定稿。
- \`T04\` 已完成：已改為純 HTML 多頁 demo。
- \`T05\` 已完成：純文字輸入整理流程已升級，GAS 自動部署完成，端到端測試通過。
- \`T06\` 已完成：社群 URL 內容解析管線與 Webhook 分流實作完成。
- \`T07\` 已完成：一般 URL 內容解析層與專用 AI 整理器實作完成，Web 網址收藏已完全切換至 V2 流程。
- \`T08\` 已完成：Webhook 三分支代碼重構合流完成，消除所有核心檔案 unused 警告，統一推播回覆重點。
- \`T09 & T10\` 已完成：在 Next.js 前端成功建立隔離 Demo 路由並對接 library_v2 資料，實作了搜尋、過濾、排序與分頁。
- \`T11\` 已完成：批次舊資料清洗腳本已在背景運行，採用 4.5 秒延遲及指數退避重試解決 429 頻率限制。
- \`T12\` 已完成：前端 Demo 路由成功轉正，替換正式首頁並打通 \`/list\` 與 \`/detail\` 路由。舊資源與隔離目錄已完全清理。
- \`T13\` 已完成：正式路由整合後的產品規格與技術架構細節已收斂回寫至 \`PRD.md\` 與 \`TECH_DOC.md\`，完成 Phase 2 的文件收斂。
- \`手機版 RWD 修復\` 已完成：已全域引入 layout 樣式，強固抽屜隱藏（\`!important\`）並為 \`main-content\` 加上防禦性高度與滾動約束。

### 當前共識

- 第一階段先做 \`demo 先行\`，不能直接覆蓋現有首頁或正式資料流。
- 新版首頁第一層資訊固定以：
  - \`一句摘要\`
  - \`用途分類\`
  - \`原始標題\`
  - \`標籤\`
- 社群與一般 URL 抓不到完整內容時，不丟棄，採低信心或部分解析收錄。
- 舊資料批次清洗遷移正在安全進行中，新舊資料在 library_v2 統一收斂。
- 舊的 \`appendToSheet\` 寫入舊工作表流程已在 T08 中完全清除，保證單一資料落點。

### 下一步

- 下一個正式起點為「第一階段升級上線後的專案維護與行動端回饋優化，或正式部署」。
`;

fs.writeFileSync(planPath, preserveContent + newStatus, 'utf8');
console.log('Successfully updated plan.md!');
