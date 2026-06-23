import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { raw_input, user_note } = body;

    if (!raw_input || typeof raw_input !== "string" || !raw_input.trim()) {
      return NextResponse.json(
        { success: false, error: "請輸入有效的內容（網址或文字）" },
        { status: 400 }
      );
    }

    const text = raw_input.trim();
    const note = user_note?.trim() || "";

    const url = extractFirstUrl(text);
    let recordPayload;

    if (url) {
      const isSocial = isSocialUrl(url);
      let extractResult;
      let organized;
      let input_type: "social_url" | "url";
      let content_type: "post" | "article";

      if (isSocial) {
        console.log(`[API] 手動處理社群 URL: ${url}`);
        extractResult = await extractSocialContent(url);
        input_type = "social_url";
        content_type = "post";
        organized = await organizeSocialInspiration(
          extractResult.title,
          extractResult.description,
          url,
          extractResult.platform,
          note
        );
      } else {
        console.log(`[API] 手動處理一般 URL: ${url}`);
        extractResult = await extractGeneralContent(url);
        input_type = "url";
        content_type = "article";
        organized = await organizeGeneralInspiration(
          extractResult.title,
          extractResult.description,
          extractResult.content,
          url,
          note
        );
      }

      // 信心等級加權
      let confidence_level = extractResult.confidence_level;
      if (note && confidence_level === "low") {
        confidence_level = "medium";
      }

      recordPayload = {
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
      };
    } else {
      console.log(`[API] 手動處理純文字: ${text}`);
      const organized = await organizeTextInspiration(text);
      const title = truncateSourceTitle(text);

      recordPayload = {
        id: crypto.randomUUID(),
        input_type: "text" as const,
        raw_input: text,
        source_title: title,
        source_url: "",
        created_at: getTaipeiTimestamp(),
        source_platform: "LINE 文字",
        content_type: "note" as const,
        summary: organized.summary,
        key_points: organized.key_points,
        tags: organized.tags,
        use_case: organized.use_case,
        topic_category: organized.topic_category,
        confidence_level: "high" as const,
        parse_status: "complete" as const,
      };
    }

    // 寫入 Google Sheets
    await appendToLibraryV2(recordPayload);

    return NextResponse.json({
      success: true,
      record: recordPayload,
    });
  } catch (error: unknown) {
    console.error("[API] 手動新增靈感失敗:", error);
    const errorMessage = error instanceof Error ? error.message : "伺服器處理失敗，請稍後再試";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
