"use client";

import dynamic from "next/dynamic";
import "tldraw/tldraw.css";

// 🔥 STRICT SSR BYPASS: Tldraw will only ever touch the browser
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
    // 🔥 Pure absolute wrapper. No flexbox layout to break the canvas dimensions.
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      <Tldraw />
    </div>
  );
}