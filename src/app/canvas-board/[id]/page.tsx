"use client";

import dynamic from "next/dynamic";
import "tldraw/tldraw.css";

const Tldraw = dynamic(() => import("tldraw").then((mod) => mod.Tldraw), { 
  ssr: false,
  loading: () => <div style={{ backgroundColor: '#111111', width: '100vw', height: '100vh' }} />
});

export default function CanvasBoard() {
  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', backgroundColor: '#111111' }}>
      <Tldraw />
    </div>
  );
}