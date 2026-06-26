import { PromptRecord } from './sheets';

export const PROMPT_CATEGORIES = ['文案寫作', '圖像生成', '工作效率', '開發技術', '其他'];

export const MOCK_PROMPT_RECORDS: PromptRecord[] = [
  {
    id: "prompt-001",
    prompt_category: "開發技術",
    prompt_text: "你是一位資深的 JavaScript 架構師。請審查以下程式碼並指出潛在的記憶體洩漏、效能瓶頸與可維護性問題：\n\n[請貼入程式碼]",
    created_at: "2026-06-25 14:30:00",
    updated_at: "2026-06-26 10:15:00",
    source_type: "web"
  },
  {
    id: "prompt-002",
    prompt_category: "圖像生成",
    prompt_text: "請幫我針對以下產品功能寫 3 組不同的 Facebook 廣告文案。每組需包含標題、痛點切入的內文，以及行動呼籲 (CTA)。語氣要活潑、吸睛，並加入適當的 Emoji：\n\n[請描述產品功能]",
    created_at: "2026-06-24 09:20:00",
    updated_at: "2026-06-24 09:20:00",
    source_type: "line"
  },
  {
    id: "prompt-003",
    prompt_category: "文案寫作",
    prompt_text: "請將以下草稿改寫為一篇結構清晰的部落格文章。要求：\n1. 採用前導、主體、總結的三段式結構\n2. 使用 Markdown 格式，適度加上小標題\n3. 語氣要專業但平易近人，適合一般大眾閱讀：\n\n[請貼入草稿]",
    created_at: "2026-06-23 16:45:00",
    updated_at: "2026-06-23 16:45:00",
    source_type: "line"
  },
  {
    id: "prompt-004",
    prompt_category: "工作效率",
    prompt_text: "請幫我摘要以下長會議記錄的決策事項與待辦清單。待辦清單需明確列出負責人與預計完成時間。如果會議中未提及，請標示為『待釐清』：\n\n[請貼入會議記錄]",
    created_at: "2026-06-22 11:10:00",
    updated_at: "2026-06-23 09:00:00",
    source_type: "web"
  },
  {
    id: "prompt-005",
    prompt_category: "其他",
    prompt_text: "請扮演一個英文口說伴讀教練。接下來我會用英文跟你對話，請在每次回覆我時：\n1. 糾正我上一句中的文法錯誤（若有）\n2. 用簡單的英文回覆我並提出一個新問題，引導我繼續對話：\n\nHello coach, I want to practice English.",
    created_at: "2026-06-22 08:00:00",
    updated_at: "2026-06-22 08:00:00",
    source_type: "line"
  }
];

const LOCAL_STORAGE_KEY = 'my_keepevery_prompt_records';

// 取得所有 Prompt
export function getStoredPrompts(): PromptRecord[] {
  if (typeof window === 'undefined') {
    return MOCK_PROMPT_RECORDS;
  }
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_PROMPT_RECORDS));
    return MOCK_PROMPT_RECORDS;
  }
  try {
    return JSON.parse(stored) as PromptRecord[];
  } catch {
    return MOCK_PROMPT_RECORDS;
  }
}

// 儲存所有 Prompt
export function saveStoredPrompts(records: PromptRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
}
