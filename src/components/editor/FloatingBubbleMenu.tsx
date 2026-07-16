"use client";
// @ts-ignore
import { BubbleMenu } from '@tiptap/react';
import React from 'react';

export const FloatingBubbleMenu = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 150, placement: 'top', animation: 'shift-away' }}
      className="flex items-center gap-1 bg-[#0A0A0A] border border-zinc-800 shadow-[0_15px_40px_rgba(0,0,0,0.6)] rounded-lg p-1.5 z-[9999] backdrop-blur-xl"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 px-3 text-sm font-semibold rounded-md transition-all ${
          editor.isActive('bold') ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
        }`}
      >
        B
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 px-3 text-sm italic font-serif rounded-md transition-all ${
          editor.isActive('italic') ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
        }`}
      >
        I
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 px-3 text-sm line-through rounded-md transition-all ${
          editor.isActive('strike') ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
        }`}
      >
        S
      </button>
      
      {/* Divider */}
      <div className="w-[1px] h-4 bg-zinc-700 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 px-3 text-xs font-mono rounded-md transition-all ${
          editor.isActive('code') ? 'bg-violet-500/20 text-violet-400 shadow-sm border border-violet-500/30' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
        }`}
      >
        {'</>'}
      </button>
    </BubbleMenu>
  );
};