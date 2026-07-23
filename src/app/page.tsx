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

    if (!confirm("Initiate permanent deletion of this workspace?")) return;

    const previousWorkspaces = [...workspaces];
    setWorkspaces((prev) => prev.filter((ws) => ws.roomId !== roomId));

    try {
      const res = await fetch(`/api/workspaces/${roomId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Workspace eradicated.", {
        style: { background: '#0a0a0a', color: '#10b981', border: '1px solid #059669', borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(16,185,129,0.3)' }
      });
    } catch (error) {
      console.error(error);
      toast.error("System Error: Deletion failed.", {
        style: { background: '#0a0a0a', color: '#ef4444', border: '1px solid #dc2626', borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(239,68,68,0.3)' }
      });
      setWorkspaces(previousWorkspaces);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[100dvh] w-full bg-[#000000] overflow-hidden">
        <div className="flex flex-col items-center gap-8 relative z-10">
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute inset-0 rounded-full border border-white/5"></div>
            <div className="absolute inset-0 rounded-full border-t-[3px] border-violet-500 animate-[spin_1s_cubic-bezier(0.68,-0.55,0.265,1.55)_infinite] shadow-[0_0_20px_rgba(139,92,246,0.5)]"></div>
            <div className="w-6 h-6 bg-violet-500/20 rounded-full animate-pulse shadow-[inset_0_0_10px_rgba(139,92,246,0.8)]"></div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-zinc-300 tracking-[0.4em] text-[10px] font-bold uppercase font-mono">Quantum Engine</p>
            <p className="text-zinc-600 tracking-widest text-[9px] uppercase font-mono">Authenticating User Identity</p>
          </div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05)_0%,transparent_50%)] pointer-events-none"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#000000] text-zinc-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-white relative overflow-hidden antialiased">
      
      {/* 🌌 CINEMATIC LIGHTING & TEXTURE */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 blur-[150px] rounded-[100%] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-[100%] pointer-events-none z-0"></div>
      <div className="fixed top-[20%] left-[50%] -translate-x-1/2 w-[80%] h-[20%] bg-blue-500/5 blur-[120px] rounded-[100%] pointer-events-none z-0"></div>
      
      {/* Architectural Grid & Film Grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-screen z-0" style={{ backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`, backgroundSize: `48px 48px` }}></div>
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none z-0 mix-blend-overlay"></div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(20px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-float-up {
          animation: float-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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

      {/* 💎 FLOATING GLASS HEADER */}
      <header className="fixed top-0 inset-x-0 h-20 flex justify-between items-center px-6 md:px-10 z-50 transition-all duration-300 bg-gradient-to-b from-[#000000] via-[#000000]/80 to-transparent backdrop-blur-md">
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 bg-[#050505] rounded-xl flex items-center justify-center border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_10px_20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="text-white text-lg font-black tracking-tighter relative z-10 font-mono">W</span>
          </div>
          <h1 className="text-[17px] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 hidden sm:block">
            Workspace
          </h1>
        </div>
        
        <div className="relative z-10">
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="relative group bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-full font-bold transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full animate-shimmer"></div>
                Initialize Session
              </button>
            </SignInButton>
          ) : (
            <div className="flex items-center gap-4 sm:gap-6 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/[0.08] rounded-full px-2 py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2.5 pl-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)] z-10"></div>
                  <div className="absolute w-4 h-4 rounded-full bg-emerald-500/30 animate-ping"></div>
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono text-zinc-300 tracking-[0.2em] uppercase hidden md:block font-bold">Encrypted</span>
              </div>
              <div className="pl-3 sm:pl-4 border-l border-white/[0.08] flex items-center">
                <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/10 hover:border-white/20 transition-all shadow-sm" } }} />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full max-w-[1400px] mx-auto px-4 sm:px-8 pt-32 pb-12 relative z-10 custom-scrollbar overflow-y-auto">
        {!isSignedIn ? (
          /* 🚀 CINE-MATIC HERO SECTION */
          <div className="w-full flex flex-col items-center justify-center relative mt-10 md:mt-24 animate-float-up">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/10 text-zinc-300 text-xs sm:text-sm font-mono mb-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] cursor-default hover:bg-white/[0.05] transition-colors">
               <span className="relative flex h-2.5 w-2.5">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,1)]"></span>
               </span>
               Protocol v2.0 is Online
            </div>
             
            <h2 className="text-5xl sm:text-7xl md:text-[6.5rem] font-black mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-600 tracking-tighter text-center leading-[1.05] drop-shadow-sm filter">
              Engineering <br className="hidden sm:block"/> at the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 relative inline-block">
                speed of thought.
                <div className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-violet-500 to-transparent blur-sm opacity-50"></div>
              </span>
            </h2>
             
            <p className="text-zinc-400 mb-14 text-lg sm:text-2xl max-w-3xl text-center leading-relaxed font-medium">
              Synchronous multiplayer editing, embedded artificial intelligence, and an uncompromising spatial interface.
            </p>
             
            <SignInButton mode="modal">
              <button className="relative group bg-white text-black px-10 py-4 rounded-full font-bold text-base transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] flex items-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.15)] overflow-hidden">
                 <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full animate-shimmer"></div>
                 Deploy Workspace
                 <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </SignInButton>
          </div>
        ) : (
          /* 💎 SPATIAL DASHBOARD */
          <div className="w-full max-w-[1200px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6 relative animate-float-up">
              <div className="relative z-10">
                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500 mb-3">Your Architecture</h2>
                <p className="text-zinc-400 font-medium text-base">Select a node to resume collaborative synthesis.</p>
              </div>
              <div className="relative z-10 shadow-[0_10px_30px_rgba(139,92,246,0.15)] rounded-xl">
                <CreateWorkspaceButton />
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-52 bg-[#050505] rounded-3xl border border-white/[0.04] relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-shimmer"></div>
                  </div>
                ))}
              </div>
            ) : workspaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {workspaces.map((ws, index) => (
                  <Link 
                    href={`/documents/${ws.roomId}`} 
                    key={ws._id} 
                    className="group relative block outline-none rounded-3xl opacity-0 animate-float-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    
                    {/* 🔥 3D GLASS CARD DESIGN */}
                    <div className="h-full bg-[#050505]/80 backdrop-blur-xl border border-white/[0.06] p-7 rounded-3xl hover:-translate-y-2 shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-[0_30px_60px_rgba(139,92,246,0.12),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:border-violet-500/30 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                      
                      {/* Spotlight Hover Effect */}
                      <div className="absolute -inset-px bg-gradient-to-b from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                      <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] flex items-center justify-center text-zinc-400 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_5px_15px_rgba(0,0,0,0.5)] group-hover:text-violet-300 group-hover:bg-violet-500/10 group-hover:border-violet-500/40 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all duration-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        </div>
                        
                        <button 
                          onClick={(e) => deleteWorkspace(e, ws.roomId)}
                          className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-20 bg-[#0a0a0a] sm:bg-transparent border border-white/5 sm:border-transparent hover:border-red-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] sm:shadow-none active:scale-90"
                          title="Purge Document"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>

                      <div className="relative z-10">
                        <h4 className="font-black text-xl text-zinc-100 mb-3 truncate group-hover:text-white transition-colors tracking-tight">
                          {ws.title}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono font-semibold bg-[#000000] py-2 px-3.5 rounded-xl border border-white/[0.04] shadow-inner group-hover:border-white/[0.08] transition-colors">
                          <span>NODE: {ws.roomId.slice(0,8)}</span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-violet-400 group-hover:shadow-[0_0_8px_rgba(167,139,250,0.8)] transition-all duration-500"></span>
                            {new Date(ws.updatedAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
               /* 💎 TERMINAL-STYLE EMPTY STATE */
               <div className="flex flex-col items-center justify-center w-full py-32 px-4 border border-white/[0.05] rounded-[2.5rem] border-dashed bg-[#030303]/50 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden animate-float-up">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#000000] pointer-events-none"></div>
                 <div className="w-20 h-20 bg-gradient-to-br from-zinc-900 to-[#000000] border border-white/10 rounded-2xl flex items-center justify-center text-zinc-600 mb-6 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.8)] relative z-10">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"/></svg>
                 </div>
                 <h3 className="text-2xl font-black text-white mb-2 tracking-tighter relative z-10">Void Detected</h3>
                 <p className="text-zinc-500 text-sm font-medium text-center max-w-sm relative z-10">No intelligence nodes found in your matrix. Initialize a new workspace to begin processing.</p>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}