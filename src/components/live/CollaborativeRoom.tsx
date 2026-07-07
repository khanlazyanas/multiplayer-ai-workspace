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
          <div className="flex min-h-screen items-center justify-center text-white bg-slate-900">
            Loading Workspace... ⏳
          </div>
        }
      >
        {children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}