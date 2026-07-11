"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  const createNewWorkspace = () => {
    const roomId = crypto.randomUUID();
    router.push(`/room/${roomId}`);
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
      {/* Navbar */}
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

      {/* Main Dashboard Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {!isSignedIn ? (
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-extrabold mb-4 text-slate-100">Your AI-Powered Workspace</h2>
            <p className="text-slate-400 mb-8">Sign in to start creating real-time collaborative documents with your team.</p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-4xl font-extrabold mb-4 text-white">Welcome back!</h2>
            <p className="text-slate-400 mb-10 text-lg">Create a new workspace and share the link with your team.</p>
            
            <button 
              onClick={createNewWorkspace}
              className="bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] transform hover:-translate-y-1"
            >
              + Create New Workspace
            </button>
          </div>
        )}
      </main>
    </div>
  );
}