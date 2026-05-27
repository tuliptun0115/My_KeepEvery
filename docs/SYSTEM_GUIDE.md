# SYSTEM_GUIDE.md (系統開發與運作規範)

## 1. 啟動與授權
- **啟動限制**：在開發或執行任何指令前，必須確實閱讀並遵循全域原則 MD 檔，並在 Session 中回報「已閱讀原則MD檔」。
- **專案管理三件套**：根目錄只保留 `plan.md`、`PRD.md`、`TECH_DOC.md`。其他程式原始檔與發布設定檔（如 `Dockerfile`、`next.config.ts`、`package.json`）除專案結構必備代碼資料夾外，不得散落在根目錄。

## 2. 成本防禦與限制
- **模型調用原則**：禁止使用已棄用的舊模型（如 Gemini 1.5），生產與測試環境均必須明確指定現行明確的模型版本（如 `gemini-2.5-flash`），避免非預期的付費風險。
- **思考預算控制 (Thinking Budget)**：配置 API 請求時，鍵名需嚴格使用 `generationConfig`，設定 `thinkingBudget` 上限，並監控 token 消耗以防止思考成本溢出。

## 3. 安全與開發規範
- **LINE Webhook 安全驗證**：接收 Webhook 事件時，必須實作且啟用 `X-Line-Signature` 簽章驗證，避免非法請求偽造靈感寫入。
- **防止敏感資料外洩**：禁止將任何真實的 LINE Channel Access Token、Gemini API Key 或 Google Sheets 憑證寫入公開代碼中，所有金鑰均應存放於 `.env.local`。
