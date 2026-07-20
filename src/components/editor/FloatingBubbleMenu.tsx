"use client";

import React, { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import { marked } from "marked";

// --- Professional SVG Icons ---
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
const WrenchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const BugIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M17.47 9c1.93-.2 3.53-1.9 3.53-3.9"/><path d="M8 14H4"/><path d="M16 14h4"/><path d="M9 18h-4"/><path d="M15 18h4"/></svg>;
const SpinnerIcon = () => <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export const FloatingBubbleMenu = ({ editor }: { editor: any }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null); // Track which button is loading
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      if (editor.isDestroyed || editor.state.selection.empty) {
        setShow(false);
        return;
      }

      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (rect.width === 0 || rect.height === 0) {
          setShow(false);
          return;
        }

        setPosition({
          top: rect.top - 55, 
          left: rect.left + (rect.width / 2),
        });
        setShow(true);
      }, 10);
    };

    editor.on('selectionUpdate', updateMenu);
    document.addEventListener('scroll', updateMenu, true);

    return () => {
      editor.off('selectionUpdate', updateMenu);
      document.removeEventListener('scroll', updateMenu, true);
    };
  }, [editor]);

  if (!editor || !show) return null;

  const handleAIAssist = async (action: 'explain' | 'refactor' | 'fix') => {
    const { state } = editor;
    const { from, to } = state.selection;
    const selectedText = state.doc.textBetween(from, to, '\n');

    if (!selectedText.trim()) return;

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

    setIsLoading(action); // Set specific button to loading state
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

      const finalContent = `
        <p></p>
        <blockquote style="border-left: 3px solid #8b5cf6; background: rgba(139, 92, 246, 0.08); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <p><strong style="color: #a78bfa;">${aiTitle}:</strong></p>
          ${rawHTML}
        </blockquote>
        <p></p>
      `;

      editor.chain().focus().setTextSelection(to).insertContent(finalContent).run();
      
      toast.success("AI Task Complete!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate AI response", { id: toastId });
    } finally {
      setIsLoading(null);
      setShow(false); 
    }
  };

  return (
    <div 
      onMouseDown={(e) => e.preventDefault()} 
      // 🔥 Glassmorphism, Pop-in Animation & Premium Borders added here
      className="fixed flex items-center gap-1 bg-[#0c0c0e]/85 backdrop-blur-md border border-zinc-700/60 shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-xl p-1.5 z-[999999] transition-all duration-200 ease-out animate-in fade-in zoom-in-95 transform -translate-x-1/2"
      style={{ top: position.top, left: position.left }}
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 px-3 text-sm font-semibold rounded-lg transition-all ${
          editor.isActive('bold') ? 'bg-zinc-700/80 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
        }`}
      >
        B
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 px-3 text-sm italic font-serif rounded-lg transition-all ${
          editor.isActive('italic') ? 'bg-zinc-700/80 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
        }`}
      >
        I
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 px-3 text-sm line-through rounded-lg transition-all ${
          editor.isActive('strike') ? 'bg-zinc-700/80 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
        }`}
      >
        S
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 px-3 text-xs font-mono rounded-lg transition-all ${
          editor.isActive('code') ? 'bg-violet-500/20 text-violet-400 shadow-sm border border-violet-500/30' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
        }`}
      >
        {'</>'}
      </button>

      <div className="w-[1px] h-5 bg-zinc-700/80 mx-1.5 rounded-full"></div>

      {/* 🚀 AI DEVELOPER TOOLS with SVGs and Spinners */}
      <button 
        onClick={() => handleAIAssist('explain')} 
        disabled={isLoading !== null} 
        className="px-3 py-1.5 text-xs font-semibold text-violet-400 hover:bg-violet-500/20 hover:text-violet-300 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {isLoading === 'explain' ? <SpinnerIcon /> : <SparklesIcon />}
        Explain
      </button>
      <button 
        onClick={() => handleAIAssist('refactor')} 
        disabled={isLoading !== null} 
        className="px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {isLoading === 'refactor' ? <SpinnerIcon /> : <WrenchIcon />}
        Refactor
      </button>
      <button 
        onClick={() => handleAIAssist('fix')} 
        disabled={isLoading !== null} 
        className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {isLoading === 'fix' ? <SpinnerIcon /> : <BugIcon />}
        Fix Bug
      </button>
    </div>
  );
};