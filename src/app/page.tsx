import { CollaborativeRoom } from "@/components/live/CollaborativeRoom";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
      {/* Yahan humne ek dummy room id 'workspace-room-1' di hai */}
      <CollaborativeRoom roomId="workspace-room-1">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-sky-400 mb-6">
            Live Room Connected! 🟢
          </h1>
          <p className="text-gray-400 text-lg">
            Ab yahan humara AI aur Multiplayer Editor aayega.
          </p>
        </div>
      </CollaborativeRoom>
    </main>
  );
}