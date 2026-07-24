"use client";

import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import { useSelf } from "@liveblocks/react/suspense";

export default function Canvas() {
  const canWrite = useSelf((me) => me.canWrite);

  return (
    <div className="w-full h-full relative flex flex-col animate-in fade-in duration-500">
      
      {/* 🌌 AMBIENT CANVAS BACKGROUND */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-[100%] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[150px] rounded-[100%] pointer-events-none z-0"></div>
      
      {/* 🎨 THE SPATIAL BOARD */}
      <div className="flex-1 w-full h-full relative z-10 p-4 sm:p-6 md:p-8 pt-28 md:pt-36 pb-20 md:pb-24">
        <div className="w-full h-full bg-[#0a0a0a]/90 backdrop-blur-xl rounded-[2rem] border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden relative">
          
          <Tldraw 
            className="z-10"
            onMount={(editor) => {
              // 🔥 FIX: 'isDarkMode' ki jagah ab 'colorScheme: dark' use hota hai
              editor.user.updateUserPreferences({ colorScheme: 'dark' });
              editor.updateInstanceState({ isReadonly: !canWrite });
            }}
          />

          {/* Premium Inner Glow */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-20"></div>
        </div>
      </div>

      <style>{`
        /* Overriding Tldraw native UI to match our God-Tier dark mode */
        .tl-theme__dark {
          --color-background: transparent !important;
          --color-panel: #111111 !important;
          --color-low: #000000 !important;
        }
      `}</style>
    </div>
  );
}