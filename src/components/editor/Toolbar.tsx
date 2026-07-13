"use client";

// 🔥 FIX: Direct import use kiya hai taaki Vercel tree-shaking me isko delete na kare
import { Editor, BubbleMenu } from "@tiptap/react";

export const Toolbar = ({ editor }: { editor: Editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu 
      editor={editor} 
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