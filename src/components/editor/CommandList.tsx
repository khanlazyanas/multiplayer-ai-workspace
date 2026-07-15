import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

export const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
        return true
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }
      return false
    },
  }))

  useEffect(() => setSelectedIndex(0), [props.items])

  return (
    // 🔥 PREMIUM VERCEL-STYLE SLASH MENU
    <div className="bg-[#0A0A0A] border border-zinc-800 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden flex flex-col p-1.5 z-50 min-w-[220px]">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            key={index}
            className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              index === selectedIndex
                ? 'bg-zinc-800/80 text-zinc-100 shadow-sm' // Active State
                : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-300' // Inactive State
            }`}
            onClick={() => selectItem(index)}
          >
            <div className="flex items-center justify-center w-6 h-6 bg-zinc-800/80 rounded border border-zinc-700/50 text-zinc-300 text-xs font-bold">
              {item.icon}
            </div>
            <span>{item.title}</span>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-zinc-500 font-medium">No results</div>
      )}
    </div>
  )
})

CommandList.displayName = 'CommandList'