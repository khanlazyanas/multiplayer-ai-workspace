"use client";

import { useOthers } from "@liveblocks/react/suspense";

export function LiveCursors() {
  const others = useOthers();

  return (
    <>
      {others.map(({ connectionId, presence, info }) => {
        // Agar user ka cursor screen par nahi hai, toh kuch mat dikhao
        if (!presence?.cursor) return null;

        // 🔥 Asli Name aur Color nikal rahe hain Liveblocks info se
        const color = (info?.color as string) || "#8B5CF6";
        const name = (info?.name as string) || "Anonymous";

        return (
          <div
            key={connectionId}
            className="pointer-events-none absolute top-0 left-0 z-[9999] transition-transform duration-100 ease-out"
            style={{
              transform: `translateX(${presence.cursor.x}px) translateY(${presence.cursor.y}px)`,
            }}
          >
            {/* SLEEK SVG CURSOR ICON */}
            <svg
              className="relative shadow-sm drop-shadow-md"
              width="24"
              height="36"
              viewBox="0 0 24 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill={color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* 🔥 PREMIUM NAME TAG BOX */}
            <div
              className="absolute left-5 top-5 rounded-md px-2 py-1 text-[11px] font-bold text-white whitespace-nowrap shadow-md transition-opacity duration-300"
              style={{ backgroundColor: color }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </>
  );
}