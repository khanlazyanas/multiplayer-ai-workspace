"use client";

// 🔥 FIX: Sirf Editor import kiya hai. BubbleMenu ko poori tarah se hata diya gaya hai!
import { Editor } from "@tiptap/react";

export const Toolbar = ({ editor }: { editor: Editor }) => {
  if (!editor) {
    return null;
  }

  return (
    // Google Docs style Sticky Toolbar
    <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 shadow-lg rounded-xl p-2 mb-6 sticky top-2 z-50">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
          editor.isActive('bold') 
            ? 'bg-sky-500 text-white shadow-md' 
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        Bold
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
          editor.isActive('italic') 
            ? 'bg-sky-500 text-white shadow-md' 
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        Italic
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
          editor.isActive('strike') 
            ? 'bg-sky-500 text-white shadow-md' 
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        Strike
      </button>

      <div className="w-px h-6 bg-slate-700 mx-1"></div> {/* Divider */}

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
          editor.isActive('code') 
            ? 'bg-emerald-500 text-white shadow-md' 
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        Code Block
      </button>
    </div>
  );
};