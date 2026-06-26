const url = "https://script.google.com/macros/s/AKfycbzZGoeND8gr4W14TA1jrKkcCi05yAJLDLkpxgftV-zwEXh7STj1jFMAC5kgPzN0f45fWQ/exec";
const payload = {
  token: "KEEP_EVERY_SECRET_123",
  sheet_name: "prompt_library",
  id: "test-init-id",
  prompt_category: "其他",
  prompt_text: "這是一筆用來初始化指令寶庫工作表與 Header 的測試資料。",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  source_type: "web"
};

console.log("發送請求以建立 prompt_library 工作表並寫入初始資料...");
fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
.then(res => {
  console.log("HTTP 狀態碼:", res.status);
  return res.json();
})
.then(data => {
  console.log("GAS 回應結果:", data);
})
.catch(err => {
  console.error("發送請求時發生錯誤:", err);
});
