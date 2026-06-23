'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  topicCategories: string[];
  totalCount: number;
}

export function Sidebar({ topicCategories, totalCount }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isHomeActive = pathname === '/';
  const isListActive = pathname === '/list';

  // 點擊連結後自動關閉手機版選單
  const handleLinkClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* 手機版選單切換按鈕 */}
      <button 
        className={`sidebar-mobile-toggle ${isMobileOpen ? 'active' : ''}`}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="切換選單"
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>

      {/* 手機版選單背景遮罩 */}
      {isMobileOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* 頂部 Logo */}
        <div className="sidebar-logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">靈感收藏庫</span>
        </div>

        {/* 總收藏統計 */}
        <div className="sidebar-stats">
          <span className="stats-label">靈感總數</span>
          <span className="stats-value">{totalCount}</span>
        </div>

        {/* 主選單 */}
        <nav className="sidebar-menu">
          <div className="menu-group-label">主要選單</div>
          <Link 
            href="/" 
            className={`menu-item ${isHomeActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <span className="menu-icon">📊</span>
            <span className="menu-text">控制台概覽</span>
          </Link>
          <Link 
            href="/list" 
            className={`menu-item ${isListActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <span className="menu-icon">📚</span>
            <span className="menu-text">所有靈感列表</span>
          </Link>
        </nav>

        {/* 主題入口選單 */}
        <div className="sidebar-topics">
          <div className="menu-group-label">主題快速入口</div>
          <div className="topic-list">
            {topicCategories.length > 0 ? (
              (() => {
                const sortedTopics = [...topicCategories].sort((a, b) => {
                  const priority = ['Prompt', 'AI 工具'];
                  const aIdx = priority.indexOf(a);
                  const bIdx = priority.indexOf(b);
                  
                  if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                  if (aIdx !== -1) return -1;
                  if (bIdx !== -1) return 1;
                  return a.localeCompare(b);
                });
                
                return sortedTopics.map((topic) => (
                  <Link
                    key={topic}
                    href={`/list?topic=${encodeURIComponent(topic)}`}
                    className="topic-item"
                    onClick={handleLinkClick}
                  >
                    <span className="topic-bullet">✦</span>
                    <span className="topic-name">{topic}</span>
                  </Link>
                ));
              })()
            ) : (
              <div className="topic-empty">暫無主題</div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
