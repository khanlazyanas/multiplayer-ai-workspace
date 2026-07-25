"use client";

import { useState, useEffect } from 'react';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

export default function Canvas() {
  const [isMounted, setIsMounted] = useState(false);

  // 🔥 SSR BYPASS: Ye guarantee dega ki Canvas load hone ke baad kabhi unmount/hide na ho.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#0a0a0a] rounded-2xl z-50">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
      className="absolute inset-0 w-full h-full z-50 tl-theme__dark overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
      style={{ minHeight: '800px', backgroundColor: '#0a0a0a' }}
    >
      <Tldraw persistenceKey="stable-canvas-v2" />
    </div>
  );
}