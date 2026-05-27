'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search,
  ExternalLink, 
  Trash2, 
  Clock,
  Zap,
  Sparkles
} from 'lucide-react';
import { Inspiration } from '@/lib/sheets';

interface InspirationGridProps {
  initialData: Inspiration[];
}

export default function InspirationGrid({ initialData }: InspirationGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // 搜尋過濾
  const filteredData = initialData.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto relative z-10">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-4 py-2 px-6 bg-white border-3 border-keep-border rounded-2xl shadow-sticker rotate-[-1deg]"
        >
          <div className="bg-keep-pink p-2 rounded-xl border-2 border-keep-border">
            <Zap className="text-white fill-current" size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2D2D2D]">靈感收藏盒</h1>
        </motion.div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="搜尋心動靈感..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full border-3 border-keep-border bg-white focus:outline-none focus:ring-2 focus:ring-keep-pink shadow-sticker transition-all w-64 md:w-80 h-14"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-keep-border/50" />
          </div>
          <button className="bg-keep-yellow hover:bg-[#FFE082] p-4 rounded-full border-3 border-keep-border shadow-sticker active:translate-y-1 active:shadow-none transition-all">
            <Plus size={24} />
          </button>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[200px] gap-4 md:gap-6">
        {filteredData.map((item, index) => (
          <motion.div
            key={`${item.title}-${index}`}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: Math.min(index * 0.05, 0.5), type: 'spring', stiffness: 100 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`
              group relative flex flex-col justify-between p-5 md:p-6 
              border-3 border-keep-border rounded-[2rem] md:rounded-[2.5rem] 
              ${item.color} ${item.size?.replace('col-span-2', 'col-span-1 sm:col-span-2').replace('row-span-2', 'row-span-1 sm:row-span-2')} 
              shadow-sticker hover:shadow-sticker-hover transition-all
            `}
          >
            {/* 卡片標籤 */}
            <div className="flex justify-between items-start">
              <div className="flex flex-wrap gap-2">
                {item.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/60 backdrop-blur-sm border-2 border-keep-border rounded-full text-xs font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={item.source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-full border-2 border-keep-border hover:bg-keep-mint transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
                <button className="p-2 bg-white rounded-full border-2 border-keep-border hover:bg-red-400 hover:text-white transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* 卡片標題 */}
            <div className="mt-4">
              <h3 className="text-xl font-bold leading-snug mb-2 line-clamp-2">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 text-keep-border/60 text-sm">
                <Clock size={14} />
                <span>{item.time}</span>
              </div>
            </div>

            {/* 右下角小裝飾 (僅大張卡片) */}
            {item.size?.includes('col-span-2') && (
              <div className="absolute -bottom-2 -right-2 opacity-30 group-hover:opacity-100 transition-all group-hover:scale-110">
                <Sparkles className="text-keep-yellow" size={40} />
              </div>
            )}
          </motion.div>
        ))}
        
        {/* 空白提示卡片 (當沒有搜尋結果或初始無資料時) */}
        {filteredData.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center p-12 border-3 border-dashed border-keep-border/30 rounded-[2.5rem] bg-white/30"
          >
            <p className="text-keep-border/50 font-medium text-lg">
              {searchQuery ? "🔍 找不到相關靈感，試試別的關鍵字？" : "✨ 期待下一個心動瞬間..."}
            </p>
          </motion.div>
        )}
      </div>

      {/* Footer 提示 */}
      <footer className="mt-16 text-center text-keep-border/40 font-medium">
        <p>© 2026 靈感收藏盒 · 線上靈感捕捉計畫</p>
      </footer>
    </div>
  );
}
