"use client";

import { CollaborativeRoom } from "@/components/live/CollaborativeRoom";
import { LiveCursors } from "@/components/live/LiveCursors";
import Editor from "@/components/editor/Editor"; 
import Canvas from "@/components/editor/Canvas"; 
// 🔥 FIX: Changed to useUpdateMyPresence to prevent massive re-renders
import { useUpdateMyPresence, useOthersListener } from "@liveblocks/react/suspense"; 
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast"; 
import { DocumentTitle } from "@/components/live/DocumentTitle"; 
import { ActiveCollaborators } from "@/components/live/ActiveCollaborators"; 
import { useParams } from "next/navigation"; 

function WorkspaceCanvas({ roomId }: { roomId: string }) {
  // 🔥 FIX: This will update cursor position without re-rendering the whole page!
  const updateMyPresence = useUpdateMyPresence();
  
  const { isLoaded, isSignedIn } = useAuth();
  const [isCopying, setIsCopying] = useState(false);
  const [activeMode, setActiveMode] = useState<"document" | "canvas">("document");

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
      className="relative flex h-screen flex-col bg-black text-zinc-200 overflow-hidden font-sans custom-scrollbar selection:bg-violet-500/30 selection:text-violet-200"
      onPointerMove={(e) => {
        updateMyPresence({ cursor: { x: Math.round(e.clientX), y: Math.round(e.clientY) } });
      }}
      onPointerLeave={() => {
        updateMyPresence({ cursor: null });
      }}
    >
      <LiveCursors />
      
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-black/80 backdrop-blur-2xl border-b border-zinc-800/80 sticky top-0 z-50">
        <div className="flex items-center gap-4 sm:gap-5 w-1/3">
          <Link 
            href="/" 
            title="Back to Dashboard"
            className="group flex items-center justify-center w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-violet-500/50 hover:bg-zinc-800 transition-all shrink-0"
          >
            <svg className="w-4 h-4 text-zinc-400 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          
          <div className="w-px h-5 bg-zinc-800 hidden sm:block"></div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.1)] shrink-0">
              <span className="text-zinc-100 text-xs font-bold">W</span>
            </div>
            <div className="hidden lg:flex flex-col">
              <DocumentTitle />
              <span className="text-[10px] font-mono text-zinc-600 tracking-wider">ID: {roomId.slice(0,8)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center w-1/3">
          <div className="flex bg-[#050505] p-1 rounded-xl border border-zinc-800 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] relative">
            <div 
              className={`absolute top-1 bottom-1 w-[90px] sm:w-[110px] bg-zinc-800 rounded-lg shadow-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${activeMode === 'document' ? 'left-1' : 'left-[94px] sm:left-[114px]'}`}
            ></div>
            
            <button
              onClick={() => setActiveMode("document")}
              className={`relative z-10 w-[90px] sm:w-[110px] flex items-center justify-center gap-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold transition-colors duration-300 ${activeMode === 'document' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Editor
            </button>
            <button
              onClick={() => setActiveMode("canvas")}
              className={`relative z-10 w-[90px] sm:w-[110px] flex items-center justify-center gap-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold transition-colors duration-300 ${activeMode === 'canvas' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
              Canvas
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 sm:gap-5 w-1/3">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-xs font-medium bg-white text-black hover:bg-zinc-200 px-3 sm:px-4 py-1.5 rounded-md transition-all active:scale-95 shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="hidden sm:block">{isCopying ? "Copied" : "Share"}</span>
          </button>

          <div className="hidden md:flex items-center">
            <ActiveCollaborators />
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-zinc-500 tracking-wider uppercase pl-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Sync</span>
          </div>
          
          <div className="pl-2 sm:pl-4 border-l border-zinc-800 flex items-center shrink-0">
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 rounded-md border border-zinc-700 hover:border-violet-500 transition-colors" } }} />
          </div>
        </div>
      </header>

      <main className={`flex-1 relative w-full z-10 ${activeMode === 'document' ? 'overflow-y-auto py-10 px-4 md:px-0 flex justify-center' : 'overflow-hidden bg-[#111111]'}`}>
        {activeMode === "document" ? (
          <>
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-2xl h-48 bg-violet-900/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="w-full max-w-4xl bg-[#0A0A0A] border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl p-8 md:p-16 min-h-[850px] relative z-20">
              <Editor key={roomId} />
            </div>
          </>
        ) : (
          <div className="w-full h-full relative">
            <Canvas />
          </div>
        )}
      </main>
    </div>
  );
}

export default function RoomPage() {
  const params = useParams();
  const safeRoomId = (params?.id as string) || "default-room";
  if (!params?.id) return null;
  
  return (
    <CollaborativeRoom roomId={safeRoomId}>
      <WorkspaceCanvas roomId={safeRoomId} />
    </CollaborativeRoom>
  );
}