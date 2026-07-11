"use client";

import { CollaborativeRoom } from "@/components/live/CollaborativeRoom";
import { LiveCursors } from "@/components/live/LiveCursors";
import Editor from "@/components/editor/Editor"; 
import { useMyPresence, useOthersListener } from "@liveblocks/react/suspense"; // Added useOthersListener
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { ActiveUsers } from "@/components/live/ActiveUsers";
import { DocumentTitle } from "@/components/live/DocumentTitle";
import { useEffect } from "react";
import toast from "react-hot-toast"; // Added import

function WorkspaceCanvas({ roomId }: { roomId: string }) {
  const [, updateMyPresence] = useMyPresence();
  const { isLoaded, isSignedIn } = useAuth();

  // Save room to local storage history
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

  // Listen for other users joining or leaving the room
  useOthersListener(({ event, user }) => {
    if (event.type === "enter") {
      toast.success(`${user.info?.name || "Someone"} joined the workspace`);
    }
    if (event.type === "leave") {
      toast(`${user.info?.name || "Someone"} left the workspace`, { icon: '👋' });
    }
  });

  if (!isLoaded || !isSignedIn) return null;

  const displayRoomId = roomId ? roomId.slice(0, 8) : "Loading";

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
      
      <div className="w-full max-w-5xl flex justify-between items-center px-6 mb-8 z-20">
        <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors border border-slate-700">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 backdrop-blur-sm shadow-md">
          
          <div className="hidden sm:block border-r border-slate-700 pr-4">
            <DocumentTitle initialTitle={`Workspace-${displayRoomId}`} />
          </div>
          
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

export default function RoomPage({ params }: { params: any }) {
  const safeRoomId = params?.id || "default-room";
  
  return (
    <CollaborativeRoom roomId={safeRoomId}>
      <WorkspaceCanvas roomId={safeRoomId} />
    </CollaborativeRoom>
  );
}