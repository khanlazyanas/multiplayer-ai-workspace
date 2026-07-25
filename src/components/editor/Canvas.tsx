"use client";

import dynamic from "next/dynamic";

// 🔥 CSS IMPORT REMOVED FROM HERE (Bypass Next.js purging)
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
    // 🔥 FORCE VIEWPORT SIZING: Ab ye parent div par depend nahi karega
    <div style={{ position: "absolute", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 100 }}>
      <Tldraw />
    </div>
  );
}