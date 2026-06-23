import { NextRequest, NextResponse } from "next/server";
import { verifySignature, replyMessage, pushMessage } from "@/lib/line";
import { extractSocialContent, extractGeneralContent } from "@/lib/extractor";
import { organizeTextInspiration, organizeSocialInspiration, organizeGeneralInspiration } from "@/lib/gemini";
import { appendToLibraryV2 } from "@/lib/sheets";

function truncateSourceTitle(text: string, maxLength: number = 60): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
}

function getTaipeiTimestamp(): string {
  return new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
}

function extractFirstUrl(text: string): string | null {
  const urlMatch = text.match(/(https?:\/\/[^\s]+)/g);
  return urlMatch ? urlMatch[0] : null;
}

const SOCIAL_DOMAINS = [
  "facebook.com",
  "instagram.com",
  "threads.net",
  "threads.com",
  "x.com",
  "twitter.com",
  "linkedin.com",
];

function isSocialUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return SOCIAL_DOMAINS.some((domain) => hostname.includes(domain));
  } catch {
    return false;
  }
}

function formatReplyMessage(
  type: string,
  source: string,
  title: string,
  summary: string,
  keyPoints: string[],
  tags: string[],
  parseStatus: "complete" | "partial",
  confidenceLevel: "high" | "medium" | "low"
): string {
  const statusEmoji = parseStatus === "complete" ? "✅" : "⚠️";
  const confidenceStr =
    confidenceLevel === "low"
      ? " (低信心)"
      : confidenceLevel === "medium"
      ? " (中等信心)"
      : " (高信心)";

  let msg = `📥 靈感已收錄至 library_v2！\n\n`;
  msg += `【類型】${type}\n`;
  msg += `【來源】${source}\n`;
  msg += `【標題】${title}\n`;
  msg += `【摘要】${summary}\n`;

  if (keyPoints && keyPoints.length > 0) {
    msg += `【重點】\n`;
    keyPoints.forEach((kp) => {
      msg += `• ${kp}\n`;
    });
  }

  msg += `【標籤】${tags.join(" ")}\n`;
  msg += `【狀態】${parseStatus}${statusEmoji}${confidenceStr}`;

  return msg;
}

async function handleUrlMessage(
  text: string,
  replyToken: string,
  userId?: string
) {
  const url = extractFirstUrl(text);
  if (!url) {
    return;
  }

  const surroundingText = text.replace(url, "").trim();
  const isSocial = isSocialUrl(url);

  if (isSocial) {
    console.log(`[Webhook] 開始處理社群 URL: ${url}`);
    await replyMessage(replyToken, "🌟 偵測到社群靈感連結，正在捕捉中...");
  } else {
    console.log(`[Webhook] 開始處理一般 URL: ${url}`);
    await replyMessage(replyToken, "🌟 偵測到網頁靈感連結，正在捕捉中...");
  }

  try {
    let extractResult;
    let organized;
    let input_type: "social_url" | "url";
    let content_type: "post" | "article";
    let typeName: string;

    if (isSocial) {
      extractResult = await extractSocialContent(url);
      input_type = "social_url";
      content_type = "post";
      typeName = "社群靈感";
      organized = await organizeSocialInspiration(
        extractResult.title,
        extractResult.description,
        url,
        extractResult.platform,
        surroundingText
      );
    } else {
      extractResult = await extractGeneralContent(url);
      input_type = "url";
      content_type = "article";
      typeName = "網頁靈感";
      organized = await organizeGeneralInspiration(
        extractResult.title,
        extractResult.description,
        extractResult.content,
        url,
        surroundingText
      );
    }

    // 信心等級加權
    let confidence_level = extractResult.confidence_level;
    if (surroundingText && confidence_level === "low") {
      confidence_level = "medium";
    }

    // 寫入 library_v2
    await appendToLibraryV2({
      id: crypto.randomUUID(),
      input_type,
      raw_input: text,
      source_title: extractResult.title,
      source_url: url,
      created_at: getTaipeiTimestamp(),
      source_platform: extractResult.platform,
      content_type,
      summary: organized.summary,
      key_points: organized.key_points,
      tags: organized.tags,
      use_case: organized.use_case,
      topic_category: organized.topic_category,
      confidence_level,
      parse_status: extractResult.parse_status,
    });

    if (userId) {
      const replyMsg = formatReplyMessage(
        typeName,
        extractResult.platform,
        extractResult.title,
        organized.summary,
        organized.key_points,
        organized.tags,
        extractResult.parse_status,
        confidence_level
      );
      await pushMessage(userId, replyMsg);
    }
  } catch (err) {
    console.error(`[Webhook] URL 處理失敗:`, err);
    if (userId) {
      const errorMsg = isSocial
        ? "❌ 社群連結收藏失敗，請稍後再試。"
        : "❌ 網頁連結收藏失敗，請稍後再試。";
      await pushMessage(userId, errorMsg);
    }
  }
}

async function handleTextMessage(
  text: string,
  replyToken: string,
  userId?: string
) {
  await replyMessage(replyToken, "📝 正在整理您的文字內容並寫入靈感收藏庫...");

  try {
    const organized = await organizeTextInspiration(text);
    const title = truncateSourceTitle(text);

    await appendToLibraryV2({
      id: crypto.randomUUID(),
      input_type: "text",
      raw_input: text,
      source_title: title,
      source_url: "",
      created_at: getTaipeiTimestamp(),
      source_platform: "LINE 文字",
      content_type: "note",
      summary: organized.summary,
      key_points: organized.key_points,
      tags: organized.tags,
      use_case: organized.use_case,
      topic_category: organized.topic_category,
      confidence_level: "high",
      parse_status: "complete",
    });

    if (userId) {
      const replyMsg = formatReplyMessage(
        "文字靈感",
        "LINE 文字",
        title,
        organized.summary,
        organized.key_points,
        organized.tags,
        "complete",
        "high"
      );
      await pushMessage(userId, replyMsg);
    }
  } catch (err) {
    console.error("[Webhook] 文字處理失敗:", err);
    if (userId) {
      await pushMessage(userId, "❌ 文字收藏失敗，請稍後再試。");
    }
  }
}

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
        const userId = event.source.userId;

        // 2. 檢測是否為 URL (支援文字收藏或 URL 收藏)
        const url = extractFirstUrl(text);
        
        if (url) {
          await handleUrlMessage(text, replyToken, userId);
        } else {
          await handleTextMessage(text, replyToken, userId);
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook route error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
