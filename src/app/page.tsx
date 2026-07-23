"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CreateWorkspaceButton } from "@/components/CreateWorkspaceButton"; 
import toast from "react-hot-toast";

interface WorkspaceData {
  _id: string;
  roomId: string;
  title: string;
  updatedAt: string;
}

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!isSignedIn) return;
      try {
        const res = await fetch("/api/workspaces");
        if (res.ok) {
          const data = await res.json();
          setWorkspaces(data);
        }
      } catch (error) {
        console.error("Failed to fetch workspaces", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, [isSignedIn]);

  const deleteWorkspace = async (e: React.MouseEvent, roomId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to permanently delete this workspace?")) return;

    const previousWorkspaces = [...workspaces];
    setWorkspaces((prev) => prev.filter((ws) => ws.roomId !== roomId));

    try {
      const res = await fetch(`/api/workspaces/${roomId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Workspace deleted successfully!", {
        style: { background: '#0a0a0a', color: '#34d399', border: '1px solid #059669', borderRadius: '12px' }
      });
    } catch (error) {
      console.error(error);
      toast.error("Error: Could not delete workspace.", {
        style: { background: '#0a0a0a', color: '#ef4444', border: '1px solid #dc2626', borderRadius: '12px' }
      });
      setWorkspaces(previousWorkspaces);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[100dvh] w-full bg-[#000000]">
        <div className="flex flex-col items-center gap-6 relative">
          <div className="absolute inset-0 bg-violet-600/30 blur-[80px] rounded-full"></div>
          <div className="w-12 h-12 border-[3px] border-white/5 border-t-violet-500 rounded-full animate-spin relative z-10 shadow-[0_0_30px_rgba(139,92,246,0.4)]"></div>
          <p className="text-zinc-500 tracking-[0.3em] text-[11px] uppercase font-mono animate-pulse relative z-10 font-bold">Authenticating Identity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-white relative overflow-hidden antialiased">
      
      {/* 🌌 ULTRA PREMIUM AMBIENT BACKGROUND */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/15 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-0" style={{ backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`, backgroundSize: `32px 32px` }}></div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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
      `}</style>

      {/* 💎 FROSTED GLASS HEADER */}
      <header className="flex justify-between items-center px-6 md:px-12 py-5 border-b border-white/[0.04] bg-[#000000]/60 backdrop-blur-3xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-xl flex items-center justify-center border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(139,92,246,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-violet-500/20 blur-md"></div>
            <span className="text-white text-xl font-black tracking-tighter relative z-10">W</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">
            Workspace
          </h1>
        </div>
        <div>
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="relative group bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-xl font-bold transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95 overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                Sign In
              </button>
            </SignInButton>
          ) : (
            <div className="flex items-center gap-4 sm:gap-6 bg-[#0a0a0a] border border-white/[0.06] rounded-full px-2 py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-2 pl-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 tracking-widest uppercase hidden md:block font-semibold">Network Secured</span>
              </div>
              <div className="pl-3 sm:pl-4 border-l border-white/10 flex items-center">
                <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/10 shadow-sm" } }} />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-12 relative z-10 custom-scrollbar overflow-y-auto">
        {!isSignedIn ? (
          /* 🚀 PURE CINEMATIC LANDING PAGE */
          <div className="w-full flex flex-col items-center justify-center relative mt-16 md:mt-32">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 text-zinc-300 text-xs sm:text-sm font-mono mb-10 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
               <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)] animate-pulse"></span>
               Next-Gen Collaboration Engine
            </div>
             
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 tracking-tighter text-center leading-[1.05] drop-shadow-sm">
              The workspace for <br className="hidden sm:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400" style={{ textShadow: '0 0 40px rgba(168,85,247,0.3)' }}>high-velocity</span> teams.
            </h2>
             
            <p className="text-zinc-400 mb-14 text-base sm:text-xl max-w-3xl text-center leading-relaxed font-medium">
              Real-time synchronization, AI-powered intelligence, and a distraction-free architecture. Built entirely on the modern web stack.
            </p>
             
            <SignInButton mode="modal">
              <button className="relative group bg-white text-black px-10 py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.15)] overflow-hidden">
                 <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                 Start Creating Free
                 <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </SignInButton>
          </div>
        ) : (
          /* 💎 SLEEK ONYX DASHBOARD */
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6 relative">
              <div className="absolute -left-10 top-0 w-32 h-32 bg-violet-600/10 blur-[80px] pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">Documents</h2>
                <p className="text-zinc-400 font-medium">Manage your collaborative intelligence sessions.</p>
              </div>
              <div className="relative z-10">
                <CreateWorkspaceButton />
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-44 bg-[#0a0a0a] rounded-2xl border border-white/[0.04] relative overflow-hidden">
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                  </div>
                ))}
              </div>
            ) : workspaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaces.map((ws) => (
                  <Link href={`/documents/${ws.roomId}`} key={ws._id} className="group relative block outline-none focus:ring-2 focus:ring-violet-500/50 rounded-2xl">
                    
                    {/* 🔥 ULTRA PREMIUM CARD DESIGN */}
                    <div className="h-full bg-[#050505] border border-white/[0.06] p-6 rounded-2xl hover:-translate-y-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_rgba(139,92,246,0.15)] hover:border-violet-500/40 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[170px]">
                      
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-[#111] border border-white/5 flex items-center justify-center text-zinc-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group-hover:text-violet-300 group-hover:bg-violet-500/20 group-hover:border-violet-500/30 transition-all duration-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        </div>
                        
                        {/* 🔥 FIX: MOBILE DELETE BUTTON VISIBILITY & STYLING */}
                        <button 
                          onClick={(e) => deleteWorkspace(e, ws.roomId)}
                          className="text-zinc-500 hover:text-red-400 hover:bg-red-500/15 p-2 rounded-lg transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-20 bg-[#111] sm:bg-transparent border border-white/5 sm:border-transparent hover:border-red-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] sm:shadow-none active:scale-95"
                          title="Delete Workspace"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>

                      <div className="relative z-10">
                        <h4 className="font-bold text-lg text-zinc-100 mb-2.5 truncate group-hover:text-violet-200 transition-colors tracking-tight">
                          {ws.title}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono font-medium bg-white/[0.02] py-1.5 px-3 rounded-lg border border-white/[0.02]">
                          <span>ID: {ws.roomId.slice(0,8)}</span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-violet-400 transition-colors"></span>
                            {new Date(ws.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
               /* 💎 PREMIUM EMPTY STATE */
               <div className="flex flex-col items-center justify-center w-full py-28 px-4 border border-white/[0.08] rounded-3xl border-dashed bg-[#050505] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none mix-blend-overlay"></div>
                 <div className="w-16 h-16 bg-[#0a0a0a] border border-white/10 rounded-2xl flex items-center justify-center text-zinc-600 mb-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_20px_rgba(0,0,0,0.5)]">
                   <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                 </div>
                 <h3 className="text-lg font-bold text-zinc-200 mb-2 tracking-tight">No intelligence documents found</h3>
                 <p className="text-zinc-500 text-sm font-medium text-center max-w-xs">Initialize your first workspace to begin collaboration and AI interaction.</p>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}