"use client";

import { CollaborativeRoom } from "@/components/live/CollaborativeRoom";
import { LiveCursors } from "@/components/live/LiveCursors";
import Editor from "@/components/editor/Editor"; 
import { useMyPresence, useOthersListener } from "@liveblocks/react/suspense"; 
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import toast from "react-hot-toast"; 

function WorkspaceCanvas({ roomId }: { roomId: string }) {
  const [, updateMyPresence] = useMyPresence();
  const { isLoaded, isSignedIn } = useAuth();

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

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div 
      className="relative flex min-h-screen flex-col items-center py-6 bg-slate-900 text-white overflow-hidden"
      onPointerMove={(e) => {
        updateMyPresence({ cursor: { x: Math.round(e.clientX), y: Math.round(e.clientY) } });
      }}
      onPointerLeave={() => {
        updateMyPresence({ cursor: null });
      }}
    >
      <LiveCursors />
      
      {/* 🔥 Cleaned up Header: Removed duplicate DocumentTitle and ActiveUsers */}
      <div className="w-full max-w-6xl flex justify-between items-center px-6 mb-6 z-20">
        <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700 backdrop-blur-sm shadow-md">
          <span className="text-sm text-slate-400 font-medium hidden sm:block">My Account</span>
          <UserButton />
        </div>
      </div>

      <div className="z-10 w-full px-4">
        <Editor />
      </div>
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