"use client";

import { useEffect, useState } from "react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

export default function Canvas({ roomId }: { roomId: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ye line Next.js ko SSR mein Tldraw chalane se rokti hai
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#111111] z-50">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-[#111111] z-50">
      <Tldraw persistenceKey={`tldraw-room-${roomId}`} />
    </div>
  );
}