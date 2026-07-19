"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export const CreateWorkspaceButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateWorkspace = async () => {
    setIsLoading(true);
    toast.loading("Setting up workspace...", { id: "create-workspace" });

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create workspace");
      }

      const workspace = await response.json();
      toast.success("Workspace created", { id: "create-workspace" });

      // 🔥 FIX: Next.js router ki jagah window.location lagaya taaki memory clear ho jaye aur naya room khali mile
      window.location.href = `/documents/${workspace.roomId}`;
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to create workspace", { id: "create-workspace" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreateWorkspace}
      disabled={isLoading}
      className="bg-white hover:bg-zinc-200 text-black font-semibold py-2.5 px-5 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
          <span>Creating...</span>
        </div>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
          </svg>
          New Workspace
        </>
      )}
    </button>
  );
};