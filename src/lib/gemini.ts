import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * 根據標題生成 3 個 AI 標籤
 * 強制要求純 JSON 回傳
 */
export async function generateInspirationTags(title: string): Promise<string[]> {
  try {
    const prompt = `
      你是一個靈感分類專家。請針對以下網頁標題或內容，提供 3 個精簡且具有代表性的標籤（帶有 # 號）。
      標題：${title}
      
      請嚴格遵守以下規則：
      1. 僅回傳 JSON 格式：{"tags": ["#標籤1", "#標籤2", "#標籤3"]}
      2. 不要包含任何額外的文字、解釋或 Markdown 語法。
      3. 標籤應涵蓋主題、領域或用途。
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // 清理可能存在的 Markdown 區塊
    const jsonString = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(jsonString);
    
    return parsed.tags || ["#靈感"];
  } catch (error) {
    console.error("Gemini tagging error:", error);
    return ["#待分類", "#網路收藏"];
  }
}
