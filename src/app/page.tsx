"use client";

import { CollaborativeRoom } from "@/components/live/CollaborativeRoom";
import { LiveCursors } from "@/components/live/LiveCursors";
import { Editor } from "@/components/editor/Editor";
import { useMyPresence } from "@liveblocks/react/suspense";

function WorkspaceCanvas() {
  const [, updateMyPresence] = useMyPresence();

  return (
    <div 
      className="relative flex min-h-screen flex-col items-center py-20 bg-slate-900 text-white overflow-hidden"
      onPointerMove={(e) => {
        updateMyPresence({ cursor: { x: Math.round(e.clientX), y: Math.round(e.clientY) } });
      }}
      onPointerLeave={() => {
        updateMyPresence({ cursor: null });
      }}
    >
      <LiveCursors />
      
      <div className="text-center z-10 mb-6">
        <h1 className="text-4xl font-extrabold text-sky-400 mb-2">
          Multiplayer AI Workspace
        </h1>
        <p className="text-gray-400 text-md">
          Type below. Changes will sync instantly across all tabs.
        </p>
      </div>

      {/* Humara Naya Real-time Editor */}
      <div className="z-10 w-full px-4">
        <Editor />
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