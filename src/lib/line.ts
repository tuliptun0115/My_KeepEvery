import crypto from "crypto";

/**
 * 驗證 LINE Webhook 簽名
 */
export function verifySignature(body: string, signature: string): boolean {
  const hmac = crypto
    .createHmac("SHA256", process.env.LINE_CHANNEL_SECRET || "")
    .update(body)
    .digest("base64");
  return hmac === signature;
}

/**
 * 回覆 LINE 訊息
 */
export async function replyMessage(replyToken: string, text: string) {
  try {
    const response = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: "text", text }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("LINE reply error:", errorData);
    }
  } catch (error) {
    console.error("LINE API connection error:", error);
  }
}
