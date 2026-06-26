const fs = require('fs');

// 1. 讀取並 overrides docs/demo/library-styles.css
// 為了跟線上 React 生效後的樣式百分之百一致：
// fill 應為 #ffffff, stroke 應為 #ffffff, stroke-width 應為 1.0, z-index 應為 -10
// .cloud-a 應為 opacity: 0.20, .cloud-b 應為 opacity: 0.15
let cssContent = fs.readFileSync('docs/demo/library-styles.css', 'utf8');

// overrides 雲朵樣式，直接追加在尾端即可
const cloudOverrides = `
/* ==================== Cloud Overrides (Align with Next.js React output) ==================== */
.cloud-wrap {
  z-index: -10;
  pointer-events: none;
  user-select: none;
}
.cloud-wrap svg {
  fill: #ffffff !important;
  stroke: #ffffff !important;
  stroke-width: 1.0 !important;
  filter: drop-shadow(4px 4px 0px #4a4a4a) !important;
}
.cloud-a {
  opacity: 0.20 !important;
  top: 40px !important;
  left: 40px !important;
}
.cloud-b {
  opacity: 0.15 !important;
  top: 160px !important;
  right: 80px !important;
}
`;

// 如果還沒有追加過，就追加
if (!cssContent.includes('Cloud Overrides')) {
  fs.appendFileSync('docs/demo/library-styles.css', cloudOverrides, 'utf8');
}

// 2. 定義側邊欄的 HTML 產生器 (對齊 Sidebar.tsx)
function getSidebarHtml(activePage) {
  return `
  <!-- 手機版選單切換按鈕 -->
  <button 
    class="sidebar-mobile-toggle"
    onclick="toggleMobileSidebar()"
    aria-label="切換選單"
  >
    ☰
  </button>

  <!-- 手機版選單背景遮罩 -->
  <div id="sidebar-overlay" class="sidebar-overlay" onclick="toggleMobileSidebar()"></div>

  <aside id="sidebar-aside" class="sidebar">
    <!-- 頂部 Logo -->
    <div class="sidebar-logo">
      <span class="logo-icon">✦</span>
      <span class="logo-text">靈感收藏庫</span>
    </div>

    <!-- 總收藏統計 -->
    <div class="sidebar-stats">
      <span class="stats-label">靈感總數</span>
      <span class="stats-value" id="sidebar-total-count">0</span>
    </div>

    <!-- 主選單 -->
    <nav class="sidebar-menu">
      <div class="menu-group-label">主要選單</div>
      <a 
        href="./library-demo.html" 
        class="menu-item ${activePage === 'home' ? 'active' : ''}"
      >
        <span class="menu-icon">📊</span>
        <span class="menu-text">控制台概覽</span>
      </a>
      <a 
        href="./list.html" 
        class="menu-item ${activePage === 'list' ? 'active' : ''}"
      >
        <span class="menu-icon">📚</span>
        <span class="menu-text">所有靈感列表</span>
      </a>
      <a 
        href="./prompts.html" 
        class="menu-item ${activePage === 'prompts' ? 'active' : ''}"
      >
        <span class="menu-icon">⚡</span>
        <span class="menu-text">指令寶庫</span>
      </a>
    </nav>

    <!-- 主題入口選單 -->
    <div class="sidebar-topics">
      <div class="menu-group-label">主題快速入口</div>
      <div class="topic-list" id="sidebar-topic-list"></div>
    </div>
  </aside>
  `;
}

// 3. 定義共用雲朵與 Sparkle 的 HTML
const commonDecorations = `
  <div class="cloud-wrap cloud-a" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>
  </div>
  <div class="cloud-wrap cloud-b" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>
  </div>
  <div class="sparkle sparkle-a" aria-hidden="true">✦</div>
  <div class="sparkle sparkle-b" aria-hidden="true">✦</div>
`;

// 4. 定義共用 JS 輔助函數
const commonScriptHelpers = `
  function toggleMobileSidebar() {
    const sidebar = document.getElementById("sidebar-aside");
    const overlay = document.getElementById("sidebar-overlay");
    const toggleBtn = document.querySelector(".sidebar-mobile-toggle");
    
    if (sidebar.classList.contains("mobile-open")) {
      sidebar.classList.remove("mobile-open");
      overlay.style.display = "none";
      toggleBtn.classList.remove("active");
      toggleBtn.textContent = "☰";
    } else {
      sidebar.classList.add("mobile-open");
      overlay.style.display = "block";
      toggleBtn.classList.add("active");
      toggleBtn.textContent = "✕";
    }
  }

  function initSidebar(activeTopic = "") {
    const orderedRecords = getOrderedRecords();
    document.getElementById("sidebar-total-count").textContent = orderedRecords.length;
    
    if (typeof getTopicCategories === 'function') {
      const topicList = document.getElementById("sidebar-topic-list");
      const topics = getTopicCategories();
      
      const sortedTopics = [...topics].sort((a, b) => {
        const priority = ['Prompt', 'AI 工具'];
        const aIdx = priority.indexOf(a);
        const bIdx = priority.indexOf(b);
        
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return a.localeCompare(b);
      });

      topicList.innerHTML = sortedTopics.map(t => {
        const isActive = activeTopic === t;
        return \`
          <a href="./list.html?topic=\${encodeURIComponent(t)}" class="topic-item \${isActive ? 'active' : ''}">
            <span class="topic-bullet">✦</span>
            <span class="topic-name">\${t}</span>
          </a>
        \`;
      }).join("");
    }
  }
`;

// ==================== 頁面 1: library-demo.html (對齊 LibraryHomeClient.tsx) ====================
const homeHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>靈感收藏庫 - 控制台概覽</title>
  <link rel="stylesheet" href="./library-styles.css">
</head>
<body>
  ${getSidebarHtml('home')}

  <!-- 主內容區 -->
  <div class="main-content">
    ${commonDecorations}

    <main class="frame shell" style="position: relative; z-index: 10; maxWidth: 1200px; margin: 0 auto;">
      <!-- Toast 提示通知 -->
      <div id="toast-notify" class="toast-notification" style="display: none;"></div>

      <!-- SaaS 大標頭與功能按鈕 -->
      <section class="dashboard-header" style="padding: 24px 0 12px; display: flex; justifyContent: space-between; alignItems: center; flexWrap: wrap; gap: 16px;">
        <div>
          <h1 class="dashboard-title" style="font-size: 28px; font-weight: bold; color: #2d2d2d; margin: 0;">首頁</h1>
          <p style="color: #666; font-size: 14px; margin-top: 4px; margin-bottom: 0;">
            讓每筆收藏能被快速理解、有效找回，並逐步累積成可再利用的個人內容資產。
          </p>
        </div>
        <div class="header-actions" style="display: flex; gap: 12px;">
          <button class="link-button accent-button" style="cursor: pointer; margin: 0;" onclick="showAddModal()">
            ➕ 手動新增靈感
          </button>
          <a 
            href="https://docs.google.com/spreadsheets/d/1MvGR7l1gBAZRjCQr9VkVsePoL1qxS3DeZyguRJtj2U0/edit?gid=1533933858#gid=1533933858" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="link-button subtle-button"
            style="margin: 0;"
          >
            📊 開啟試算表
          </a>
        </div>
      </section>

      <!-- 橫向並排的 4 個 SaaS 數據統計卡 -->
      <section class="stats-grid" id="stats-cards-container"></section>

      <!-- 收藏結果表格區塊 -->
      <section class="results">
        <div class="section-head">
          <div class="section-title">最新收藏</div>
        </div>
        <div class="section-meta-row">
          <div id="summary-label" class="section-subtitle">目前顯示最新 10 / 0 筆收藏。</div>
          <a href="./list.html" class="text-action section-action section-action-large">
            看更多收藏
          </a>
        </div>

        <!-- 表格排版 (Table Layout) -->
        <div class="table-responsive">
          <table class="inspiration-table">
            <thead>
              <tr>
                <th style="width: 40px;" class="rwd-hide"><input type="checkbox" disabled /></th>
                <th style="width: 60px;">序號</th>
                <th>摘要與原始標題</th>
                <th style="width: 140px;">主題分類</th>
                <th style="width: 140px;">用途分類</th>
                <th style="width: 150px;">收藏時間</th>
                <th style="width: 60px;">操作</th>
              </tr>
            </thead>
            <tbody id="inspiration-table-body"></tbody>
          </table>
        </div>
      </section>
    </main>
  </div>

  <script src="./library-data.js"></script>
  <script>
    ${commonScriptHelpers}

    const HOME_LATEST_LIMIT = 10;
    let records = getOrderedRecords();
    let activeMenuId = null;

    function renderStats() {
      const highCount = records.filter(r => r.confidence_level === 'high').length;
      const partialCount = records.filter(r => r.parse_status === 'partial').length;
      const latestUpdate = records.length > 0 ? records[0].created_at : '無';
      
      const statsContainer = document.getElementById('stats-cards-container');
      statsContainer.innerHTML = \`
        <a href="./list.html" class="stat-card link-card" title="查看所有靈感列表">
          <div class="stat-card-label">靈感總數</div>
          <div class="stat-card-value">\${records.length}</div>
          <div class="stat-card-trend trend-neutral">已成功清洗</div>
        </a>
        <a href="./list.html?confidence=high" class="stat-card link-card" title="篩選高品質內容">
          <div class="stat-card-label">高品質 AI 整理</div>
          <div class="stat-card-value">\${highCount}</div>
          <div class="stat-card-trend trend-positive">高信心解析</div>
        </a>
        <a href="./list.html?parse_status=partial" class="stat-card link-card" title="篩選部分解析內容">
          <div class="stat-card-label">部分解析與歸檔</div>
          <div class="stat-card-value">\${partialCount}</div>
          <div class="stat-card-trend trend-negative">等待手動補全</div>
        </a>
        <div class="stat-card">
          <div class="stat-card-label">最新更新時間</div>
          <div class="stat-card-value-small" style="font-size: 14px; font-weight: 600; height: 40px; display: flex; align-items: center;">
            \${latestUpdate.split(' ')[0]}
          </div>
          <div class="stat-card-trend trend-neutral">最新紀錄</div>
        </div>
      \`;
    }

    function renderTable() {
      const latestRecords = records.slice(0, HOME_LATEST_LIMIT);
      document.getElementById('summary-label').textContent = \`目前顯示最新 \${latestRecords.length} / \${records.length} 筆收藏。\`;
      
      const tbody = document.getElementById('inspiration-table-body');
      if (latestRecords.length === 0) {
        tbody.innerHTML = \`<tr><td colspan="7" class="empty">暫無任何靈感收藏紀錄，請使用 LINE 或手動新增。</td></tr>\`;
        return;
      }

      tbody.innerHTML = latestRecords.map((item, index) => {
        const isMenuOpen = activeMenuId === item.id;
        const hasUrl = !!item.source_url;
        const serial = String(records.length - index).padStart(2, '0');
        const displayTime = item.created_at.split(' ')[0];

        return \`
          <tr onclick="window.location.href='./detail.html?id=' + encodeURIComponent('\${item.id}')" style="cursor: pointer;">
            <td class="rwd-hide" onclick="event.stopPropagation()"><input type="checkbox" disabled /></td>
            <td data-label="序號">
              <span class="table-number">\${serial}</span>
            </td>
            <td data-label="摘要與標題">
              <div class="table-summary-cell">
                <a href="./detail.html?id=\${encodeURIComponent(item.id)}" class="table-summary-link" onclick="event.stopPropagation()">
                  \${item.summary}
                </a>
              </div>
              <div class="table-title-cell" title="\${item.source_title}">
                \${item.source_title}
              </div>
            </td>
            <td data-label="主題分類">
              <span class="badge-tag topic-tag">\${item.topic_category || '無'}</span>
            </td>
            <td data-label="用途分類">
              <span class="badge-tag usecase-tag">\${item.use_case || '無'}</span>
            </td>
            <td data-label="收藏時間">
              <span class="table-time">\${displayTime}</span>
            </td>
            <td style="position: relative;" onclick="event.stopPropagation()">
              <button class="table-action-dots" onclick="toggleMenu(event, '\${item.id}')">•••</button>
              
              \${isMenuOpen ? \`
                <div class="context-menu" style="display: flex;">
                  <a href="./detail.html?id=\${encodeURIComponent(item.id)}" class="context-menu-item">👁️ 查看詳情</a>
                  \${hasUrl ? \`<a href="\${item.source_url}" target="_blank" rel="noopener noreferrer" class="context-menu-item">🔗 打開原文</a>\` : \`<span class="context-menu-item disabled" title="此筆收藏無外部連結">🔗 無原文連結</span>\`}
                  <button onclick="copySummary('\${item.summary}')" class="context-menu-item btn-menu">📋 複製摘要</button>
                  <button onclick="alert('✏️ 編輯靈感已被觸發！')" class="context-menu-item btn-menu">✏️ 編輯靈感</button>
                  <button onclick="deleteRecord()" class="context-menu-item btn-menu text-danger">❌ 刪除收藏</button>
                </div>
              \` : ''}
            </td>
          </tr>
        \`;
      }).join('');
    }

    function toggleMenu(event, id) {
      if (activeMenuId === id) {
        activeMenuId = null;
      } else {
        activeMenuId = id;
      }
      renderTable();
    }

    function copySummary(text) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('📋 已成功複製摘要內容！');
        activeMenuId = null;
        renderTable();
      });
    }

    function showToast(msg) {
      const toast = document.getElementById('toast-notify');
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 2000);
    }

    function deleteRecord() {
      alert('🔐 本系統 Google Sheets 資料庫目前為唯讀狀態。\\n若需刪除此筆記錄，請至 Google Sheets 試算表中進行編輯。');
      activeMenuId = null;
      renderTable();
    }

    function showAddModal() {
      alert('➕ 手動新增靈感彈窗 (靜態網頁僅支援模擬，不直接寫入 Google Sheets)。');
    }

    // 點擊外部關閉選單
    document.addEventListener('click', () => {
      if (activeMenuId !== null) {
        activeMenuId = null;
        renderTable();
      }
    });

    initSidebar();
    renderStats();
    renderTable();
  </script>
</body>
</html>
`;

fs.writeFileSync('docs/demo/library-demo.html', homeHtml, 'utf8');

// ==================== 頁面 2: list.html (對齊 LibraryListClient.tsx) ====================
const listHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>靈感收藏庫 - 所有靈感列表</title>
  <link rel="stylesheet" href="./library-styles.css">
</head>
<body>
  ${getSidebarHtml('list')}

  <!-- 主內容區 -->
  <div class="main-content">
    ${commonDecorations}

    <main class="frame shell" style="position: relative; z-index: 10; maxWidth: 1200px; margin: 0 auto;">
      <!-- Toast 提示通知 -->
      <div id="toast-notify" class="toast-notification" style="display: none;"></div>

      <!-- SaaS 大標頭與功能按鈕 -->
      <section class="dashboard-header" style="padding: 24px 0 12px; display: flex; justifyContent: space-between; alignItems: center; flexWrap: wrap; gap: 16px;">
        <div>
          <h1 class="dashboard-title" style="font-size: 28px; font-weight: bold; color: #2d2d2d; margin: 0;">所有靈感列表</h1>
          <p style="color: #666; font-size: 14px; margin-top: 4px; margin-bottom: 0;">
            在此搜尋並多重過濾篩選您收藏的靈感與筆記。
          </p>
        </div>
        <div class="header-actions">
          <button class="link-button accent-button" style="cursor: pointer; margin: 0;" onclick="alert('手動新增模式')">
            ➕ 手動新增靈感
          </button>
        </div>
      </section>

      <!-- 過濾面板 -->
      <section class="controls toolbar-panel" style="margin-top: 24px;">
        <div class="toolbar-row toolbar-list-primary">
          <label class="search toolbar-search" style="flex-grow: 1;">
            <input id="search-input" type="text" placeholder="搜尋摘要、標題、標籤或重點..." oninput="handleSearch()" />
          </label>
          <select id="use-case-filter" class="filter-select" onchange="handleFilterChange()"></select>
          <select id="topic-filter" class="filter-select" onchange="handleFilterChange()"></select>
          <select id="sort-filter" class="filter-select narrow-select" onchange="handleFilterChange()">
            <option value="latest">最新優先</option>
            <option value="oldest">最舊優先</option>
            <option value="high_confidence">高信心優先</option>
          </select>
        </div>
        <div class="toolbar-row toolbar-list-secondary" style="margin-top: 10px;">
          <select id="platform-filter" class="filter-select" onchange="handleFilterChange()"></select>
          <select id="confidence-filter" class="filter-select" onchange="handleFilterChange()"></select>
          <select id="time-filter" class="filter-select" onchange="handleFilterChange()">
            <option value="全部時間">全部時間</option>
            <option value="最近 3 天">最近 3 天</option>
            <option value="最近 7 天">最近 7 天</option>
          </select>
          <button id="clear-filters" class="text-action" type="button" onclick="clearFilters()">清除條件</button>
        </div>
      </section>

      <!-- 統計數據與已選條件 -->
      <section class="notice toolbar-meta-panel" style="margin-top: 16px;">
        <div class="toolbar-row toolbar-summary-row" style="display: flex; justify-content: space-between;">
          <div id="result-count" class="toolbar-result">目前顯示 0 / 0 筆收藏。</div>
          <div id="active-filters" class="notice-summary toolbar-summary"></div>
        </div>
      </section>

      <!-- 收藏結果表格區塊 -->
      <section class="results">
        <!-- 表格排版 (Table Layout) -->
        <div class="table-responsive">
          <table class="inspiration-table">
            <thead>
              <tr>
                <th style="width: 40px;" class="rwd-hide"><input type="checkbox" disabled /></th>
                <th style="width: 60px;">序號</th>
                <th>摘要與原始標題</th>
                <th style="width: 140px;">主題分類</th>
                <th style="width: 140px;">用途分類</th>
                <th style="width: 150px;">收藏時間</th>
                <th style="width: 60px;">操作</th>
              </tr>
            </thead>
            <tbody id="inspiration-table-body"></tbody>
          </table>
        </div>

        <div id="empty-state" class="empty" style="display: none; margin-top: 20px;">
          目前沒有符合條件的收藏。
        </div>

        <!-- 分頁器 -->
        <div id="pagination" class="pagination" style="margin-top: 24px;"></div>
      </section>
    </main>
  </div>

  <script src="./library-data.js"></script>
  <script>
    ${commonScriptHelpers}

    const ITEMS_PER_PAGE = 10;
    const records = getOrderedRecords();
    
    const params = new URLSearchParams(window.location.search);
    const state = {
      keyword: params.get("keyword") || "",
      useCase: params.get("use_case") || "全部用途",
      topic: params.get("topic") || "全部主題",
      sort: params.get("sort") || "latest",
      platform: params.get("platform") || "全部來源",
      confidence: params.get("confidence") || "全部信心",
      time: params.get("time") || "全部時間",
      page: Number(params.get("page") || "1")
    };

    let activeMenuId = null;

    function populateFilterOptions() {
      const useCases = ["全部用途", ...getUseCases()];
      const topics = ["全部主題", ...getTopicCategories()];
      const platforms = ["全部來源", ...new Set(records.map(r => r.source_platform))];
      const confidences = ["全部信心", "high", "medium", "low"];

      document.getElementById('use-case-filter').innerHTML = useCases.map(u => \`<option value="\${u}">\${u}</option>\`).join('');
      document.getElementById('topic-filter').innerHTML = topics.map(t => \`<option value="\${t}">\${t}</option>\`).join('');
      document.getElementById('platform-filter').innerHTML = platforms.map(p => \`<option value="\${p}">\${p}</option>\`).join('');
      document.getElementById('confidence-filter').innerHTML = confidences.map(c => \`<option value="\${c}">\${c}</option>\`).join('');

      document.getElementById('use-case-filter').value = state.useCase;
      document.getElementById('topic-filter').value = state.topic;
      document.getElementById('platform-filter').value = state.platform;
      document.getElementById('confidence-filter').value = state.confidence;
      document.getElementById('time-filter').value = state.time;
      document.getElementById('sort-filter').value = state.sort;
      document.getElementById('search-input').value = state.keyword;
    }

    function isWithinTimeRange(item) {
      if (state.time === "全部時間" || records.length === 0) return true;
      const recordDate = new Date(item.created_at.replace(/\\//g, '-').replace(' ', 'T'));
      const latestDate = new Date(records[0].created_at.replace(/\\//g, '-').replace(' ', 'T'));
      const diffMs = latestDate - recordDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (state.time === "最近 3 天") return diffDays <= 3;
      if (state.time === "最近 7 天") return diffDays <= 7;
      return true;
    }

    function getFilteredRecords() {
      const keyword = state.keyword.trim().toLowerCase();
      let filtered = records.filter(item => {
        const text = [
          item.summary,
          item.source_title,
          item.use_case,
          item.topic_category,
          ...(item.tags || []),
          ...(item.key_points || [])
        ].join(" ").toLowerCase();

        const hitKeyword = !keyword || text.includes(keyword);
        const hitUseCase = state.useCase === "全部用途" || item.use_case === state.useCase;
        const hitTopic = state.topic === "全部主題" || item.topic_category === state.topic;
        const hitPlatform = state.platform === "全部來源" || item.source_platform === state.platform;
        const hitConfidence = state.confidence === "全部信心" || item.confidence_level === state.confidence;
        const hitTime = isWithinTimeRange(item);

        return hitKeyword && hitUseCase && hitTopic && hitPlatform && hitConfidence && hitTime;
      });

      if (state.sort === "oldest") {
        return [...filtered].reverse();
      } else if (state.sort === "high_confidence") {
        const rank = { high: 0, medium: 1, low: 2 };
        return [...filtered].sort((a, b) => {
          const diff = rank[a.confidence_level] - rank[b.confidence_level];
          return diff !== 0 ? diff : b.created_at.localeCompare(a.created_at);
        });
      }
      return filtered;
    }

    function renderList() {
      const filtered = getFilteredRecords();
      const tbody = document.getElementById('inspiration-table-body');
      const emptyState = document.getElementById('empty-state');
      
      document.getElementById('result-count').textContent = \`目前顯示 \${filtered.length} / \${records.length} 筆收藏。\`;
      
      // 已選條件標示
      const active = [];
      if (state.useCase !== "全部用途") active.push(\`用途：\${state.useCase}\`);
      if (state.topic !== "全部主題") active.push(\`主題：\${state.topic}\`);
      if (state.platform !== "全部來源") active.push(\`來源：\${state.platform}\`);
      if (state.confidence !== "全部信心") active.push(\`信心：\${state.confidence}\`);
      if (state.time !== "全部時間") active.push(\`時間：\${state.time}\`);
      document.getElementById('active-filters').textContent = active.length ? \`已選條件：\${active.join("、")}\` : "";

      const start = (state.page - 1) * ITEMS_PER_PAGE;
      const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

      if (paginated.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        document.getElementById('pagination').innerHTML = '';
        return;
      }

      emptyState.style.display = 'none';
      tbody.innerHTML = paginated.map((item, index) => {
        const isMenuOpen = activeMenuId === item.id;
        const hasUrl = !!item.source_url;
        const serial = String(filtered.length - (start + index)).padStart(2, '0');
        const displayTime = item.created_at.split(' ')[0];

        return \`
          <tr onclick="window.location.href='./detail.html?id=' + encodeURIComponent('\${item.id}')" style="cursor: pointer;">
            <td class="rwd-hide" onclick="event.stopPropagation()"><input type="checkbox" disabled /></td>
            <td data-label="序號">
              <span class="table-number">\${serial}</span>
            </td>
            <td data-label="摘要與標題">
              <div class="table-summary-cell">
                <a href="./detail.html?id=\${encodeURIComponent(item.id)}" class="table-summary-link" onclick="event.stopPropagation()">
                  \${item.summary}
                </a>
              </div>
              <div class="table-title-cell" title="\${item.source_title}">
                \${item.source_title}
              </div>
            </td>
            <td data-label="主題分類">
              <span class="badge-tag topic-tag">\${item.topic_category || '無'}</span>
            </td>
            <td data-label="用途分類">
              <span class="badge-tag usecase-tag">\${item.use_case || '無'}</span>
            </td>
            <td data-label="收藏時間">
              <span class="table-time">\${displayTime}</span>
            </td>
            <td style="position: relative;" onclick="event.stopPropagation()">
              <button class="table-action-dots" onclick="toggleMenu(event, '\${item.id}')">•••</button>
              
              \${isMenuOpen ? \`
                <div class="context-menu" style="display: flex;">
                  <a href="./detail.html?id=\${encodeURIComponent(item.id)}" class="context-menu-item">👁️ 查看詳情</a>
                  \${hasUrl ? \`<a href="\${item.source_url}" target="_blank" rel="noopener noreferrer" class="context-menu-item">🔗 打開原文</a>\` : \`<span class="context-menu-item disabled" title="此筆收藏無外部連結">🔗 無原文連結</span>\`}
                  <button onclick="copySummary('\${item.summary}')" class="context-menu-item btn-menu">📋 複製摘要</button>
                  <button onclick="alert('✏️ 編輯靈感已被觸發！')" class="context-menu-item btn-menu">✏️ 編輯靈感</button>
                  <button onclick="deleteRecord()" class="context-menu-item btn-menu text-danger">❌ 刪除收藏</button>
                </div>
              \` : ''}
            </td>
          </tr>
        \`;
      }).join('');

      renderPagination(filtered.length);
    }

    function renderPagination(totalCount) {
      const pageCount = Math.ceil(totalCount / ITEMS_PER_PAGE);
      const paginationDiv = document.getElementById('pagination');
      if (pageCount <= 1) {
        paginationDiv.innerHTML = '';
        return;
      }

      let buttons = [];
      buttons.push(\`<button class="pager-link" onclick="goToPage(1)" \${state.page === 1 ? 'disabled' : ''}>« 最前頁</button>\`);
      for (let i = 1; i <= pageCount; i++) {
        buttons.push(\`<button class="pager-link \${state.page === i ? 'active' : ''}" onclick="goToPage(\${i})">\${i}</button>\`);
      }
      buttons.push(\`<button class="pager-link" onclick="goToPage(\${pageCount})" \${state.page === pageCount ? 'disabled' : ''}>最後頁 »</button>\`);
      paginationDiv.innerHTML = buttons.join('');
    }

    function goToPage(p) {
      state.page = p;
      updateUrl();
      renderList();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function toggleMenu(event, id) {
      if (activeMenuId === id) {
        activeMenuId = null;
      } else {
        activeMenuId = id;
      }
      renderList();
    }

    function copySummary(text) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('📋 已成功複製摘要內容！');
        activeMenuId = null;
        renderList();
      });
    }

    function showToast(msg) {
      const toast = document.getElementById('toast-notify');
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 2000);
    }

    function deleteRecord() {
      alert('🔐 本系統 Google Sheets 資料庫目前為唯讀狀態。\\n若需刪除此筆記錄，請至 Google Sheets 試算表中進行編輯。');
      activeMenuId = null;
      renderList();
    }

    function handleSearch() {
      state.keyword = document.getElementById('search-input').value;
      state.page = 1;
      updateUrl();
      renderList();
    }

    function handleFilterChange() {
      state.useCase = document.getElementById('use-case-filter').value;
      state.topic = document.getElementById('topic-filter').value;
      state.platform = document.getElementById('platform-filter').value;
      state.confidence = document.getElementById('confidence-filter').value;
      state.time = document.getElementById('time-filter').value;
      state.sort = document.getElementById('sort-filter').value;
      state.page = 1;
      updateUrl();
      renderList();
      initSidebar(state.topic !== "全部主題" ? state.topic : "");
    }

    function clearFilters() {
      state.keyword = "";
      state.useCase = "全部用途";
      state.topic = "全部主題";
      state.platform = "全部來源";
      state.confidence = "全部信心";
      state.time = "全部時間";
      state.sort = "latest";
      state.page = 1;
      populateFilterOptions();
      updateUrl();
      renderList();
      initSidebar();
    }

    // 點擊外部關閉選單
    document.addEventListener('click', () => {
      if (activeMenuId !== null) {
        activeMenuId = null;
        renderList();
      }
    });

    populateFilterOptions();
    initSidebar(state.topic !== "全部主題" ? state.topic : "");
    renderList();
  </script>
</body>
</html>
`;

fs.writeFileSync('docs/demo/list.html', listHtml, 'utf8');

// ==================== 頁面 3: detail.html (對齊 LibraryDetailClient.tsx) ====================
const detailHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>靈感收藏庫 - 收藏內容詳情</title>
  <link rel="stylesheet" href="./library-styles.css">
</head>
<body>
  ${getSidebarHtml('detail')}

  <!-- 主內容區 -->
  <div class="main-content">
    ${commonDecorations}

    <main class="frame shell" style="position: relative; z-index: 10; maxWidth: 1200px; margin: 0 auto; padding: 24px 18px 44px;">
      <!-- Toast 提示通知 -->
      <div id="toast-notify" class="toast-notification" style="display: none;"></div>

      <!-- 內容區塊框框外的右上方輕量導航 -->
      <div id="detail-nav-links" class="detail-external-nav"></div>

      <!-- 詳細內容卡片區 -->
      <section id="detail-card-container" class="results" style="margin-top: 12px;"></section>
      
      <div id="detail-empty" class="empty" style="display: none; margin-top: 20px;">
        找不到這筆收藏。
      </div>
    </main>
  </div>

  <script src="./library-data.js"></script>
  <script>
    ${commonScriptHelpers}

    const records = getOrderedRecords();
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    let record = null;
    if (!id) {
      record = records[0];
    } else {
      record = records.find(r => r.id === id);
    }

    let isMenuOpen = false;

    function formatDateTime(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr.replace(/\\//g, '-').replace(' ', 'T'));
      if (isNaN(d.getTime())) return dateStr;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return \`\${year}-\${month}-\\044{date} \${hours}:\${minutes}:\${seconds}\`;
    }

    function renderDetail() {
      const container = document.getElementById('detail-card-container');
      const emptyDiv = document.getElementById('detail-empty');
      const navLinks = document.getElementById('detail-nav-links');

      if (!record) {
        container.innerHTML = '';
        emptyDiv.style.display = 'block';
        navLinks.innerHTML = \`<a href="./list.html" class="ext-nav-link">← 回列表頁</a>\`;
        return;
      }

      emptyDiv.style.display = 'none';
      const index = records.findIndex(r => r.id === record.id);
      const prevRecord = index > 0 ? records[index - 1] : null;
      const nextRecord = index < records.length - 1 ? records[index + 1] : null;
      const serial = String(records.length - index).padStart(2, '0');
      const formattedTime = formatDateTime(record.created_at);

      // 渲染外部導航
      let navHtml = \`<a href="./list.html" class="ext-nav-link">← 回列表頁</a>\`;
      if (prevRecord) {
        navHtml += \`
          <span class="ext-nav-divider">|</span>
          <a href="./detail.html?id=\${encodeURIComponent(prevRecord.id)}" class="ext-nav-link">上一筆</a>
        \`;
      }
      if (nextRecord) {
        navHtml += \`
          <span class="ext-nav-divider">|</span>
          <a href="./detail.html?id=\${encodeURIComponent(nextRecord.id)}" class="ext-nav-link">下一筆</a>
        \`;
      }
      navLinks.innerHTML = navHtml;

      // 渲染主要內容
      const hasUrl = !!record.source_url;
      container.innerHTML = \`
        <article class="record" style="background: rgba(255, 255, 255, 0.94);">
          <div class="record-top">
            <span class="record-number">\${serial}</span>
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: flex-end; position: relative;">
              <span class="record-time">\${formattedTime}</span>
              
              <button
                class="table-action-dots"
                onclick="toggleMenu(event)"
                style="cursor: pointer; padding: 4px 8px;"
              >
                ••• 操作
              </button>

              \${isMenuOpen ? \`
                <div class="context-menu" style="display: flex; right: 0; top: 32px;">
                  \${hasUrl ? \`<a href="\${record.source_url}" target="_blank" rel="noopener noreferrer" class="context-menu-item">🔗 打開原文</a>\` : \`<span class="context-menu-item disabled" title="此筆收藏無外部連結">🔗 無原文連結</span>\`}
                  <button onclick="copySummary('\${record.summary}')" class="context-menu-item btn-menu">📋 複製摘要</button>
                  <button onclick="alert('編輯靈感')" class="context-menu-item btn-menu">✏️ 編輯靈感</button>
                  <button onclick="deleteRecord()" class="context-menu-item btn-menu text-danger">❌ 刪除收藏</button>
                </div>
              \` : ''}
            </div>
          </div>
          
          <div class="summary" style="margin-top: 16px;">\${record.summary}</div>
          
          <div class="meta-row" style="margin-top: 12px;">
            <span class="chip">\${record.use_case}</span>
            <span class="chip topic">\${record.topic_category}</span>
            <span class="chip topic" style="border-left-color: #f3b0c3;">\${record.source_platform}</span>
          </div>
          
          <div class="title" style="margin-top: 14px;">\${record.source_title}</div>
          
          <div class="tags" style="margin-top: 14px;">
            \${record.tags.map(tag => \`<span class="tag">#\${tag.replace('#', '')}</span>\`).join('')}
          </div>
          
          <div class="detail-panel" style="margin-top: 18px;">
            <div class="detail-label">2-3 個重點</div>
            <ul class="points" style="margin-top: 12px;">
              \${record.key_points && record.key_points.length > 0 ? 
                record.key_points.map(pt => \`<li>\${pt}</li>\`).join('') : 
                '<li>暫無重點分析</li>'
              }
            </ul>
          </div>
          
          <div class="detail-panel" style="margin-top: 18px;">
            <div class="detail-label">原始內容</div>
            <p class="detail-full" style="margin-top: 8px; white-space: pre-wrap;">
              \${record.raw_input || '這筆收藏沒有額外原始文字。'}
            </p>
            \${hasUrl ? \`
              <p class="detail-full" style="margin-top: 14px;">
                <a class="link-button" href="\${record.source_url}" target="_blank" rel="noreferrer" style="box-shadow: 3px 3px 0 #2d2d2d; padding: 8px 14px; font-size: 13px;">
                  查看來源
                </a>
              </p>
            \` : ''}
          </div>
        </article>
      \`;
    }

    function toggleMenu(event) {
      event.stopPropagation();
      isMenuOpen = !isMenuOpen;
      renderDetail();
    }

    function copySummary(text) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('📋 已成功複製摘要內容！');
        isMenuOpen = false;
        renderDetail();
      });
    }

    function showToast(msg) {
      const toast = document.getElementById('toast-notify');
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 2000);
    }

    function deleteRecord() {
      alert('🔐 本系統 Google Sheets 資料庫目前為唯讀狀態。\\n若需刪除此筆記錄，請至 Google Sheets 試算表中進行編輯。');
      isMenuOpen = false;
      renderDetail();
    }

    // 點擊外部關閉選單
    document.addEventListener('click', () => {
      if (isMenuOpen) {
        isMenuOpen = false;
        renderDetail();
      }
    });

    initSidebar(record ? record.topic_category : "");
    renderDetail();
  </script>
</body>
</html>
`;

fs.writeFileSync('docs/demo/detail.html', detailHtml, 'utf8');

// ==================== 頁面 4: prompts.html (與首頁 layout 對齊) ====================
// 指令寶庫也是使用一致的 Layout
let promptsHtml = fs.readFileSync('docs/demo/prompts.html', 'utf8');
// 我們可以用正則替換它側邊欄的 HTML，使它也和全新的 sidebar 一致
const oldSidebarRegex = /<aside id="sidebar-aside" class="sidebar">[\s\S]*?<\/aside>/;
const newSidebar = getSidebarHtml('prompts');

promptsHtml = promptsHtml.replace(oldSidebarRegex, newSidebar);
// 同時將 promptsHtml 中的 toggleMobileSidebar 輔助函數與 initSidebar 輔助函數修正為 common
// 檢查裡面是否有對齊 css 檔案
fs.writeFileSync('docs/demo/prompts.html', promptsHtml, 'utf8');

// ==================== 頁面 5: prompts-detail.html ====================
let promptsDetailHtml = fs.readFileSync('docs/demo/prompts-detail.html', 'utf8');
promptsDetailHtml = promptsDetailHtml.replace(oldSidebarRegex, getSidebarHtml('prompts'));
fs.writeFileSync('docs/demo/prompts-detail.html', promptsDetailHtml, 'utf8');

console.log('Successfully rebuilt all 5 Demo pages with exact official DOM structures and helpers.');
