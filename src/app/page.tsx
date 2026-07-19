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
      <div className="flex min-h-screen items-center justify-center bg-black text-violet-500 font-medium">
        <div className="flex flex-col items-center gap-5">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin"></div>
          <p className="tracking-[0.2em] text-xs text-zinc-500 uppercase font-mono">Initializing System</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-200 relative overflow-hidden">
      
      {/* Stealthy AI Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-fuchsia-900/10 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* MINIMALIST HEADER */}
      <header className="flex justify-between items-center px-8 py-5 border-b border-zinc-800/80 bg-black/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
            <span className="text-zinc-100 text-lg font-bold">W</span>
          </div>
          <h1 className="text-lg font-semibold tracking-wide text-zinc-100">
            Workspace
          </h1>
        </div>
        <div>
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-md font-medium transition-colors text-sm">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <span className="text-[11px] font-mono text-zinc-500 tracking-wider uppercase hidden md:block">System Online</span>
              </div>
              <div className="pl-5 border-l border-zinc-800">
                <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 rounded-md border border-zinc-700" } }} />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full max-w-7xl mx-auto px-6 py-12 relative z-10">
        {!isSignedIn ? (
          /* PURE BLACK LANDING PAGE */
          <div className="w-full flex flex-col items-center justify-center relative mt-24">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
                Next-Gen Collaboration
              </div>
              
              <h2 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-600 tracking-tight text-center leading-[1.1]">
                The workspace for <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">high-velocity</span> teams.
              </h2>
              
              <p className="text-zinc-500 mb-12 text-lg max-w-2xl text-center leading-relaxed">
                Real-time synchronization, AI-powered writing, and a distraction-free environment. Built purely on the MERN stack.
              </p>
              
              <SignInButton mode="modal">
                  <button className="bg-white hover:bg-zinc-200 text-black px-8 py-3.5 rounded-lg font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    Start Creating Free
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
              </SignInButton>
          </div>
        ) : (
          /* SLEEK ONYX DASHBOARD */
          <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 mb-1.5">Documents</h2>
                <p className="text-zinc-500 text-sm">Your recent collaborative sessions.</p>
              </div>
              <div className="shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                <CreateWorkspaceButton />
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-36 bg-zinc-900/50 rounded-xl border border-zinc-800/50 animate-pulse"></div>
                ))}
              </div>
            ) : workspaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {workspaces.map((ws) => (
                  <a href={`/documents/${ws.roomId}`} key={ws._id} className="group relative block">
                    <div className="h-full bg-[#0A0A0A] border border-zinc-800 p-5 rounded-xl hover:border-violet-500/30 hover:bg-[#111] transition-all duration-300">
                      
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-violet-400 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        </div>
                        
                        <button 
                          onClick={(e) => deleteWorkspace(e, ws.roomId)}
                          className="text-zinc-600 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 z-20"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>

                      <div>
                        <h4 className="font-medium text-base text-zinc-200 mb-2 truncate group-hover:text-violet-300 transition-colors">
                          {ws.title}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-zinc-600 font-mono">
                          <span>{ws.roomId.slice(0,8)}</span>
                          <span>{new Date(ws.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center w-full py-20 px-4 border border-zinc-800/50 rounded-2xl border-dashed bg-zinc-900/20">
                 <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 mb-4">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                 </div>
                 <h3 className="text-sm font-medium text-zinc-300 mb-1">No documents found</h3>
                 <p className="text-zinc-600 text-xs">Create a new workspace to get started.</p>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}