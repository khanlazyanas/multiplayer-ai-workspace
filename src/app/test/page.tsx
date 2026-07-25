"use client";

import dynamic from "next/dynamic";
import "tldraw/tldraw.css";

const Tldraw = dynamic(() => import("tldraw").then((mod) => mod.Tldraw), { ssr: false });

export default function TestPage() {
  return (
    <div style={{ position: 'absolute', inset: 0, width: '100vw', height: '100vh', backgroundColor: '#111111' }}>
      <Tldraw />
    </div>
  );
}