"use client";

import { CollaborativeRoom } from "@/components/live/CollaborativeRoom";
import { LiveCursors } from "@/components/live/LiveCursors";
import { useMyPresence } from "@liveblocks/react/suspense";

function WorkspaceCanvas() {
  // Ye hook tumhare mouse ki position liveblocks par bhejta hai
  const [, updateMyPresence] = useMyPresence();

  return (
    <div 
      className="relative flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white overflow-hidden cursor-none"
      onPointerMove={(e) => {
        updateMyPresence({ cursor: { x: Math.round(e.clientX), y: Math.round(e.clientY) } });
      }}
      onPointerLeave={() => {
        updateMyPresence({ cursor: null });
      }}
    >
      {/* Ye component doosre logon ke cursors dikhayega */}
      <LiveCursors />
      
      <div className="text-center z-10 pointer-events-none">
        <h1 className="text-5xl font-extrabold text-sky-400 mb-6">
          Multiplayer Canvas Ready! 🚀
        </h1>
        <p className="text-gray-400 text-lg">
          Is URL (http://localhost:3000) ko ek naye tab me open karo<br/>aur dono screens ko aamne-saamne rakh kar jadoo dekho!
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <CollaborativeRoom roomId="workspace-room-1">
      <WorkspaceCanvas />
    </CollaborativeRoom>
  );
}