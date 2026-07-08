"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useLiveblocksExtension } from "@liveblocks/react-tiptap";
import Mention from "@tiptap/extension-mention";
import suggestion from "./suggestion";

export default function Editor() {
  const liveblocks = useLiveblocksExtension();

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
    <div className="w-full max-w-4xl mx-auto mt-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
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