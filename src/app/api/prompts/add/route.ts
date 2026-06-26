import { NextRequest, NextResponse } from "next/server";
import { analyzePrompt } from "@/lib/gemini";
import { appendToPromptLibrary } from "@/lib/sheets";

function getTaipeiTimestamp(): string {
  return new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
}

export async function POST(req: NextRequest) {
  try {
    const { prompt_text, prompt_title } = await req.json();
    if (!prompt_text || !prompt_text.trim()) {
      return NextResponse.json({ error: "指令內容不可為空" }, { status: 400 });
    }

    // AI 自動分類與自動生成標題
    const analysis = await analyzePrompt(prompt_text);
    const finalTitle = prompt_title && prompt_title.trim() 
      ? prompt_title.trim() 
      : analysis.title;

    const now = getTaipeiTimestamp();
    
    const newPrompt = {
      id: crypto.randomUUID(),
      prompt_title: finalTitle,
      prompt_category: analysis.category,
      prompt_text: prompt_text.trim(),
      created_at: now,
      updated_at: now,
      source_type: "web"
    };

    // 寫入 Google Sheets
    await appendToPromptLibrary(newPrompt);

    return NextResponse.json({ success: true, prompt: newPrompt });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '內部伺服器錯誤';
    console.error("API /api/prompts/add error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
