import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

export const MentionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command({ id: item })
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

  return (
    // 🔥 PREMIUM VERCEL-STYLE DROPDOWN CONTAINER
    <div className="bg-[#0A0A0A] border border-zinc-800 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden flex flex-col p-1.5 z-50 min-w-[220px]">
      {props.items.length ? (
        props.items.map((item: string, index: number) => (
          <button
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              index === selectedIndex
                ? 'bg-zinc-800/80 text-zinc-100 shadow-sm' // Premium dark grey for active item
                : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-300' // Subtle state for inactive
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item}
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-zinc-500 font-medium">No results</div>
      )}
    </div>
  )
})

MentionList.displayName = 'MentionList'