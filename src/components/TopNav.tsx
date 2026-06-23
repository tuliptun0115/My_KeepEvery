'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TopNav() {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isList = pathname === '/list';
  const isDetail = pathname === '/detail';


  return (
    <header className="top-nav">
      {/* 左側頁籤與麵包屑導航 */}
      <div className="top-nav-left">
        <nav className="top-nav-tabs">
          <Link 
            href="/" 
            className={`nav-tab-item ${isHome ? 'active' : ''}`}
          >
            📊 控制台概覽
          </Link>
          <Link 
            href="/list" 
            className={`nav-tab-item ${isList ? 'active' : ''}`}
          >
            📚 所有靈感列表
          </Link>
          {isDetail && (
            <span className="nav-tab-item active">
              👁️ 靈感詳細內容
            </span>
          )}
        </nav>
      </div>

      {/* 右側通知與使用者資訊 */}
      <div className="top-nav-right">
        {/* 通知小鈴鐺 */}
        <button className="nav-icon-button" title="系統通知">
          <span className="icon">🔔</span>
          <span className="badge-dot"></span>
        </button>

        {/* 使用者資訊區塊 */}
        <div className="user-profile">
          <span className="user-name">管理員</span>
          <div className="user-avatar" title="Rami Malek">
            RM
          </div>
        </div>
      </div>
    </header>
  );
}
