"use client";

import { Editor } from "@tiptap/react";

export const Toolbar = ({ editor, onAskAI }: { editor: Editor, onAskAI?: () => void }) => {
  if (!editor) {
    return null;
  }

  return (
    // 🔥 FIX: Removed flex-wrap, added flex-nowrap, w-max, max-w-[90vw] and horizontal scroll for mobile
    <div className="flex flex-nowrap items-center gap-1 sm:gap-1.5 bg-[#18181b]/90 backdrop-blur-xl border border-white/[0.1] shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_10px_rgba(139,92,246,0.1)] rounded-full px-2 sm:px-2.5 py-1.5 sm:py-2 w-max max-w-[90vw] sm:max-w-none overflow-x-auto no-scrollbar relative group z-50 mx-auto">
      
      {/* Subtle Glow behind the toolbar */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center text-xs sm:text-sm font-bold rounded-full transition-all ${
          editor.isActive('bold') 
            ? 'bg-zinc-700 text-white shadow-inner border border-white/5' 
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        }`}
        title="Bold"
      >
        B
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center text-xs sm:text-sm font-serif italic rounded-full transition-all ${
          editor.isActive('italic') 
            ? 'bg-zinc-700 text-white shadow-inner border border-white/5' 
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        }`}
        title="Italic"
      >
        I
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center text-xs sm:text-sm line-through rounded-full transition-all ${
          editor.isActive('strike') 
            ? 'bg-zinc-700 text-white shadow-inner border border-white/5' 
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        }`}
        title="Strike"
      >
        S
      </button>

      <div className="w-px h-4 sm:h-5 bg-zinc-700/80 mx-0.5 sm:mx-1.5 shrink-0"></div> {/* Divider */}

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-mono font-medium rounded-full transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 ${
          editor.isActive('code') 
            ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-inner' 
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white border border-transparent'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
        Code
      </button>

      {/* 🔥 PREMIUM AI BUTTON 🔥 */}
      {onAskAI && (
        <>
          <div className="w-px h-4 sm:h-5 bg-zinc-700/80 mx-0.5 sm:mx-1.5 shrink-0"></div>
          <button
            onClick={onAskAI}
            className="px-3 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-full transition-all flex items-center gap-1 sm:gap-1.5 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 hover:text-violet-200 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)] hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] relative overflow-hidden shrink-0"
            title="Ask AI (Ctrl + Enter on Desktop)"
          >
            <div className="absolute inset-0 w-full h-full bg-white/5 opacity-0 hover:opacity-100 transition-opacity"></div>
            ✨ Ask AI
          </button>
        </>
      )}

      {/* Adding local style to ensure scrollbar is hidden on mobile */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};