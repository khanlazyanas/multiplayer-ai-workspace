"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "tldraw/tldraw.css";

const Tldraw = dynamic(() => import("tldraw").then((mod) => mod.Tldraw), { 
  ssr: false 
});

export default function Canvas() {
  const renderCount = useRef(0);
  const [isCrashed, setIsCrashed] = useState(false);
  renderCount.current++;

  useEffect(() => {
    console.log(`[DEBUG] 🟢 CANVAS MOUNTED (DOM mein aa gaya) - Time: ${new Date().toLocaleTimeString()}`);
    
    return () => {
      console.warn(`[DEBUG] 🔴 CANVAS UNMOUNTED (React ne isko delete kar diya!) - Time: ${new Date().toLocaleTimeString()}`);
    };
  }, []);

  console.log(`[DEBUG] 🟡 Canvas Render Triggered. Total Renders: ${renderCount.current}`);

  if (isCrashed) {
    return <div className="text-red-500 p-10">Canvas Crashed! Check Console.</div>;
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-[#111111] z-50 border-4 border-red-500">
      {/* Red border lagaya hai taaki pata chale canvas ka container zinda hai ya nahi */}
      <Tldraw />
    </div>
  );
}