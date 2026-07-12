"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useLiveblocksExtension } from "@liveblocks/react-tiptap";
import Mention from "@tiptap/extension-mention";
import suggestion from "./suggestion";
import { Toolbar } from "./Toolbar";
import toast from "react-hot-toast"; // 🔥 Added toast for notifications

export default function Editor() {
  const liveblocks = useLiveblocksExtension();
  const [isLoading, setIsLoading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // @ts-ignore
        history: false, 
      }),
      liveblocks,
      Mention.configure({
        HTMLAttributes: {
          class: 'bg-sky-500/20 text-sky-400 rounded px-1.5 py-0.5 font-semibold shadow-sm',
        },
        suggestion,
      }),
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-full text-slate-200 text-base md:text-lg cursor-text leading-relaxed",
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          const state = view.state;
          const { $from } = state.selection;
          
          let hasAI = false;
          let userInstruction = "";

          $from.parent.forEach((node) => {
            if (node.type.name === 'mention' && node.attrs.id.includes('AI')) {
              hasAI = true;
            } else if (node.isText) {
              userInstruction += node.text;
            }
          });

          if (hasAI) {
            event.preventDefault(); 
            
            const fullContext = state.doc.textBetween(0, state.doc.content.size, '\n');
            const cleanInstruction = userInstruction.replace(/@/g, '').trim();

            const smartPrompt = `Here is the current document content:\n\n${fullContext}\n\nUser Request: ${cleanInstruction || "Please analyze or continue the code above."}`;

            setIsLoading(true);
            
            fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: smartPrompt })
            })
            .then(async (res) => {
              const text = await res.text();
              if (!res.ok) throw new Error(text); 
              
              const latestState = view.state;
              const tr = latestState.tr;
              
              tr.insertText(`\n\n🤖 AI Response:\n${text}\n\n`, latestState.selection.to);
              view.dispatch(tr);
            })
            .catch((err) => {
              console.error(err);
              toast.error("Error generating AI response!");
            })
            .finally(() => {
              setIsLoading(false);
            });
            
            return true; 
          }
        }
        return false; 
      }
    },
  });

  const exportDocument = () => {
    if (!editor) return;
    const content = editor.getText();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-workspace-document.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Document exported successfully!"); // Success toast
  };

  // 🔥 New Share Logic
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Invite link copied to clipboard!");
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-sky-400 font-medium animate-pulse">
        Initializing Workspace Engine...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 md:mt-6 bg-[#0B0F19] rounded-2xl shadow-[0_0_50px_rgba(14,165,233,0.05)] border border-slate-800/80 overflow-hidden relative flex flex-col h-[75vh] md:h-[80vh] transition-all">
      
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0B0F19]/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-slate-800/90 text-sky-400 px-6 py-3 rounded-full text-sm md:text-base font-semibold flex items-center shadow-[0_0_30px_rgba(14,165,233,0.2)] border border-sky-500/30 animate-pulse">
            <span className="mr-3 text-xl">✨</span> AI is analyzing document...
          </div>
        </div>
      )}

      <div className="bg-slate-900/80 backdrop-blur-md px-4 py-3 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex space-x-2.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
        </div>
        
        <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm font-medium tracking-wide ml-8">
          <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          live-workspace.md
        </div>
        
        <div className="flex gap-2">
          {/* 🔥 New Share Button */}
          <button 
            onClick={copyLink}
            className="flex items-center gap-1.5 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white px-4 py-1.5 rounded-md shadow-lg transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Share
          </button>

          <button 
            onClick={exportDocument}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-400 px-3 py-1.5 rounded-md border border-slate-700 hover:border-sky-500/30 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export TXT
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 md:p-10 w-full relative">
        <Toolbar editor={editor} />
        <EditorContent editor={editor} className="w-full h-full" />
      </div>
    </div>
  );
}