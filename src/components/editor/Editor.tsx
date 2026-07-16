"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useLiveblocksExtension } from "@liveblocks/react-tiptap";
// 🔥 NAYA IMPORT: Liveblocks Sync Status ke liye
import { useStatus } from "@liveblocks/react/suspense"; 
import Mention from "@tiptap/extension-mention";
import suggestion from "./suggestion";
import { Toolbar } from "./Toolbar";
import toast from "react-hot-toast";
import { DocumentTitle } from "../live/DocumentTitle";
import { ActiveUsers } from "../live/ActiveUsers";
import { FloatingBubbleMenu } from "./FloatingBubbleMenu";
import { DocumentHeader } from "./DocumentHeader"; 

// 🔥 IMPORTS SLASH COMMANDS KE LIYE
import SlashCommands from './slashExtension'
import slashSuggestion from './slashSuggestion'

export default function Editor() {
  const liveblocks = useLiveblocksExtension();
  // 🔥 CLOUD SYNC STATUS HOOK
  const syncStatus = useStatus(); 
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
          class: 'bg-zinc-800 text-violet-400 rounded px-1.5 py-0.5 font-semibold shadow-sm',
        },
        suggestion,
      }),
      SlashCommands.configure({
        suggestion: {
          char: '/',
          command: ({ editor, range, props }: any) => {
            props.command({ editor, range })
          },
          ...slashSuggestion,
        }
      }),
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-full text-zinc-200 text-base md:text-lg cursor-text leading-relaxed ProseMirror",
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
              toast.error("Error generating AI response!", {
                style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' }
              });
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

  const exportDocumentTXT = () => {
    if (!editor) return;
    const content = editor.getText();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-workspace.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("TXT exported successfully!", {
      style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' }
    });
  };

  const exportDocumentPDF = async () => {
    if (!editor) return;
    
    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = document.querySelector('.ProseMirror') as HTMLElement; 
    
    if (!element) {
      toast.error("Could not find content to export");
      return;
    }

    const opt = {
      margin: 0.5,
      filename: 'my-workspace.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    };

    const originalColor = element.style.color;
    element.style.color = '#000000'; 

    toast.loading("Generating PDF...", { id: "pdf-toast", style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' } });
    
    html2pdf().set(opt).from(element).save().then(() => {
      element.style.color = originalColor; 
      toast.success("PDF exported successfully!", { id: "pdf-toast", style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' } });
    }).catch(() => {
      toast.error("Failed to generate PDF", { id: "pdf-toast", style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' } });
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Invite link copied to clipboard!", {
      style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' }
    });
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500 font-medium animate-pulse">
        Initializing Workspace Engine...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 md:mt-6 bg-[#0A0A0A] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-zinc-800 overflow-hidden relative flex flex-col h-[75vh] md:h-[80vh] transition-all">
      
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-zinc-900 text-violet-400 px-6 py-3 rounded-full text-sm md:text-base font-semibold flex items-center shadow-[0_0_30px_rgba(139,92,246,0.2)] border border-violet-500/30 animate-pulse">
            <span className="mr-3 text-xl">✨</span> AI is analyzing document...
          </div>
        </div>
      )}

      {/* Mac style header */}
      <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 border-b border-zinc-800 flex items-center justify-between shrink-0 overflow-x-auto">
        <div className="flex space-x-2.5 min-w-fit pr-4">
          <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
        </div>
        
        <DocumentTitle />
        
        <div className="flex items-center gap-2 min-w-fit">
          
          {/* 🔥 REAL-TIME CLOUD SYNC INDICATOR */}
          <div className="flex items-center gap-1.5 mr-2 bg-[#111] px-2.5 py-1 rounded-md border border-zinc-800 text-[11px] font-mono hidden sm:flex">
            {syncStatus === "initial" || syncStatus === "connecting" || syncStatus === "reconnecting" ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-zinc-400">Connecting...</span>
              </>
            ) : syncStatus === "disconnected" ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <span className="text-red-400">Offline</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-emerald-400">Saved to Cloud</span>
              </>
            )}
          </div>

          <ActiveUsers />

          <button 
            onClick={copyLink}
            className="flex items-center gap-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-md shadow-lg transition-all"
          >
            Share
          </button>

          <button 
            onClick={exportDocumentPDF}
            className="flex items-center gap-1.5 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-md border border-red-500/30 transition-all"
            title="Download as PDF"
          >
            PDF
          </button>

          <button 
            onClick={exportDocumentTXT}
            className="flex items-center gap-1.5 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md border border-zinc-700 transition-all"
            title="Download as plain text"
          >
            TXT
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto w-full relative bg-transparent custom-scrollbar">
        <DocumentHeader />
        <div className="p-5 md:p-10 max-w-4xl mx-auto w-full">
          <Toolbar editor={editor} />
          <FloatingBubbleMenu editor={editor} />
          <EditorContent editor={editor} className="w-full h-full mt-2" />
        </div>
      </div>
    </div>
  );
}