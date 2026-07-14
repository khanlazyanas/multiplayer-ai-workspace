"use client";

import { CollaborativeRoom } from "@/components/live/CollaborativeRoom";
import { LiveCursors } from "@/components/live/LiveCursors";
import Editor from "@/components/editor/Editor"; 
import { useMyPresence, useOthersListener } from "@liveblocks/react/suspense"; 
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast"; 
// 🔥 FIX: DocumentTitle ko wapas import kiya
import { DocumentTitle } from "@/components/live/DocumentTitle"; 

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
      toast.success(`${user.info?.name || "Someone"} joined the workspace`);
    }
    if (type === "leave") {
      toast(`${user.info?.name || "Someone"} left the workspace`, { icon: '👋' });
    }
  });

  // 🔥 NAYA FEATURE: Share Link Function
  const handleShare = () => {
    setIsCopying(true);
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Workspace link copied to clipboard!");
      setTimeout(() => setIsCopying(false), 2000);
    });
  };

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div 
      className="relative flex min-h-screen flex-col bg-[#090E17] text-slate-200 overflow-x-hidden font-sans custom-scrollbar"
      onPointerMove={(e) => {
        updateMyPresence({ cursor: { x: Math.round(e.clientX), y: Math.round(e.clientY) } });
      }}
      onPointerLeave={() => {
        updateMyPresence({ cursor: null });
      }}
    >
      <LiveCursors />
      
      {/* ULTRA PREMIUM GLASSMORPHISM HEADER */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#090E17]/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-5">
          <Link 
            href="/" 
            title="Back to Dashboard"
            className="group flex items-center justify-center w-10 h-10 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:border-sky-500/50 hover:bg-slate-800 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 text-slate-400 group-hover:text-sky-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          
          <div className="w-px h-6 bg-slate-700/50 hidden sm:block"></div>
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
              <span className="text-white text-sm font-extrabold tracking-wider">W</span>
            </div>
            <div className="hidden sm:flex flex-col">
              {/* 🔥 FIX: DocumentTitle component wapas laga diya */}
              <DocumentTitle />
              <span className="text-[10px] font-mono text-slate-500 tracking-wider">ID: {roomId.slice(0,8)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* 🔥 SHARE BUTTON */}
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 px-4 py-2 rounded-lg border border-sky-500/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="hidden sm:block">{isCopying ? "Copied!" : "Share"}</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Sync
          </div>
          
          <div className="pl-2 border-l border-slate-700/50 flex items-center">
            <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 border-2 border-slate-700/50 hover:border-sky-500 transition-colors shadow-md" } }} />
          </div>
        </div>
      </header>

      {/* CENTERED A4 DOCUMENT CANVAS WITH GLOW */}
      <main className="flex-1 overflow-y-auto py-10 px-4 md:px-0 flex justify-center w-full z-10 relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-sky-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-4xl bg-[#0F1523] border border-slate-800/80 shadow-[0_0_60px_rgba(0,0,0,0.4)] rounded-2xl p-8 md:p-16 min-h-[850px] relative z-20">
          <Editor />
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