"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useLiveblocksExtension } from "@liveblocks/react-tiptap";
import { useStatus } from "@liveblocks/react/suspense"; 
import Mention from "@tiptap/extension-mention";
import suggestion from "./suggestion";
import { Toolbar } from "./Toolbar";
import toast from "react-hot-toast";
import { DocumentTitle } from "../live/DocumentTitle";
import { ActiveUsers } from "../live/ActiveUsers";
import { FloatingBubbleMenu } from "./FloatingBubbleMenu";
import { DocumentHeader } from "./DocumentHeader"; 

import SlashCommands from './slashExtension';
import slashSuggestion from './slashSuggestion';
import { marked } from "marked";

export default function Editor() {
  const liveblocks = useLiveblocksExtension();
  const syncStatus = useStatus(); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    onUpdate: () => {
      setIsSyncing(true);
    },
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
        // 🔥 SHORTCUT: Ctrl+Enter (ya Cmd+Enter) dabane par AI chalega
        const isCtrlEnter = event.key === 'Enter' && (event.ctrlKey || event.metaKey);
        const isNormalEnter = event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey;

        if (isCtrlEnter || isNormalEnter) {
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

          // Ctrl+Enter direct AI trigger karega
          if (isCtrlEnter) {
            hasAI = true;
          }

          if (hasAI && userInstruction.trim().length > 0) {
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
              
              // 🔥 1. Extreme Trim to remove any hidden API blank lines
              const cleanText = text.replace(/^[\s\n]+|[\s\n]+$/g, '');
              const rawHTML = await marked.parse(cleanText);
              
              // 🔥 2. The Bulletproof HTML Payload 
              // Notice the <p><br></p> at the very end. This forces a visible empty line outside!
              const formattedResponse = `
                <blockquote>
                  <p><strong style="color: #a78bfa;">🤖 AI Assistant:</strong></p>
                  ${rawHTML}
                </blockquote>
                <p><br></p>
              `;

              if (editor) {
                editor.chain()
                  .focus()
                  .insertContent(formattedResponse)
                  .run();
              }
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

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isSyncing) {
      timeout = setTimeout(() => {
        setIsSyncing(false);
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [isSyncing]);

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

  const exportDocumentPDF = async () => {
    if (!editor) return;

    const toastId = toast.loading("Preparing PDF...");

    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      
      const element = document.querySelector('.ProseMirror') as HTMLElement; 
      
      if (!element) {
        throw new Error("Document content not found");
      }

      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: 'workspace-document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          onclone: (clonedDoc: any) => {
            const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
            styles.forEach((styleTag: any) => styleTag.remove());

            const clonedEditor = clonedDoc.querySelector('.ProseMirror');
            if (clonedEditor) {
              clonedEditor.style.backgroundColor = '#ffffff';
              clonedEditor.style.color = '#000000';
              clonedEditor.style.padding = '20px';
              
              const allElements = clonedEditor.querySelectorAll('*');
              allElements.forEach((el: any) => {
                el.style.color = '#000000';
              });
            }
          }
        }, 
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      await (html2pdf as any)().set(opt).from(element).save();
      toast.success("PDF exported successfully!", { id: toastId });

    } catch (err: any) {
      console.error("PDF Export Error:", err);
      toast.error(`Error: ${err.message || "Failed to generate"}`, { id: toastId });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Invite link copied to clipboard!");
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500 font-medium animate-pulse">
        Initializing Workspace Engine...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 md:mt-6 bg-[#0c0c0e] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-zinc-800/80 overflow-hidden relative flex flex-col h-[75vh] md:h-[80vh] transition-all">
      
      {/* 🔥 THE 200% FIX: CSS Flexbox to murder all margins and gaps */}
      <style>{`
        .ProseMirror blockquote {
          border-left: 3px solid #8b5cf6;
          margin: 1.5rem 0;
          background: rgba(139, 92, 246, 0.08);
          padding: 1.25rem;
          border-radius: 0.5rem;
          display: flex; 
          flex-direction: column;
          gap: 0.5rem; /* Exact 8px gap between header and text, NO MORE! */
        }
        .ProseMirror blockquote p {
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1.6;
        }
        /* Add a sleek separator line under the AI Assistant text */
        .ProseMirror blockquote p:first-child {
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
          padding-bottom: 0.5rem !important;
          margin-bottom: 0.25rem !important;
        }
      `}</style>

      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-300">
          <div className="bg-zinc-900/90 text-violet-400 px-6 py-3 rounded-full text-sm md:text-base font-semibold flex items-center shadow-[0_0_30px_rgba(139,92,246,0.15)] border border-violet-500/20 animate-pulse">
            <span className="mr-3 text-xl">✨</span> AI is analyzing document...
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-zinc-900/60 backdrop-blur-xl px-5 py-3.5 border-b border-zinc-800/80 flex items-center justify-between shrink-0 overflow-x-auto z-20">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex p-1.5 bg-zinc-800/50 rounded-md border border-zinc-700/50">
             <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <DocumentTitle />
        </div>
        
        <div className="flex items-center gap-2 min-w-fit">
          <div className="flex items-center gap-2 mr-3 bg-black/40 px-3 py-1.5 rounded-full border border-zinc-800/80 text-[11px] font-mono hidden sm:flex shadow-inner">
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
            ) : isSyncing ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-spin"></div>
                <span className="text-yellow-400">Syncing...</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-emerald-400">Saved</span>
              </>
            )}
          </div>
          <ActiveUsers />
          <div className="w-px h-5 bg-zinc-800 mx-1 hidden sm:block"></div>
          <button onClick={copyLink} className="flex items-center gap-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white px-3.5 py-1.5 rounded-md shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all active:scale-95">Share</button>
          <button onClick={exportDocumentPDF} className="flex items-center gap-1.5 text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md border border-zinc-700/50 transition-all hover:text-white">PDF</button>
          <button onClick={exportDocumentTXT} className="flex items-center gap-1.5 text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md border border-zinc-700/50 transition-all hover:text-white">TXT</button>
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