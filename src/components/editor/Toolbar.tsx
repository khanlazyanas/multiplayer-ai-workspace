"use client";

import { Editor } from "@tiptap/react";

export const Toolbar = ({ editor }: { editor: Editor }) => {
  if (!editor) {
    return null;
  }

  return (
    // 🔥 PREMIUM FLOATING PILL TOOLBAR
    <div className="flex flex-wrap items-center gap-1 bg-[#18181b]/90 backdrop-blur-xl border border-zinc-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-full px-2 py-1.5 mb-8 w-fit mx-auto sticky top-4 z-50">
      
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded-full transition-all ${
          editor.isActive('bold') 
            ? 'bg-zinc-700 text-white shadow-inner' 
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        }`}
        title="Bold"
      >
        B
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`w-8 h-8 flex items-center justify-center text-sm font-serif italic rounded-full transition-all ${
          editor.isActive('italic') 
            ? 'bg-zinc-700 text-white shadow-inner' 
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        }`}
        title="Italic"
      >
        I
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`w-8 h-8 flex items-center justify-center text-sm line-through rounded-full transition-all ${
          editor.isActive('strike') 
            ? 'bg-zinc-700 text-white shadow-inner' 
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        }`}
        title="Strike"
      >
        S
      </button>

      <div className="w-px h-5 bg-zinc-700/50 mx-1"></div> {/* Divider */}

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`px-3 py-1.5 text-xs font-mono font-medium rounded-full transition-all flex items-center gap-1.5 ${
          editor.isActive('code') 
            ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30' 
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white border border-transparent'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
        Code
      </button>
    </div>
  );
};