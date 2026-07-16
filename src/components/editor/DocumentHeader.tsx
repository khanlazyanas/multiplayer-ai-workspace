import React, { useState } from 'react';
import Image from 'next/image';

export const DocumentHeader = () => {
  // Demo ke liye default values. 
  // Baad mein inhe Liveblocks (backend) se connect kar sakte hain taaki sync ho jaye.
  const [coverUrl, setCoverUrl] = useState("https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2070&auto=format&fit=crop");
  const [emoji, setEmoji] = useState("🚀");
  const [isHoveringCover, setIsHoveringCover] = useState(false);

  // Random Gradient/Image generator (Demo feature)
  const changeCover = () => {
    const images = [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop", // Abstract dark
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop", // Minimal wireframe
      "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2070&auto=format&fit=crop"  // Purple aesthetic
    ];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setCoverUrl(randomImage);
  };

  return (
    <div className="w-full relative flex flex-col items-center">
      
      {/* --- COVER IMAGE AREA --- */}
      <div 
        className="w-full h-48 md:h-64 relative group overflow-hidden"
        onMouseEnter={() => setIsHoveringCover(true)}
        onMouseLeave={() => setIsHoveringCover(false)}
      >
        <Image
          src={coverUrl}
          alt="Document Cover"
          fill
          className="object-cover opacity-80 transition-opacity duration-500 ease-in-out"
          priority
        />
        
        {/* Subtle Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0A0A]/90 pointer-events-none"></div>

        {/* Change Cover Button (Appears on Hover) */}
        <button
          onClick={changeCover}
          className={`absolute bottom-4 right-4 md:right-10 bg-[#111]/80 backdrop-blur-md border border-zinc-700/50 text-zinc-200 text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-2 transition-all duration-300 ${
            isHoveringCover ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          } hover:bg-zinc-800`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Change Cover
        </button>
      </div>

      {/* --- EMOJI ICON (Overlapping the cover) --- */}
      <div className="w-full max-w-4xl px-8 relative flex justify-start">
        <button 
          className="relative -mt-12 md:-mt-16 text-6xl md:text-7xl bg-[#0A0A0A] rounded-full p-2 border border-zinc-800 shadow-xl hover:scale-105 transition-transform duration-200 z-10"
          title="Click to change emoji"
          // In future, you can integrate a library like 'emoji-picker-react' here
          onClick={() => setEmoji(emoji === "🚀" ? "💻" : emoji === "💻" ? "🧠" : "🚀")} 
        >
          {emoji}
        </button>
      </div>

    </div>
  );
};