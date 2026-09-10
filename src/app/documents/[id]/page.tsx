"use client";

import "tldraw/tldraw.css"; 
import { CollaborativeRoom } from "@/components/live/CollaborativeRoom";
import { LiveCursors } from "@/components/live/LiveCursors";
import Editor from "@/components/editor/Editor"; 
import Canvas from "@/components/editor/Canvas"; 
import { useUpdateMyPresence, useOthersListener } from "@liveblocks/react"; 
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast"; 
import { DocumentTitle } from "@/components/live/DocumentTitle"; 
import { ActiveCollaborators } from "@/components/live/ActiveCollaborators"; 
import { useParams } from "next/navigation"; 

// 🎙️ IMPORT THE AUDIO HUDDLE COMPONENT
import { AudioHuddle } from "@/components/live/AudioHuddle";

function WorkspaceUI({ 
  roomId, 
  activeMode, 
  setActiveMode 
}: { 
  roomId: string, 
  activeMode: "document" | "canvas", 
  setActiveMode: (mode: "document" | "canvas") => void 
}) {
  const updateMyPresence = useUpdateMyPresence();
  const [isCopying, setIsCopying] = useState(false);

  useOthersListener(({ type, user }) => {
    if (type === "enter") toast.success(`${(user.info?.name as string) || "Someone"} joined`, { style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' } });
    if (type === "leave") toast(`${(user.info?.name as string) || "Someone"} left`, { style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' } });
  });

  const handleShare = () => {
    setIsCopying(true);
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success("Link copied", { style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' } });
      setTimeout(() => setIsCopying(false), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full w-full pointer-events-none">
      
      {/* HEADER: Hamesha top par aur clickable rahega */}
      <header className="h-[60px] pointer-events-auto relative z-50 flex items-center justify-between px-4 sm:px-6 bg-black/80 backdrop-blur-2xl border-b border-zinc-800/80">
        <div className="flex items-center gap-4 sm:gap-5 w-1/3">
          <Link href="/" title="Back to Dashboard" className="group flex items-center justify-center w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-violet-500/50 hover:bg-zinc-800 transition-all shrink-0">
            <svg className="w-4 h-4 text-zinc-400 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div className="w-px h-5 bg-zinc-800 hidden sm:block"></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.1)] shrink-0"><span className="text-zinc-100 text-xs font-bold">W</span></div>
            <div className="hidden lg:flex flex-col"><DocumentTitle /><span className="text-[10px] font-mono text-zinc-600 tracking-wider">ID: {roomId.slice(0,8)}</span></div>
          </div>
        </div>

        <div className="flex justify-center w-1/3">
          <div className="flex bg-[#050505] p-1 rounded-xl border border-zinc-800 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] relative pointer-events-auto">
            <div className={`absolute top-1 bottom-1 w-[90px] sm:w-[110px] bg-zinc-800 rounded-lg shadow-sm transition-all duration-300 ${activeMode === 'document' ? 'left-1' : 'left-[94px] sm:left-[114px]'}`}></div>
            <button onClick={() => setActiveMode("document")} className={`relative z-10 w-[90px] sm:w-[110px] flex items-center justify-center gap-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold transition-colors ${activeMode === 'document' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
              Editor
            </button>
            <button onClick={() => setActiveMode("canvas")} className={`relative z-10 w-[90px] sm:w-[110px] flex items-center justify-center gap-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold transition-colors ${activeMode === 'canvas' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
              Canvas
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 sm:gap-5 w-1/3 pointer-events-auto">
          <button onClick={handleShare} className="flex items-center gap-2 text-xs font-medium bg-white text-black hover:bg-zinc-200 px-3 sm:px-4 py-1.5 rounded-md transition-all active:scale-95 shrink-0">
            <span className="hidden sm:block">{isCopying ? "Copied" : "Share"}</span>
          </button>
          <div className="hidden md:flex items-center"><ActiveCollaborators /></div>
          
          {/* 🔥 UPDATED PREMIUM USER BUTTON */}
          <div className="pl-2 sm:pl-4 border-l border-zinc-800 flex items-center shrink-0">
            <UserButton 
              appearance={{ 
                elements: { 
                  avatarBox: "w-8 h-8 rounded-md border border-zinc-700 hover:border-violet-500 transition-colors",
                  userPreviewMainIdentifier: "text-white font-semibold",
                  userPreviewSecondaryIdentifier: "text-zinc-400",
                  userButtonPopoverCard: "bg-[#0A0A0A] border border-zinc-800 shadow-[0_0_40px_rgba(139,92,246,0.1)]",
                  userButtonPopoverActionButton: "hover:bg-zinc-800/50 transition-colors",
                  userButtonPopoverActionButtonText: "text-zinc-200",
                  userButtonPopoverActionButtonIcon: "text-zinc-400"
                } 
              }} 
            />
          </div>
        </div>
      </header>

      {/* EDITOR AREA */}
      <main 
        className={`flex-1 w-full bg-black relative overflow-y-auto py-10 px-4 md:px-0 flex justify-center transition-opacity duration-300 ${
          activeMode === 'document' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onPointerMove={(e) => activeMode === "document" && updateMyPresence({ cursor: { x: Math.round(e.clientX), y: Math.round(e.clientY) } })}
        onPointerLeave={() => activeMode === "document" && updateMyPresence({ cursor: null })}
      >
        {activeMode === "document" && <LiveCursors />}
        <div className="w-full max-w-4xl bg-[#0A0A0A] border border-zinc-800 rounded-xl p-8 md:p-16 min-h-[850px] relative z-40">
          <Editor key={roomId} />
        </div>
      </main>

    </div>
  );
}

export default function RoomPage() {
  const params = useParams();
  const safeRoomId = (params?.id as string) || "default-room";
  const [activeMode, setActiveMode] = useState<"document" | "canvas">("document");
  
  const { isLoaded, isSignedIn } = useAuth();
  const [isAuthStable, setIsAuthStable] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) setIsAuthStable(true);
  }, [isLoaded, isSignedIn]);

  // 🔥 Canvas Memory Lock
  const memoizedCanvas = useMemo(() => <Canvas />, []);

  if (!params?.id || !isAuthStable) return <div className="w-full h-screen bg-black"></div>;
  
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-zinc-200">
      
      {/* 🚀 LAYER 1 (BOTTOM): CANVAS */}
      <div className="absolute top-[60px] left-0 right-0 bottom-0 z-0">
        {memoizedCanvas}
      </div>

      {/* 🚀 LAYER 2 (TOP): LIVEBLOCKS UI */}
      <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
        <CollaborativeRoom roomId={safeRoomId}>
          <WorkspaceUI roomId={safeRoomId} activeMode={activeMode} setActiveMode={setActiveMode} />
        </CollaborativeRoom>
      </div>

      {/* 🎙️ LAYER 3 (FLOATING): AUDIO HUDDLE */}
      <AudioHuddle roomId={safeRoomId} />
      
    </div>
  );
}