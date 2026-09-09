"use client";

import dynamic from "next/dynamic";
import "tldraw/tldraw.css";

// 🔥 Ultra clean dynamic import without extra boilerplate
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
    <div className="absolute inset-0 w-full h-full bg-[#111111] z-50">
      <Tldraw />
    </div>
  );
}