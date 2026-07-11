"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";

export function ActiveUsers() {
  // Ye hook baki sabhi connected users ka data layega
  const others = useOthers();
  // Ye hook tumhara khud ka data layega
  const currentUser = useSelf();
  
  const hasMoreUsers = others.length > 3;

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2 overflow-hidden">
        
        {/* Baaki users ki profile photos */}
        {others.slice(0, 3).map(({ connectionId, info }) => (
          <div key={connectionId} className="relative w-8 h-8 rounded-full ring-2 ring-slate-900 bg-slate-800 z-10">
            <img 
              src={info?.avatar} 
              alt={info?.name || "User"} 
              className="w-full h-full rounded-full object-cover"
              title={info?.name} // Hover karne par naam dikhega
            />
          </div>
        ))}

        {/* Agar 3 se zyada log hain toh "+X" dikhayenge */}
        {hasMoreUsers && (
          <div className="z-20 flex w-8 h-8 items-center justify-center rounded-full ring-2 ring-slate-900 bg-slate-700 text-xs font-medium text-white">
            +{others.length - 3}
          </div>
        )}

        {/* Tumhari khud ki photo (Hamesha end mein aur alag border color ke sath) */}
        {currentUser && (
          <div className="relative w-8 h-8 rounded-full ring-2 ring-sky-500 bg-sky-500 z-30 shadow-[0_0_10px_rgba(14,165,233,0.5)]">
            <img 
              src={currentUser.info?.avatar} 
              alt="You" 
              className="w-full h-full rounded-full object-cover"
              title="You"
            />
          </div>
        )}
      </div>
    </div>
  );
}