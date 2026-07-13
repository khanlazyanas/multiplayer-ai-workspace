"use client";

import { useState, useRef, useEffect } from "react";
// 🔥 FIX: Changed to /suspense to match the rest of the application
import { useStorage, useMutation } from "@liveblocks/react/suspense";

export const DocumentTitle = ({ initialTitle }: { initialTitle?: string }) => {
  const roomTitle = useStorage((root: any) => root.title) || initialTitle || "live-workspace.md";
  
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(roomTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitle = useMutation(({ storage }, newTitle: string) => {
    storage.set("title", newTitle);
  }, []);

  useEffect(() => {
    if (!isEditing) {
      setLocalTitle(roomTitle);
    }
  }, [roomTitle, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (localTitle.trim() && localTitle !== roomTitle) {
      updateTitle(localTitle);
    } else {
      setLocalTitle(roomTitle);
    }
  };

  return (
    <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm font-medium tracking-wide ml-8">
      <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      
      {isEditing ? (
        <input
          ref={inputRef}
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setIsEditing(false);
              setLocalTitle(roomTitle);
            }
          }}
          className="bg-transparent border-b border-sky-500 outline-none text-slate-200 px-1 w-36 md:w-48 transition-all"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className="cursor-pointer hover:text-sky-400 hover:bg-sky-500/10 px-1 rounded transition-colors"
          title="Click to rename document"
        >
          {roomTitle}
        </span>
      )}
    </div>
  );
};