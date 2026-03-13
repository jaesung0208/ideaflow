'use client'

import type { Cursor } from '@/types'

interface CursorLayerProps {
  cursors: Cursor[]
  viewOffset: { x: number; y: number }
}

export default function CursorLayer({ cursors, viewOffset }: CursorLayerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className="absolute"
          style={{
            left: cursor.x - viewOffset.x,
            top: cursor.y - viewOffset.y,
            transition: 'left 0.1s linear, top 0.1s linear',
          }}
        >
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <path
              d="M0 0L0 14L4 10L6.5 16L8.5 15L6 9L11 9L0 0Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1.2"
            />
          </svg>
          <span
            className="absolute left-4 top-0 text-xs text-white px-1.5 py-0.5 rounded whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.nickname}
          </span>
        </div>
      ))}
    </div>
  )
}
