"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";

export const ActiveUsers = () => {
  const others = useOthers();
  const currentUser = useSelf();
  
  const hasMoreUsers = others.length > 3;

  return (
    <div className="flex items-center -space-x-2 mr-4">
      {/* Current User Avatar */}
      {currentUser && (
        <div 
          className="h-7 w-7 rounded-full ring-2 ring-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-md z-10" 
          // 🔥 FIX: Added 'as string' to satisfy TypeScript
          style={{ backgroundColor: (currentUser.info?.color as string) || '#0ea5e9' }}
          title="You"
        >
          You
        </div>
      )}
      
      {/* Other Users Avatars */}
      {others.slice(0, 3).map(({ connectionId, info }) => (
        <div 
          key={connectionId} 
          className="h-7 w-7 rounded-full ring-2 ring-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-md z-0"
          // 🔥 FIX: Added 'as string' here as well
          style={{ backgroundColor: (info?.color as string) || '#6366f1' }}
          title={(info?.name as string) || `User ${connectionId}`}
        >
          {(info?.name as string) ? (info?.name as string).charAt(0).toUpperCase() : `U${String(connectionId).slice(-1)}`}
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