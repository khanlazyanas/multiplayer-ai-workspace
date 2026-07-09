"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useLiveblocksExtension } from "@liveblocks/react-tiptap";
import Mention from "@tiptap/extension-mention";
import suggestion from "./suggestion";

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
          class: 'bg-sky-500/20 text-sky-400 rounded px-1 font-medium',
        },
        suggestion,
      }),
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[400px] text-gray-100 text-lg p-4 cursor-text",
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          const state = view.state;
          const { $from } = state.selection;
          
          let hasAI = false;
          let promptText = "";

          $from.parent.forEach((node) => {
            if (node.type.name === 'mention' && node.attrs.id.includes('AI')) {
              hasAI = true;
            } else if (node.isText) {
              promptText += node.text;
            }
          });

          if (hasAI) {
            event.preventDefault(); 
            const finalPrompt = promptText.replace(/@/g, '').trim();

            if (finalPrompt) {
              setIsLoading(true);
              
              fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: finalPrompt })
              })
              .then(async (res) => {
                const text = await res.text();
                // 🔥 FIX: Agar backend fail hua, toh uski asali error message pakdo
                if (!res.ok) {
                  throw new Error(text); 
                }
                
                const latestState = view.state;
                const tr = latestState.tr;
                tr.insertText(`\n\n🤖 AI:\n${text}\n\n`, latestState.selection.to);
                view.dispatch(tr);
              })
              .catch((err) => {
                console.error(err);
                // 🔥 FIX: Alert mein ab seedha asali bimari likhi aayegi!
                alert("❌ ERROR: " + err.message);
              })
              .finally(() => {
                setIsLoading(false);
              });
            }
            return true; 
          }
        }
        return false; 
      }
    },
  });

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400 font-medium">
        Loading AI Workspace... ⏳
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden relative">
      
      {isLoading && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-sky-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-lg z-50 animate-pulse">
          <span className="mr-2">✨</span> AI is thinking...
        </div>
      )}

      <div className="bg-slate-950 px-6 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-slate-400 text-sm font-medium">live-workspace.md</span>
      </div>
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}