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
          class: 'bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-violet-300 rounded-md px-2.5 py-0.5 font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-violet-500/30 transition-all duration-300 hover:from-violet-500/20 hover:to-indigo-500/20 hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:-translate-y-[1px] cursor-pointer',
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
        class: "focus:outline-none min-h-full text-zinc-300 text-[16px] md:text-[18px] cursor-text leading-[1.8] tracking-[-0.01em] ProseMirror pb-40 pt-4 selection:bg-violet-600/40 selection:text-white antialiased",
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
              if (!res.ok || !res.body) throw new Error("API Error"); 

              setIsLoading(false); 

              if (editor) {
                // Ek nayi line add karo jahan AI likhna shuru karega
                editor.commands.insertContent('<p></p>');
                const startPos = editor.state.selection.from;
                
                // Live typing indicator
                editor.commands.insertText("✨ AI Synapse is writing...\n\n");

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let fullResponseText = "";
                
                // NATIVE TIPTAP STREAMING - Secure & Liveblocks compatible
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  
                  const chunk = decoder.decode(value, { stream: true });
                  if (chunk) {
                    fullResponseText += chunk;
                    editor.commands.insertText(chunk);
                  }
                }

                // Jaise hi streaming khtm ho, pura data select karke replace kardo beautiful markdown blockquote se
                const endPos = editor.state.selection.to;

                if (fullResponseText) {
                  const rawHTML = await marked.parse(fullResponseText.trim());
                  const finalContent = `<blockquote class="ai-blockquote"><p><strong style="color: #e9d5ff; text-shadow: 0 0 20px rgba(216, 180, 254, 0.7); display: flex; align-items: center; gap: 8px; font-weight: 800; letter-spacing: -0.02em;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #c084fc; drop-shadow: 0 0 5px rgba(192, 132, 252, 0.5);"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> AI Synapse</strong></p>${rawHTML}</blockquote><p></p>`;
                  
                  editor.chain()
                    .deleteRange({ from: startPos, to: endPos })
                    .insertContent(finalContent)
                    .focus()
                    .run();
                }
              }
            })
            .catch((err) => {
              console.error(err);
              toast.error("Critical Failure: Neural Link Severed.", {
                style: { background: '#050505', color: '#ef4444', border: '1px solid #7f1d1d', borderRadius: '16px' }
              });
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
      toast.error("Awaiting input prompt.", {
        style: { background: '#050505', color: '#a1a1aa', border: '1px solid #27272a', borderRadius: '16px' }
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
      if (!res.ok || !res.body) throw new Error("API Error"); 

      setIsLoading(false);

      // Same rock-solid logic for the toolbar button
      editor.commands.insertContent('<p></p>');
      const startPos = editor.state.selection.from;
      editor.commands.insertText("✨ AI Synapse is writing...\n\n");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponseText = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          fullResponseText += chunk;
          editor.commands.insertText(chunk);
        }
      }

      const endPos = editor.state.selection.to;

      if (editor && fullResponseText) {
        const rawHTML = await marked.parse(fullResponseText.trim());
        const finalContent = `<blockquote class="ai-blockquote"><p><strong style="color: #e9d5ff; text-shadow: 0 0 20px rgba(216, 180, 254, 0.7); display: flex; align-items: center; gap: 8px; font-weight: 800; letter-spacing: -0.02em;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #c084fc; drop-shadow: 0 0 5px rgba(192, 132, 252, 0.5);"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> AI Synapse</strong></p>${rawHTML}</blockquote><p></p>`;
        
        editor.chain()
          .deleteRange({ from: startPos, to: endPos })
          .insertContent(finalContent)
          .focus()
          .run();
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error("Critical Failure: Neural Link Severed.", {
        style: { background: '#050505', color: '#ef4444', border: '1px solid #7f1d1d', borderRadius: '16px' }
      });
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
    link.download = "engine-output.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Data synthesized to TXT.", {
      style: { background: '#050505', color: '#34d399', border: '1px solid #065f46', borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(52,211,153,0.2)' }
    });
  };

  const exportDocumentPDF = async () => {
    if (!editor) return;
    const toastId = toast.loading("Compiling high-fidelity PDF...", {
      style: { background: '#050505', color: '#e4e4e7', border: '1px solid #27272a', borderRadius: '16px' }
    });
    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const element = document.querySelector('.ProseMirror') as HTMLElement; 
      if (!element) throw new Error("Document payload missing.");

      const opt = {
        margin: [1, 1, 1, 1],
        filename: 'engine-output.pdf',
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
              clonedEditor.style.fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif';
              const allElements = clonedEditor.querySelectorAll('*');
              allElements.forEach((el: any) => el.style.color = '#000000');
            }
          }
        }, 
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      await (html2pdf as any)().set(opt).from(element).save();
      toast.success("PDF Compiled.", { id: toastId, style: { background: '#050505', color: '#34d399', border: '1px solid #065f46', borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(52,211,153,0.2)' } });
    } catch (err: any) {
      console.error("PDF Export Error:", err);
      toast.error(`Compilation Failed: ${err.message}`, { id: toastId });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Encrypted link copied to clipboard.", {
      style: { background: '#050505', color: '#c084fc', border: '1px solid #581c87', borderRadius: '16px', boxShadow: '0 10px 30px -10px rgba(192,132,252,0.2)' }
    });
    setIsShareModalOpen(false); 
  };

  const handleUpdateAccess = async (newAccess: string) => {
    setAccessType(newAccess);
    setIsUpdatingAccess(true);
    
    const toastId = toast.loading("Configuring firewall protocols...", {
      style: { background: '#050505', color: '#e4e4e7', border: '1px solid #27272a', borderRadius: '16px' }
    });
    
    try {
      const res = await fetch('/api/room/update-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, accessType: newAccess })
      });
      
      if (!res.ok) throw new Error("Failed to sync with backend");
      
      toast.success(`Access level elevated. Re-syncing...`, { 
        id: toastId,
        style: { background: '#050505', color: '#34d399', border: '1px solid #065f46', borderRadius: '16px' }
      });

      broadcast({ type: "PERMISSION_CHANGED" });

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error(error);
      toast.error("Firewall error.", { id: toastId });
      setAccessType(accessType === "write" ? "read" : "write"); 
    } finally {
      setIsUpdatingAccess(false);
    }
  };

  const handleAddComment = () => {
    if (!editor || !canWrite) return;
    
    if (editor.state.selection.empty) {
      toast.error("Highlight a specific vector to comment.", {
        style: { background: '#050505', color: '#e4e4e7', border: '1px solid #27272a', borderRadius: '16px' }
      });
      return;
    }
    
    if (editor.isActive('codeBlock')) {
      toast.error("Code-blocks are immutable to inline annotations.", {
        style: { background: '#050505', color: '#e4e4e7', border: '1px solid #27272a', borderRadius: '16px' }
      });
      return;
    }
    
    setTimeout(() => {
      editor.chain().focus().addPendingComment().run();
    }, 50);
  };

  if (!editor) return (
    <div className="flex items-center justify-center h-[100dvh] w-full bg-[#000000] overflow-hidden">
      <div className="flex flex-col items-center gap-8 relative z-10">
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-full border border-white/[0.03]"></div>
          <div className="absolute inset-0 rounded-full border-t-[3px] border-l-[1px] border-violet-500 animate-[spin_1.5s_cubic-bezier(0.68,-0.55,0.265,1.55)_infinite] shadow-[0_0_40px_rgba(139,92,246,0.5)]"></div>
          <div className="w-8 h-8 bg-violet-500/20 rounded-full animate-pulse shadow-[inset_0_0_20px_rgba(139,92,246,0.9)]"></div>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-zinc-200 tracking-[0.5em] text-[11px] font-black uppercase font-mono shadow-sm">Initializing Node</p>
          <p className="text-zinc-600 tracking-widest text-[9px] uppercase font-mono">Establishing neural link</p>
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08)_0%,transparent_60%)] pointer-events-none"></div>
    </div>
  );

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-[#000000] relative flex flex-col font-sans text-zinc-100 selection:bg-violet-600/40 selection:text-white">
      
      <div className="absolute top-[-15%] left-[10%] w-[70%] h-[40%] bg-violet-600/10 blur-[160px] rounded-[100%] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[0%] w-[60%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-[100%] pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none z-0 mix-blend-overlay"></div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-screen z-0" style={{ backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`, backgroundSize: `64px 64px` }}></div>

      {isShareModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300 p-4">
          <div className="bg-[#050505]/95 backdrop-blur-3xl border border-white/[0.06] rounded-[2rem] w-full max-w-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_40px_100px_rgba(0,0,0,1)] overflow-hidden relative scale-in-95 duration-200">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-32 bg-violet-500/15 blur-[80px] pointer-events-none"></div>

            <div className="p-8 md:p-10 border-b border-white/[0.04] flex justify-between items-start relative z-10">
              <div>
                <h3 className="text-3xl font-black tracking-tighter text-white flex items-center gap-2 mb-2">
                  Network Access
                </h3>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed">Establish secure links for external nodes.</p>
              </div>
              <button onClick={() => setIsShareModalOpen(false)} className="text-zinc-500 hover:text-white p-3 rounded-2xl hover:bg-white/[0.04] transition-all duration-300 focus:outline-none ring-1 ring-transparent hover:ring-white/10 active:scale-90">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-8 md:p-10 relative z-10">
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  readOnly 
                  value={typeof window !== 'undefined' ? window.location.href : ''} 
                  className="w-full bg-[#000000] border border-white/[0.08] rounded-2xl px-5 py-4 text-sm text-zinc-300 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all font-mono tracking-tight shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]" 
                />
                <button onClick={copyLink} className="group relative bg-white text-black px-8 py-4 rounded-2xl text-sm font-black shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all duration-300 active:scale-95 hover:bg-zinc-200 overflow-hidden shrink-0 hover:shadow-[0_0_50px_rgba(255,255,255,0.25)]">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                  Copy Key
                </button>
              </div>
            </div>

            <div className="bg-[#020202] px-8 md:px-10 py-8 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-[#111] flex items-center justify-center text-zinc-300 border border-white/[0.06] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_5px_15px_rgba(0,0,0,0.5)] shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div>
                  <span className="text-sm font-black text-zinc-100 block tracking-wide mb-1">Authorization</span>
                  <span className="text-[12px] text-zinc-500 block font-medium">Set network permissions</span>
                </div>
              </div>
              
              <select 
                value={accessType}
                onChange={(e) => handleUpdateAccess(e.target.value)}
                disabled={isUpdatingAccess || !canWrite}
                className="bg-[#0a0a0a] text-sm font-bold text-zinc-200 px-5 py-4 rounded-2xl border border-white/[0.08] outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 cursor-pointer disabled:opacity-50 transition-all shadow-xl w-full sm:w-auto appearance-none hover:bg-[#111111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a1a1aa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.25rem', paddingRight: '3.5rem' }}
              >
                <option value="write">Allow Edit</option>
                <option value="read">Read Only</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .lb-root {
          --lb-z-index: 999999 !important; 
        }

        /* 💎 GOD-TIER AI BLOCKQUOTE */
        .ai-blockquote {
          position: relative;
          border: 1px solid rgba(168, 85, 247, 0.15);
          border-top: 1px solid rgba(168, 85, 247, 0.4);
          margin: 3rem 0;
          background: linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, rgba(0, 0, 0, 0.4) 100%);
          padding: 2rem 2.5rem;
          border-radius: 20px;
          box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 1), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 0 40px rgba(168,85,247,0.05);
          backdrop-filter: blur(24px) saturate(180%);
        }
        .ai-blockquote::before {
          content: '';
          position: absolute;
          top: -1px; left: 20%; right: 20%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,0.8), transparent);
        }
        .ai-blockquote p {
          margin-bottom: 1.25rem;
          line-height: 1.8;
          color: #f4f4f5;
          font-weight: 400;
          letter-spacing: -0.01em;
        }
        .ai-blockquote p:last-child {
          margin-bottom: 0;
        }
        
        .ProseMirror code {
          background-color: rgba(255, 255, 255, 0.05); 
          color: #e4e4e7; 
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
          font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
          font-size: 0.85em;
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-weight: 500;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
          letter-spacing: -0.02em;
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
          background: #030303;
          color: #a1a1aa;
          padding: 3.5rem 2rem 2rem 2rem; 
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
          font-size: 0.85em;
          margin: 3rem 0;
          overflow-x: auto;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 40px 80px -20px rgba(0, 0, 0, 1);
          line-height: 1.8;
          letter-spacing: -0.01em;
        }
        .mac-os-code-block::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 20px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ff5f56;
          box-shadow: 22px 0 0 #ffbd2e, 44px 0 0 #27c93f;
          opacity: 0.8;
        }
        .mac-os-code-block::after {
          content: 'TERMINAL';
          position: absolute;
          top: 18px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.2);
          pointer-events: none;
        }

        @media (max-width: 640px) {
          .ai-blockquote {
            margin: 1.5rem 0;
            padding: 1.25rem 1.25rem;
            border-radius: 14px;
          }
          .mac-os-code-block {
            padding: 2.5rem 1.25rem 1.25rem 1.25rem;
            margin: 1.5rem 0;
            border-radius: 12px;
          }
          .mac-os-code-block::before {
            top: 14px; left: 14px; width: 10px; height: 10px;
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
          margin-bottom: 1.25rem;
        }
        .ProseMirror li {
          margin-bottom: 0.75rem;
          line-height: 1.8;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @keyframes spin-gradient { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-8">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/5 bg-transparent"></div>
              <div className="absolute inset-0 rounded-full border-t-[3px] border-r-[1px] border-violet-500 animate-[spin-gradient_1s_linear_infinite] shadow-[0_0_40px_rgba(139,92,246,0.5)]"></div>
              <div className="absolute inset-2 rounded-full border-b-[2px] border-indigo-400 animate-[spin-gradient_2s_linear_infinite_reverse] opacity-50"></div>
              <div className="w-10 h-10 bg-violet-500/20 rounded-full animate-pulse shadow-[inset_0_0_20px_rgba(139,92,246,0.9)] border border-violet-400/30"></div>
            </div>
            <span className="text-zinc-200 font-mono tracking-[0.3em] text-[11px] font-black uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">Synthesizing Response...</span>
          </div>
        </div>
      )}

      <div className="absolute top-4 md:top-8 left-0 right-0 z-30 flex justify-center pointer-events-none px-3 sm:px-4">
        
        <div className="bg-[#050505]/70 backdrop-blur-[40px] saturate-200 border border-white/[0.08] shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-[1.5rem] w-full max-w-[1200px] pointer-events-auto transition-all overflow-hidden">
          
          <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 w-full overflow-x-auto no-scrollbar">
            
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="hidden sm:flex p-2 bg-gradient-to-br from-white/10 to-transparent rounded-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <div className="min-w-[80px] shrink-0">
                 <DocumentTitle />
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3.5 shrink-0 pl-4 sm:pl-6">
              <div className="flex items-center gap-2 bg-black/60 px-3.5 py-2 rounded-full border border-white/[0.06] text-[10px] sm:text-[11px] font-mono shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] backdrop-blur-md shrink-0">
                {syncStatus === "initial" || syncStatus === "connecting" || syncStatus === "reconnecting" ? (
                  <><div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.9)]"></div><span className="text-zinc-300 hidden sm:inline uppercase tracking-wider font-bold">Connecting</span></>
                ) : syncStatus === "disconnected" ? (
                  <><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]"></div><span className="text-red-400 hidden sm:inline uppercase tracking-wider font-bold">Offline</span></>
                ) : isSyncing ? (
                  <><div className="w-2 h-2 rounded-full bg-yellow-400 animate-spin shadow-[0_0_10px_rgba(250,204,21,0.9)]"></div><span className="text-yellow-400 hidden sm:inline uppercase tracking-wider font-bold">Syncing</span></>
                ) : (
                  <><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]"></div><span className="text-emerald-400 hidden sm:inline uppercase tracking-wider font-bold">Encrypted</span></>
                )}
              </div>
              <div className="shrink-0">
                <ActiveUsers />
              </div>
              <div className="w-px h-8 bg-white/[0.08] mx-0.5 sm:mx-2 shrink-0"></div>
              
              {canWrite && (
                <button 
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }} 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddComment(); }} 
                  className="group flex items-center gap-2 text-[11px] sm:text-[12px] font-black tracking-wide bg-[#111] hover:bg-[#1a1a1a] text-zinc-100 px-4 py-2.5 rounded-xl border border-white/[0.08] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_5px_15px_rgba(0,0,0,0.5)] active:scale-95 shrink-0"
                >
                  <svg className="w-4 h-4 text-sky-400 group-hover:text-sky-300 transition-colors drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  <span className="hidden sm:inline">Comment</span>
                </button>
              )}
              
              <button onClick={() => setIsShareModalOpen(true)} className="relative flex items-center gap-1.5 text-[11px] sm:text-[12px] font-black tracking-wide bg-white text-black hover:bg-zinc-200 px-5 py-2.5 rounded-xl shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all duration-300 active:scale-95 shrink-0 overflow-hidden group">
                 <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                 Share Link
              </button>
              
              <div className="flex bg-[#050505] rounded-xl border border-white/[0.08] p-1 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] ml-1 sm:ml-2 shrink-0 pr-4 sm:pr-1">
                <button onClick={exportDocumentPDF} className="flex items-center gap-1 text-[10px] sm:text-xs font-black hover:bg-white/10 text-zinc-400 px-3 py-2 rounded-lg transition-all hover:text-white shrink-0">PDF</button>
                <div className="w-px h-5 bg-white/[0.08] my-auto shrink-0"></div>
                <button onClick={exportDocumentTXT} className="flex items-center gap-1 text-[10px] sm:text-xs font-black hover:bg-white/10 text-zinc-400 px-3 py-2 rounded-lg transition-all hover:text-white shrink-0">TXT</button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto w-full relative bg-transparent custom-scrollbar scroll-smooth z-10 pt-28 md:pt-40">
        <div className="relative z-10">
          <DocumentHeader />
        </div>
        
        <div className="px-4 py-6 sm:px-8 sm:py-10 md:p-16 max-w-[950px] mx-auto w-full relative lb-root lb-dark z-10">
          {canWrite && <FloatingBubbleMenu editor={editor} />}
          
          <div className="z-[99999] relative">
            <FloatingThreads editor={editor} threads={threads} className="z-[99999]" />
            <FloatingComposer editor={editor} className="z-[99999]" />
          </div>
          
          <EditorContent editor={editor} className="w-full h-full mt-6" />
        </div>
      </div>

      {canWrite && (
        <div className="absolute bottom-6 sm:bottom-8 md:bottom-12 left-0 right-0 flex justify-center z-50 pointer-events-none animate-in slide-in-from-bottom-10 fade-in duration-700 ease-out">
           <div className="pointer-events-auto">
             <Toolbar editor={editor} onAskAI={handleAskAI} />
           </div>
        </div>
      )}

    </div>
  );
}