/**
 * 將內容發送到 Google Apps Script WebApp
 */
export interface Inspiration {
  id: string | number;
  time: string;
  title: string;
  tags: string[];
  source: string;
  color?: string;
  size?: string;
}

export interface LibraryRecordV2 {
  id: string;
  input_type: string;
  raw_input: string;
  source_title: string;
  source_url: string;
  created_at: string;
  source_platform: string;
  content_type: string;
  summary: string;
  key_points: string[];
  tags: string[];
  use_case: string;
  topic_category: string;
  confidence_level: string;
  parse_status: string;
}

interface RawSheetItem {
  time?: string;
  title?: string;
  tags?: string | string[];
  source?: string;
}

/**
 * 從 Google Sheets 抓取靈魂收藏 (Inspirations)
 */
export async function fetchFromSheet(): Promise<Inspiration[]> {
  try {
    const webAppUrl = process.env.GOOGLE_GAS_URL;
    const secret = process.env.GOOGLE_GAS_SECRET;

    if (!webAppUrl) {
      console.error("[Sheets] 錯誤: 未配置 GOOGLE_GAS_URL");
      return [];
    }

    // 遮蔽 URL 關鍵資訊用於 Log
    const maskedUrl = webAppUrl.substring(0, 25) + "..." + webAppUrl.substring(webAppUrl.length - 10);
    console.log(`[Sheets] 開始抓取資料... URL: ${maskedUrl}`);

    const response = await fetch(`${webAppUrl}?secret=${secret}`, {
      next: { revalidate: 60 },
    });

    console.log(`[Sheets] GAS 回應狀態: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const text = await response.text();
      console.error(`[Sheets] GAS 讀取失敗 (${response.status}): ${text.substring(0, 100)}`);
      return [];
    }

    const rawData = await response.json() as RawSheetItem[];
    console.log(`[Sheets] 成功抓取 ${rawData.length} 筆原始資料`);
    
    // 資料轉換：分配顏色與尺寸
    const colors = ["bg-white", "bg-keep-pink/20", "bg-keep-mint/20", "bg-keep-yellow/20"];
    const sizes = [
      "col-span-2 row-span-2", 
      "col-span-1 row-span-1", 
      "col-span-1 row-span-2", 
      "col-span-2 row-span-1"
    ];

    return rawData
      .reverse()
      .map((item, index) => ({
        id: `insp-${index}`,
        time: item.time || "",
        title: item.title || "",
        source: item.source || "",
        tags:
          typeof item.tags === "string"
            ? item.tags.split(",").map((t: string) => t.trim())
            : Array.isArray(item.tags)
              ? item.tags
              : [],
        color: colors[index % colors.length],
        size: sizes[index % sizes.length]
      }));

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Sheets] 發生異常錯誤:", message);
    return [];
  }
}


/**
 * 從 Google Sheets 抓取新版 library_v2 收藏資料
 */
export async function fetchFromLibraryV2(): Promise<LibraryRecordV2[]> {
  try {
    const webAppUrl = process.env.GOOGLE_GAS_URL;
    const secret = process.env.GOOGLE_GAS_SECRET;

    if (!webAppUrl) {
      console.error("[Sheets] 錯誤: 未配置 GOOGLE_GAS_URL");
      return [];
    }

    const maskedUrl = webAppUrl.substring(0, 25) + "..." + webAppUrl.substring(webAppUrl.length - 10);
    console.log(`[Sheets] 開始抓取 library_v2 資料... URL: ${maskedUrl}`);

    const response = await fetch(`${webAppUrl}?secret=${secret}&sheet_name=library_v2`, {
      next: { revalidate: 60 },
    });

    console.log(`[Sheets] GAS library_v2 回應狀態: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const text = await response.text();
      console.error(`[Sheets] GAS library_v2 讀取失敗 (${response.status}): ${text.substring(0, 100)}`);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawData = await response.json() as any[];
    console.log(`[Sheets] 成功抓取 ${rawData.length} 筆 library_v2 原始資料`);

    return rawData
      .reverse() // 讓最新收藏排在前面
      .map((item) => ({
        id: String(item.id || ""),
        input_type: item.input_type || "",
        raw_input: item.raw_input || "",
        source_title: item.source_title || "",
        source_url: item.source_url || "",
        created_at: item.created_at || "",
        source_platform: item.source_platform || "",
        content_type: item.content_type || "",
        summary: item.summary || "",
        key_points: typeof item.key_points === "string" && item.key_points
          ? item.key_points.split(" || ").map((p: string) => p.trim())
          : Array.isArray(item.key_points)
            ? item.key_points
            : [],
        tags: typeof item.tags === "string" && item.tags
          ? item.tags.split(",").map((t: string) => t.trim())
          : Array.isArray(item.tags)
            ? item.tags
            : [],
        use_case: item.use_case || "",
        topic_category: item.topic_category || "",
        confidence_level: item.confidence_level || "",
        parse_status: item.parse_status || "",
      }));

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Sheets] 發生異常錯誤:", message);
    return [];
  }
}


/**
 * 將新版 library_v2 收藏資料發送到 Google Apps Script WebApp
 */
export async function appendToLibraryV2(data: LibraryRecordV2) {
  try {
    const webAppUrl = process.env.GOOGLE_GAS_URL;

    if (!webAppUrl) {
      throw new Error("未配置 GOOGLE_GAS_URL");
    }

    const response = await fetch(webAppUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: process.env.GOOGLE_GAS_SECRET,
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
      throw new Error(`GAS WebApp 請求失敗: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Google Apps Script library_v2 append error:", error);
    throw error;
  }
}

/**
 * 更新新版 library_v2 收藏資料
 */
export async function updateLibraryV2Record(data: LibraryRecordV2) {
  try {
    const webAppUrl = process.env.GOOGLE_GAS_URL;

    if (!webAppUrl) {
      throw new Error("未配置 GOOGLE_GAS_URL");
    }

    const response = await fetch(webAppUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: process.env.GOOGLE_GAS_SECRET,
        sheet_name: "library_v2",
        action: "update_row",
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
      throw new Error(`GAS WebApp 請求失敗: ${response.status}`);
    }

    const result = await response.json();
    if (result.result !== "success") {
      throw new Error(result.message || "更新失敗");
    }

    return { success: true };
  } catch (error) {
    console.error("Google Apps Script library_v2 update error:", error);
    throw error;
  }
}

