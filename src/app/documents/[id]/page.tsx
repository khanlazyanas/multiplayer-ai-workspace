"use client";

import { CollaborativeRoom } from "@/components/live/CollaborativeRoom";
import { LiveCursors } from "@/components/live/LiveCursors";
import Editor from "@/components/editor/Editor"; 
import { useMyPresence, useOthersListener } from "@liveblocks/react/suspense"; 
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast"; 
import { DocumentTitle } from "@/components/live/DocumentTitle"; 
// 🔥 IMPORT ADDED HERE
import { ActiveCollaborators } from "@/components/live/ActiveCollaborators"; 

function WorkspaceCanvas({ roomId }: { roomId: string }) {
  const [, updateMyPresence] = useMyPresence();
  const { isLoaded, isSignedIn } = useAuth();
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    if (roomId) {
      const saved = localStorage.getItem("recent_workspaces");
      let workspaces = saved ? JSON.parse(saved) : [];
      if (!workspaces.includes(roomId)) {
        workspaces = [roomId, ...workspaces].slice(0, 6);
        localStorage.setItem("recent_workspaces", JSON.stringify(workspaces));
      }
    }
  }, [roomId]);

  useOthersListener(({ type, user }) => {
    if (type === "enter") {
      toast.success(`${(user.info?.name as string) || "Someone"} joined`, {
        style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' }
      });
    }
    if (type === "leave") {
      toast(`${(user.info?.name as string) || "Someone"} left`, { 
        icon: '👋',
        style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' }
      });
    }
  });

  const handleShare = () => {
    setIsCopying(true);
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied", {
        style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' }
      });
      setTimeout(() => setIsCopying(false), 2000);
    });
  };

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div 
      className="relative flex min-h-screen flex-col bg-black text-zinc-200 overflow-x-hidden font-sans custom-scrollbar selection:bg-violet-500/30 selection:text-violet-200"
      onPointerMove={(e) => {
        updateMyPresence({ cursor: { x: Math.round(e.clientX), y: Math.round(e.clientY) } });
      }}
      onPointerLeave={() => {
        updateMyPresence({ cursor: null });
      }}
    >
      <LiveCursors />
      
      {/* MINIMALIST ONYX HEADER */}
      <header className="flex items-center justify-between px-6 py-3 bg-black/80 backdrop-blur-2xl border-b border-zinc-800/80 sticky top-0 z-50">
        <div className="flex items-center gap-5">
          <Link 
            href="/" 
            title="Back to Dashboard"
            className="group flex items-center justify-center w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-violet-500/50 hover:bg-zinc-800 transition-all"
          >
            <svg className="w-4 h-4 text-zinc-400 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          
          <div className="w-px h-5 bg-zinc-800 hidden sm:block"></div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.1)]">
              <span className="text-zinc-100 text-xs font-bold">W</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <DocumentTitle />
              <span className="text-[10px] font-mono text-zinc-600 tracking-wider">ID: {roomId.slice(0,8)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          
          {/* SLEEK SHARE BUTTON */}
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-xs font-medium bg-white text-black hover:bg-zinc-200 px-4 py-1.5 rounded-md transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="hidden sm:block">{isCopying ? "Copied" : "Share"}</span>
          </button>

          {/* 🔥 ACTIVE COLLABORATORS ADDED HERE */}
          <div className="hidden md:flex items-center">
            <ActiveCollaborators />
          </div>

          {/* VERCEL-STYLE LIVE SYNC DOT */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 tracking-wider uppercase pl-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden lg:block">Sync</span>
          </div>
          
          <div className="pl-4 border-l border-zinc-800 flex items-center">
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 rounded-md border border-zinc-700 hover:border-violet-500 transition-colors" } }} />
          </div>
        </div>
      </header>

      {/* STEALTH A4 DOCUMENT CANVAS */}
      <main className="flex-1 overflow-y-auto py-10 px-4 md:px-0 flex justify-center w-full z-10 relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-2xl h-48 bg-violet-900/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-4xl bg-[#0A0A0A] border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl p-8 md:p-16 min-h-[850px] relative z-20">
          {/* 🔥 FIX: 'key' prop added to force re-render on new document load */}
          <Editor key={roomId} />
        </div>
      </main>
    </div>
  );
}

export default function RoomPage({ params }: { params: any }) {
  const safeRoomId = params?.id || "default-room";
  
  return (
    <CollaborativeRoom roomId={safeRoomId}>
      <WorkspaceCanvas roomId={safeRoomId} />
    </CollaborativeRoom>
  );
}