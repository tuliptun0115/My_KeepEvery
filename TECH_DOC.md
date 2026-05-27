# 技術規格書

## 系統架構
```
LINE 用戶
  └─► LINE Messaging API (Webhook)
        └─► Next.js API Route (/api/webhook)
              ├─► Google Gemini 1.5 Flash（AI 標籤生成）
              └─► Google Apps Script（寫入 Google Sheets）
                    └─► Next.js 前端儀表板（讀取展示）
```

## 技術棧
| 層級 | 技術選型 | 說明 |
|---|---|---|
| 前端 | Next.js 16 + React 19 | App Router 架構 |
| 樣式 | Tailwind CSS v4 + Framer Motion | 動畫與 Bento Grid |
| AI | Google Gemini 1.5 Flash | 自動生成 3 個標籤 |
| 資料儲存 | Google Sheets via Apps Script | 輕量化資料庫替代方案 |
| 通訊 | LINE Messaging API | Webhook 接收訊息 |
| 部署 | Docker + Google Cloud Run | CI/CD 持續部署 |

## 核心功能規格

### Webhook 接收（LINE）
- 路徑：`/api/webhook`
- 輸入：LINE 事件物件（文字 / 連結）
- 輸出：觸發 Gemini 標籤 + 寫入 Sheets
- 限制：需驗證 LINE Signature

### AI 標籤生成（Gemini）
- 模型：Gemini 1.5 Flash
- 輸入：使用者傳入的文字或網址
- 輸出：3 個繁體中文標籤
- 限制：注意 API rate limit

### 儀表板展示
- 資料來源：Google Sheets API
- 介面風格：Bento Grid + 櫻花粉主題
- 互動：Framer Motion 動畫

## API / 串接說明
| 服務 | 用途 | 文件 |
|---|---|---|
| Google Gemini | AI 標籤 | `@google/genai` SDK |
| LINE Messaging API | 接收訊息 | docs/AUTHENTICATION_GUIDE.md |
| Google Apps Script | 寫入 Sheets | scripts/google_sheets_gas.js |

## 資安規範
- 所有金鑰存放於 `.env.local`，不進版控
- LINE Webhook 需驗證 `X-Line-Signature`
- Cloud Run 使用 Service Account 限制存取範圍

## 成本控制
| 服務 | 計費方式 | 備註 |
|---|---|---|
| Google Gemini | 依用量，有免費額度 | 注意 Flash vs Pro 差價 |
| Google Cloud Run | 依請求數＋運算時間 | 低流量幾乎免費 |
| LINE Messaging API | 免費方案有訊息上限 | 個人使用綽綽有餘 |

## 相關文件
- [API 配置手冊](./docs/AUTHENTICATION_GUIDE.md)
- [Cloud Run 部署指南](./docs/DEPLOY_GUIDE.md)
- [產品規格文件 PRD](./docs/PRD.md)
- [UI/UX 設計規範](./docs/UI_UX_GUIDE.md)
