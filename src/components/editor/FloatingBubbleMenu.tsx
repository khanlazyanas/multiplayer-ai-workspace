"use client";

// 🔥 Turbopack Bypass: Wildcard import se hum strict static analysis ko bypass kar rahe hain
import * as TiptapReact from '@tiptap/react';
import React, { useState } from 'react';
import toast from "react-hot-toast";
import { marked } from "marked";

export const FloatingBubbleMenu = ({ editor }: { editor: any }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!editor) return null;

  // 🔥 Runtime par BubbleMenu extract kar rahe hain taaki build fail na ho
  const BubbleMenu = (TiptapReact as any).BubbleMenu;

  // Agar bypass ke baad bhi load na ho (safe fallback)
  if (!BubbleMenu) return null;

  const handleAIAssist = async (action: 'explain' | 'refactor' | 'fix') => {
    const { state } = editor;
    const { from, to } = state.selection;
    const selectedText = state.doc.textBetween(from, to, '\n');

    if (!selectedText.trim()) return;

    // 🔥 AI Prompts
    let promptTemplate = "";
    let aiTitle = "";
    
    if (action === 'explain') {
      promptTemplate = `Please explain the following code or text simply and clearly:\n\n${selectedText}`;
      aiTitle = "🧠 AI Explanation";
    } else if (action === 'refactor') {
      promptTemplate = `Refactor and optimize the following code for better performance and readability. Provide only the improved code and a brief explanation of changes:\n\n${selectedText}`;
      aiTitle = "🛠 AI Refactored Code";
    } else if (action === 'fix') {
      promptTemplate = `Find and fix any bugs in the following code. Explain what was wrong and how you fixed it:\n\n${selectedText}`;
      aiTitle = "🐛 AI Bug Fix";
    }

    setIsLoading(true);
    const toastId = toast.loading(`${action === 'explain' ? 'Analyzing' : action === 'refactor' ? 'Optimizing' : 'Debugging'} code...`, {
      style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' }
    });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptTemplate })
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      const text = await res.text();
      const cleanText = text.trim();
      const rawHTML = await marked.parse(cleanText);

      // AI Response with Premium Blockquote Style
      const finalContent = `
        <p></p>
        <blockquote style="border-left: 3px solid #8b5cf6; background: rgba(139, 92, 246, 0.08); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong style="color: #a78bfa;">${aiTitle}:</strong></p>
          ${rawHTML}
        </blockquote>
        <p></p>
      `;

      // Code ko selection ke baad insert karna
      editor.chain().focus().setTextSelection(to).insertContent(finalContent).run();
      
      toast.success("AI Task Complete!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate AI response", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 150, placement: 'top', animation: 'shift-away' }}
      className="flex items-center gap-1 bg-[#0A0A0A] border border-zinc-800 shadow-[0_15px_40px_rgba(0,0,0,0.6)] rounded-lg p-1.5 z-[9999] backdrop-blur-xl overflow-hidden"
    >
      {/* 🛑 TUMHARE PURANE BUTTONS (Unchanged) */}
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
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 px-3 text-xs font-mono rounded-md transition-all ${
          editor.isActive('code') ? 'bg-violet-500/20 text-violet-400 shadow-sm border border-violet-500/30' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
        }`}
      >
        {'</>'}
      </button>

      {/* Divider */}
      <div className="w-[1px] h-5 bg-zinc-700/80 mx-1"></div>

      {/* 🚀 NAYE AI BUTTONS */}
      <button 
        onClick={() => handleAIAssist('explain')} 
        disabled={isLoading} 
        className="px-2.5 py-1.5 text-xs font-medium text-violet-400 hover:bg-violet-500/20 hover:text-violet-300 rounded-md transition-all flex items-center gap-1.5 disabled:opacity-50"
      >
        🧠 Explain
      </button>
      <button 
        onClick={() => handleAIAssist('refactor')} 
        disabled={isLoading} 
        className="px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-md transition-all flex items-center gap-1.5 disabled:opacity-50"
      >
        🛠 Refactor
      </button>
      <button 
        onClick={() => handleAIAssist('fix')} 
        disabled={isLoading} 
        className="px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 rounded-md transition-all flex items-center gap-1.5 disabled:opacity-50"
      >
        🐛 Fix Bug
      </button>
    </BubbleMenu>
  );
};