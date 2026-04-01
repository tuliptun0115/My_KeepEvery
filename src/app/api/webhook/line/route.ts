import { NextRequest, NextResponse } from "next/server";
import { verifySignature, replyMessage, pushMessage } from "@/lib/line";
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
          // 擷取網址以外的任何使用者附帶中文字
          const surroundingText = text.replace(url, "").trim();

          console.log(`[Webhook] 開始處理 URL: ${url}`);
          await replyMessage(replyToken, "🌟 偵測到靈感連結，正在捕捉中...");

          try {
            // 核心處理流程
            console.log(`[Webhook] 提取標題中...`);
            let title = await extractTitle(url);
            
            // 如果爬蟲失敗只有抓到品牌名，而且使用者有附帶備註文字，我們就以使用者的文字為主
            if (surroundingText && (title === "Facebook" || title === "Instagram" || title.includes("Log in"))) {
              console.log(`[Webhook] 爬蟲可能遭擋，改用使用者附加文字作為標題: ${surroundingText}`);
              title = surroundingText;
            }

            console.log(`[Webhook] 生成 AI 標籤中... (附帶使用者文字)`);
            // 把網頁標題與使用者打的字混在一起丟給 AI，給他最大量的判斷情報
            const aiContent = surroundingText ? `[原標題: ${title}] 使用者備註: ${surroundingText}` : title;
            const geminiResult = await generateInspirationTags(aiContent, url);
            const tags = geminiResult.tags;
            
            // 如果 Gemini 有查出真正的標題，我們就把它換回去！(完美解決 FB/IG 沒文案也沒標題的狀況)
            if (geminiResult.real_title) {
              console.log(`[Webhook] Gemini 利用搜尋找回了真實標題：${geminiResult.real_title}`);
              title = geminiResult.real_title;
            }

            const time = new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
            
            console.log(`[Webhook] 寫入 Google Sheets 中...`);
            await appendToSheet({
              time,
              title,
              tags,
              source: url
            });

            console.log(`[Webhook] 全部完成，發送 Push Message 通知`);
            // 推送成功訊息 (因為 replyToken 只能用一次，所以這裡用 pushMessage)
            // 註：這需要知道 userId，我們從 event 取得
            const userId = event.source.userId;
            if (userId) {
              let replyMsg = `✅ 靈感已收藏！\n\n📌 標題：${title}\n🏷️ 標籤：${tags.join(" ")}`;
              
              const isBlockedSocial = (title.includes("Facebook") || title.includes("Instagram") || title.includes("Log in")) && !surroundingText;
              if (isBlockedSocial) {
                replyMsg += `\n\n⚠️ 【防擋小提醒】Meta (FB/IG) 拒絕了外部機器人讀取這篇貼文，因此我無法看到內容。下次分享連結給我的時候，建議您「順手打幾個字」（例如：這是大谷翔平全壘打），我就能依據您的文字進行完美分類與標題設定哦！`;
              }
              
              await pushMessage(userId, replyMsg);
            }
          } catch (err) {
            console.error("[Webhook] URL 處理失敗:", err);
            const userId = event.source.userId;
            if (userId) {
              await pushMessage(userId, `❌ 收藏失敗：網路連線逾時或 API 錯誤。\n請確認試算表權限與 Gemini 金鑰。`);
            }
          }
        } else {
          // 純文字收藏
          await replyMessage(replyToken, "📝 正在將您的文字紀錄到靈感收藏盒...");
          
          try {
            const geminiResult = await generateInspirationTags(text);
            const tags = geminiResult.tags;
            const time = new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
            
            await appendToSheet({
              time,
              title: text,
              tags,
              source: "LINE 文字訊息"
            });

            const userId = event.source.userId;
            if (userId) {
              await pushMessage(userId, `✅ 文字靈感已收藏！\n🏷️ AI 標籤：${tags.join(" ")}`);
            }
          } catch (err) {
            console.error("[Webhook] 文字處理失敗:", err);
            const userId = event.source.userId;
            if (userId) {
              await pushMessage(userId, `❌ 文字收藏失敗，請稍後再試。`);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook route error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
