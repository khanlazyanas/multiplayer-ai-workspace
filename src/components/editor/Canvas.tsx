"use client";

import dynamic from "next/dynamic";
import "tldraw/tldraw.css";

// 🔥 SSR strictly disabled
const Tldraw = dynamic(() => import("tldraw").then((mod) => mod.Tldraw), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#111111]">
      <div className="w-8 h-8 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin"></div>
    </div>
  )
});

export default function Canvas() {
  return (
    // 🔥 Strict absolute bounding. No flexbox, no padding traps.
    <div className="absolute inset-0 w-full h-full z-[100] bg-[#111111]">
      <Tldraw 
        // ❌ REMOVED persistenceKey: Yehi wo chiz thi jo 5 second me IndexedDB crash karwa rahi thi!
        onMount={(editor) => {
          editor.user.updateUserPreferences({ colorScheme: 'dark' });
        }}
      />
    </div>
  );
}