import { GoogleGenAI } from "@google/genai";

/**
 * 初始化 Google GenAI 客戶端 (新版 SDK)
 * 使用 gemini-2.0-flash 模型 (免費額度適用)
 */
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const MODEL_NAME = "gemini-2.5-flash";

/**
 * 根據標題與網址生成 3 個 AI 標籤，並試圖補全失效的標題
 * - 若標題有效：根據標題分類
 * - 若標題失效：強制 Google Search 找回真實標題與分類
 */
export async function generateInspirationTags(
  content: string,
  url: string = ""
): Promise<{tags: string[], real_title: string | null}> {
  try {
    const prompt = `
你是一個靈感分類專家。請根據以下標題或內容，提供 3 個精簡且具有代表性的繁體中文標籤（帶有 # 號）。

原標題或內容：${content}
來源網址：${url}

規則：
1. 直接根據「原標題或內容」的文字進行分類，\`real_title\` 給 null。
2. 如果內容是 "來自 Facebook 的分享"、"來自 Threads 的分享" 等無意義通用文字，代表貼文無法被爬取，請給出 3 個通用標籤（如 #社群分享 #收藏 #待閱讀），\`real_title\` 給 null。
3. 僅回傳 JSON 格式：{"tags": ["#標籤1", "#標籤2", "#標籤3"], "real_title": null}
4. 不要包含任何額外的文字、解釋或 Markdown 語法。
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const text = response.text ?? "";
    console.log("[Gemini] 原始回應:", text.substring(0, 200));

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[Gemini] 無法從回應中找到 JSON");
      return { tags: ["#靈感", "#收藏"], real_title: null };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return { tags: parsed.tags || ["#靈感"], real_title: parsed.real_title || null };
  } catch (error) {
    console.error("[Gemini] 標籤生成失敗:", error);
    return { tags: ["#待分類", "#網路收藏"], real_title: null };
  }
}
