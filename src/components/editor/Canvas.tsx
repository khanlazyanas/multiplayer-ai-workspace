"use client";

import { useEffect, useState } from "react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

export default function Canvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    // 🔥 Pure strict absolute bounding box. No flexbox trickery, no re-rendering loops.
    <div style={{ position: "absolute", inset: 0, zIndex: 100 }}>
      <Tldraw />
    </div>
  );
}