/* eslint-disable @typescript-eslint/no-require-imports */
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

// 解析環境變數 (手動讀取 .env.local)
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

const VALID_CATEGORIES = new Set([
  "Prompt",
  "AI 工具",
  "社群行銷",
  "產品設計",
  "前端開發",
  "工作流程",
  "商業策略",
  "內容創作",
  "日常隨筆",
  "其他"
]);

const VALID_CATEGORIES_ARRAY = Array.from(VALID_CATEGORIES);

const VALID_USE_CASES = new Set([
  "Prompt",
  "內容靈感",
  "工具收藏",
  "工作流程參考",
  "技術參考",
  "產品研究",
  "商業與市場",
  "待分類"
]);

const VALID_USE_CASES_ARRAY = Array.from(VALID_USE_CASES);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 輔助函式：解析重點或標籤為字串陣列
function parseFieldToArray(field, delimiter) {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  return String(field).split(delimiter).map(s => s.trim()).filter(Boolean);
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  if (isDryRun) {
    console.log("=== DRY RUN 模式 (僅顯示對比，不修改 Google Sheets) ===");
  } else {
    console.log("=== 正式同步模式 (清洗後將覆寫回 Google Sheets) ===");
  }

  // 1. 撈取 library_v2 所有的歷史資料
  console.log("[1/4] 開始從 Google Sheets 撈取 library_v2 歷史資料...");
  const fetchUrl = `${webAppUrl}?secret=${secret}&sheet_name=library_v2`;
  
  let records = [];
  try {
    const res = await fetch(fetchUrl);
    if (!res.ok) {
      throw new Error(`GAS 回應失敗: ${res.status}`);
    }
    records = await res.json();
    console.log(`[成功] 撈取到 ${records.length} 筆歷史收藏資料`);
  } catch (err) {
    console.error("無法從 Google Sheets 撈取資料，錯誤:", err.message);
    process.exit(1);
  }

  if (records.length === 0) {
    console.log("資料庫中無資料，無需清洗。");
    process.exit(0);
  }

  // 2. 開始清洗與重分類
  console.log("\n[2/4] 開始逐筆檢查與重分類...");
  const cleanedRecords = [];
  let promptCount = 0;
  let aiCount = 0;
  let keptCount = 0;

  for (let i = 0; i < records.length; i++) {
    const item = records[i];
    const keyPointsArray = parseFieldToArray(item.key_points, " || ");
    const tagsArray = parseFieldToArray(item.tags, ",");

    let newTopic = item.topic_category || "";
    let newUseCase = item.use_case || "";
    let needGeminiTopic = false;
    let needGeminiUseCase = false;
    let reason = "";

    // A. 偵測 Prompt 關鍵特徵
    const contentToCheck = [
      item.source_title,
      item.summary,
      item.raw_input,
      ...tagsArray,
      ...keyPointsArray
    ].join(" ").toLowerCase();

    const isPromptRelated = 
      contentToCheck.includes("prompt") ||
      contentToCheck.includes("提示詞") ||
      contentToCheck.includes("提示工程") ||
      contentToCheck.includes("指令") ||
      contentToCheck.includes("system prompt");

    if (isPromptRelated) {
      newTopic = "Prompt";
      newUseCase = "Prompt";
      reason = "Prompt特徵自動歸類";
      promptCount++;
    } else {
      // 判斷是否需要重新分類主題
      if (!VALID_CATEGORIES.has(item.topic_category)) {
        needGeminiTopic = true;
      }
      // 判斷是否需要重新分類用途
      if (!VALID_USE_CASES.has(item.use_case)) {
        needGeminiUseCase = true;
      }

      if (!needGeminiTopic && !needGeminiUseCase) {
        keptCount++;
        reason = "保留合法分類";
      } else {
        aiCount++;
        reason = `AI 重分類[${needGeminiTopic ? '主題' : ''}${needGeminiTopic && needGeminiUseCase ? '+' : ''}${needGeminiUseCase ? '用途' : ''}]`;
      }
    }

    if (needGeminiTopic || needGeminiUseCase) {
      try {
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: `你是一個內容主題與用途分類專家。請根據以下這筆收藏內容，重新評估其主題分類 (topic_category) 與用途分類 (use_case)。
你必須從指定的類別中選擇最貼切的一個（大小寫與字元需完全一致）。

指定的 10 大主題分類 (topic_category)：
${VALID_CATEGORIES_ARRAY.map(c => `- ${c}`).join("\n")}

指定的 8 大用途分類 (use_case)：
${VALID_USE_CASES_ARRAY.map(c => `- ${c}`).join("\n")}

內容標題：${item.source_title || ""}
一句話摘要：${item.summary || ""}
關鍵重點：${keyPointsArray.join(" || ")}
標籤：${tagsArray.join(", ")}
目前的主題分類：${item.topic_category || ""}
目前的用途分類：${item.use_case || ""}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                topic_category: { 
                  type: "STRING", 
                  enum: VALID_CATEGORIES_ARRAY 
                },
                use_case: {
                  type: "STRING",
                  enum: VALID_USE_CASES_ARRAY
                }
              },
              required: ["topic_category", "use_case"]
            }
          }
        });

        const resText = response.text || "{}";
        const parsed = JSON.parse(resText);
        
        if (needGeminiTopic) {
          if (parsed.topic_category && VALID_CATEGORIES.has(parsed.topic_category)) {
            newTopic = parsed.topic_category;
          } else {
            newTopic = "其他";
          }
        }
        
        if (needGeminiUseCase) {
          if (parsed.use_case && VALID_USE_CASES.has(parsed.use_case)) {
            newUseCase = parsed.use_case;
          } else {
            newUseCase = "待分類";
          }
        }
      } catch (err) {
        console.error(`  -> [AI 失敗] "${item.source_title.substring(0, 15)}" 使用 fallback. 錯誤: ${err.message}`);
        if (needGeminiTopic) newTopic = "其他";
        if (needGeminiUseCase) newUseCase = "待分類";
      }
      
      // 控制頻率限制 1.5 秒
      await sleep(1500);
    }

    console.log(`[筆數 ${String(i+1).padStart(2, '0')}] ID: ${item.id.substring(0, 15)}... | 主題: [${item.topic_category}]->[${newTopic}] | 用途: [${item.use_case}]->[${newUseCase}] (${reason})`);

    cleanedRecords.push({
      ...item,
      use_case: newUseCase,
      topic_category: newTopic,
      key_points: keyPointsArray,
      tags: tagsArray
    });
  }

  console.log(`\n[清洗結果] 總計 ${records.length} 筆 | 自動 Prompt 歸類: ${promptCount} 筆 | AI 重分類: ${aiCount} 筆 | 直接保留: ${keptCount} 筆`);

  // 3. 準備回寫資料
  console.log("\n[3/4] 準備將資料轉換為二維陣列...");
  const rowsArray = cleanedRecords.map((r) => {
    return [
      r.id || "",
      r.input_type || "",
      r.raw_input || "",
      r.source_title || "",
      r.source_url || "",
      r.created_at || "",
      r.source_platform || "",
      r.content_type || "",
      r.summary || "",
      r.key_points.join(" || "),
      r.tags.join(", "),
      r.use_case || "",
      r.topic_category || "",
      r.confidence_level || "",
      r.parse_status || ""
    ];
  });

  // 4. 發送覆寫請求
  if (isDryRun) {
    console.log("\n[4/4] [DRY RUN] 未發送回寫請求。洗滌完成！");
  } else {
    console.log("\n[4/4] 開始將洗滌後的資料覆寫回 Google Sheets...");
    try {
      const response = await fetch(webAppUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: secret,
          sheet_name: "library_v2",
          action: "overwrite_sheet",
          rows: rowsArray
        }),
      });

      if (!response.ok) {
        throw new Error(`GAS 覆寫 API 回應錯誤: ${response.status}`);
      }

      const result = await response.json();
      console.log(`[成功] Google Sheets 全量覆寫完成！寫入 ${result.count} 筆清洗後的資料。`);
    } catch (err) {
      console.error("[失敗] 無法寫入 Google Sheets，錯誤:", err.message);
      process.exit(1);
    }
  }
}

main();
