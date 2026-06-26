# My_KeepEvery 專案進度板

## 1. 文件角色

- `PRD.md`：正式產品需求
- `TECH_DOC.md`：正式技術設計
- `plan.md`：整體進度、目前狀態、下一步
- `docs/log.md`：決策、踩坑、驗證紀錄
- `docs/tasks/*.md`：單一子功能的 task 拆解文件

## 2. 命名與查找規則

### 核心文件固定名

- `PRD.md`
- `TECH_DOC.md`
- `plan.md`
- `docs/log.md`

### Task 文件固定位置與命名

- 位置：`docs/tasks/`
- 格式：`YYYY-MM-DD-feature-slug.md`
- `feature-slug` 一律使用小寫 `kebab-case`

### Task 編號規則

- 使用子功能前綴 + 流水號
- 例如：
  - `PL-01`、`PL-02`：`prompt-library`
  - `RWD-01`：`mobile-rwd`
  - `WB-01`：`webhook`

## 3. 專案目前狀態

- 狀態：`✅ 全功能完成並上線。指令寶庫（含刪除）、正式環境 Cloud Run 部署完成（Revision my-keepevery-00020-mdj）。`
- 最後更新：`2026-06-26`

## 4. 已完成主功能

- `T01 - T14` 靈感收藏庫第一階段已完成
- 已完成：
  - `library_v2` 資料模型與 Sheets / GAS 整合
  - 純文字、社群 URL、一般 URL 三條靈感輸入流程
  - 首頁 `/`、列表頁 `/list`、詳細頁 `/detail`
  - Cloud Run 正式部署與 LINE Webhook 修復
  - 基本編輯能力與近期 RWD / UI 微調
  - 指令寶庫頁面路由與分工重構（`/prompts` 改為首頁，新增 `/prompts/list` 列表頁）

## 5. 目前焦點子功能

### Prompt Library

- 功能名稱：`指令寶庫`
- 狀態：`已完成 PL-01-3 sheets.ts 連接器、PL-02 Gemini 意圖判斷與分類、PL-03 LINE Webhook 分流接線與實測。`
  - 指令寶庫首頁（`/prompts`）與列表頁（`/prompts/list`）路由分流重構
  - API 路由 `/api/prompts/add`、`/api/prompts/update` 上線（PL-04）
  - 首頁/列表頁重構為 Server Component，移除 localStorage，接通真實 Sheets 資料（PL-05）
  - `AddPromptModal` / `EditPromptModal` 改接真實 API（PL-06）
  - 詳情頁重構為 Server Component，移除 localStorage，接通真實資料（PL-05-3）
  - Sidebar「指令寶庫」連結確認正確（`/prompts`，active 涵蓋所有子路由）
  - `npm run lint` 0 錯誤、`npm run build` 全部 12 路由通過（PL-07）
- 狀態：`✅ 指令寶庫全功能完成。`

## 6. 下一步

1. [x] 執行 `PL-01-3`，實作 Next.js sheets.ts 的 PromptRecord 結構與讀寫連接函數
2. [x] 進行 `PL-02` 及 `PL-03-1/2` LINE Webhook 的 Prompt 判定分流與實測
3. [x] 實作網頁端後端 API（`PL-04-1/2`）並連通新增與編輯 Modal（`PL-06-1/2`）
4. [x] 重構前端頁面真實資料連通（`PL-05-1/2`）
5. [x] 進行整體樣式與編譯發布驗證（`PL-07`）

## 7. 接手摘要

- 查需求：先看 `PRD.md`
- 查技術：再看 `TECH_DOC.md`
- 查目前做到哪：看 `plan.md`
- 查某個子功能怎麼拆：看 `docs/tasks/*.md`
- 查決策與驗證紀錄：看 `docs/log.md`
