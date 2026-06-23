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


export interface SocialExtractResult {
  title: string;
  description: string;
  platform: string;
  parse_status: "complete" | "partial";
  confidence_level: "high" | "medium" | "low";
}



/**
 * 同時解析 HTML 中的 Title 與 Description
 */
function parseHtmlMetadata(html: string): { title: string | null; description: string | null } {
  let title: string | null = null;
  let description: string | null = null;

  // 1. JSON-LD
  const jsonLdMatch = html.match(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  );
  if (jsonLdMatch?.[1]) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      title =
        data.headline ||
        data.name ||
        (data["@graph"] && data["@graph"][0]?.name);
      
      description = data.description || (data["@graph"] && data["@graph"][0]?.description) || null;
    } catch {
      // 忽略 JSON 錯誤
    }
  }

  // 2. og:title
  if (!title) {
    const ogMatch =
      html.match(/<meta[^>]*property=["']?og:title["']?[^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']?og:title["']?/i);
    if (ogMatch?.[1] && ogMatch[1].trim().length > 2) {
      title = decodeHtmlEntities(ogMatch[1].trim());
    }
  }

  // 3. twitter:title
  if (!title) {
    const twitterMatch =
      html.match(/<meta[^>]*name=["']?twitter:title["']?[^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']?twitter:title["']?/i);
    if (twitterMatch?.[1] && twitterMatch[1].trim().length > 2) {
      title = decodeHtmlEntities(twitterMatch[1].trim());
    }
  }

  // 4. <title>
  if (!title) {
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch?.[1]) {
      const raw = titleMatch[1].trim();
      const blacklist = ["Facebook", "YouTube", "Instagram", "Log In", "Login"];
      if (raw.length > 2 && !blacklist.some((b) => raw === b || raw.includes(b))) {
        title = decodeHtmlEntities(raw);
      }
    }
  }

  // 5. og:description
  const ogDescMatch =
    html.match(/<meta[^>]*property=["']?og:description["']?[^>]*content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']?og:description["']?/i);
  if (ogDescMatch?.[1]) {
    description = decodeHtmlEntities(ogDescMatch[1].trim());
  }

  // 6. twitter:description
  if (!description) {
    const twitterDescMatch =
      html.match(/<meta[^>]*name=["']?twitter:description["']?[^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']?twitter:description["']?/i);
    if (twitterDescMatch?.[1]) {
      description = decodeHtmlEntities(twitterDescMatch[1].trim());
    }
  }

  // 7. description meta
  if (!description) {
    const descMatch =
      html.match(/<meta[^>]*name=["']?description["']?[^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']?description["']?/i);
    if (descMatch?.[1]) {
      description = decodeHtmlEntities(descMatch[1].trim());
    }
  }

  return { title, description };
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
      "linkedin.com": "LinkedIn",
    };
    const name = Object.entries(nameMap).find(([d]) =>
      hostname.includes(d)
    )?.[1];
    return name ? `來自 ${name} 的分享` : `來自 ${hostname} 的分享`;
  } catch {
    return "無法提取標題";
  }
}


/**
 * 專為社群網域設計的內容擷取方法，支援 title/description 解析及防擋降級判定
 */
export async function extractSocialContent(url: string): Promise<SocialExtractResult> {
  console.log(`[Extractor] 開始擷取社群網址內容: ${url}`);
  const hostname = new URL(url).hostname.toLowerCase();

  // 1. 判定平台
  let platform = "unknown";
  if (hostname.includes("threads.net") || hostname.includes("threads.com")) {
    platform = "threads";
  } else if (hostname.includes("facebook.com")) {
    platform = "facebook";
  } else if (hostname.includes("instagram.com")) {
    platform = "instagram";
  } else if (hostname.includes("x.com") || hostname.includes("twitter.com")) {
    platform = "x";
  } else if (hostname.includes("linkedin.com")) {
    platform = "linkedin";
  }

  let title: string | null = null;
  let description: string | null = null;

  // 第一層嘗試：oEmbed (最快且通常不被擋，尤其是 Threads/YouTube)
  title = await tryOEmbed(url);

  // 第二層嘗試：Microlink API
  if (!title || !description) {
    try {
      const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
      console.log(`[Extractor] Microlink 社群內容請求: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const json = await response.json() as { status: string; data?: { title?: string; description?: string } };
        if (json.status === "success" && json.data) {
          if (!title && json.data.title) {
            title = decodeHtmlEntities(json.data.title);
          }
          if (json.data.description) {
            description = decodeHtmlEntities(json.data.description);
          }
          console.log(`[Extractor] Microlink 擷取社群成功. title="${title}", description="${description}"`);
        }
      } else {
        console.log(`[Extractor] Microlink 擷取社群失敗: ${response.status}`);
      }
    } catch (error) {
      console.error("[Extractor] Microlink 社群解析錯誤:", error);
    }
  }

  // 第三層嘗試：HTML 解析備援
  if (!title || !description) {
    try {
      const headers: Record<string, string> = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      };

      const response = await fetch(url, {
        headers,
        next: { revalidate: 600 },
        redirect: "follow",
      });

      if (response.ok) {
        const html = await response.text();
        const meta = parseHtmlMetadata(html);
        if (!title) title = meta.title;
        if (!description) description = meta.description;
        console.log(`[Extractor] HTML 解析社群成功. title="${title}", description="${description}"`);
      }
    } catch (error) {
      console.error("[Extractor] HTML 解析社群錯誤:", error);
    }
  }

  // 判斷是否為無意義/無效的標題 (防阻擋特徵)
  const isInvalidTitle = (t: string | null): boolean => {
    if (!t) return true;
    const lower = t.toLowerCase();
    return (
      lower.includes("log in") ||
      lower.includes("login") ||
      t === "Facebook" ||
      t === "Instagram" ||
      t === "Threads" ||
      t === "Twitter" ||
      t === "X" ||
      t === "無法提取標題"
    );
  };

  let parse_status: "complete" | "partial" = "complete";
  let confidence_level: "high" | "medium" | "low" = "medium";

  if (isInvalidTitle(title)) {
    console.log(`[Extractor] 偵測到社群標題遭阻擋，執行降級`);
    title = fallbackTitle(url);
    description = "";
    parse_status = "partial";
    confidence_level = "low";
  } else if (!description || description.trim().length === 0) {
    description = "";
    parse_status = "partial";
    confidence_level = "low";
  }

  return {
    title: title || fallbackTitle(url),
    description: description || "",
    platform,
    parse_status,
    confidence_level,
  };
}

export interface GeneralExtractResult {
  title: string;
  description: string;
  content: string;
  platform: string;
  parse_status: "complete" | "partial";
  confidence_level: "high" | "medium" | "low";
}

function cleanHtmlText(html: string): string {
  let clean = html.replace(/<head[\s\S]*?<\/head>/gi, "");
  clean = clean.replace(/<script[\s\S]*?<\/script>/gi, "");
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, "");
  clean = clean.replace(/<[^>]+>/g, " ");
  clean = decodeHtmlEntities(clean);
  clean = clean.replace(/\s+/g, " ").trim();
  return clean;
}

/**
 * 專為一般網域網址設計的內容擷取方法，支援 title/description/正文 擷取及備援判定
 */
export async function extractGeneralContent(url: string): Promise<GeneralExtractResult> {
  console.log(`[Extractor] 開始擷取一般網址內容: ${url}`);
  
  let title: string | null = null;
  let description: string | null = null;
  let content = "";
  let parse_status: "complete" | "partial" = "complete";
  let confidence_level: "high" | "medium" | "low" = "high";

  // 第一層嘗試：直接 HTML fetch 解析
  try {
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    };

    const response = await fetch(url, {
      headers,
      next: { revalidate: 600 },
      redirect: "follow",
    });

    if (response.ok) {
      const html = await response.text();
      const meta = parseHtmlMetadata(html);
      title = meta.title;
      description = meta.description;
      content = cleanHtmlText(html);
      console.log(`[Extractor] HTML 擷取一般網址成功. title="${title}", description="${description}"`);
    } else {
      console.log(`[Extractor] HTML 擷取一般網址失敗: ${response.status}`);
    }
  } catch (error) {
    console.error("[Extractor] HTML 擷取一般網址錯誤:", error);
  }

  // 第二層嘗試：Microlink API 備援
  if (!title) {
    try {
      const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
      console.log(`[Extractor] Microlink 一般網址內容請求: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const json = await response.json() as { status: string; data?: { title?: string; description?: string } };
        if (json.status === "success" && json.data) {
          title = json.data.title ? decodeHtmlEntities(json.data.title) : null;
          description = json.data.description ? decodeHtmlEntities(json.data.description) : null;
          console.log(`[Extractor] Microlink 擷取一般網址成功. title="${title}", description="${description}"`);
        }
      }
    } catch (error) {
      console.error("[Extractor] Microlink 一般網址解析錯誤:", error);
    }
  }

  // 判定是否有效
  const isInvalidTitle = (t: string | null): boolean => {
    if (!t) return true;
    const lower = t.toLowerCase();
    return (
      lower.includes("log in") ||
      lower.includes("login") ||
      t === "Facebook" ||
      t === "Instagram" ||
      t === "Threads" ||
      t === "Twitter" ||
      t === "X" ||
      t === "無法提取標題"
    );
  };

  if (isInvalidTitle(title)) {
    console.log(`[Extractor] 偵測到網頁標題無效或遭阻擋，執行降級`);
    title = fallbackTitle(url);
    description = "";
    content = "";
    parse_status = "partial";
    confidence_level = "low";
  } else {
    // 擷取正文前 1000 個字
    if (content.length > 1000) {
      content = content.slice(0, 1000);
    }

    if (content.length > 200) {
      confidence_level = "high";
      parse_status = "complete";
    } else if (content.length > 50 || (description && description.trim().length > 20)) {
      confidence_level = "medium";
      parse_status = "complete";
    } else {
      confidence_level = "low";
      parse_status = "partial";
    }
  }

  let platform = "Web";
  try {
    platform = new URL(url).hostname.replace("www.", "");
  } catch {
    // ignore
  }

  return {
    title: title || fallbackTitle(url),
    description: description || "",
    content: content || "",
    platform,
    parse_status,
    confidence_level,
  };
}
