"use client";

import dynamic from 'next/dynamic';
import 'tldraw/tldraw.css';

// 🔥 SSR completely disabled
const Tldraw = dynamic(() => import('tldraw').then((mod) => mod.Tldraw), { ssr: false });

export default function Canvas() {
  return (
    // 🔥 THE GOD-TIER FIX: 'fixed' positioning makes it IMPOSSIBLE to collapse. 
    // top: '72px' ensures it stays exactly below your header.
    <div 
      className="tl-theme__dark" 
      style={{ 
        position: 'fixed', 
        top: '72px', 
        left: '0', 
        right: '0', 
        bottom: '0', 
        zIndex: 40,
        backgroundColor: '#0a0a0a' 
      }}
    >
      <Tldraw />
    </div>
  );
}