"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export const CreateWorkspaceButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateWorkspace = async () => {
    setIsLoading(true);
    toast.loading("Setting up your AI workspace...", { id: "create-workspace" });

    try {
      // Backend API ko call kar rahe hain jo MongoDB me room banayegi
      const response = await fetch("/api/workspaces", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create workspace");
      }

      const workspace = await response.json();
      toast.success("Workspace created successfully!", { id: "create-workspace" });

      // Naye generate hue roomId par redirect kar do
      router.push(`/documents/${workspace.roomId}`);
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to create workspace. Try again.", { id: "create-workspace" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreateWorkspace}
      disabled={isLoading}
      className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <span className="animate-pulse">Creating... ⏳</span>
      ) : (
        "+ Create New Workspace"
      )}
    </button>
  );
};