import { NextRequest, NextResponse } from "next/server";
import { updateLibraryV2Record } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      input_type,
      raw_input,
      source_title,
      source_url,
      created_at,
      source_platform,
      content_type,
      summary,
      key_points,
      tags,
      use_case,
      topic_category,
      confidence_level,
      parse_status
    } = body;

    // 基本欄位驗證
    if (!id) {
      return NextResponse.json(
        { success: false, error: "缺少靈感 ID，無法執行更新" },
        { status: 400 }
      );
    }

    if (!summary || typeof summary !== "string" || !summary.trim()) {
      return NextResponse.json(
        { success: false, error: "摘要內容不能為空" },
        { status: 400 }
      );
    }

    const recordPayload = {
      id,
      input_type: input_type || "text",
      raw_input: raw_input || "",
      source_title: source_title || "",
      source_url: source_url || "",
      created_at: created_at || new Date().toISOString(),
      source_platform: source_platform || "手動編輯",
      content_type: content_type || "note",
      summary: summary.trim(),
      key_points: Array.isArray(key_points) ? key_points : [],
      tags: Array.isArray(tags) ? tags : [],
      use_case: use_case || "內容靈感",
      topic_category: topic_category || "未分類",
      confidence_level: confidence_level || "high",
      parse_status: parse_status || "complete",
    };

    console.log(`[API] 正在更新靈感: ${id}`);
    await updateLibraryV2Record(recordPayload);

    return NextResponse.json({
      success: true,
      record: recordPayload,
    });
  } catch (error: unknown) {
    console.error("[API] 更新靈感失敗:", error);
    const errorMessage = error instanceof Error ? error.message : "伺服器處理失敗，請稍後再試";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
