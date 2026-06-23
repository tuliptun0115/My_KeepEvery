/* eslint-disable @typescript-eslint/no-require-imports */
const { GoogleGenAI } = require("@google/genai");

// 解析環境變數 (為防止 Node 版本不支援 --env-file，手動讀取 .env.local)
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      // 移除引號
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value.trim();
    }
  });
}

const webAppUrl = process.env.GOOGLE_GAS_URL;
const secret = process.env.GOOGLE_GAS_SECRET;
const apiKey = process.env.GEMINI_API_KEY;

if (!webAppUrl || !secret || !apiKey) {
  console.error("錯誤: 請確保 .env.local 存在且包含 GOOGLE_GAS_URL, GOOGLE_GAS_SECRET 與 GEMINI_API_KEY");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const MODEL_NAME = "gemini-2.5-flash";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isUrl(str) {
  if (!str) return false;
  try {
    new URL(str);
    return str.startsWith("http://") || str.startsWith("https://");
  } catch (_) {
    return false;
  }
}

function isSocialUrl(urlStr) {
  const socialDomains = ["threads.net", "facebook.com", "instagram.com", "twitter.com", "x.com", "linkedin.com"];
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    return socialDomains.some(domain => host.includes(domain));
  } catch (_) {
    return false;
  }
}

function getDomain(urlStr) {
  try {
    return new URL(urlStr).hostname.replace("www.", "");
  } catch (_) {
    return "Web";
  }
}

function extractJsonObject(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : null;
}

// 根據時間戳記或標題產生唯一 ID
function generateId(item) {
  const cleanTitle = (item.title || "").substring(0, 10).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "");
  const cleanTime = (item.time || "").replace(/[^0-9]/g, "");
  return `insp-${cleanTime}-${cleanTitle || "migrated"}`;
}

async function organizeLegacyItem(item, inputType, retries = 3, retryDelay = 25000) {
  const prompt = `
你是一個靈感與知識的整理編輯。請將使用者舊版收藏的資料，整理並升級成新版「靈感收藏庫」的規格。

舊版收藏資料：
- 類型：${inputType}
- 標題/內容：${item.title}
- 原始標籤：${item.tags}
- 來源：${item.source}

請輸出 JSON 格式，包含以下欄位：
1. summary: 一句繁體中文摘要，總結此項收藏，長度不超過 90 字。
2. key_points: 輸出 2 到 3 個重點句子的陣列（例如：["重點 1", "重點 2"]）。
3. tags: 3 到 5 個繁體中文標籤，每個標籤都要帶 #，必須包含主題或關鍵技術。如果是 URL，且知道網域名稱，請加入該網域標籤（例如 #React、#Threads）。
4. use_case: 這則內容之後可以怎麼用，例如：內容靈感、技術參考、工具收藏、寫作素材、產業研究。
5. topic_category: 主題類別，例如：AI 工具、產品設計、前端開發、市場行銷、未分類。

僅回傳符合格式的 JSON，不要包含 Markdown 標籤或任何說明文字。

格式：
{
  "summary": "一句話摘要",
  "key_points": ["重點1", "重點2"],
  "tags": ["#標籤1", "#標籤2", "#標籤3"],
  "use_case": "用途分類",
  "topic_category": "主題分類"
}
`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });

      const text = response.text ?? "";
      const jsonText = extractJsonObject(text);
      if (!jsonText) {
        throw new Error("無法從回應中找到 JSON");
      }

      const parsed = JSON.parse(jsonText);
      return {
        summary: parsed.summary || item.title.substring(0, 90),
        key_points: Array.isArray(parsed.key_points) ? parsed.key_points : [item.title.substring(0, 40)],
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        use_case: parsed.use_case || "內容靈感",
        topic_category: parsed.topic_category || "未分類"
      };
    } catch (error) {
      const errMsg = error.message || String(error);
      const isRateLimit = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota");
      
      if (isRateLimit && attempt < retries) {
        console.warn(`[Gemini] 遇到頻率限制，等待 ${retryDelay/1000} 秒後重試 (${attempt}/${retries})...`);
        await sleep(retryDelay);
        continue;
      }
      
      console.error(`[Gemini] 整理失敗 (時間: ${item.time}):`, errMsg);
      break;
    }
  }

  return null;
}

async function fetchLegacyRecords() {
  console.log("[Migration] 開始從舊試算表抓取資料...");
  const response = await fetch(`${webAppUrl}?secret=${secret}`);
  if (!response.ok) {
    throw new Error(`無法讀取舊資料: ${response.statusText}`);
  }
  return await response.json();
}

async function fetchV2Records() {
  console.log("[Migration] 開始從 library_v2 抓取資料以做重複比對...");
  const response = await fetch(`${webAppUrl}?secret=${secret}&sheet_name=library_v2`);
  if (!response.ok) {
    throw new Error(`無法讀取 library_v2 資料: ${response.statusText}`);
  }
  return await response.json();
}

async function appendToLibraryV2(data) {
  try {
    const response = await fetch(webAppUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: secret,
        sheet_name: "library_v2",
        id: data.id,
        input_type: data.input_type,
        raw_input: data.raw_input,
        source_title: data.source_title,
        source_url: data.source_url,
        created_at: data.created_at,
        source_platform: data.source_platform,
        content_type: data.content_type,
        summary: data.summary,
        key_points: data.key_points.join(" || "),
        tags: data.tags.join(", "),
        use_case: data.use_case,
        topic_category: data.topic_category,
        confidence_level: data.confidence_level,
        parse_status: data.parse_status,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { result: "error", message: `HTTP ${response.status}: ${text.substring(0, 100)}` };
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await response.json();
    } else {
      const text = await response.text();
      return { result: "error", message: `非 JSON 回應: ${text.substring(0, 100)}` };
    }
  } catch (error) {
    return { result: "error", message: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  if (dryRun) {
    console.log("=== DRY RUN 模式 ===");
  }

  try {
    const legacyItems = await fetchLegacyRecords();
    console.log(`[Migration] 成功撈出 ${legacyItems.length} 筆舊資料`);

    if (legacyItems.length === 0) {
      console.log("[Migration] 沒有舊資料需要遷移。");
      return;
    }

    let existingIds = new Set();
    try {
      const v2Items = await fetchV2Records();
      v2Items.forEach(item => {
        if (item.id) existingIds.add(item.id);
      });
      console.log(`[Migration] library_v2 已有 ${existingIds.size} 筆資料`);
    } catch (e) {
      console.log("[Migration] 無法獲取 library_v2 已存在項目 (可能工作表尚未建立)，將假定沒有重複。");
    }

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < legacyItems.length; i++) {
      const item = legacyItems[i];
      const targetId = generateId(item);

      if (existingIds.has(targetId)) {
        console.log(`[${i+1}/${legacyItems.length}] 跳過已遷移項目: ${item.title.substring(0, 20)}...`);
        skipCount++;
        continue;
      }

      console.log(`\n[${i+1}/${legacyItems.length}] 正在處理: ${item.title.substring(0, 30)}...`);

      // 判斷 input_type
      let inputType = "text";
      let sourceUrl = "";
      let sourcePlatform = "LINE 文字";
      let contentType = "note";

      if (isUrl(item.source)) {
        sourceUrl = item.source;
        if (isSocialUrl(item.source)) {
          inputType = "social_url";
          contentType = "social_post";
          // 簡單判斷平台
          const domain = getDomain(item.source);
          if (domain.includes("threads")) sourcePlatform = "Threads";
          else if (domain.includes("facebook")) sourcePlatform = "Facebook";
          else if (domain.includes("instagram")) sourcePlatform = "Instagram";
          else if (domain.includes("twitter") || domain.includes("x.com")) sourcePlatform = "X";
          else if (domain.includes("linkedin")) sourcePlatform = "LinkedIn";
          else sourcePlatform = "社群網站";
        } else {
          inputType = "url";
          contentType = "web_page";
          sourcePlatform = getDomain(item.source);
        }
      }

      // 呼叫 Gemini 做摘要整理
      console.log(` -> 呼叫 Gemini AI 整理中...`);
      const organized = await organizeLegacyItem(item, inputType);

      if (!organized) {
        console.error(" -> [Error] Gemini AI 整理失敗（可能已達 API Quota 限制或連線異常），停止遷移以防止寫入低品質資料！");
        process.exit(1);
      }

      const v2Record = {
        id: targetId,
        input_type: inputType,
        raw_input: inputType === "text" ? item.title : item.source,
        source_title: inputType === "text" ? item.title.substring(0, 30) : item.title,
        source_url: sourceUrl,
        created_at: item.time || new Date().toISOString(),
        source_platform: sourcePlatform,
        content_type: contentType,
        summary: organized.summary,
        key_points: organized.key_points,
        tags: organized.tags,
        use_case: organized.use_case,
        topic_category: organized.topic_category,
        confidence_level: "medium", // 舊資料經 AI 整理設為 medium 信心
        parse_status: "complete"
      };

      if (dryRun) {
        console.log(" -> [DRY RUN] 整理結果:", JSON.stringify(v2Record, null, 2));
      } else {
        console.log(` -> 正在寫入 library_v2...`);
        let res = await appendToLibraryV2(v2Record);
        
        // 若寫入失敗，等待 10 秒後重試一次
        if (res.result !== "success") {
          console.warn(` -> 寫入失敗: ${res.message || "未知原因"}。等待 10 秒後重試...`);
          await sleep(10000);
          res = await appendToLibraryV2(v2Record);
        }

        if (res.result === "success") {
          console.log(` -> 寫入成功！`);
          successCount++;
        } else {
          console.error(` -> 寫入失敗 (放棄此筆):`, res.message);
        }
      }

      // 由於 Gemini Free Tier 的限額是 15 RPM，所以每筆處理之後延遲 4.5 秒以避免超限。
      await sleep(4500);
    }

    console.log(`\n=== 遷移結束 ===`);
    console.log(`總處理: ${legacyItems.length} 筆`);
    console.log(`成功遷移: ${successCount} 筆`);
    console.log(`跳過重複: ${skipCount} 筆`);

  } catch (error) {
    console.error("遷移過程中發生錯誤:", error);
  }
}

main();
