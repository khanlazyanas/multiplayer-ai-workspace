"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useLiveblocksExtension, FloatingComposer, FloatingThreads } from "@liveblocks/react-tiptap";
import { useStatus, useThreads, useRoom, useSelf } from "@liveblocks/react/suspense"; 
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
  
  // Get current user's write permission strictly from Liveblocks
  const canWrite = useSelf((me) => me.canWrite);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [accessType, setAccessType] = useState("write"); 
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    editable: canWrite, // Initial state
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
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
        HTMLAttributes: {
          class: 'rounded-md',
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-full text-zinc-200 text-base md:text-lg cursor-text leading-relaxed ProseMirror",
      },
      handleKeyDown: (view, event) => {
        if (!canWrite) return true; // Block keyboard entirely for viewers

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

              const finalContent = `<blockquote><p><strong style="color: #a78bfa;">🤖 AI Assistant:</strong></p>${rawHTML}</blockquote><p></p>`;

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

  // Dynamically force Tiptap to lock or unlock based on Liveblocks permission
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
        style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' }
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

      const finalContent = `<blockquote><p><strong style="color: #a78bfa;">🤖 AI Assistant:</strong></p>${rawHTML}</blockquote><p></p>`;

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
    toast.success("TXT exported successfully!");
  };

  const exportDocumentPDF = async () => {
    if (!editor) return;
    const toastId = toast.loading("Preparing PDF...");
    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const element = document.querySelector('.ProseMirror') as HTMLElement; 
      if (!element) throw new Error("Document content not found");

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
              allElements.forEach((el: any) => el.style.color = '#000000');
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
    setIsShareModalOpen(false); 
  };

  const handleUpdateAccess = async (newAccess: string) => {
    setAccessType(newAccess);
    setIsUpdatingAccess(true);
    
    const toastId = toast.loading("Updating workspace permissions...", {
      style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' }
    });
    
    try {
      const res = await fetch('/api/room/update-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, accessType: newAccess })
      });
      
      if (!res.ok) throw new Error("Failed to sync with backend");
      
      toast.success(`Access updated! Reloading to apply changes...`, { 
        id: toastId,
        style: { background: '#18181b', color: '#34d399', border: '1px solid #059669' }
      });

      // Force page reload to invalidate Liveblocks cache and apply new tokens globally
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
        style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' }
      });
      return;
    }
    
    if (editor.isActive('codeBlock')) {
      toast.error("Comments cannot be added directly inside code blocks.", {
        style: { background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' }
      });
      return;
    }
    
    toast.success("Opening comment box...", { 
      duration: 1500,
      style: { background: '#18181b', color: '#38bdf8', border: '1px solid #0369a1' } 
    });
    
    setTimeout(() => {
      editor.chain().focus().addPendingComment().run();
    }, 50);
  };

  if (!editor) return <div className="flex items-center justify-center min-h-[60vh] text-zinc-500 font-medium animate-pulse">Initializing Workspace Engine...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 md:mt-6 bg-[#0c0c0e] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-zinc-800/80 overflow-hidden relative flex flex-col h-[75vh] md:h-[80vh] transition-all">
      
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-2xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="p-5 border-b border-zinc-800/80 flex justify-between items-center bg-[#121214]">
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">Share Workspace</h3>
                <p className="text-xs text-zinc-400 mt-1">Send this link to anyone to collaborate with them.</p>
              </div>
              <button onClick={() => setIsShareModalOpen(false)} className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex gap-2 mb-2">
                <input 
                  type="text" 
                  readOnly 
                  value={typeof window !== 'undefined' ? window.location.href : ''} 
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none" 
                />
                <button onClick={copyLink} className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-lg transition-all active:scale-95">
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-[#121214] px-6 py-4 border-t border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 border border-violet-500/30">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div>
                  <span className="text-sm font-medium text-zinc-300 block">Anyone with link</span>
                  <span className="text-[11px] text-zinc-500 block">Control what guests can do</span>
                </div>
              </div>
              
              <select 
                value={accessType}
                onChange={(e) => handleUpdateAccess(e.target.value)}
                disabled={isUpdatingAccess || !canWrite}
                className="bg-zinc-800 text-xs font-semibold text-zinc-200 px-3 py-2 rounded-md border border-zinc-700/80 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 cursor-pointer disabled:opacity-50 transition-all shadow-inner"
              >
                <option value="write">Can Edit (Full)</option>
                <option value="read">Can View (Read-Only)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .lb-root {
          --lb-z-index: 999999 !important; 
        }

        .ProseMirror blockquote {
          border-left: 3px solid #8b5cf6;
          margin: 1.5rem 0;
          background: rgba(139, 92, 246, 0.08);
          padding: 1.25rem;
          border-radius: 0.5rem;
        }
        .ProseMirror blockquote p {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        .ProseMirror blockquote p:last-child {
          margin-bottom: 0;
        }
        
        .ProseMirror pre {
          background: #18181b;
          color: #abb2bf;
          padding: 1.2rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255,255,255,0.05);
          font-family: 'Fira Code', 'Courier New', Courier, monospace;
          font-size: 0.9em;
          margin: 1rem 0;
          overflow-x: auto;
        }
        .ProseMirror pre code {
          background: none;
          padding: 0;
          color: inherit;
        }
        .hljs-keyword, .hljs-operator { color: #c678dd; } 
        .hljs-built_in, .hljs-type, .hljs-class .hljs-title { color: #e5c07b; } 
        .hljs-literal, .hljs-number { color: #d19a66; } 
        .hljs-string { color: #98c379; } 
        .hljs-title.function_ { color: #61afef; } 
        .hljs-comment { color: #5c6370; font-style: italic; } 
        .hljs-variable, .hljs-property { color: #e06c75; } 

        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror li {
          margin-bottom: 0.25rem;
        }
      `}</style>

      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-300">
          <div className="bg-zinc-900/90 text-violet-400 px-6 py-3 rounded-full text-sm md:text-base font-semibold flex items-center shadow-[0_0_30px_rgba(139,92,246,0.15)] border border-violet-500/20 animate-pulse">
            <span className="mr-3 text-xl">✨</span> AI is analyzing document...
          </div>
        </div>
      )}

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
              <><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div><span className="text-zinc-400">Connecting...</span></>
            ) : syncStatus === "disconnected" ? (
              <><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div><span className="text-red-400">Offline</span></>
            ) : isSyncing ? (
              <><div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-spin"></div><span className="text-yellow-400">Syncing...</span></>
            ) : (
              <><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div><span className="text-emerald-400">Saved</span></>
            )}
          </div>
          <ActiveUsers />
          <div className="w-px h-5 bg-zinc-800 mx-1 hidden sm:block"></div>
          
          {canWrite && (
            <button 
              type="button"
              onPointerDown={(e) => {
                e.preventDefault(); 
                e.stopPropagation();
              }} 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddComment();
              }} 
              className="flex items-center gap-1.5 text-xs font-semibold bg-sky-600/90 hover:bg-sky-500 text-white px-3 py-1.5 rounded-md shadow-[0_0_15px_rgba(2,132,199,0.3)] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Comment
            </button>
          )}
          
          <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white px-3.5 py-1.5 rounded-md shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all active:scale-95">Share</button>
          <button onClick={exportDocumentPDF} className="flex items-center gap-1.5 text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md border border-zinc-700/50 transition-all hover:text-white">PDF</button>
          <button onClick={exportDocumentTXT} className="flex items-center gap-1.5 text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md border border-zinc-700/50 transition-all hover:text-white">TXT</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto w-full relative bg-transparent custom-scrollbar">
        <DocumentHeader />
        
        <div className="p-5 md:p-10 max-w-4xl mx-auto w-full relative lb-root lb-dark">
          {canWrite && <Toolbar editor={editor} onAskAI={handleAskAI} />}
          {canWrite && <FloatingBubbleMenu editor={editor} />}
          
          <div className="z-[99999] relative">
            <FloatingThreads editor={editor} threads={threads} className="z-[99999]" />
            <FloatingComposer editor={editor} className="z-[99999]" />
          </div>
          
          <EditorContent editor={editor} className="w-full h-full mt-2" />
        </div>
      </div>
    </div>
  );
}