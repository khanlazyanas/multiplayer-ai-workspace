"use client";

import { ReactNode } from "react";
import { LiveblocksProvider } from "@liveblocks/react/suspense";

export function Provider({ children }: { children: ReactNode }) {
  return (
    // Puraani public API key hata kar, humne apna naya auth endpoint laga diya hai
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      {children}
    </LiveblocksProvider>
  );
}