"use client";

import dynamic from "next/dynamic";
import "tldraw/tldraw.css";

// 🔥 200% FIX: Pure dynamic import with absolutely no persistence keys or custom mounts.
const Tldraw = dynamic(() => import("tldraw").then((mod) => mod.Tldraw), {
  ssr: false,
});

export default function Canvas() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Tldraw />
    </div>
  );
}