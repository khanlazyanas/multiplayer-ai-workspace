"use client";

import { ReactNode, useState, useEffect } from "react";
// 🔥 FIX: Import changed to normal "@liveblocks/react" (NO SUSPENSE)
import { RoomProvider } from "@liveblocks/react";

export function CollaborativeRoom({ 
  roomId, 
  children 
}: { 
  roomId: string; 
  children: ReactNode; 
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Ye manual state ensure karegi ki loading screen sirf pehli baar aaye
    setMounted(true);
  }, []);

  return (
    <RoomProvider id={roomId} initialPresence={{ cursor: null }}>
      {!mounted ? (
        <div className="flex min-h-screen items-center justify-center bg-black text-violet-500 font-medium">
          <div className="flex flex-col items-center gap-5">
            <div className="w-8 h-8 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin"></div>
            <p className="tracking-[0.2em] text-xs text-zinc-500 uppercase font-mono">Syncing Workspace</p>
          </div>
        </div>
      ) : (
        children
      )}
    </RoomProvider>
  );
}