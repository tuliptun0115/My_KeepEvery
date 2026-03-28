'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, 
  Sparkles, 
  ExternalLink, 
  Trash2, 
  Plus, 
  Search,
  Hash,
  Clock,
  LayoutGrid,
  Zap
} from 'lucide-react';

// 模擬數據
const MOCK_INSPIRATIONS = [
  {
    id: 1,
    title: "日式清透感網頁設計靈感",
    tags: ["#設計", "#UI", "#極簡"],
    source: "https://example.com/item1",
    time: "1小時前",
    color: "bg-white",
    size: "col-span-2 row-span-2",
  },
  {
    id: 2,
    title: "草莓大福食譜筆記",
    tags: ["#美食", "#食譜"],
    source: "https://cook.com/st",
    time: "3小時前",
    color: "bg-keep-pink/20",
    size: "col-span-1 row-span-1",
  },
  {
    id: 3,
    title: "2026 前端技術趨勢預測",
    tags: ["#科技", "#前端"],
    source: "https://tech.blog/2026",
    time: "昨天",
    color: "bg-keep-mint/20",
    size: "col-span-1 row-span-2",
  },
  {
    id: 4,
    title: "宮崎駿動畫配色分析",
    tags: ["#藝術", "#配色"],
    source: "https://art.com/anime",
    time: "2天前",
    color: "bg-keep-yellow/20",
    size: "col-span-1 row-span-1",
  },
  {
    id: 5,
    title: "居家辦公植栽佈置建議",
    tags: ["#生活", "#植栽"],
    source: "https://living.com/plants",
    time: "3天前",
    color: "bg-white",
    size: "col-span-2 row-span-1",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFF0F3] bg-gradient-to-b from-keep-pink/10 to-white text-keep-border font-sans p-6 md:p-12 relative overflow-hidden">
      
      {/* 裝飾性背景元素 - 雲朵 */}
      <motion.div 
        animate={{ x: [0, 20, 0] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-10 text-white fill-current opacity-80"
      >
        <Cloud size={80} strokeWidth={1} className="drop-shadow-sticker" />
      </motion.div>
      
      <motion.div 
        animate={{ x: [0, -25, 0] }} 
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 right-20 text-white fill-current opacity-60"
      >
        <Cloud size={100} strokeWidth={1} className="drop-shadow-sticker" />
      </motion.div>

      {/* 裝飾性花瓣/星星 */}
      <Sparkles className="absolute bottom-32 left-8 md:bottom-20 md:left-20 text-keep-yellow opacity-50 animate-pulse hidden sm:block" size={32} />
      <div className="absolute bottom-32 right-8 md:bottom-10 md:right-10 hidden sm:flex gap-2">
        <div className="w-8 h-8 rounded-full bg-keep-pink border-2 border-keep-border sticker-shadow" />
        <div className="w-8 h-8 rounded-full bg-keep-mint border-2 border-keep-border sticker-shadow" />
      </div>

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
            <h1 className="text-3xl font-bold tracking-tight">靈感收藏盒</h1>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="搜尋心動靈感..." 
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
          {MOCK_INSPIRATIONS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`
                group relative flex flex-col justify-between p-5 md:p-6 
                border-3 border-keep-border rounded-[2rem] md:rounded-[2.5rem] 
                ${item.color} ${item.size.replace('col-span-2', 'col-span-1 sm:col-span-2').replace('row-span-2', 'row-span-1 sm:row-span-2')} 
                shadow-sticker hover:shadow-sticker-hover transition-all
              `}
            >
              {/* 卡片標籤 */}
              <div className="flex justify-between items-start">
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/60 backdrop-blur-sm border-2 border-keep-border rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-white rounded-full border-2 border-keep-border hover:bg-keep-mint transition-colors">
                    <ExternalLink size={16} />
                  </button>
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
              {item.size.includes('col-span-2') && (
                <div className="absolute -bottom-2 -right-2 opacity-30 group-hover:opacity-100 transition-all group-hover:scale-110">
                  <Sparkles className="text-keep-yellow" size={40} />
                </div>
              )}
            </motion.div>
          ))}
          
          {/* 空白提示卡片 */}
          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="md:col-span-2 flex flex-col items-center justify-center p-6 border-3 border-dashed border-keep-border/30 rounded-[2.5rem] bg-white/30"
          >
            <p className="text-keep-border/50 font-medium">✨ 期待下一個心動瞬間...</p>
          </motion.div>
        </div>

        {/* Footer 提示 */}
        <footer className="mt-16 text-center text-keep-border/40 font-medium">
          <p>© 2026 靈感收藏盒 · 線上靈感捕捉計畫</p>
        </footer>
      </div>

      <style jsx global>{`
        .rotate-[-1deg] { transform: rotate(-1deg); }
        .border-3 { border-width: 3px; }
      `}</style>
    </div>
  );
}
