const crypto = require("crypto");

// 讀取環境變數 (模擬環境)
const CHANNEL_SECRET = "c95932271d56bcd90676932fd25f26f7";
const TARGET_URL = "http://localhost:3000/api/webhook/line";

// 測試案例
const testCases = [
  {
    name: "情境 A (顯式 Prompt 分流)",
    text: "/prompt 請扮演一位專業翻譯官，幫我將以下繁體中文翻譯成精準的英文："
  },
  {
    name: "情境 B (隱式 Prompt 分流)",
    text: "你是一個前端架構師，請幫我設計一個基於 Next.js 15 App Router 的雙欄佈局 CSS 設計方案。"
  },
  {
    name: "情境 C (一般純文字靈感分流)",
    text: "新讀到的筆記：在軟體架構中，保持模組的高內聚、低耦合可以極大降低維護成本，尤其是在頻繁重構的敏捷開發流程中。"
  }
];

async function sendWebhook(text, name) {
  console.log(`\n==================================================`);
  console.log(`🚀 開始執行測試: [${name}]`);
  console.log(`📝 輸入內容: "${text}"`);

  const payload = {
    destination: "xxxxxxxxxx",
    events: [
      {
        type: "message",
        message: {
          type: "text",
          id: "325708" + Math.floor(Math.random() * 1000),
          text: text
        },
        timestamp: Date.now(),
        source: {
          type: "user",
          userId: "U1234567890abcdef1234567890abcdef"
        },
        replyToken: "replyToken_" + Math.floor(Math.random() * 100000),
        mode: "active"
      }
    ]
  };

  const bodyStr = JSON.stringify(payload);
  
  // 計算 LINE Webhook 簽章
  const signature = crypto
    .createHmac("SHA256", CHANNEL_SECRET)
    .update(bodyStr)
    .digest("base64");

  try {
    const res = await fetch(TARGET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-line-signature": signature
      },
      body: bodyStr
    });

    console.log(`📬 伺服器狀態碼: ${res.status}`);
    const data = await res.json();
    console.log(`📬 Webhook 回應:`, data);
  } catch (err) {
    console.error(`❌ Webhook 發送異常:`, err.message);
  }
}

async function runTests() {
  for (const tc of testCases) {
    await sendWebhook(tc.text, tc.name);
    // 延遲 8 秒，避免 Gemini 429 且讓伺服器有時間完成 Sheets 寫入與 LINE pushMessage 模擬
    await new Promise((resolve) => setTimeout(resolve, 8000));
  }
  console.log("\n==================================================");
  console.log("🏁 模擬測試發送完畢，請檢查後台日誌與 Google Sheets 是否正確收錄！");
}

runTests();
