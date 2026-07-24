"use client";

import dynamic from 'next/dynamic';
import 'tldraw/tldraw.css';

// 🔥 SSR Disabled completely
const Tldraw = dynamic(() => import('tldraw').then((mod) => mod.Tldraw), { 
  ssr: false 
});

export default function Canvas() {
  return (
    // 🔥 Pure strict absolute sizing with no complex wrappers
    <div className="absolute inset-0 w-full h-full p-4 sm:p-6 md:p-8 animate-in fade-in duration-500">
      
      {/* 🌌 AMBIENT CANVAS BACKGROUND */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-[100%] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[150px] rounded-[100%] pointer-events-none z-0"></div>
      
      <div className="w-full h-full relative bg-[#0a0a0a] rounded-[2rem] border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* 🎨 THE SPATIAL BOARD CONTAINER */}
        <div className="absolute inset-0 w-full h-full z-10">
          <Tldraw 
            onMount={(editor) => {
              // 🔥 FIX: Safe try-catch execution. Agar koi error aaya bhi toh screen crash nahi hogi!
              try {
                editor.user.updateUserPreferences({ colorScheme: 'dark' });
              } catch (err) {
                console.error("Tldraw configuration error:", err);
              }
            }}
          />
        </div>

        {/* Premium Inner Glow */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-20"></div>
      </div>

      <style>{`
        /* Overriding Tldraw native UI to match our God-Tier dark mode */
        .tl-theme__dark {
          --color-background: transparent !important;
        }
      `}</style>
    </div>
  );
}