import { GoogleGenAI } from "@google/genai";

/**
 * 初始化 Google GenAI 客戶端 (新版 SDK)
 * 使用 gemini-2.0-flash 模型 (免費額度適用)
 */
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const MODEL_NAME = "gemini-2.5-flash";

export interface OrganizedTextInspiration {
  summary: string;
  key_points: string[];
  tags: string[];
  use_case: string;
  topic_category: string;
}

function extractJsonObject(text: string): string | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : null;
}

function truncateSingleLine(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
}

function buildFallbackKeyPoints(content: string): string[] {
  return [
    truncateSingleLine(content, 40),
    "可作為後續整理與延伸發想的原始筆記",
  ];
}

function buildFallbackTags(): string[] {
  return ["#文字收藏", "#待整理", "#靈感筆記"];
}

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

    const jsonText = extractJsonObject(text);
    if (!jsonText) {
      console.error("[Gemini] 無法從回應中找到 JSON");
      return { tags: ["#靈感", "#收藏"], real_title: null };
    }

    const parsed = JSON.parse(jsonText);
    return { tags: parsed.tags || ["#靈感"], real_title: parsed.real_title || null };
  } catch (error) {
    console.error("[Gemini] 標籤生成失敗:", error);
    return { tags: ["#待分類", "#網路收藏"], real_title: null };
  }
}

/**
 * 將純文字靈感整理為新版收藏欄位
 */
export async function organizeTextInspiration(
  content: string
): Promise<OrganizedTextInspiration> {
  try {
    const prompt = `
你是「靈感收藏庫」的內容整理編輯。請將使用者貼上的繁體中文或中英混合筆記，整理成可寫入資料庫的 JSON。

原文：
${content}

規則：
1. summary 必須是一句繁體中文摘要，幫助首頁第一眼快速理解。
2. key_points 請輸出 2 到 3 條，每條都是簡短重點句。
3. tags 請輸出 3 到 5 個繁體中文標籤，每個標籤都要帶 #。
4. use_case 描述用途分類。必須從以下指定的 8 個用途分類中選擇最貼切的一個，不能超出此範圍（大小寫與字元需完全一致）：
   - Prompt
   - 內容靈感
   - 工具收藏
   - 工作流程參考
   - 技術參考
   - 產品研究
   - 商業與市場
   - 待分類
   注意：若內容本身是提供 prompt 指令（提示詞範本）、prompt 教學或 prompt 心得，用途分類 (use_case) 必須固定選擇為：Prompt。
5. topic_category 描述主題分類。必須從以下指定的 10 個主題分類中選擇最貼切的一個，不能超出此範圍（大小寫與字元需完全一致）：
   - Prompt
   - AI 工具
   - 社群行銷
   - 產品設計
   - 前端開發
   - 工作流程
   - 商業策略
   - 內容創作
   - 日常隨筆
   - 其他
   注意：若內容本身是提供 prompt 指令（提示詞範本）、prompt 教學或 prompt 心得，主題分類 (topic_category) 必須固定選擇為：Prompt。
6. 只回傳 JSON，不要加任何解釋或 Markdown。

格式：
{
  "summary": "一句話摘要",
  "key_points": ["重點1", "重點2"],
  "tags": ["#標籤1", "#標籤2", "#標籤3"],
  "use_case": "用途分類",
  "topic_category": "主題分類"
}
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const text = response.text ?? "";
    console.log("[Gemini] 純文字整理原始回應:", text.substring(0, 300));

    const jsonText = extractJsonObject(text);
    if (!jsonText) {
      throw new Error("無法從回應中找到 JSON");
    }

    const parsed = JSON.parse(jsonText);
    const keyPoints = Array.isArray(parsed.key_points)
      ? parsed.key_points.map((item: string) => String(item).trim()).filter(Boolean).slice(0, 3)
      : [];
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.map((item: string) => String(item).trim()).filter(Boolean).slice(0, 5)
      : [];

    return {
      summary: truncateSingleLine(parsed.summary || content, 90),
      key_points: keyPoints.length >= 2 ? keyPoints : buildFallbackKeyPoints(content),
      tags: tags.length >= 3 ? tags : buildFallbackTags(),
      use_case: truncateSingleLine(parsed.use_case || "內容靈感", 30),
      topic_category: truncateSingleLine(parsed.topic_category || "未分類", 30),
    };
  } catch (error) {
    console.error("[Gemini] 純文字整理失敗:", error);

    return {
      summary: truncateSingleLine(content, 90),
      key_points: buildFallbackKeyPoints(content),
      tags: buildFallbackTags(),
      use_case: "內容靈感",
      topic_category: "未分類",
    };
  }
}

export interface OrganizedSocialInspiration {
  summary: string;
  key_points: string[];
  tags: string[];
  use_case: string;
  topic_category: string;
}

/**
 * 將社群貼文內容整理為新版收藏欄位
 */
export async function organizeSocialInspiration(
  title: string,
  description: string,
  url: string,
  platform: string,
  surroundingText: string = ""
): Promise<OrganizedSocialInspiration> {
  const isFallbackTitle = title.startsWith("來自 ") || title === "無法提取標題";
  
  // 組裝 AI 閱讀的上下文
  let context = `來源網址：${url}\n來源平台：${platform}\n標題：${title}\n`;
  if (description) {
    context += `貼文內容描述：${description}\n`;
  }
  if (surroundingText) {
    context += `使用者備註/附加文字：${surroundingText}\n`;
  }

  try {
    const prompt = `
你是一個靈感與知識的整理編輯。請將使用者收藏的社群貼文或連結資訊，整理成可寫入資料庫的 JSON。

社群連結資訊：
${context}

規則：
1. summary 必須是一句繁體中文摘要，幫助首頁第一眼快速理解。
   - 如果這是一則抓不到內容的降級網址（如標題是 "來自 Facebook 的分享" 且沒有描述與備註），請直白摘要，例如：「來自 Threads 的社群分享，內容尚待整理。」
   - 如果有使用者備註，請高度參考備註內容進行摘要。
2. key_points 請輸出 2 到 3 條簡短重點。如果內容太少，可以輸出 1 到 2 條，例如：「使用者收藏此社群連結，尚無詳細貼文正文」。
3. tags 請輸出 3 到 5 個繁體中文標籤，每個標籤都要帶 #。必須包含平台名稱標籤（如 #Threads、#Facebook、#Instagram、#X、#LinkedIn）。
4. use_case 描述用途分類。必須從以下指定的 8 個用途分類中選擇最貼切的一個，不能超出此範圍（大小寫與字元需完全一致）：
   - Prompt
   - 內容靈感
   - 工具收藏
   - 工作流程參考
   - 技術參考
   - 產品研究
   - 商業與市場
   - 待分類
   注意：若內容本身是提供 prompt 指令（提示詞範本）、prompt 教學或 prompt 心得，用途分類 (use_case) 必須固定選擇為：Prompt。
5. topic_category 描述主題分類。必須從以下指定的 10 個主題分類中選擇最貼切的一個，不能超出此範圍（大小寫與字元需完全一致）：
   - Prompt
   - AI 工具
   - 社群行銷
   - 產品設計
   - 前端開發
   - 工作流程
   - 商業策略
   - 內容創作
   - 日常隨筆
   - 其他
   注意：若內容本身是提供 prompt 指令（提示詞範本）、prompt 教學或 prompt 心得，主題分類 (topic_category) 必須固定選擇為：Prompt。
6. 只回傳 JSON，不要加任何解釋或 Markdown。

格式：
{
  "summary": "一句話摘要",
  "key_points": ["重點1", "重點2"],
  "tags": ["#標籤1", "#標籤2", "#標籤3"],
  "use_case": "用途分類",
  "topic_category": "主題分類"
}
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const text = response.text ?? "";
    console.log("[Gemini] 社群 URL 整理原始回應:", text.substring(0, 300));

    const jsonText = extractJsonObject(text);
    if (!jsonText) {
      throw new Error("無法從回應中找到 JSON");
    }

    const parsed = JSON.parse(jsonText);
    const keyPoints = Array.isArray(parsed.key_points)
      ? parsed.key_points.map((item: string) => String(item).trim()).filter(Boolean).slice(0, 3)
      : [];
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.map((item: string) => String(item).trim()).filter(Boolean).slice(0, 5)
      : [];

    const defaultTags = [`#${platform.charAt(0).toUpperCase() + platform.slice(1)}`, "#社群分享", "#待整理"];

    return {
      summary: truncateSingleLine(parsed.summary || (isFallbackTitle ? `來自 ${platform} 的分享` : title), 90),
      key_points: keyPoints.length > 0 ? keyPoints : [isFallbackTitle ? "無可用貼文內容，僅保留連結" : "已收藏社群貼文"],
      tags: tags.length >= 3 ? tags : defaultTags,
      use_case: truncateSingleLine(parsed.use_case || "內容靈感", 30),
      topic_category: truncateSingleLine(parsed.topic_category || "未分類", 30),
    };
  } catch (error) {
    console.error("[Gemini] 社群 URL 整理失敗:", error);

    const fallbackSummary = surroundingText 
      ? `[備註] ${truncateSingleLine(surroundingText, 70)}`
      : (isFallbackTitle ? `來自 ${platform} 的分享` : truncateSingleLine(title, 90));

    return {
      summary: fallbackSummary,
      key_points: surroundingText ? [surroundingText] : ["無可用貼文內容，僅保留連結"],
      tags: [`#${platform.charAt(0).toUpperCase() + platform.slice(1)}`, "#社群分享", "#待整理"],
      use_case: "內容靈感",
      topic_category: "未分類",
    };
  }
}

export interface OrganizedGeneralInspiration {
  summary: string;
  key_points: string[];
  tags: string[];
  use_case: string;
  topic_category: string;
}

/**
 * 將一般網頁 URL 內容整理為新版收藏欄位
 */
export async function organizeGeneralInspiration(
  title: string,
  description: string,
  content: string,
  url: string,
  surroundingText: string = ""
): Promise<OrganizedGeneralInspiration> {
  const isFallbackTitle = title.startsWith("來自 ") || title === "無法提取標題";

  let context = `來源網址：${url}\n標題：${title}\n`;
  if (description) {
    context += `描述 (Description)：${description}\n`;
  }
  if (content) {
    context += `正文片段 (Content)：${content}\n`;
  }
  if (surroundingText) {
    context += `使用者備註/附加文字：${surroundingText}\n`;
  }

  try {
    const prompt = `
你是一個靈感與知識的整理編輯。請將使用者收藏的網頁連結資訊與正文片段，整理成可寫入資料庫的 JSON。

網頁連結資訊：
${context}

規則：
1. summary 必須是一句繁體中文摘要，幫助首頁第一眼快速理解。
   - 如果這是一則抓不到內容的降級網址（如標題是 "來自 xxx.com 的分享" 且沒有描述與正文），請直白摘要，例如：「來自 xxx.com 的網頁分享，內容尚待整理。」
   - 如果有使用者備註，請高度參考備註內容進行摘要。
2. key_points 請輸出 2 到 3 條簡短重點。如果內容太少，可以輸出 1 到 2 條。
3. tags 請輸出 3 到 5 個繁體中文標籤，每個標籤都要帶 #。
4. use_case 描述用途分類。必須從以下指定的 8 個用途分類中選擇最貼切的一個，不能超出此範圍（大小寫與字元需完全一致）：
   - Prompt
   - 內容靈感
   - 工具收藏
   - 工作流程參考
   - 技術參考
   - 產品研究
   - 商業與市場
   - 待分類
   注意：若內容本身是提供 prompt 指令（提示詞範本）、prompt 教學或 prompt 心得，用途分類 (use_case) 必須固定選擇為：Prompt。
5. topic_category 描述主題分類。必須從以下指定的 10 個主題分類中選擇最貼切的一個，不能超出此範圍（大小寫與字元需完全一致）：
   - Prompt
   - AI 工具
   - 社群行銷
   - 產品設計
   - 前端開發
   - 工作流程
   - 商業策略
   - 內容創作
   - 日常隨筆
   - 其他
   注意：若內容本身是提供 prompt 指令（提示詞範本）、prompt 教學或 prompt 心得，主題分類 (topic_category) 必須固定選擇為：Prompt。
6. 只回傳 JSON，不要加 any額外的解釋或 Markdown。

格式：
{
  "summary": "一句話摘要",
  "key_points": ["重點1", "重點2"],
  "tags": ["#標籤1", "#標籤2", "#標籤3"],
  "use_case": "用途分類",
  "topic_category": "主題分類"
}
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const text = response.text ?? "";
    console.log("[Gemini] 一般 URL 整理原始回應:", text.substring(0, 300));

    const jsonText = extractJsonObject(text);
    if (!jsonText) {
      throw new Error("無法從回應中找到 JSON");
    }

    const parsed = JSON.parse(jsonText);
    const keyPoints = Array.isArray(parsed.key_points)
      ? parsed.key_points.map((item: string) => String(item).trim()).filter(Boolean).slice(0, 3)
      : [];
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.map((item: string) => String(item).trim()).filter(Boolean).slice(0, 5)
      : [];

    let domain = "Web";
    try {
      domain = new URL(url).hostname.replace("www.", "");
    } catch {
      // ignore
    }
    const defaultTags = [`#${domain}`, "#網頁收藏", "#待整理"];

    return {
      summary: truncateSingleLine(parsed.summary || (isFallbackTitle ? `來自 ${domain} 的分享` : title), 90),
      key_points: keyPoints.length > 0 ? keyPoints : [isFallbackTitle ? "無可用網頁內容，僅保留連結" : "已收藏網頁內容"],
      tags: tags.length >= 3 ? tags : defaultTags,
      use_case: truncateSingleLine(parsed.use_case || "內容靈感", 30),
      topic_category: truncateSingleLine(parsed.topic_category || "未分類", 30),
    };
  } catch (error) {
    console.error("[Gemini] 一般 URL 整理失敗:", error);

    let domain = "Web";
    try {
      domain = new URL(url).hostname.replace("www.", "");
    } catch {
      // ignore
    }

    const fallbackSummary = surroundingText
      ? `[備註] ${truncateSingleLine(surroundingText, 70)}`
      : (isFallbackTitle ? `來自 ${domain} 的分享` : truncateSingleLine(title, 90));

    return {
      summary: fallbackSummary,
      key_points: surroundingText ? [surroundingText] : ["無可用網頁內容，僅保留連結"],
      tags: [`#${domain}`, "#網頁收藏", "#待整理"],
      use_case: "內容靈感",
      topic_category: "未分類",
    };
  }
}

