"use client";

import { useOthers, useSelf } from "@liveblocks/react";

export const ActiveUsers = () => {
  // Liveblocks hooks to get current users in the room
  const others = useOthers();
  const currentUser = useSelf();
  
  const hasMoreUsers = others.length > 3;

  return (
    <div className="flex items-center -space-x-2 mr-4">
      {/* Current User Avatar */}
      {currentUser && (
        <div 
          className="h-7 w-7 rounded-full bg-sky-500 ring-2 ring-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-md z-10" 
          title="You"
        >
          You
        </div>
      )}
      
      {/* Other Users Avatars */}
      {others.slice(0, 3).map(({ connectionId }) => (
        <div 
          key={connectionId} 
          className="h-7 w-7 rounded-full bg-indigo-500 ring-2 ring-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-md z-0"
          title={`User ${connectionId}`}
        >
          U{String(connectionId).slice(-1)}
        </div>
      ))}

      {/* +X More Indicator */}
      {hasMoreUsers && (
        <div className="h-7 w-7 rounded-full bg-slate-700 ring-2 ring-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-md z-0">
          +{others.length - 3}
        </div>
      )}
    </div>
  );
};