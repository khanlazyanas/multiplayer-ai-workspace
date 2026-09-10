"use client";

import { LiveKitRoom, RoomAudioRenderer, ControlBar, useParticipants } from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export function AudioHuddle({ roomId }: { roomId: string }) {
  const { user } = useUser();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!user?.firstName) return;
    const name = `${user.firstName} ${user.lastName || ""}`.trim();
    
    (async () => {
      try {
        const resp = await fetch(`/api/livekit?room=${roomId}&username=${name}`);
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error("Failed to fetch LiveKit token", e);
      }
    })();
  }, [roomId, user?.firstName, user?.lastName]);

  if (token === "") {
    return null; // Token aane tak hide rakho
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#0A0A0A] border border-zinc-800 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.15)] overflow-hidden">
      <LiveKitRoom
        video={false}
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        className="flex flex-col items-center justify-center p-2"
      >
        <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 rounded-xl mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-zinc-300">Live Huddle</span>
          <ActiveUsersCount />
        </div>
        
        {/* LiveKit ka default audio controls (Mic On/Off) */}
        <ControlBar variation="minimal" controls={{ microphone: true, camera: false, screenShare: false }} />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

// Chhota sub-component active users dikhane ke liye
function ActiveUsersCount() {
  const participants = useParticipants();
  return <span className="text-xs text-zinc-500">({participants.length} online)</span>;
}