"use client";

import { ReactNode } from "react";
import { LiveblocksProvider } from "@liveblocks/react";

export function Provider({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider 
      publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || ""}
    >
      {children}
    </LiveblocksProvider>
  );
}