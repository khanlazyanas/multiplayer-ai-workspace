"use client";

import { memo } from "react";
import dynamic from "next/dynamic";
import "tldraw/tldraw.css";

// 🔥 STRICT SSR BYPASS
const Tldraw = dynamic(() => import("tldraw").then((mod) => mod.Tldraw), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-8 h-8 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin"></div>
    </div>
  )
});

// 🔥 THE GOD-TIER FIX: React.memo() prevents ANY re-renders from Liveblocks syncing!
const Canvas = memo(function Canvas() {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: 0, zIndex: 50, backgroundColor: "#0a0a0a" }}>
      <Tldraw persistenceKey="multiplayer-canvas-v3" />
    </div>
  );
});

export default Canvas;