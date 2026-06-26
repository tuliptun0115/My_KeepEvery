import { NextRequest, NextResponse } from "next/server";
import { updatePromptLibraryRecord } from "@/lib/sheets";
import { analyzePrompt } from "@/lib/gemini";

function getTaipeiTimestamp(): string {
  return new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
}

export async function POST(req: NextRequest) {
  try {
    const { id, prompt_title, prompt_category, prompt_text, created_at, source_type } = await req.json();
    
    if (!id || !prompt_category || !prompt_text || !prompt_text.trim()) {
      return NextResponse.json({ error: "參數缺失或不合規" }, { status: 400 });
    }

    let finalTitle = prompt_title || "";
    if (!finalTitle.trim()) {
      const analysis = await analyzePrompt(prompt_text);
      finalTitle = analysis.title;
    }

    const updatedPrompt = {
      id,
      prompt_title: finalTitle.trim(),
      prompt_category,
      prompt_text: prompt_text.trim(),
      created_at: created_at || getTaipeiTimestamp(),
      updated_at: getTaipeiTimestamp(),
      source_type: source_type || "web"
    };

    // 呼叫 Sheets 更新
    await updatePromptLibraryRecord(updatedPrompt);

    return NextResponse.json({ success: true, prompt: updatedPrompt });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '內部伺服器錯誤';
    console.error("API /api/prompts/update error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
