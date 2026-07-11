import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Provider } from "./Provider";
import { Toaster } from "react-hot-toast"; // Added import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Multiplayer AI Workspace",
  description: "Collaborative AI workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Provider>
            {children}
            {/* Global toaster for notifications */}
            <Toaster position="bottom-right" toastOptions={{
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
              }
            }} />
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}