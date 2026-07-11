"use client";

import { useState, useRef, useEffect } from "react";

export function DocumentTitle({ initialTitle }: { initialTitle: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Jaise hi edit mode on hoga, input field par apne aap focus chala jayega
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setIsEditing(false)} // Bahar click karne par save ho jayega
          onKeyDown={(e) => {
            if (e.key === "Enter") setIsEditing(false); // Enter dabane par save ho jayega
          }}
          className="bg-slate-700 text-slate-200 px-3 py-1 rounded-md outline-none border border-sky-500 text-sm font-medium w-48 shadow-[0_0_10px_rgba(14,165,233,0.3)] transition-all"
          placeholder="Document Title..."
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className="text-sm text-slate-300 font-medium cursor-pointer hover:bg-slate-700 px-3 py-1 rounded-md transition-colors border border-transparent hover:border-slate-600 truncate max-w-[200px]"
          title="Click to rename"
        >
          {title}
        </span>
      )}
    </div>
  );
}