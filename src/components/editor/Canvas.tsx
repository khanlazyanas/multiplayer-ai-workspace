"use client";

import dynamic from "next/dynamic";
import "tldraw/tldraw.css";
import { CanvasErrorBoundary } from "@/components/editor/CanvasErrorBoundary"; // Import

const Tldraw = dynamic(() => import("tldraw").then((mod) => mod.Tldraw), { ssr: false });

export default function Canvas() {
  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', backgroundColor: '#111111' }}>
      <CanvasErrorBoundary>
        <Tldraw />
      </CanvasErrorBoundary>
    </div>
  );
}