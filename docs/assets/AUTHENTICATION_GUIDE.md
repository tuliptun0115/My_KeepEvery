# 🗝️ 金鑰申請完全手冊 - 靈感收藏盒

本文件將引導您完成「靈感收藏盒」運作所需的各項金鑰申請。

---

## 1. LINE Messaging API (機器人核心)
這是為了讓 LINE 機器人能收到您的訊息並回覆。

1.  **登入**：前往 [LINE Developers Console](https://developers.line.biz/) 並用 LINE 帳號登入。
2.  **建立 Provider**：點擊「Create」，輸入名字（例如：`My-Apps`）。
3.  **建立 Channel**：點擊「Create a new channel」，選擇 **Messaging API**。
    - **基本資訊**：填寫機器人名稱、描述、分類。
    - **勾選條約**：點擊 Create 完成。
4.  **獲取金鑰**：
    - **Channel Secret**：在「Basic settings」分頁往下捲動即可看到。
    - **Channel Access Token**：在「Messaging API」分頁最下方，點擊「Issue」按鈕即可生成長字串。
5.  **開啟 Webhook**：在「Messaging API」分頁找到 **Webhook settings**，將 `Use webhook` 開啟（URL 等部署後再填）。

---

## 2. Gemini API (AI 標籤生成)
這是為了讓 AI 能閱讀您的網頁標題並產生標籤。

1.  **前往平台**：登入 [Google AI Studio (Gemini API)](https://aistudio.google.com/)。
2.  **建立 Key**：首頁側邊欄點擊「Get API key」。
3.  **點擊生成**：點擊「Create API key in new project」。
4.  **保存**：將生成的這串英文數字複製下來。

---

## 3. Google Sheets (資料儲存庫 - 簡單 Apps Script 版)
這是為了讓系統能把資料寫進您的 Excel 表格中，此方法不需信用卡、不需 Google Cloud 帳號。

1.  **建立試算表**：手動建立一個新的 Google 試算表。
2.  **開啟指令碼編輯器**：
    - 點擊選單：**擴充功能 (Extensions)** > **Apps Script**。
3.  **貼上程式碼**：請直接複製 [**scripts/google_sheets_gas.js**](file:///c:/Users/8475/Desktop/AI%20Project/My_KeepEvery/scripts/google_sheets_gas.js) 檔案中的完整程式碼，並貼入試算表的 Apps Script 編輯器中。

4.  **發佈 WebApp**：
    - 點擊右上角「**部署 (Deploy)**」 > 「**新增部署**」。
    - 類型選擇「**網頁應用程式**」。
    - 誰可以存取設定為「**任何人 (Anyone)**」。
5.  **複製網址**：部署成功後，畫面上會出現一個「**網頁應用程式 (Web App)**」區塊，下方有一串以 `https://script.google.com/macros/s/...` 開頭的網址。請點擊旁邊的「**複製**」。
6.  **設定金鑰**：將這串網址填入 `.env.local` 的 `GOOGLE_GAS_URL` 欄位中。

---

## 🚀 最後步驟
將以上獲得的資訊填入專案根目錄的 `.env.local` 檔案中（請從 `.env.example` 複製一份出來更名）。
