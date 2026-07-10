"use client";

import { CollaborativeRoom } from "@/components/live/CollaborativeRoom";
import { LiveCursors } from "@/components/live/LiveCursors";
import Editor from "@/components/editor/Editor"; 
import { useMyPresence } from "@liveblocks/react/suspense";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

function WorkspaceCanvas() {
  const [, updateMyPresence] = useMyPresence();
  
  // 🔐 isLoaded batayega ki Clerk ne check poora kar liya ya nahi
  const { isSignedIn, isLoaded } = useAuth();

  // Jab tak Clerk check kar raha hai, screen flickering rokne ke liye
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-sky-500 animate-pulse font-medium">
        Checking authentication... ⏳
      </div>
    );
  }

  // 🛑 AGAR BANDA LOGIN NAHI HAI - Usko bahar hi rok lo
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white relative overflow-hidden">
        {/* Background Design */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"></div>
        
        <div className="z-10 text-center flex flex-col items-center p-8 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-sky-500/20">
            <span className="text-white text-2xl font-bold">W</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">
            Secure Workspace
          </h1>
          <p className="text-slate-400 mb-8 text-sm">
            You need to be signed in to access the collaborative AI editor and team cursors.
          </p>
          
          <SignInButton mode="modal">
            <button className="w-full bg-sky-500 hover:bg-sky-400 text-white transition-all duration-200 px-6 py-3 rounded-lg font-bold shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)]">
              Sign In with Google
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // ✅ AGAR BANDA LOGIN HAI - Toh usko main Editor dikhao
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
      
      {/* 🚀 Header for Logged In User */}
      <div className="w-full max-w-5xl flex justify-end px-6 mb-8 z-20">
        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 backdrop-blur-sm shadow-md">
          <span className="text-sm text-slate-300 font-medium hidden sm:block">Active Workspace</span>
          <UserButton />
        </div>
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