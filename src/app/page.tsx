"use client";

import { CollaborativeRoom } from "@/components/live/CollaborativeRoom";
import { LiveCursors } from "@/components/live/LiveCursors";
import Editor from "@/components/editor/Editor"; 
import { useMyPresence } from "@liveblocks/react/suspense";


import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

function WorkspaceCanvas() {
  const [, updateMyPresence] = useMyPresence();
  
  // 🔐 Hook se check kar rahe hain ki user login hai ya nahi
  const { isSignedIn } = useAuth();

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
      
      {/* 🚀 Strict Authentication Header */}
      <div className="w-full max-w-5xl flex justify-end px-6 mb-8 z-20">
        {!isSignedIn ? (
          // Agar Login NAHI hai (SignedOut)
          <SignInButton mode="modal">
            <button className="bg-sky-500 hover:bg-sky-600 transition-colors px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-sky-500/30 text-white tracking-wide">
              Sign In to Collaborate
            </button>
          </SignInButton>
        ) : (
          // Agar Login HAI (SignedIn)
          <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 backdrop-blur-sm shadow-md">
            <span className="text-sm text-slate-300 font-medium hidden sm:block">Welcome to Workspace</span>
            <UserButton />
          </div>
        )}
      </div>

      <div className="text-center z-10 mb-6 pointer-events-none">
        <h1 className="text-4xl font-extrabold text-sky-400 mb-2">
          Multiplayer AI Workspace
        </h1>
        <p className="text-gray-400 text-md">
          Type below. Changes will sync instantly across all tabs.
        </p>
      </div>

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