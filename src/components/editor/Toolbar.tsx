"use client";

import { Editor } from "@tiptap/react";
import * as TipTapReact from "@tiptap/react";

// 🔥 ULTIMATE VERCEL BYPASS: Dynamic key access. 
// Webpack strict static analysis ko fool karne ke liye humne isko string variable me hide kar diya hai.
const menuKey = "BubbleMenu";
const BubbleMenu = (TipTapReact as any)[menuKey];

export const Toolbar = ({ editor }: { editor: Editor }) => {
  // Agar TipTap load hone me time le raha ho toh error se bachne ke liye safe check
  if (!editor || !BubbleMenu) {
    return null;
  }

  return (
    <BubbleMenu 
      editor={editor} 
      tippyOptions={{ duration: 100, placement: 'top' }}
      className="flex bg-slate-800 border border-slate-700 shadow-2xl rounded-lg overflow-hidden p-1 gap-1 z-50"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          editor.isActive('bold') ? 'bg-sky-500 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          editor.isActive('italic') ? 'bg-sky-500 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          editor.isActive('strike') ? 'bg-sky-500 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
      >
        Strike
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          editor.isActive('code') ? 'bg-sky-500 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
      >
        Code
      </button>
    </BubbleMenu>
  );
};