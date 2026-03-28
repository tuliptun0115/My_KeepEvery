/**
 * 靈感收藏盒 - Google Apps Script 後端處理程序
 * 
 * 部署指引：
 * 1. 在 Google 試算表內點擊「擴充功能」 > 「Apps Script」
 * 2. 貼入以下完整程式碼並儲存
 * 3. 點擊「部署」 > 「新增部署」 > 「網頁應用程式」
 * 4. 誰可以存取設定為「任何人 (Anyone)」
 * 
 * 安全說明：
 * 程式內含 SECRET_TOKEN 驗證，請確保與 .env.local 一致
 */

function doPost(e) {
  // 安全驗證碼：需與您的 .env.local 中的 GOOGLE_GAS_SECRET 一致
  var SECRET_TOKEN = "KEEP_EVERY_SECRET_123"; 
  
  var data = JSON.parse(e.postData.contents);
  
  // 安全性檢查
  if (data.token !== SECRET_TOKEN) {
    return ContentService.createTextOutput("Unauthorized").setStatusCode(401);
  }

  // 取得當前作用中的試算表分頁
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // 按照順序寫入資料：時間、標題、標籤、連結
  sheet.appendRow([
    data.time, 
    data.title, 
    data.tags, 
    data.source
  ]);
  
  // 回傳成功訊息
  return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
