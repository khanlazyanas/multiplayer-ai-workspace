"use client";

import { CollaborativeRoom } from "@/components/live/CollaborativeRoom";
import { LiveCursors } from "@/components/live/LiveCursors";
import Editor from "@/components/editor/Editor"; 
import { useMyPresence } from "@liveblocks/react/suspense";
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { ActiveUsers } from "@/components/live/ActiveUsers";

function WorkspaceCanvas({ roomId }: { roomId: string }) {
  const [, updateMyPresence] = useMyPresence();
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded || !isSignedIn) return null; // Security check

  return (
    <div 
      className="relative flex min-h-screen flex-col items-center py-10 bg-slate-900 text-white overflow-hidden"
      onPointerMove={(e) => {
        updateMyPresence({ cursor: { x: Math.round(e.clientX), y: Math.round(e.clientY) } });
      }}
      onPointerLeave={() => {
        updateMyPresence({ cursor: null });
      }}
    >
      <LiveCursors />
      
      {/* 🚀 Cleaned Header */}
      <div className="w-full max-w-5xl flex justify-between items-center px-6 mb-8 z-20">
        <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors border border-slate-700">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 backdrop-blur-sm shadow-md">
          <span className="text-sm text-slate-400 font-mono hidden sm:block border-r border-slate-700 pr-4">
            {roomId.slice(0, 8)}
          </span>
          
          {/* 🔥 Ye raha humara naya Live Avatars Component */}
          <ActiveUsers />
          
          <UserButton />
        </div>
      </div>

      <div className="text-center z-10 mb-6 pointer-events-none">
        <h1 className="text-4xl font-extrabold text-sky-400 mb-2">
          Multiplayer AI Workspace
        </h1>
        <p className="text-gray-400 text-md">
          Invite others by sharing this URL.
        </p>
      </div>

      <div className="z-10 w-full px-4">
        <Editor />
      </div>
    </div>
  );
}

export default function RoomPage({ params }: { params: { id: string } }) {
  // Yahan params.id URL se aayega!
  return (
    <CollaborativeRoom roomId={params.id}>
      <WorkspaceCanvas roomId={params.id} />
    </CollaborativeRoom>
  );
}