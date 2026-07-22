"use client";

import { useState, useRef, useEffect } from "react";
// 🔥 Add useSelf here to check permissions
import { useStorage, useMutation, useSelf } from "@liveblocks/react/suspense";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

export const DocumentTitle = ({ initialTitle }: { initialTitle?: string }) => {
  const roomTitle = useStorage((root: any) => root.title) || initialTitle || "Untitled Workspace";
  const params = useParams(); // URL se roomId nikalne ke liye
  
  // 🔥 THE LOCK: Check if the current user has write access
  const canWrite = useSelf((me) => me.canWrite);
  
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(roomTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Liveblocks me update karna (Real-time for other users)
  const updateLiveblocksTitle = useMutation(({ storage }, newTitle: string) => {
    storage.set("title", newTitle);
  }, []);

  // 2. MongoDB me update karna (For Dashboard)
  const updateDatabaseTitle = async (newTitle: string) => {
    if (!params?.id) return;
    
    try {
      const res = await fetch(`/api/workspaces/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!res.ok) throw new Error("Failed to sync title to database");
    } catch (error) {
      console.error(error);
      toast.error("Title not synced to dashboard");
    }
  };

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
    const finalTitle = localTitle.trim();
    
    if (finalTitle && finalTitle !== roomTitle) {
      updateLiveblocksTitle(finalTitle); // Real-time sync
      updateDatabaseTitle(finalTitle);   // Database sync
    } else {
      setLocalTitle(roomTitle);
    }
  };

  return (
    <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm font-medium tracking-wide ml-8">
      <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      
      {isEditing && canWrite ? (
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
          onClick={() => {
            if (canWrite) setIsEditing(true); // 🔥 Sirf tabhi edit mode on hoga jab canWrite true ho
          }}
          className={`px-1 rounded transition-colors ${
            canWrite 
              ? "cursor-pointer hover:text-sky-400 hover:bg-sky-500/10" // Edit walo ke liye UI
              : "cursor-default opacity-80" // Read-only walo ke liye UI
          }`}
          title={canWrite ? "Click to rename document" : "View Only (Cannot edit title)"}
        >
          {roomTitle}
        </span>
      )}
    </div>
  );
};