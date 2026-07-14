"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";

export const ActiveCollaborators = () => {
  const others = useOthers();
  const currentUser = useSelf();
  
  const allUsers = currentUser ? [currentUser, ...others] : others;
  const MAX_VISIBLE = 4;
  const visibleUsers = allUsers.slice(0, MAX_VISIBLE);
  const extraUsersCount = allUsers.length - MAX_VISIBLE;

  if (allUsers.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2.5 overflow-visible px-2">
      {visibleUsers.map((user, index) => {
        const name = (user.info?.name as string) || "Anonymous";
        // Fixed TypeScript Error: Explicitly typing color as string
        const color = (user.info?.color as string) || "#8B5CF6"; 
        const avatar = (user.info?.avatar as string) || `https://ui-avatars.com/api/?name=${name}&background=0D0D0D&color=fff`;

        return (
          <div
            key={user.connectionId || index}
            className="relative w-8 h-8 rounded-md border-2 border-black bg-zinc-900 group shadow-md transition-transform hover:-translate-y-1 hover:z-20 cursor-default"
            style={{ zIndex: 10 - index }}
            title={name}
          >
            <img
              src={avatar}
              alt={name}
              className="w-full h-full rounded-md object-cover"
            />
            <div 
              className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-black"
              // TypeScript will now accept this as a valid CSS value
              style={{ backgroundColor: color }} 
            ></div>
          </div>
        );
      })}

      {extraUsersCount > 0 && (
        <div 
          className="relative w-8 h-8 rounded-md border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-300 z-0 shadow-inner"
        >
          +{extraUsersCount}
        </div>
      )}
    </div>
  );
};