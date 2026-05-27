# 專案計劃書

## 基本資訊
- 專案名稱：My_KeepEvery（靈感收藏盒 InspirationBox）
- 建立日期：2026-04-26
- 負責人：Tulip
- 狀態：[ ] 規劃中 / [x] 進行中 / [ ] 完成

## 專案概況
透過 LINE 收藏靈感，Gemini AI 自動標籤分類，寫入 Google Sheets 歸檔，並用 Next.js 儀表板瀏覽所有收藏內容。

- **使用者**：Tulip 個人使用
- **核心功能**：LINE 收藏 → AI 標籤 → Sheets 歸檔 → 儀表板呈現
- **目前版本**：0.1.0，開發中

## 目標與背景
在 LINE 隨手傳文字或連結，Gemini AI 自動幫你貼標籤，同步寫進 Google Sheets，用 Next.js 儀表板瀏覽所有靈感。

## 資源評估
| 項目 | 說明 |
|---|---|
| 使用工具 | Next.js 16、Tailwind CSS v4、Framer Motion |
| 外部 API / 服務 | Google Gemini 1.5 Flash、Google Sheets（Apps Script）、LINE Messaging API |
| 部署 | Docker + Google Cloud Run |

## 實作步驟
- [x] 建立 Next.js 專案架構
- [x] 串接 LINE Webhook
- [x] 串接 Google Gemini AI 標籤
- [x] 串接 Google Sheets 歸檔
- [ ] 完成前端儀表板 UI
- [ ] Docker 打包與 Cloud Run 部署
- [ ] 測試完整流程

## 當前進度備註
> 切換工具前在這裡更新，讓下一個 AI 接得住

- **最後更新**：2026-04-26
- **使用工具**：Claude Code
- **做到哪裡**：後端串接完成（LINE Webhook、Gemini 標籤、Sheets 歸檔），前端儀表板尚未完成
- **下一步**：完成前端儀表板 UI，接著 Docker 打包
- **注意事項**：Gemini 1.5 已停用，需確認目前使用的模型版本

## 已知風險 / 注意事項
- Next.js 16 為較新版本，API 與文件結構和訓練資料不同，改動前先查 `node_modules/next/dist/docs/`
- Gemini API 有用量限制，需注意 rate limit
- LINE Webhook 需要 HTTPS endpoint，本地開發需用 ngrok 或 Cloud Run 測試

## 完成定義（Done Criteria）
- 從 LINE 傳入訊息後，能在儀表板上看到已標籤的靈感卡片
- 資料同步寫入 Google Sheets
- Cloud Run 部署成功，公開可存取
