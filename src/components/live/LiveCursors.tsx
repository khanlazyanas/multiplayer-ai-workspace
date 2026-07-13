"use client"; // 🔥 FIX: Added missing use client directive

import { useOthers } from "@liveblocks/react/suspense";

const COLORS = ["#E57373", "#9575CD", "#4FC3F7", "#81C784", "#FFF176", "#FF8A65"];

export function LiveCursors() {
  const others = useOthers();

  return (
    <>
      {others.map(({ connectionId, presence }) => {
        if (presence == null || !presence.cursor) return null;

        return (
          <div
            key={connectionId}
            className="pointer-events-none absolute top-0 left-0 z-50 transition-transform duration-100 ease-out"
            style={{
              transform: `translateX(${presence.cursor.x}px) translateY(${presence.cursor.y}px)`,
            }}
          >
            {/* SVG Cursor Icon */}
            <svg
              className="w-6 h-6"
              style={{ fill: COLORS[connectionId % COLORS.length] }}
              stroke="white"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M5.653 2.653a.5.5 0 00-.69.69l14 14a.5.5 0 00.847-.417L18.435 9l5.053-5.053a.5.5 0 00-.707-.707L18.435 7.583V1.69a.5.5 0 00-.847-.417l-11.935 11.935z" />
            </svg>
          </div>
        );
      })}
    </>
  );
}