const LIBRARY_RECORDS = [
  {
    id: "entry-012",
    input_type: "text",
    raw_input: "把一段提示詞整理成可以重複套用的模板，之後收藏時直接套用。",
    source_title: "提示詞模板化筆記",
    source_url: "",
    created_at: "2026-06-21 09:40",
    source_platform: "LINE 文字",
    content_type: "note",
    summary: "這則筆記在整理如何把零散提示詞收斂成可重複使用的 prompt 模板。",
    key_points: [
      "重點是固定輸出格式與欄位。",
      "可直接拿來整理社群收藏內容。",
      "適合後續做成常用收藏 prompt。"
    ],
    tags: ["Prompt", "Template", "Workflow"],
    use_case: "Prompt",
    topic_category: "提示工程",
    confidence_level: "high",
    parse_status: "complete"
  },
  {
    id: "entry-011",
    input_type: "social_url",
    raw_input: "https://www.threads.net/@builder/post/011",
    source_title: "用 3 層結構拆 AI Agent 任務",
    source_url: "https://www.threads.net/@builder/post/011",
    created_at: "2026-06-21 08:30",
    source_platform: "Threads",
    content_type: "post",
    summary: "這則社群內容在講如何把 AI Agent 任務拆成 planning、execution、verification 三層。",
    key_points: [
      "拆層後更容易交接與除錯。",
      "每層都要有清楚輸入與輸出。",
      "適合拿來校正自己的 agent 流程。"
    ],
    tags: ["AI Agent", "Planning", "Execution"],
    use_case: "工作流程參考",
    topic_category: "AI 系統設計",
    confidence_level: "medium",
    parse_status: "partial"
  },
  {
    id: "entry-010",
    input_type: "url",
    raw_input: "https://example.com/knowledge/ui-patterns",
    source_title: "UI Patterns for Knowledge Retrieval",
    source_url: "https://example.com/knowledge/ui-patterns",
    created_at: "2026-06-20 22:10",
    source_platform: "Web",
    content_type: "article",
    summary: "這篇文章整理知識型介面的常見回找模式，重點是讓人能快速掃描與定位內容。",
    key_points: [
      "列表頁比華麗卡牆更適合高頻回找。",
      "篩選條件要貼近真實使用線索。",
      "單筆頁適合承接完整內容與上下篇瀏覽。"
    ],
    tags: ["UI Pattern", "Knowledge", "Search"],
    use_case: "首頁靈感",
    topic_category: "產品設計",
    confidence_level: "high",
    parse_status: "complete"
  },
  {
    id: "entry-009",
    input_type: "social_url",
    raw_input: "https://www.linkedin.com/posts/demo-009",
    source_title: "LinkedIn 上關於知識庫資訊架構的短文",
    source_url: "https://www.linkedin.com/posts/demo-009",
    created_at: "2026-06-20 18:55",
    source_platform: "LinkedIn",
    content_type: "post",
    summary: "這則分享強調知識庫首頁不該只展示收藏，而要優先支撐回找與再利用。",
    key_points: [
      "首頁應先呈現摘要與用途。",
      "資料完整度要被誠實標示。",
      "收藏不是終點，回找才是價值。"
    ],
    tags: ["Information Architecture", "Knowledge Base", "UX"],
    use_case: "方向校準",
    topic_category: "知識管理",
    confidence_level: "medium",
    parse_status: "partial"
  },
  {
    id: "entry-008",
    input_type: "url",
    raw_input: "https://example.com/marketing/content-curation",
    source_title: "Content Curation for Small Teams",
    source_url: "https://example.com/marketing/content-curation",
    created_at: "2026-06-20 14:20",
    source_platform: "Web",
    content_type: "article",
    summary: "這篇文章介紹如何把平常看到的內容整理成之後可重用的行銷靈感素材。",
    key_points: [
      "整理時要先決定用途分類。",
      "短摘要能降低二次閱讀成本。",
      "分類與標籤要服務未來使用，而不是只求漂亮。"
    ],
    tags: ["Content Curation", "Marketing", "Idea"],
    use_case: "行銷素材",
    topic_category: "內容策略",
    confidence_level: "high",
    parse_status: "complete"
  },
  {
    id: "entry-007",
    input_type: "text",
    raw_input: "收藏不是問題，真正的問題是之後根本找不到也想不起來。",
    source_title: "收藏痛點筆記",
    source_url: "",
    created_at: "2026-06-20 11:40",
    source_platform: "LINE 文字",
    content_type: "note",
    summary: "這則筆記直指個人收藏工具最大的問題是收得到卻用不起來。",
    key_points: [
      "回找線索比收藏量更重要。",
      "用途與主題要先於視覺裝飾。",
      "適合拿來做產品定位依據。"
    ],
    tags: ["Pain Point", "Product", "Retrieval"],
    use_case: "產品研究",
    topic_category: "知識管理",
    confidence_level: "high",
    parse_status: "complete"
  },
  {
    id: "entry-006",
    input_type: "social_url",
    raw_input: "https://www.instagram.com/p/entry006",
    source_title: "來自 Instagram 的分享",
    source_url: "https://www.instagram.com/p/entry006",
    created_at: "2026-06-19 21:30",
    source_platform: "Instagram",
    content_type: "post",
    summary: "這是一則尚未抓到完整文案的社群內容，目前先保留可辨識的主題與來源資訊。",
    key_points: [
      "內容解析不足，但仍值得保留。",
      "後續可人工補充或重新解析。",
      "驗證低信心收錄是否能被接受。"
    ],
    tags: ["社群分享", "待補充", "收藏"],
    use_case: "待整理",
    topic_category: "社群觀察",
    confidence_level: "low",
    parse_status: "partial"
  },
  {
    id: "entry-005",
    input_type: "url",
    raw_input: "https://www.youtube.com/watch?v=entry005",
    source_title: "Designing Better Knowledge Systems",
    source_url: "https://www.youtube.com/watch?v=entry005",
    created_at: "2026-06-19 17:00",
    source_platform: "YouTube",
    content_type: "video",
    summary: "這支影片說明如何把零散收藏整理成可搜尋、可重用、可延伸的知識系統。",
    key_points: [
      "先定義回找情境，再決定欄位。",
      "用途與主題雙軸很重要。",
      "適合作為首頁資訊架構靈感。"
    ],
    tags: ["Knowledge System", "YouTube", "UX"],
    use_case: "首頁靈感",
    topic_category: "知識管理",
    confidence_level: "high",
    parse_status: "complete"
  },
  {
    id: "entry-004",
    input_type: "url",
    raw_input: "https://example.com/tool/ai-research",
    source_title: "AI Research Stack Comparison",
    source_url: "https://example.com/tool/ai-research",
    created_at: "2026-06-19 12:10",
    source_platform: "Web",
    content_type: "tool",
    summary: "這篇比較文整理多個 AI research 工具的定位差異，適合後續做工具選型參考。",
    key_points: [
      "不同工具適用於不同研究階段。",
      "重點不只是功能，也包含輸出整理能力。",
      "適合後續寫工具比較筆記。"
    ],
    tags: ["AI Tool", "Research", "Comparison"],
    use_case: "工具收藏",
    topic_category: "AI 工具",
    confidence_level: "high",
    parse_status: "complete"
  },
  {
    id: "entry-003",
    input_type: "text",
    raw_input: "把摘要格式固定成一句話加 2-3 個重點，回找時才不會被資訊淹沒。",
    source_title: "摘要格式筆記",
    source_url: "",
    created_at: "2026-06-18 23:50",
    source_platform: "LINE 文字",
    content_type: "note",
    summary: "這則筆記確認摘要格式應採一句話加 2-3 個重點，避免收藏內容過空或過滿。",
    key_points: [
      "一句話負責快速理解。",
      "重點負責補齊脈絡。",
      "格式固定後也較利於 AI 輸出。"
    ],
    tags: ["Summary", "Format", "Prompt"],
    use_case: "Prompt",
    topic_category: "提示工程",
    confidence_level: "high",
    parse_status: "complete"
  },
  {
    id: "entry-002",
    input_type: "social_url",
    raw_input: "https://x.com/demo/status/entry002",
    source_title: "X 上關於收藏工作流的貼文",
    source_url: "https://x.com/demo/status/entry002",
    created_at: "2026-06-18 15:10",
    source_platform: "X",
    content_type: "post",
    summary: "這則貼文討論如何把看到的好內容快速丟進收藏系統，之後再做二次整理。",
    key_points: [
      "強調先收進來，再做分層整理。",
      "收錄速度與後續可用性要平衡。",
      "適合當收藏流程設計參考。"
    ],
    tags: ["Workflow", "Capture", "Social"],
    use_case: "工作流程參考",
    topic_category: "知識管理",
    confidence_level: "medium",
    parse_status: "partial"
  },
  {
    id: "entry-001",
    input_type: "url",
    raw_input: "https://example.com/community/prompt-library",
    source_title: "Prompt Library Patterns",
    source_url: "https://example.com/community/prompt-library",
    created_at: "2026-06-17 20:00",
    source_platform: "Web",
    content_type: "article",
    summary: "這篇文章整理 prompt library 常見的欄位設計與分類方式，適合當結構範本。",
    key_points: [
      "分類方式會直接影響回找效率。",
      "範本應兼顧可讀性與擴充性。",
      "可延伸成自己的 prompt 資產庫。"
    ],
    tags: ["Prompt Library", "Structure", "Knowledge"],
    use_case: "Prompt",
    topic_category: "提示工程",
    confidence_level: "high",
    parse_status: "complete"
  }
];

function sortRecordsDesc(records) {
  return [...records].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

function getOrderedRecords() {
  return sortRecordsDesc(LIBRARY_RECORDS);
}

function getUseCases() {
  return [...new Set(LIBRARY_RECORDS.map((item) => item.use_case))];
}

function getTopicCategories() {
  return [...new Set(LIBRARY_RECORDS.map((item) => item.topic_category))];
}

function getRecordById(id) {
  return LIBRARY_RECORDS.find((item) => item.id === id) || null;
}

function getRecordIndexById(id, records) {
  return records.findIndex((item) => item.id === id);
}
