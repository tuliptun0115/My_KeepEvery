# 🚀 Cloud Run 部署指令手冊

請開啟終端機（Terminal / PowerShell），依序執行以下指令：

### 1. 登入 Google Cloud
```powershell
gcloud auth login
gcloud config set project [您的專案 ID]
```

### 2. 啟動 Artifact Registry (若尚未啟動)
```powershell
gcloud services enable artifactregistry.googleapis.com cloudbuild.googleapis.com run.googleapis.com
```

### 3. 建置並推送到雲端 (GCR)
這個步驟會把程式打包成映像檔：
```powershell
gcloud builds submit --tag gcr.io/[您的專案 ID]/inspiration-box
```

### 4. 正式部署到 Cloud Run
**注意：** 您必須在指令中帶入您的金鑰，或者部署後去 Cloud Run 控制台手動修改環境變數。

```powershell
gcloud run deploy inspiration-box `
  --image gcr.io/[您的專案 ID]/inspiration-box `
  --platform managed `
  --region asia-east1 `
  --allow-unauthenticated `
  --set-env-vars "LINE_CHANNEL_ACCESS_TOKEN=[您的金鑰],LINE_CHANNEL_SECRET=[您的金鑰],GEMINI_API_KEY=[您的金鑰],GOOGLE_GAS_URL=[您的連結],GOOGLE_GAS_SECRET=KEEP_EVERY_SECRET_123"
```

---

### 🔗 部署完成後的最重要一步
1. 部署完後，Cloud Run 會給您一個網址 (Service URL)。
2. 複製該網址，並在後面加上 `/api/webhook/line`。
   - 例如：`https://inspiration-box-xxx.a.run.app/api/webhook/line`
3. 回到 **LINE Developers Console** 的 **Messaging API** 分頁。
4. 找到 **Webhook settings**，將這個網址貼入 **Webhook URL**。
5. 點擊 **Verify**，如果顯示 `Success`，就代表大功告成了！
