/**
 * 網頁標題提取工具 (KeepEvery)
 * 策略分層：oEmbed API → HTML og:title 解析 → 網域降級
 */

// ============================================================
// 第一層：oEmbed API (YouTube 專用，免費精準)
// ============================================================

const OEMBED_PROVIDERS: Record<string, (url: string) => string> = {
  "youtube.com": (url) =>
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
  "youtu.be": (url) =>
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
  "threads.net": (url) =>
    `https://www.threads.net/oembed/?url=${encodeURIComponent(url)}&format=json`,
  "threads.com": (url) =>
    `https://www.threads.net/oembed/?url=${encodeURIComponent(url)}&format=json`,
};

async function tryOEmbed(url: string): Promise<string | null> {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    const providerFn = Object.entries(OEMBED_PROVIDERS).find(([domain]) =>
      hostname.includes(domain)
    );

    if (!providerFn) return null;

    const oembedUrl = providerFn[1](url);
    console.log(`[Extractor] oEmbed 請求: ${oembedUrl}`);

    const response = await fetch(oembedUrl, {
      next: { revalidate: 3600 }, // oEmbed 結果可快取 1 小時
    });

    if (!response.ok) {
      console.log(`[Extractor] oEmbed 失敗: ${response.status}`);
      return null;
    }

    const data = await response.json() as { title?: string };
    if (data.title) {
      console.log(`[Extractor] oEmbed 成功: ${data.title}`);
      return data.title;
    }

    return null;
  } catch (error) {
    console.error("[Extractor] oEmbed 錯誤:", error);
    return null;
  }
}

// ============================================================
// 網域常數與共用變數
// ============================================================

const SOCIAL_DOMAINS = [
  "facebook.com",
  "instagram.com",
  "threads.net",
  "threads.com",
  "x.com",
  "twitter.com",
];

// ============================================================
// 第二層：社群 API 解析 (社群平台專用，使用 Microlink)
// ============================================================

async function trySocialApi(url: string): Promise<string | null> {
  try {
    const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
    console.log(`[Extractor] Microlink 請求: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.log(`[Extractor] Microlink 失敗: ${response.status}`);
      return null;
    }

    const json = await response.json();
    if (json.status === "success" && json.data?.title) {
      console.log(`[Extractor] Microlink 成功: ${json.data.title}`);
      return decodeHtmlEntities(json.data.title);
    }

    return null;
  } catch (error) {
    console.error("[Extractor] Microlink 錯誤:", error);
    return null;
  }
}

// ============================================================
// 第三層：HTML 解析 (一般網站用)
// ============================================================

async function tryHtmlParse(url: string): Promise<string | null> {
  try {

    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      Range: "bytes=0-65535",
    };

    const response = await fetch(url, {
      headers,
      next: { revalidate: 600 },
      redirect: "follow",
    });

    // 若 Range 被拒，嘗試完整請求
    if (!response.ok && response.status !== 206) {
      delete headers["Range"];
      const retryResponse = await fetch(url, {
        headers,
        next: { revalidate: 600 },
      });
      if (!retryResponse.ok) return null;
      return parseTitle(await retryResponse.text());
    }

    return parseTitle(await response.text());
  } catch (error) {
    console.error("[Extractor] HTML 解析錯誤:", error);
    return null;
  }
}

/**
 * 從 HTML 中解析標題，優先順序：JSON-LD > og:title > title
 */
function parseTitle(html: string): string | null {
  // 1. JSON-LD
  const jsonLdMatch = html.match(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  );
  if (jsonLdMatch?.[1]) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      const title =
        data.headline ||
        data.name ||
        (data["@graph"] && data["@graph"][0]?.name);
      if (title && typeof title === "string" && title.length > 3) {
        return decodeHtmlEntities(title.trim());
      }
    } catch {
      // JSON 解析失敗，繼續
    }
  }

  // 2. og:title (支援各種引號與屬性順序)
  const ogMatch =
    html.match(/<meta[^>]*property=["']?og:title["']?[^>]*content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']?og:title["']?/i);
  if (ogMatch?.[1] && ogMatch[1].trim().length > 2) {
    return decodeHtmlEntities(ogMatch[1].trim());
  }

  // 3. twitter:title (常見備用 meta)
  const twitterMatch =
    html.match(/<meta[^>]*name=["']?twitter:title["']?[^>]*content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']?twitter:title["']?/i);
  if (twitterMatch?.[1] && twitterMatch[1].trim().length > 2) {
    return decodeHtmlEntities(twitterMatch[1].trim());
  }

  // 4. <title>
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch?.[1]) {
    const raw = titleMatch[1].trim();
    // 過濾無意義的頁面標題
    const blacklist = ["Facebook", "YouTube", "Instagram", "Log In", "Login"];
    if (raw.length > 2 && !blacklist.some((b) => raw === b || raw.includes(b))) {
      return decodeHtmlEntities(raw);
    }
  }

  return null;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ");
}

// ============================================================
// 第三層：網域降級 (兜底)
// ============================================================

function fallbackTitle(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    const nameMap: Record<string, string> = {
      "facebook.com": "Facebook",
      "instagram.com": "Instagram",
      "threads.net": "Threads",
      "threads.com": "Threads",
      "x.com": "X (Twitter)",
      "twitter.com": "X (Twitter)",
    };
    const name = Object.entries(nameMap).find(([d]) =>
      hostname.includes(d)
    )?.[1];
    return name ? `來自 ${name} 的分享` : `來自 ${hostname} 的分享`;
  } catch {
    return "無法提取標題";
  }
}

// ============================================================
// 主入口
// ============================================================

export async function extractTitle(url: string): Promise<string> {
  console.log(`[Extractor] 開始提取: ${url}`);

  // 第一層：oEmbed (YouTube 等有官方 API 的平台)
  const oembedTitle = await tryOEmbed(url);
  if (oembedTitle) return oembedTitle;

  const hostname = new URL(url).hostname;
  const isSocial = SOCIAL_DOMAINS.some((d) => hostname.includes(d));

  if (isSocial) {
    // 第二層：社群網站 (走 Microlink API)
    console.log(`[Extractor] 偵測到社群網域 ${hostname}，使用 Microlink API 解析`);
    const socialTitle = await trySocialApi(url);
    if (socialTitle) return socialTitle;
    // Microlink 失敗時，也嘗試 HTML 解析 (X/Threads 有時可直接爬取)
    console.log(`[Extractor] Microlink 失敗，嘗試 HTML 解析作為備援`);
    const htmlFallback = await tryHtmlParse(url);
    if (htmlFallback) return htmlFallback;
  } else {
    // 第三層：HTML 解析 (一般網站)
    const htmlTitle = await tryHtmlParse(url);
    if (htmlTitle) return htmlTitle;
  }

  // 第四層：網域降級 (社群或完全無法抓取時兜底)
  console.log(`[Extractor] API 輔助抓取失敗，使用網域降級`);
  return fallbackTitle(url);
}
