"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useLiveblocksExtension } from "@liveblocks/react-tiptap";
import Mention from "@tiptap/extension-mention";
import suggestion from "./suggestion";
import { useCompletion } from "@ai-sdk/react";

export default function Editor() {
  const liveblocks = useLiveblocksExtension();

  // Vercel AI SDK ka hook jo backend se baat karega
  const { complete, isLoading } = useCompletion({
    api: "/api/chat",
  });

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
      // Yahan hum Enter key press ko pakdenge
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          const state = view.state;
          const { $from } = state.selection;
          
          // Current line ka text nikal rahe hain
          const currentLineText = state.doc.textBetween($from.start(), $from.end(), ' ');

          // Agar line mein AI Assistant tag hua hai
          if (currentLineText.includes('AI Assistant')) {
            event.preventDefault(); // Normal Enter ko roko (next line par mat jao abhi)

            // AI ka naam hata kar sirf prompt bacha lo
            const prompt = currentLineText.replace(/@?🤖\s?AI Assistant/g, '').trim();

            if (prompt) {
              // Loading shuru, aur backend ko prompt bhejo
              complete(prompt).then((response) => {
                if (response) {
                  // AI ka answer aane ke baad usko editor mein nayi line mein insert karo
                  const tr = view.state.tr;
                  tr.insertText(`\n\n🤖 AI: ${response}\n\n`, state.selection.to);
                  view.dispatch(tr);
                }
              }).catch(err => console.error(err));
            }
            return true; // Humne Enter key ka kaam handle kar liya
          }
        }
        return false; // Agar AI tag nahi hai, toh normal Enter apna kaam karega
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
      
      {/* AI jab soch raha hoga toh ye beautiful loader dikhega */}
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