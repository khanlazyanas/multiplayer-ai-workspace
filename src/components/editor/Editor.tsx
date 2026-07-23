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
          class: 'bg-violet-500/15 text-violet-300 rounded-md px-2 py-0.5 font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-violet-500/30 transition-all hover:bg-violet-500/25 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] cursor-pointer',
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
          class: 'mac-os-code-block',
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-full text-zinc-300 text-base md:text-[17px] cursor-text leading-loose ProseMirror pb-40 pt-4 selection:bg-violet-500/40 selection:text-white antialiased",
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

              const finalContent = `<blockquote class="ai-blockquote"><p><strong style="color: #d8b4fe; text-shadow: 0 0 15px rgba(216, 180, 254, 0.5); display: flex; align-items: center; gap: 6px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> AI Intelligence</strong></p>${rawHTML}</blockquote><p></p>`;

              if (editor) {
                editor.commands.insertContent(finalContent);
              }
            })
            .catch((err) => {
              console.error(err);
              toast.error("Network Error: Could not connect to AI matrix.");
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
      toast.error("Please highlight or write a query for the AI first.", {
        style: { background: '#0a0a0a', color: '#e4e4e7', border: '1px solid #27272a', borderRadius: '12px' }
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

      const finalContent = `<blockquote class="ai-blockquote"><p><strong style="color: #d8b4fe; text-shadow: 0 0 15px rgba(216, 180, 254, 0.5); display: flex; align-items: center; gap: 6px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> AI Intelligence</strong></p>${rawHTML}</blockquote><p></p>`;

      editor.commands.insertContent(finalContent);
    })
    .catch((err) => {
      console.error(err);
      toast.error("Network Error: Could not connect to AI matrix.");
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
    link.download = "ultra-workspace.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Document compiled to TXT successfully!", {
      style: { background: '#0a0a0a', color: '#34d399', border: '1px solid #059669', borderRadius: '12px' }
    });
  };

  const exportDocumentPDF = async () => {
    if (!editor) return;
    const toastId = toast.loading("Rendering High-Fidelity PDF...", {
      style: { background: '#0a0a0a', color: '#e4e4e7', border: '1px solid #27272a', borderRadius: '12px' }
    });
    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const element = document.querySelector('.ProseMirror') as HTMLElement; 
      if (!element) throw new Error("Document content not found");

      const opt = {
        margin: [1, 1, 1, 1],
        filename: 'ultra-workspace.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 3, 
          useCORS: true, 
          logging: false,
          onclone: (clonedDoc: any) => {
            const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
            styles.forEach((styleTag: any) => styleTag.remove());
            const clonedEditor = clonedDoc.querySelector('.ProseMirror');
            if (clonedEditor) {
              clonedEditor.style.backgroundColor = '#ffffff';
              clonedEditor.style.color = '#000000';
              clonedEditor.style.padding = '40px';
              clonedEditor.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
              const allElements = clonedEditor.querySelectorAll('*');
              allElements.forEach((el: any) => el.style.color = '#000000');
            }
          }
        }, 
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      await (html2pdf as any)().set(opt).from(element).save();
      toast.success("PDF generated successfully!", { id: toastId, style: { background: '#0a0a0a', color: '#34d399', border: '1px solid #059669', borderRadius: '12px' } });
    } catch (err: any) {
      console.error("PDF Export Error:", err);
      toast.error(`Export Failed: ${err.message}`, { id: toastId });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Secure invite link copied!", {
      style: { background: '#0a0a0a', color: '#c084fc', border: '1px solid #7e22ce', borderRadius: '12px' }
    });
    setIsShareModalOpen(false); 
  };

  const handleUpdateAccess = async (newAccess: string) => {
    setAccessType(newAccess);
    setIsUpdatingAccess(true);
    
    const toastId = toast.loading("Configuring access protocols...", {
      style: { background: '#0a0a0a', color: '#e4e4e7', border: '1px solid #27272a', borderRadius: '12px' }
    });
    
    try {
      const res = await fetch('/api/room/update-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, accessType: newAccess })
      });
      
      if (!res.ok) throw new Error("Failed to sync with backend");
      
      toast.success(`Access updated securely! Syncing network...`, { 
        id: toastId,
        style: { background: '#0a0a0a', color: '#34d399', border: '1px solid #059669', borderRadius: '12px' }
      });

      broadcast({ type: "PERMISSION_CHANGED" });

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error(error);
      toast.error("Failed to reconfigure access", { id: toastId });
      setAccessType(accessType === "write" ? "read" : "write"); 
    } finally {
      setIsUpdatingAccess(false);
    }
  };

  const handleAddComment = () => {
    if (!editor || !canWrite) return;
    
    if (editor.state.selection.empty) {
      toast.error("Highlight a specific section to comment.", {
        style: { background: '#0a0a0a', color: '#e4e4e7', border: '1px solid #27272a', borderRadius: '12px' }
      });
      return;
    }
    
    if (editor.isActive('codeBlock')) {
      toast.error("Inline comments inside code blocks are restricted.", {
        style: { background: '#0a0a0a', color: '#e4e4e7', border: '1px solid #27272a', borderRadius: '12px' }
      });
      return;
    }
    
    setTimeout(() => {
      editor.chain().focus().addPendingComment().run();
    }, 50);
  };

  if (!editor) return (
    <div className="flex items-center justify-center h-[100dvh] w-full bg-[#000000]">
      <div className="flex flex-col items-center gap-6 relative">
        <div className="absolute inset-0 bg-violet-600/30 blur-[80px] rounded-full"></div>
        <div className="w-12 h-12 border-[3px] border-white/5 border-t-violet-500 rounded-full animate-spin relative z-10 shadow-[0_0_30px_rgba(139,92,246,0.4)]"></div>
        <p className="text-zinc-500 tracking-[0.3em] text-[11px] uppercase font-mono animate-pulse relative z-10 font-bold">Booting Quantum Engine</p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-[#000000] relative flex flex-col font-sans text-zinc-100 selection:bg-violet-500/30">
      
      <div className="absolute top-[-10%] left-[20%] w-[60%] h-[30%] bg-violet-600/15 blur-[120px] rounded-[100%] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[40%] bg-blue-600/10 blur-[130px] rounded-[100%] pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0 mix-blend-overlay"></div>

      {isShareModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-300 p-4">
          <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/[0.08] rounded-3xl w-full max-w-md shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_30px_100px_rgba(0,0,0,1)] overflow-hidden relative scale-in-95 duration-200">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-violet-500/20 blur-[80px] pointer-events-none"></div>

            <div className="p-6 md:p-8 border-b border-white/[0.04] flex justify-between items-start relative z-10">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 mb-1.5">
                  Share Access
                </h3>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed">Invite external collaborators securely.</p>
              </div>
              <button onClick={() => setIsShareModalOpen(false)} className="text-zinc-500 hover:text-white p-2.5 rounded-full hover:bg-white/5 transition-all focus:outline-none ring-1 ring-transparent hover:ring-white/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-6 md:p-8 relative z-10">
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  readOnly 
                  value={typeof window !== 'undefined' ? window.location.href : ''} 
                  className="w-full bg-[#000000] border border-white/[0.1] rounded-xl px-4 py-3.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/60 transition-all font-mono tracking-tight shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" 
                />
                <button onClick={copyLink} className="group relative bg-white text-black px-6 py-3.5 rounded-xl text-sm font-bold shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all active:scale-95 hover:bg-zinc-200 overflow-hidden shrink-0">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  Copy Link
                </button>
              </div>
            </div>

            <div className="bg-[#030303] px-6 md:px-8 py-6 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-300 border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div>
                  <span className="text-sm font-bold text-zinc-100 block tracking-wide">General Access</span>
                  <span className="text-[13px] text-zinc-500 block mt-0.5 font-medium">Manage link permissions</span>
                </div>
              </div>
              
              <select 
                value={accessType}
                onChange={(e) => handleUpdateAccess(e.target.value)}
                disabled={isUpdatingAccess || !canWrite}
                className="bg-[#0a0a0a] text-sm font-bold text-zinc-200 px-4 py-3 rounded-xl border border-white/[0.1] outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 cursor-pointer disabled:opacity-50 transition-all shadow-lg w-full sm:w-auto appearance-none hover:bg-[#111111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a1a1aa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem', paddingRight: '2.5rem' }}
              >
                <option value="write">Can Edit</option>
                <option value="read">Can View</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .lb-root {
          --lb-z-index: 999999 !important; 
        }

        .ai-blockquote {
          position: relative;
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-top: 1px solid rgba(168, 85, 247, 0.4);
          margin: 2.5rem 0;
          background: linear-gradient(180deg, rgba(168, 85, 247, 0.05) 0%, rgba(168, 85, 247, 0.01) 100%);
          padding: 1.5rem 2rem;
          border-radius: 16px;
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px) saturate(150%);
        }
        .ai-blockquote p {
          margin-bottom: 1rem;
          line-height: 1.7;
          color: #e4e4e7;
          font-weight: 400;
          font-size: 1.05em;
        }
        .ai-blockquote p:last-child {
          margin-bottom: 0;
        }
        
        .ProseMirror code {
          background-color: rgba(255, 255, 255, 0.05); 
          color: #e4e4e7; 
          padding: 0.2rem 0.4rem;
          border-radius: 6px;
          font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
          font-size: 0.85em;
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-weight: 500;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .ProseMirror pre code {
          background-color: transparent !important;
          color: inherit !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
        }

        .mac-os-code-block {
          position: relative;
          background: #050505;
          color: #a1a1aa;
          padding: 3rem 1.5rem 1.5rem 1.5rem; 
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
          font-size: 0.85em;
          margin: 2.5rem 0;
          overflow-x: auto;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 30px 60px -20px rgba(0, 0, 0, 1);
          line-height: 1.7;
        }
        .mac-os-code-block::before {
          content: '';
          position: absolute;
          top: 16px;
          left: 16px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ff5f56;
          box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
        }

        @media (max-width: 640px) {
          .ai-blockquote {
            margin: 1.5rem 0;
            padding: 1.25rem 1.25rem;
            border-radius: 12px;
          }
          .mac-os-code-block {
            padding: 2.5rem 1rem 1rem 1rem;
            margin: 1.5rem 0;
            border-radius: 10px;
          }
          .mac-os-code-block::before {
            top: 12px;
            left: 12px;
            width: 10px;
            height: 10px;
            box-shadow: 16px 0 0 #ffbd2e, 32px 0 0 #27c93f;
          }
        }

        .hljs-keyword, .hljs-operator { color: #c678dd; } 
        .hljs-built_in, .hljs-type, .hljs-class .hljs-title { color: #e5c07b; font-weight: 500; } 
        .hljs-literal, .hljs-number { color: #d19a66; } 
        .hljs-string { color: #98c379; } 
        .hljs-title.function_ { color: #61afef; font-weight: 500; } 
        .hljs-comment { color: #52525b; font-style: italic; } 
        .hljs-variable, .hljs-property { color: #e06c75; } 

        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .ProseMirror li {
          margin-bottom: 0.5rem;
          line-height: 1.8;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1); 
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2); 
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }

        @keyframes spin-gradient {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* 🔥 THE BUG FIX: SOLID TEXT + DROP SHADOW TO PREVENT CLIPPING ISSUES 🔥 */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/5 bg-transparent"></div>
              <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-violet-500 animate-[spin-gradient_1s_linear_infinite] shadow-[0_0_30px_rgba(139,92,246,0.6)]"></div>
              <div className="w-8 h-8 bg-violet-500/20 rounded-full animate-pulse shadow-[inset_0_0_15px_rgba(139,92,246,0.8)]"></div>
            </div>
            {/* This is completely safe and won't turn into a white block */}
            <span className="text-zinc-200 font-mono tracking-[0.2em] text-xs font-bold uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">Processing Query...</span>
          </div>
        </div>
      )}

      <div className="absolute top-4 md:top-6 left-0 right-0 z-30 flex justify-center pointer-events-none px-4">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl px-4 sm:px-6 py-3 border border-white/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-2xl flex items-center justify-between w-full max-w-[1200px] pointer-events-auto transition-all">
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex p-1.5 bg-gradient-to-b from-white/10 to-transparent rounded-lg border border-white/10 shadow-inner">
               <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <DocumentTitle />
          </div>
          
          <div className="flex items-center gap-3 min-w-fit overflow-x-auto no-scrollbar pl-4">
            <div className="flex items-center gap-2 mr-2 bg-black/80 px-3 py-1.5 rounded-full border border-white/[0.08] text-[10px] sm:text-xs font-mono shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
              {syncStatus === "initial" || syncStatus === "connecting" || syncStatus === "reconnecting" ? (
                <><div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div><span className="text-zinc-400 hidden sm:inline">Connecting</span></>
              ) : syncStatus === "disconnected" ? (
                <><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div><span className="text-red-400 hidden sm:inline">Offline</span></>
              ) : isSyncing ? (
                <><div className="w-2 h-2 rounded-full bg-yellow-400 animate-spin shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div><span className="text-yellow-400 hidden sm:inline">Syncing</span></>
              ) : (
                <><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div><span className="text-emerald-400 hidden sm:inline font-bold">Saved</span></>
              )}
            </div>
            <ActiveUsers />
            <div className="w-px h-6 bg-white/[0.08] mx-1 hidden sm:block"></div>
            
            {canWrite && (
              <button 
                type="button"
                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }} 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddComment(); }} 
                className="group flex items-center gap-1.5 text-[11px] sm:text-xs font-bold bg-[#111] hover:bg-[#1a1a1a] text-zinc-100 px-3.5 py-2 rounded-lg border border-white/[0.08] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] active:scale-95"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 group-hover:text-sky-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span className="hidden sm:inline">Comment</span>
              </button>
            )}
            
            <button onClick={() => setIsShareModalOpen(true)} className="relative flex items-center gap-1.5 text-[11px] sm:text-xs font-bold bg-white text-black hover:bg-zinc-200 px-4.5 py-2 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all active:scale-95 shrink-0 overflow-hidden group">
               <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
               Share
            </button>
            
            <div className="flex bg-black/60 rounded-lg border border-white/[0.08] p-0.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
              <button onClick={exportDocumentPDF} className="flex items-center gap-1 text-[10px] sm:text-xs font-bold hover:bg-white/10 text-zinc-400 px-2.5 sm:px-3 py-1.5 rounded-md transition-all hover:text-white shrink-0">PDF</button>
              <div className="w-px h-4 bg-white/[0.08] my-auto"></div>
              <button onClick={exportDocumentTXT} className="flex items-center gap-1 text-[10px] sm:text-xs font-bold hover:bg-white/10 text-zinc-400 px-2.5 sm:px-3 py-1.5 rounded-md transition-all hover:text-white shrink-0">TXT</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto w-full relative bg-transparent custom-scrollbar scroll-smooth z-10 pt-24 md:pt-32">
        <div className="relative z-10">
          <DocumentHeader />
        </div>
        
        <div className="px-3 py-4 sm:px-6 sm:py-6 md:p-12 max-w-[900px] mx-auto w-full relative lb-root lb-dark z-10">
          {canWrite && <FloatingBubbleMenu editor={editor} />}
          
          <div className="z-[99999] relative">
            <FloatingThreads editor={editor} threads={threads} className="z-[99999]" />
            <FloatingComposer editor={editor} className="z-[99999]" />
          </div>
          
          <EditorContent editor={editor} className="w-full h-full mt-4" />
        </div>
      </div>

      {canWrite && (
        <div className="absolute bottom-4 sm:bottom-6 md:bottom-10 left-0 right-0 flex justify-center z-50 pointer-events-none animate-in slide-in-from-bottom-8 fade-in duration-500">
           <div className="pointer-events-auto">
             <Toolbar editor={editor} onAskAI={handleAskAI} />
           </div>
        </div>
      )}

    </div>
  );
}