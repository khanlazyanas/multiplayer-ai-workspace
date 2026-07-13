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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sky-500 animate-pulse font-medium">
        Loading Workspace Dashboard... ⏳
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <span className="text-white text-xl font-bold">W</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Multiplayer Workspace</h1>
        </div>
        <div>
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white px-6 py-2.5 rounded-lg font-bold transition-all border border-sky-500/20 hover:border-sky-500">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <UserButton />
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full">
        {!isSignedIn ? (
          /* 🔥 PREMIUM LANDING PAGE FOR LOGGED-OUT USERS */
          <div className="w-full flex flex-col items-center justify-center relative">
            {/* Background Glow */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-sky-500/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
            
            {/* Hero Section */}
            <div className="text-center mt-24 md:mt-32 px-4 max-w-4xl mx-auto relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-sky-400 text-sm font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                MERN Stack & Next.js Powered
              </div>
              
              <h2 className="text-5xl md:text-7xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-sky-100 to-slate-100 tracking-tight leading-tight">
                Think, Write, and Build <br className="hidden md:block"/> <span className="text-sky-500">Together.</span>
              </h2>
              
              <p className="text-slate-400 mb-10 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                An enterprise-grade, real-time collaborative workspace. Experience seamless document editing, smart AI assistance, and instant synchronization.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <SignInButton mode="modal">
                  <button className="bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] transform hover:-translate-y-1 w-full sm:w-auto">
                    Start Creating Free
                  </button>
                </SignInButton>
                <a href="#features" className="bg-slate-900 hover:bg-slate-800 text-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-all border border-slate-800 hover:border-slate-700 w-full sm:w-auto">
                  Explore Features
                </a>
              </div>
            </div>

            {/* Features Grid */}
            <div id="features" className="w-full max-w-6xl mx-auto mt-32 px-6 pb-24 relative z-10">
              <h3 className="text-3xl font-bold text-center mb-16 text-slate-100">Powerful capabilities under the hood</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl hover:border-sky-500/50 transition-all hover:-translate-y-1 group">
                  <div className="w-14 h-14 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400 text-2xl mb-6 group-hover:scale-110 transition-transform">
                    ⚡
                  </div>
                  <h4 className="text-xl font-bold text-slate-200 mb-3">Real-time Sync</h4>
                  <p className="text-slate-400 leading-relaxed">Powered by Liveblocks and WebSockets. See your team's cursors and edits instantly without refreshing.</p>
                </div>
                
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl hover:border-purple-500/50 transition-all hover:-translate-y-1 group">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 text-2xl mb-6 group-hover:scale-110 transition-transform">
                    🤖
                  </div>
                  <h4 className="text-xl font-bold text-slate-200 mb-3">AI Integration</h4>
                  <p className="text-slate-400 leading-relaxed">Built-in smart assistant to help you draft, summarize, and brainstorm right inside your document.</p>
                </div>
                
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/50 transition-all hover:-translate-y-1 group">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 text-2xl mb-6 group-hover:scale-110 transition-transform">
                    🗄️
                  </div>
                  <h4 className="text-xl font-bold text-slate-200 mb-3">Database Architecture</h4>
                  <p className="text-slate-400 leading-relaxed">Robust MongoDB backend ensuring your workspaces and metadata are securely saved and always accessible.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 🔥 DASHBOARD FOR LOGGED-IN USERS */
          <div className="w-full flex flex-col items-center p-10 max-w-5xl mx-auto">
            <div className="text-center mb-12 mt-10">
              <h2 className="text-4xl font-extrabold mb-4 text-white">Welcome back!</h2>
              <p className="text-slate-400 mb-8 text-lg">Create a new workspace or open a recent one.</p>
              
              <CreateWorkspaceButton />
            </div>

            {isLoading ? (
              <div className="mt-10 text-slate-400 animate-pulse">Loading your workspaces...</div>
            ) : workspaces.length > 0 ? (
              <div className="w-full mt-10">
                <h3 className="text-xl font-bold text-slate-300 mb-6 border-b border-slate-800 pb-2">Your Workspaces</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {workspaces.map((ws) => (
                    <Link href={`/documents/${ws.roomId}`} key={ws._id} className="relative group">
                      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:bg-slate-800 hover:border-sky-500/50 transition-all cursor-pointer shadow-lg h-full">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 shrink-0 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                              📄
                            </div>
                            <h4 className="font-semibold text-slate-200 truncate" title={ws.title}>{ws.title}</h4>
                          </div>
                          
                          <button 
                            onClick={(e) => deleteWorkspace(e, ws.roomId)}
                            className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                            title="Delete Workspace"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 font-mono truncate">ID: {ws.roomId.slice(0,8)}...</p>
                        <p className="text-[10px] text-slate-600 mt-2">
                          Updated: {new Date(ws.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
               <div className="mt-10 text-slate-500 bg-slate-900/50 p-8 rounded-xl border border-slate-800 text-center w-full max-w-md">
                 No workspaces found. Create your first one above!
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}