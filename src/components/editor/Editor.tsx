"use client";

import { useEffect, useState } from "react";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

export function Editor() {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<any>();

  // Yjs document aur Liveblocks provider ko setup kar rahe hain
  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
    };
  }, [room]);

  if (!doc || !provider) {
    return null;
  }

  return <CollaborativeEditor doc={doc} provider={provider} />;
}

function CollaborativeEditor({ doc, provider }: { doc: Y.Doc; provider: any }) {
  // Khud ki dummy info (baad me isko real user se replace karenge)
  const userInfo = useSelf((me) => me.info || { name: "Developer", color: "#4FC3F7" });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // @ts-ignore
        history: false, 
      }),
      Collaboration.configure({
        document: doc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: userInfo,
      }),
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[400px] text-gray-100 text-lg p-4",
      },
    },
  });

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden cursor-text">
      {/* Editor ka Header */}
      <div className="bg-slate-950 px-6 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-slate-400 text-sm font-medium">multiplayer-document.md</span>
      </div>
      
      {/* Main Text Area */}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}