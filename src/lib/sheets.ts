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

    const rawData = await response.json() as any[];
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
        ...item,
        tags: typeof item.tags === "string" ? item.tags.split(",").map((t: string) => t.trim()) : item.tags,
        color: colors[index % colors.length],
        size: sizes[index % sizes.length]
      }));

  } catch (error: any) {
    console.error("[Sheets] 發生異常錯誤:", error.message || error);
    return [];
  }
}

/**
 * 將內容發送到 Google Apps Script WebApp
 */
export async function appendToSheet(data: {
  time: string;
  title: string;
  tags: string[];
  source: string;
}) {
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
        token: process.env.GOOGLE_GAS_SECRET, // 加入安全驗證
        time: data.time,
        title: data.title,
        tags: data.tags.join(", "),
        source: data.source,
      }),
    });

    if (!response.ok) {
      throw new Error(`GAS WebApp 請求失敗: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Google Apps Script append error:", error);
    throw error;
  }
}
