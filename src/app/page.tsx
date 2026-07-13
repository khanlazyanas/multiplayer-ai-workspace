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

  // 🔥 Naya Delete Function
  const deleteWorkspace = async (e: React.MouseEvent, roomId: string) => {
    e.preventDefault(); // Link par click hone se rokne ke liye
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this workspace?")) return;

    const previousWorkspaces = [...workspaces];
    setWorkspaces((prev) => prev.filter((ws) => ws.roomId !== roomId)); // UI se turant hatao

    try {
      const res = await fetch(`/api/workspaces/${roomId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Workspace deleted!");
    } catch (error) {
      console.error(error);
      toast.error("Could not delete workspace.");
      setWorkspaces(previousWorkspaces); // Agar error aaye toh wapas UI me le aao
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-sky-500 animate-pulse font-medium">
        Loading Workspace Dashboard... ⏳
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <span className="text-white text-xl font-bold">W</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Multiplayer Workspace</h1>
        </div>
        <div>
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="bg-sky-500 hover:bg-sky-400 px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-sky-500/20">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <UserButton />
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-10 max-w-5xl mx-auto w-full">
        {!isSignedIn ? (
          <div className="text-center mt-20 max-w-md mx-auto">
            <h2 className="text-3xl font-extrabold mb-4 text-slate-100">Your AI-Powered Workspace</h2>
            <p className="text-slate-400 mb-8">Sign in to start creating real-time collaborative documents with your team.</p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
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
                          
                          {/* 🔥 Delete Button */}
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