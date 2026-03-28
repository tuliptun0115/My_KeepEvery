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
