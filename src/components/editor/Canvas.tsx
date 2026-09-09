"use client";

import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

export default function Canvas() {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#111111] z-50">
      <Tldraw />
    </div>
  );
}