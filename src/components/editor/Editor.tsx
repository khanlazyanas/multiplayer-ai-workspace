"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useLiveblocksExtension } from "@liveblocks/react-tiptap";
import Mention from "@tiptap/extension-mention";
import suggestion from "./suggestion";
import { Toolbar } from "./Toolbar";
import toast from "react-hot-toast";
import { DocumentTitle } from "../live/DocumentTitle";
import { ActiveUsers } from "../live/ActiveUsers";

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
        class: "focus:outline-none min-h-full text-slate-200 text-base md:text-lg cursor-text leading-relaxed ProseMirror", // Added ProseMirror class for PDF selector
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
    toast.success("TXT exported successfully!");
  };

  // 🔥 Naya PDF Export Function
  const exportDocumentPDF = async () => {
    if (!editor) return;
    
    // Dynamic import to avoid Next.js SSR issues with window objects
    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = document.querySelector('.ProseMirror') as HTMLElement; 
    
    if (!element) {
      toast.error("Could not find content to export");
      return;
    }

    // 🔥 FIX: 'as const' laga diya taaki TS strict string literal samajh jaye
    const opt = {
      margin: 0.5,
      filename: 'my-workspace.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    };

    // Styling hack for PDF to ensure text is visible on white background
    const originalColor = element.style.color;
    element.style.color = '#000000'; 

    toast.loading("Generating PDF...", { id: "pdf-toast" });
    
    html2pdf().set(opt).from(element).save().then(() => {
      element.style.color = originalColor; // Restore original color
      toast.success("PDF exported successfully!", { id: "pdf-toast" });
    }).catch(() => {
      toast.error("Failed to generate PDF", { id: "pdf-toast" });
    });
  };

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

      <div className="bg-slate-900/80 backdrop-blur-md px-4 py-3 border-b border-slate-800/80 flex items-center justify-between shrink-0 overflow-x-auto">
        <div className="flex space-x-2.5 min-w-fit pr-4">
          <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
        </div>
        
        <DocumentTitle />
        
        <div className="flex items-center gap-2 min-w-fit">
          <ActiveUsers />

          <button 
            onClick={copyLink}
            className="flex items-center gap-1.5 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white px-3 py-1.5 rounded-md shadow-lg transition-all"
          >
            Share
          </button>

          {/* 🔥 PDF Export Button */}
          <button 
            onClick={exportDocumentPDF}
            className="flex items-center gap-1.5 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-md border border-red-500/30 transition-all"
            title="Download as PDF"
          >
            PDF
          </button>

          <button 
            onClick={exportDocumentTXT}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-400 px-3 py-1.5 rounded-md border border-slate-700 hover:border-sky-500/30 transition-all"
            title="Download as plain text"
          >
            TXT
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 md:p-10 w-full relative bg-white/5 md:bg-transparent">
        <Toolbar editor={editor} />
        <EditorContent editor={editor} className="w-full h-full" />
      </div>
    </div>
  );
}