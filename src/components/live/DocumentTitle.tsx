"use client";

import { useState, useRef, useEffect } from "react";

export const DocumentTitle = () => {
  const [title, setTitle] = useState("live-workspace.md");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Jab user edit mode mein aaye, toh input par automatically focus ho jaye
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm font-medium tracking-wide ml-8">
      <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      
      {isEditing ? (
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
          className="bg-transparent border-b border-sky-500 outline-none text-slate-200 px-1 w-36 md:w-48 transition-all"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className="cursor-pointer hover:text-sky-400 hover:bg-sky-500/10 px-1 rounded transition-colors"
          title="Click to rename document"
        >
          {title}
        </span>
      )}
    </div>
  );
};