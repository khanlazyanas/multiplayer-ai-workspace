"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useLiveblocksExtension, FloatingComposer, FloatingThreads } from "@liveblocks/react-tiptap";
import { useStatus, useThreads, useRoom, useSelf, useBroadcastEvent, useEventListener } from "@liveblocks/react/suspense"; 
import Mention from "@tiptap/extension-mention";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
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

import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-ui/styles/dark/attributes.css";

const lowlight = createLowlight(common);

export default function Editor() {
  const liveblocks = useLiveblocksExtension();
  const syncStatus = useStatus(); 
  const { threads } = useThreads();
  const room = useRoom();
  
  const canWrite = useSelf((me) => me.canWrite);
  
  const broadcast = useBroadcastEvent();
  
  useEventListener(({ event }) => {
    if ((event as any).type === "PERMISSION_CHANGED") {
      window.location.reload();
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [accessType, setAccessType] = useState("write"); 
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    editable: canWrite, 
    onUpdate: () => {
      setIsSyncing(true);
    },
    extensions: [
      StarterKit.configure({
        // @ts-ignore
        history: false, 
        codeBlock: false, 
      }),
      liveblocks, 
      Mention.configure({
        HTMLAttributes: {
          class: 'bg-zinc-800 text-violet-400 rounded-md px-2 py-0.5 font-semibold shadow-sm border border-violet-500/20 transition-all hover:bg-violet-500/10',
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
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
        HTMLAttributes: {
          class: 'rounded-xl shadow-2xl',
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-full text-zinc-300 text-base md:text-lg cursor-text leading-relaxed ProseMirror pb-32 selection:bg-violet-500/30 selection:text-violet-100",
      },
      handleKeyDown: (view, event) => {
        if (!canWrite) return true; 

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
              
              const cleanText = text.trim();
              const rawHTML = await marked.parse(cleanText); 

              const finalContent = `<blockquote><p><strong style="color: #c084fc;">✨ AI Assistant:</strong></p>${rawHTML}</blockquote><p></p>`;

              if (editor) {
                editor.commands.insertContent(finalContent);
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
    if (editor) {
      editor.setEditable(canWrite);
    }
  }, [editor, canWrite]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isSyncing) {
      timeout = setTimeout(() => {
        setIsSyncing(false);
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [isSyncing]);

  const handleAskAI = () => {
    if (!editor || !canWrite) return;
    const state = editor.state;
    const { $from } = state.selection;
    let userInstruction = $from.parent.textContent.replace(/@AI/g, '').trim();

    if (!userInstruction) {
      toast.error("Please write something for AI first!", {
        style: { background: '#09090b', color: '#e4e4e7', border: '1px solid #27272a' }
      });
      return;
    }

    const fullContext = state.doc.textBetween(0, state.doc.content.size, '\n');
    const smartPrompt = `Here is the current document content:\n\n${fullContext}\n\nUser Request: ${userInstruction}`;

    setIsLoading(true);
    
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: smartPrompt })
    })
    .then(async (res) => {
      const text = await res.text();
      if (!res.ok) throw new Error(text); 
      
      const cleanText = text.trim();
      const rawHTML = await marked.parse(cleanText); 

      const finalContent = `<blockquote><p><strong style="color: #c084fc;">✨ AI Assistant:</strong></p>${rawHTML}</blockquote><p></p>`;

      editor.commands.insertContent(finalContent);
    })
    .catch((err) => {
      console.error(err);
      toast.error("Error generating AI response!");
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

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
      style: { background: '#09090b', color: '#34d399', border: '1px solid #059669' }
    });
  };

  const exportDocumentPDF = async () => {
    if (!editor) return;
    const toastId = toast.loading("Preparing Premium PDF...");
    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const element = document.querySelector('.ProseMirror') as HTMLElement; 
      if (!element) throw new Error("Document content not found");

      const opt = {
        margin: [0.75, 0.75, 0.75, 0.75],
        filename: 'premium-workspace.pdf',
        image: { type: 'jpeg', quality: 1 },
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
              clonedEditor.style.color = '#111827';
              clonedEditor.style.padding = '30px';
              clonedEditor.style.fontFamily = 'Inter, sans-serif';
              const allElements = clonedEditor.querySelectorAll('*');
              allElements.forEach((el: any) => el.style.color = '#111827');
            }
          }
        }, 
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      await (html2pdf as any)().set(opt).from(element).save();
      toast.success("PDF exported successfully!", { id: toastId, style: { background: '#09090b', color: '#34d399', border: '1px solid #059669' } });
    } catch (err: any) {
      console.error("PDF Export Error:", err);
      toast.error(`Error: ${err.message || "Failed to generate"}`, { id: toastId });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Invite link copied to clipboard!", {
      style: { background: '#09090b', color: '#c084fc', border: '1px solid #7e22ce' }
    });
    setIsShareModalOpen(false); 
  };

  const handleUpdateAccess = async (newAccess: string) => {
    setAccessType(newAccess);
    setIsUpdatingAccess(true);
    
    const toastId = toast.loading("Updating workspace permissions...", {
      style: { background: '#09090b', color: '#e4e4e7', border: '1px solid #27272a' }
    });
    
    try {
      const res = await fetch('/api/room/update-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, accessType: newAccess })
      });
      
      if (!res.ok) throw new Error("Failed to sync with backend");
      
      toast.success(`Access updated! Applying changes...`, { 
        id: toastId,
        style: { background: '#09090b', color: '#34d399', border: '1px solid #059669' }
      });

      broadcast({ type: "PERMISSION_CHANGED" });

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error(error);
      toast.error("Failed to update access", { id: toastId });
      setAccessType(accessType === "write" ? "read" : "write"); 
    } finally {
      setIsUpdatingAccess(false);
    }
  };

  const handleAddComment = () => {
    if (!editor || !canWrite) return;
    
    if (editor.state.selection.empty) {
      toast.error("Please highlight text first to comment!", {
        style: { background: '#09090b', color: '#e4e4e7', border: '1px solid #27272a' }
      });
      return;
    }
    
    if (editor.isActive('codeBlock')) {
      toast.error("Comments cannot be added directly inside code blocks.", {
        style: { background: '#09090b', color: '#e4e4e7', border: '1px solid #27272a' }
      });
      return;
    }
    
    setTimeout(() => {
      editor.chain().focus().addPendingComment().run();
    }, 50);
  };

  if (!editor) return (
    <div className="flex items-center justify-center h-[100dvh] w-full bg-[#09090b]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin"></div>
        <p className="text-zinc-500 tracking-widest text-xs uppercase font-mono animate-pulse">Initializing Workspace Engine...</p>
      </div>
    </div>
  );

  return (
    /* 🔥 ULTRA PREMIUM MAIN WRAPPER: OLED Black, Glass Borders, and Drop Shadows */
    <div className="w-full max-w-7xl mx-auto md:my-6 lg:my-8 bg-[#09090b] md:rounded-[24px] shadow-2xl border-y md:border border-zinc-800/60 overflow-hidden relative flex flex-col h-[100dvh] md:h-[85vh] lg:h-[88vh] transition-all ring-1 ring-white/5">
      
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300 p-4">
          <div className="bg-[#0f0f13] border border-zinc-800/80 rounded-2xl w-full max-w-md shadow-[0_30px_80px_rgba(0,0,0,0.9)] overflow-hidden relative ring-1 ring-white/10 scale-in-95 duration-200">
            
            {/* Modal Glow Effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="p-5 md:p-6 border-b border-zinc-800/60 flex justify-between items-center relative z-10">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                  Share Workspace
                </h3>
                <p className="text-sm text-zinc-400 mt-1.5 font-medium">Invite collaborators to your document.</p>
              </div>
              <button onClick={() => setIsShareModalOpen(false)} className="text-zinc-500 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-5 md:p-6 relative z-10">
              <div className="flex gap-3 mb-2">
                <input 
                  type="text" 
                  readOnly 
                  value={typeof window !== 'undefined' ? window.location.href : ''} 
                  className="w-full bg-[#18181b] border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium" 
                />
                <button onClick={copyLink} className="bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 md:px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all active:scale-95 border border-violet-500/50">
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-[#09090b] px-5 md:px-6 py-5 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20 shadow-inner shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div>
                  <span className="text-sm font-bold text-zinc-200 block">General Access</span>
                  <span className="text-xs text-zinc-500 block mt-0.5">Control guest permissions</span>
                </div>
              </div>
              
              <select 
                value={accessType}
                onChange={(e) => handleUpdateAccess(e.target.value)}
                disabled={isUpdatingAccess || !canWrite}
                className="bg-[#18181b] text-sm font-semibold text-zinc-200 px-4 py-2.5 rounded-xl border border-zinc-700/80 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 cursor-pointer disabled:opacity-50 transition-all shadow-sm w-full sm:w-auto appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a1a1aa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
              >
                <option value="write">Can Edit (Full)</option>
                <option value="read">Can View (Restricted)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .lb-root {
          --lb-z-index: 999999 !important; 
        }

        /* 🔥 ULTRA PREMIUM AI BLOCKQUOTE */
        .ProseMirror blockquote {
          position: relative;
          border-left: 3px solid transparent;
          margin: 2rem 0;
          background: linear-gradient(to right, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.01) 100%);
          padding: 1.5rem 1.75rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(139, 92, 246, 0.15);
          border-left-color: #8b5cf6;
          box-shadow: 0 10px 30px -10px rgba(139, 92, 246, 0.1);
        }
        .ProseMirror blockquote p {
          margin-bottom: 0.75rem;
          line-height: 1.7;
          color: #d4d4d8;
        }
        .ProseMirror blockquote p:last-child {
          margin-bottom: 0;
        }
        
        /* 🔥 PREMIUM INLINE CODE FIX */
        .ProseMirror code {
          background-color: rgba(168, 85, 247, 0.1); 
          color: #d8b4fe; 
          padding: 0.2rem 0.4rem;
          border-radius: 0.375rem;
          font-family: 'Fira Code', 'Courier New', Courier, monospace;
          font-size: 0.85em;
          border: 1px solid rgba(168, 85, 247, 0.2);
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .ProseMirror pre code {
          background-color: transparent !important;
          color: inherit !important;
          padding: 0 !important;
          border: none !important;
        }

        /* 🔥 PREMIUM MAC-OS STYLE CODE BLOCKS */
        .ProseMirror pre {
          background: #0f0f13;
          color: #a1a1aa;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.06);
          font-family: 'Fira Code', 'JetBrains Mono', monospace;
          font-size: 0.9em;
          margin: 1.5rem 0;
          overflow-x: auto;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.5), 0 10px 30px -10px rgba(0,0,0,0.5);
          line-height: 1.6;
        }

        .hljs-keyword, .hljs-operator { color: #c678dd; } 
        .hljs-built_in, .hljs-type, .hljs-class .hljs-title { color: #e5c07b; font-weight: 600; } 
        .hljs-literal, .hljs-number { color: #d19a66; } 
        .hljs-string { color: #98c379; } 
        .hljs-title.function_ { color: #61afef; font-weight: 600; } 
        .hljs-comment { color: #71717a; font-style: italic; } 
        .hljs-variable, .hljs-property { color: #e06c75; } 

        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror li {
          margin-bottom: 0.35rem;
        }

        /* Sleek Custom Scrollbar for the whole editor */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2); 
        }

        /* Hide Scrollbar for Toolbar */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* 🔥 FUTURISTIC AI LOADING OVERLAY */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#09090b]/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#121214]/90 backdrop-blur-xl text-violet-300 px-6 py-4 rounded-2xl text-sm md:text-base font-semibold flex items-center gap-4 shadow-[0_0_40px_rgba(139,92,246,0.15)] border border-violet-500/20">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-bounce"></div>
            </div>
            AI is engineering a response...
          </div>
        </div>
      )}

      {/* 🔥 ULTRA RESPONSIVE & PREMIUM TOOLBAR */}
      <div className="bg-[#0f0f13]/80 backdrop-blur-2xl px-4 sm:px-6 py-3 border-b border-zinc-800/80 flex items-center justify-between shrink-0 overflow-x-auto z-20 no-scrollbar shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex p-1.5 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg border border-zinc-700/50 shadow-inner">
             <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <DocumentTitle />
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 min-w-fit pl-4">
          <div className="flex items-center gap-2 mr-1 sm:mr-2 bg-[#09090b] px-3 py-1.5 rounded-full border border-zinc-800/80 text-[10px] sm:text-xs font-mono shadow-inner">
            {syncStatus === "initial" || syncStatus === "connecting" || syncStatus === "reconnecting" ? (
              <><div className="w-2 h-2 rounded-full bg-yellow-500/80 animate-pulse"></div><span className="text-zinc-400 hidden sm:inline">Connecting</span></>
            ) : syncStatus === "disconnected" ? (
              <><div className="w-2 h-2 rounded-full bg-red-500/80"></div><span className="text-red-400 hidden sm:inline">Offline</span></>
            ) : isSyncing ? (
              <><div className="w-2 h-2 rounded-full bg-yellow-400/80 animate-spin"></div><span className="text-yellow-400 hidden sm:inline">Syncing</span></>
            ) : (
              <><div className="w-2 h-2 rounded-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div><span className="text-emerald-400 hidden sm:inline">Saved</span></>
            )}
          </div>
          <ActiveUsers />
          <div className="w-px h-6 bg-zinc-800 mx-1 hidden sm:block"></div>
          
          {canWrite && (
            <button 
              type="button"
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }} 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddComment(); }} 
              className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-3 py-2 rounded-lg border border-zinc-700/50 transition-all shadow-sm"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span className="hidden sm:inline">Comment</span>
            </button>
          )}
          
          <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all active:scale-95 shrink-0 border border-violet-500/30">Share</button>
          
          <div className="flex bg-[#09090b] rounded-lg border border-zinc-800/80 p-0.5">
            <button onClick={exportDocumentPDF} className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold hover:bg-zinc-800 text-zinc-400 px-2.5 py-1.5 rounded-md transition-all hover:text-white shrink-0">PDF</button>
            <div className="w-px h-4 bg-zinc-800 my-auto"></div>
            <button onClick={exportDocumentTXT} className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold hover:bg-zinc-800 text-zinc-400 px-2.5 py-1.5 rounded-md transition-all hover:text-white shrink-0">TXT</button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto w-full relative bg-transparent custom-scrollbar scroll-smooth">
        <DocumentHeader />
        
        {/* Editor Area with premium typography paddings */}
        <div className="p-4 sm:p-6 md:p-12 max-w-[850px] mx-auto w-full relative lb-root lb-dark">
          {canWrite && <Toolbar editor={editor} onAskAI={handleAskAI} />}
          {canWrite && <FloatingBubbleMenu editor={editor} />}
          
          <div className="z-[99999] relative">
            <FloatingThreads editor={editor} threads={threads} className="z-[99999]" />
            <FloatingComposer editor={editor} className="z-[99999]" />
          </div>
          
          <EditorContent editor={editor} className="w-full h-full mt-4" />
        </div>
      </div>
    </div>
  );
}