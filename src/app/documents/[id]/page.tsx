"use client";

import { CollaborativeRoom } from "@/components/live/CollaborativeRoom";
import { LiveCursors } from "@/components/live/LiveCursors";
import Editor from "@/components/editor/Editor"; 
import Canvas from "@/components/editor/Canvas"; 
import { useUpdateMyPresence, useOthersListener } from "@liveblocks/react/suspense"; 
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast"; 
import { DocumentTitle } from "@/components/live/DocumentTitle"; 
import { ActiveCollaborators } from "@/components/live/ActiveCollaborators"; 
import { useParams } from "next/navigation"; 

function WorkspaceCanvas({ roomId }: { roomId: string }) {
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
    if (type === "enter") toast.success(`${(user.info?.name as string) || "Someone"} joined`, { style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' }});
    if (type === "leave") toast(`${(user.info?.name as string) || "Someone"} left`, { icon: '👋', style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' }});
  });

  const handleShare = () => {
    setIsCopying(true);
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success("Link copied", { style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' }});
      setTimeout(() => setIsCopying(false), 2000);
    });
  };

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div 
      className="relative flex h-screen flex-col bg-black text-zinc-200 overflow-hidden font-sans custom-scrollbar selection:bg-violet-500/30 selection:text-violet-200"
      onPointerMove={(e) => {
        if (activeMode === "document") updateMyPresence({ cursor: { x: Math.round(e.clientX), y: Math.round(e.clientY) } });
      }}
      onPointerLeave={() => {
        if (activeMode === "document") updateMyPresence({ cursor: null });
      }}
    >
      {activeMode === "document" && <LiveCursors />}
      
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-black/80 backdrop-blur-2xl border-b border-zinc-800/80 sticky top-0 z-50">
        <div className="flex items-center gap-4 sm:gap-5 w-1/3">
          <Link href="/" className="group flex items-center justify-center w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-violet-500/50 hover:bg-zinc-800 transition-all shrink-0">
            <svg className="w-4 h-4 text-zinc-400 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div className="w-px h-5 bg-zinc-800 hidden sm:block"></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.1)] shrink-0"><span className="text-zinc-100 text-xs font-bold">W</span></div>
            <div className="hidden lg:flex flex-col"><DocumentTitle /><span className="text-[10px] font-mono text-zinc-600 tracking-wider">ID: {roomId.slice(0,8)}</span></div>
          </div>
        </div>

        <div className="flex justify-center w-1/3">
          <div className="flex bg-[#050505] p-1 rounded-xl border border-zinc-800 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] relative">
            <div className={`absolute top-1 bottom-1 w-[90px] sm:w-[110px] bg-zinc-800 rounded-lg shadow-sm transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${activeMode === 'document' ? 'left-1' : 'left-[94px] sm:left-[114px]'}`}></div>
            <button onClick={() => setActiveMode("document")} className={`relative z-10 w-[90px] sm:w-[110px] flex items-center justify-center gap-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold transition-colors duration-300 ${activeMode === 'document' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Editor</button>
            <button onClick={() => setActiveMode("canvas")} className={`relative z-10 w-[90px] sm:w-[110px] flex items-center justify-center gap-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold transition-colors duration-300 ${activeMode === 'canvas' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Canvas</button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 sm:gap-5 w-1/3">
          <button onClick={handleShare} className="flex items-center gap-2 text-xs font-medium bg-white text-black hover:bg-zinc-200 px-3 sm:px-4 py-1.5 rounded-md transition-all active:scale-95 shrink-0"><span className="hidden sm:block">{isCopying ? "Copied" : "Share"}</span></button>
          <div className="hidden md:flex items-center"><ActiveCollaborators /></div>
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-zinc-500 tracking-wider uppercase pl-2">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span><span>Sync</span>
          </div>
          <div className="pl-2 sm:pl-4 border-l border-zinc-800 flex items-center shrink-0"><UserButton appearance={{ elements: { avatarBox: "w-8 h-8 rounded-md border border-zinc-700 hover:border-violet-500 transition-colors" } }} /></div>
        </div>
      </header>

      {/* 🔥 THE FINAL LAYOUT: Clean conditional rendering */}
      <main className="flex-1 relative w-full overflow-hidden bg-[#0a0a0a]">
        {activeMode === "document" ? (
          <div className="absolute inset-0 overflow-y-auto flex justify-center z-10">
            <Editor key={roomId} />
          </div>
        ) : (
          <div className="absolute inset-0 z-10">
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