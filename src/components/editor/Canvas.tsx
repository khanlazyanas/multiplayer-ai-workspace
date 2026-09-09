"use client";

import { memo } from "react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

// 🔥 THE TITANIUM SHIELD 🔥
// '() => true' ka matlab hai Next.js chahe hazar baar koshish kare, 
// ye component dobara refresh nahi hoga aur Tldraw apni memory nahi bhoolega.
const Canvas = memo(function Canvas() {
  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', backgroundColor: '#111111' }}>
      <Tldraw />
    </div>
  );
}, () => true);

export default Canvas;