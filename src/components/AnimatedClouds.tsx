'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cloud } from 'lucide-react';

export function AnimatedClouds() {
  return (
    <>
      <motion.div 
        animate={{ x: [0, 20, 0] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-10 text-white fill-current opacity-20 pointer-events-none select-none z-[-10]"
      >
        <Cloud size={80} strokeWidth={1} className="drop-shadow-[4px_4px_0px_#4A4A4A]" />
      </motion.div>
      
      <motion.div 
        animate={{ x: [0, -25, 0] }} 
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 right-20 text-white fill-current opacity-15 pointer-events-none select-none z-[-10]"
      >
        <Cloud size={100} strokeWidth={1} className="drop-shadow-[4px_4px_0px_#4A4A4A]" />
      </motion.div>
    </>
  );
}
