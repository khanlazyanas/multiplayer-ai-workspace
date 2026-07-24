"use client";

import dynamic from 'next/dynamic';
import 'tldraw/tldraw.css';
import { useSelf } from "@liveblocks/react/suspense";

// 🔥 Dynamic import to prevent SSR issues
const Tldraw = dynamic(() => import('tldraw').then((mod) => mod.Tldraw), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-transparent">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin"></div>
        <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Loading Workspace...</p>
      </div>
    </div>
  )
});

export default function Canvas() {
  const canWrite = useSelf((me) => me.canWrite);

  return (
    // 🔥 FIX: Absolute positioning lagaya taaki flexbox isko squish na kar paye
    <div className="absolute inset-0 w-full h-full p-4 sm:p-6 md:p-8 pt-6 pb-6 animate-in fade-in duration-500">
      
      {/* 🌌 AMBIENT CANVAS BACKGROUND */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-[100%] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[150px] rounded-[100%] pointer-events-none z-0"></div>
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0 mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

      {/* 🎨 THE SPATIAL BOARD CONTAINER */}
      <div className="w-full h-full bg-[#0a0a0a]/90 backdrop-blur-xl rounded-[2rem] border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden relative z-10">
        
        {/* 🔥 FIX: TLDRAW REQUIRES THIS ABSOLUTE WRAPPER TO STRETCH */}
        <div className="absolute inset-0 z-10">
          <Tldraw 
            persistenceKey="multiplayer-canvas-store"
            onMount={(editor) => {
              editor.user.updateUserPreferences({ colorScheme: 'dark' });
              editor.updateInstanceState({ isReadonly: !canWrite });
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
          --color-panel: #111111 !important;
          --color-low: #000000 !important;
        }
      `}</style>
    </div>
  );
}