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

    if (!confirm("Are you sure you want to delete this workspace?")) return;

    const previousWorkspaces = [...workspaces];
    setWorkspaces((prev) => prev.filter((ws) => ws.roomId !== roomId));

    try {
      const res = await fetch(`/api/workspaces/${roomId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Workspace deleted!");
    } catch (error) {
      console.error(error);
      toast.error("Could not delete workspace.");
      setWorkspaces(previousWorkspaces);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090E17] text-sky-500 animate-pulse font-medium">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
          <p className="tracking-widest text-sm text-slate-400 uppercase">Loading Environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090E17] text-slate-200 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* ULTRA PREMIUM HEADER */}
      <header className="flex justify-between items-center px-8 py-5 border-b border-white/[0.05] bg-[#090E17]/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)] border border-white/10">
            <span className="text-white text-xl font-black tracking-tighter">W</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
            Workspace
          </h1>
        </div>
        <div>
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="bg-white/5 hover:bg-white/10 text-slate-200 px-6 py-2 rounded-lg font-medium transition-all border border-white/10 hover:border-white/20 text-sm">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-slate-500 hidden md:block">Connected</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
              <div className="pl-4 border-l border-white/10">
                <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 border border-white/10 shadow-lg" } }} />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full max-w-7xl mx-auto px-6 py-12 relative z-10">
        {!isSignedIn ? (
          /* PREVIOUS LANDING PAGE REMAINS HERE (Omitted for brevity, paste your current landing page code here if needed, or I can provide it again) */
          <div className="w-full flex flex-col items-center justify-center relative mt-20">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sky-400 text-sm font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                MERN Stack Powered
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tighter text-center">
                Think, Write, and <br/> Build Together.
              </h2>
              
              <p className="text-slate-400 mb-10 text-lg max-w-2xl text-center leading-relaxed font-light">
                An enterprise-grade, real-time collaborative workspace. Experience seamless document editing, smart AI assistance, and instant synchronization.
              </p>
              
              <SignInButton mode="modal">
                  <button className="bg-sky-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_40px_rgba(14,165,233,0.3)] hover:shadow-[0_0_60px_rgba(14,165,233,0.5)] hover:scale-105 active:scale-95 flex items-center gap-2">
                    Start Creating Free →
                  </button>
              </SignInButton>
          </div>
        ) : (
          /* 🔥 ULTRA PREMIUM DASHBOARD FOR LOGGED-IN USERS */
          <div className="w-full">
            {/* Dashboard Header & Create Button */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-100 mb-2">Projects Overview</h2>
                <p className="text-slate-500 font-medium text-sm">Manage your collaborative workspaces and documents.</p>
              </div>
              <div className="shadow-[0_0_30px_rgba(14,165,233,0.15)] rounded-full">
                <CreateWorkspaceButton />
              </div>
            </div>

            {/* Workspaces Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 bg-white/5 rounded-2xl border border-white/5 animate-pulse"></div>
                ))}
              </div>
            ) : workspaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaces.map((ws) => (
                  <Link href={`/documents/${ws.roomId}`} key={ws._id} className="group relative block">
                    <div className="h-full bg-[#111827]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:border-sky-500/50 hover:bg-[#1f2937]/80 transition-all duration-300 shadow-xl overflow-hidden">
                      
                      {/* Top Action Bar */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                          📄
                        </div>
                        
                        <button 
                          onClick={(e) => deleteWorkspace(e, ws.roomId)}
                          className="text-slate-600 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-20"
                          title="Delete Workspace"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Content */}
                      <div>
                        <h4 className="font-semibold text-lg text-slate-200 mb-1 truncate group-hover:text-sky-400 transition-colors" title={ws.title}>
                          {ws.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                          <span>ID: {ws.roomId.slice(0,8)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                          <span>{new Date(ws.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Hover Overlay Glow */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-sky-900/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"></div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center w-full py-24 px-4 bg-white/[0.02] border border-white/5 rounded-3xl border-dashed">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-2xl mb-4">📭</div>
                 <h3 className="text-xl font-bold text-slate-300 mb-2">No projects yet</h3>
                 <p className="text-slate-500 text-center max-w-sm">Create your first collaborative workspace and start building together with your team.</p>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}