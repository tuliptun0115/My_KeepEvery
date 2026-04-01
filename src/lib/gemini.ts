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
你是一個靈感分類專家。請針對以下資訊，提供 3 個精簡且具有代表性的繁體中文標籤（帶有 # 號），並且如果原標題無效，請利用 Google 搜尋還原真實標題。

原標題或內容：${content}
來源網址：${url}

規則：
1. 如果「原標題或內容」是有意義的文字，請根據它來分類，並且 \`real_title\` 欄位給 null。
2. 【極度重要】如果收到 "Facebook"、"來自 Facebook 的分享"、"Instagram" 或 "Threads" 等廢字，代表標題抓取失敗。這時你**必須強制啟動 Google Search** 針對網址進行搜尋！查出發文者或內容大意後：
   - 給出正確的 tags
   - 將你查到的真實大意或發文者名稱填入 \`real_title\`（例如 "大谷翔平粉專貼文" 或 "CNN: 最新選情"）。
3. 僅回傳 JSON 格式：{"tags": ["#標籤1", "#標籤2", "#標籤3"], "real_title": "字串或null"}
4. 不要包含任何額外的文字、解釋或 Markdown 語法。
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
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
