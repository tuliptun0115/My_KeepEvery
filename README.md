# 🌸 靈感收藏盒 (InspirationBox)

這是一個結合 LINE 訊息採集、Google Gemini AI 智慧標籤與 Google Sheets 自動歸檔的「靈感管理」全端應用程式。

## 🌟 核心功能
*   **LINE 隨手收藏**：只需在 LINE 聊天室傳送文字或連結，系統即可自動捕捉靈感。
*   **AI 智慧標籤**：整合 Google Gemini 1.5 Flash，自動分析網頁內容並生成 3 個相關標籤。
*   **Google Sheets 自動歸檔**：所有靈感都會即時寫入您的專案試算表，方便後續整理。
*   **Bento Grid 前端介面**：採用 Next.js 15 與 Tailwind CSS 打造極具質感的櫻花粉風格儀表板。

## 🛠️ 技術棧
*   **框架**：Next.js 15 (App Router)
*   **樣式**：Tailwind CSS + Framer Motion
*   **AI**：Google Gemini 1.5 Flash
*   **資料儲存**：Google Apps Script + Google Sheets
*   **通訊**：LINE Messaging API
*   **部署**：Docker + Google Cloud Run (Continuous Deployment)

## 快速開始
1.  **環境變數**：複製 `.env.local.example` 並填入您的金鑰。
2.  **安裝依賴**：`npm install`
3.  **開發模式**：`npm run dev`

## 相關文件
*   [API 配置手冊](./docs/AUTHENTICATION_GUIDE.md)
*   [Cloud Run 部署指南](./docs/DEPLOY_GUIDE.md)
*   [產品規格文件 (PRD)](./docs/PRD.md)
*   [UI/UX 設計規範](./docs/UI_UX_GUIDE.md)
*   [Google Apps Script 代碼](./scripts/google_sheets_gas.js)
