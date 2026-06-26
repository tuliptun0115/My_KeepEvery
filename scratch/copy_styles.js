const fs = require('fs');

const officialCss = fs.readFileSync('src/app/library.css', 'utf8');

const promptLibraryStyles = `
/* ==================== Prompt Library Styles ==================== */

.prompt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 20px;
  position: relative;
  z-index: 1;
}

.prompt-card {
  background: #ffffff;
  border: 3px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 250px;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.prompt-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: var(--shadow-hover);
}

.prompt-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.prompt-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  border: 2px solid var(--border);
  color: var(--text);
  background: var(--accent-soft);
  letter-spacing: 0.05em;
}

.prompt-badge.write { background: #ffe4ea; }
.prompt-badge.read { background: #dff6ef; }
.prompt-badge.execute { background: #fff8dd; }

.prompt-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.prompt-card-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text);
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.prompt-card-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  white-space: pre-wrap;
}

.prompt-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1.5px dashed rgba(45,45,45,0.12);
  padding-top: 12px;
}

.prompt-card-time {
  font-size: 11px;
  color: var(--muted);
  font-weight: 600;
}

.prompt-card-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid var(--border);
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 2px 2px 0 var(--border);
  transition: all 0.15s ease;
  color: var(--text);
  padding: 0;
}

.btn-icon:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 var(--border);
  background: #fff8dd;
}

.btn-icon:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 var(--border);
}

.btn-icon svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
}

/* 詳情頁 styles */
.prompt-detail-card {
  background: #ffffff;
  border: 3px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
  padding: 24px;
  margin-top: 20px;
  position: relative;
  z-index: 1;
}

.prompt-detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}

.prompt-detail-text {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text);
  white-space: pre-wrap;
  background: #fafafa;
  border: 3px solid var(--border);
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
  position: relative;
}

.prompt-copy-bubble {
  position: absolute;
  top: 10px;
  right: 10px;
}

.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: #1f1b18;
  color: #fff;
  padding: 12px 24px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  border: 3px solid var(--border);
  box-shadow: var(--shadow);
  z-index: 9999;
  opacity: 0;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s;
  pointer-events: none;
}

.toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}
`;

fs.writeFileSync('docs/demo/library-styles.css', officialCss + '\n' + promptLibraryStyles, 'utf8');
console.log('Successfully copied official CSS and appended Prompt Library styles.');
