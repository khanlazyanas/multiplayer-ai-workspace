"use client";

import { ReactNode } from "react";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";

export function CollaborativeRoom({ 
  roomId, 
  children 
}: { 
  roomId: string; 
  children: ReactNode; 
}) {
  return (
    <RoomProvider id={roomId} initialPresence={{ cursor: null }}>
      <ClientSideSuspense 
        fallback={
          /* 🔥 ULTRA PREMIUM OLED BLACK LOADING SCREEN */
          <div className="flex min-h-screen items-center justify-center bg-black text-violet-500 font-medium">
            <div className="flex flex-col items-center gap-5">
              <div className="w-8 h-8 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin"></div>
              <p className="tracking-[0.2em] text-xs text-zinc-500 uppercase font-mono">Syncing Workspace</p>
            </div>
          </div>
        }
      >
        {children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}