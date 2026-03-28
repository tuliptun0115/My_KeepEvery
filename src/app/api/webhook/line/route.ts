import { NextRequest, NextResponse } from "next/server";
import { verifySignature, replyMessage } from "@/lib/line";
import { extractTitle } from "@/lib/extractor";
import { generateInspirationTags } from "@/lib/gemini";
import { appendToSheet } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-line-signature");

    // 1. 安全性驗證
    if (!signature || !verifySignature(rawBody, signature)) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const events = body.events;

    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const text = event.message.text.trim();
        const replyToken = event.replyToken;

        // 2. 檢測是否為 URL (支援文字收藏或 URL 收藏)
        const urlMatch = text.match(/(https?:\/\/[^\s]+)/g);
        
        if (urlMatch) {
          const url = urlMatch[0];
          await replyMessage(replyToken, "🌟 偵測到靈感連結，正在捕捉中...");

          // 核心處理流程
          const title = await extractTitle(url);
          const tags = await generateInspirationTags(title);
          const time = new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });

          // 寫入 Google Sheets
          await appendToSheet({
            time,
            title,
            tags,
            source: url
          });

          // 第二次通知 (這裡需要 push message 或在背景處理，但 reply 只能用一次)
          // 註：這是一個簡化版，真實環境中複數訊息需考慮 API 限制
        } else {
          // 純文字收藏
          await replyMessage(replyToken, "📝 正在將您的文字紀錄到靈感收藏盒...");
          const tags = await generateInspirationTags(text);
          const time = new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
          
          await appendToSheet({
            time,
            title: text,
            tags,
            source: "LINE 文字訊息"
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook route error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
