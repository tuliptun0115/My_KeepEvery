import { GoogleGenAI } from "@google/genai";

/**
 * 初始化 Google GenAI 客戶端 (新版 SDK)
 * 使用 gemini-2.0-flash 模型 (免費額度適用)
 */
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const MODEL_NAME = "gemini-2.5-flash";

/**
 * 根據標題與網址生成 3 個 AI 標籤
 * - 若標題有效：根據標題分類
 * - 若標題為空或過簡：根據 URL 路徑推測主題
 */
export async function generateInspirationTags(
  content: string,
  url: string = ""
): Promise<string[]> {
  try {
    const prompt = `
你是一個靈感分類專家。請針對以下資訊，提供 3 個精簡且具有代表性的繁體中文標籤（帶有 # 號）。

標題或內容：${content}
來源網址：${url}

規則：
1. 如果「標題或內容」是有意義的文字，請根據它來分類。
2. 如果「標題或內容」過於簡短或無意義（如 "無標題網頁"、"YouTube"、"Facebook"），請改為根據「來源網址」的路徑、參數或網域來推測可能的內容主題。
3. 僅回傳 JSON 格式：{"tags": ["#標籤1", "#標籤2", "#標籤3"]}
4. 不要包含任何額外的文字、解釋或 Markdown 語法。
5. 標籤應涵蓋主題、領域或用途。
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const text = response.text ?? "";
    console.log("[Gemini] 原始回應:", text.substring(0, 200));

    // 從回應中提取 JSON 物件 (容錯處理)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[Gemini] 無法從回應中找到 JSON");
      return ["#靈感", "#收藏"];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.tags || ["#靈感"];
  } catch (error) {
    console.error("[Gemini] 標籤生成失敗:", error);
    return ["#待分類", "#網路收藏"];
  }
}
