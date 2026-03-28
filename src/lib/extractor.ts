/**
 *輕量化網頁標題提取工具 (KeepEvery Efficiency Strategy)
 * 使用 Header-Only Fetch 或 Range Request 僅讀取前 2KB 資料
 */
export async function extractTitle(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'Range': 'bytes=0-2048', // 僅請求前 2KB
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 600 } // 10 分鐘快取 (Requirement)
    });

    if (!response.ok && response.status !== 206) {
      throw new Error(`無法存取 URL: ${response.status}`);
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }

    return "無標題網頁";
  } catch (error) {
    console.error("Title extraction error:", error);
    return "無法提取標題";
  }
}
