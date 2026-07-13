"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
// 🔥 FIX 1: Naye button component ko import kiya hai
import { CreateWorkspaceButton } from "@/components/CreateWorkspaceButton"; 

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  
  const [recentWorkspaces, setRecentWorkspaces] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("recent_workspaces");
    if (saved) {
      setRecentWorkspaces(JSON.parse(saved));
    }
  }, []);

  // 🔥 FIX 2: Purana 'createNewWorkspace' function hata diya kyunki ab API backend sambhal raha hai

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
              
              {/* 🔥 FIX 3: Purane button tag ko hata kar seedha component render kiya hai */}
              <CreateWorkspaceButton />
            </div>

            {recentWorkspaces.length > 0 && (
              <div className="w-full mt-10">
                <h3 className="text-xl font-bold text-slate-300 mb-6 border-b border-slate-800 pb-2">Recent Workspaces</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {recentWorkspaces.map((roomId) => (
                    <Link href={`/documents/${roomId}`} key={roomId}>
                      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:bg-slate-800 hover:border-sky-500/50 transition-all cursor-pointer group shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                            📄
                          </div>
                          <h4 className="font-semibold text-slate-200 truncate">Workspace-{roomId.slice(0,5)}</h4>
                        </div>
                        <p className="text-xs text-slate-500 font-mono truncate">ID: {roomId}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}