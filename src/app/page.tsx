export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-5xl font-extrabold text-sky-400 mb-6">
        Tailwind is Working! 🎉
      </h1>
      <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-black transition-all">
        Test Button
      </button>
    </main>
  );
}