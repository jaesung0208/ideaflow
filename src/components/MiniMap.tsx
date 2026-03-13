'use client'

import { useRef } from 'react'
import { Note } from '@/types'
import { NOTE_COLORS, NOTE_SIZE } from '@/lib/constants'

interface MiniMapProps {
  notes: Note[]
  viewOffset: { x: number; y: number }
  viewSize: { width: number; height: number }
  onNavigate: (x: number, y: number) => void
}

const MAP_W = 150
const MAP_H = 100
const PADDING = 300

export default function MiniMap({ notes, viewOffset, viewSize, onNavigate }: MiniMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  // 전체 월드 범위: 모든 노트 + 현재 뷰포트 + 패딩
  const allX = [
    viewOffset.x - PADDING,
    viewOffset.x + viewSize.width + PADDING,
    ...notes.flatMap((n) => [n.x - PADDING, n.x + NOTE_SIZE.width + PADDING]),
  ]
  const allY = [
    viewOffset.y - PADDING,
    viewOffset.y + viewSize.height + PADDING,
    ...notes.flatMap((n) => [n.y - PADDING, n.y + NOTE_SIZE.height + PADDING]),
  ]

  const minX = Math.min(...allX)
  const minY = Math.min(...allY)
  const worldW = Math.max(...allX) - minX
  const worldH = Math.max(...allY) - minY

  const toMap = (wx: number, wy: number) => ({
    x: ((wx - minX) / worldW) * MAP_W,
    y: ((wy - minY) / worldH) * MAP_H,
  })

  const navigate = (e: React.PointerEvent) => {
    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const wx = (mx / MAP_W) * worldW + minX
    const wy = (my / MAP_H) * worldH + minY
    onNavigate(wx - viewSize.width / 2, wy - viewSize.height / 2)
  }

  const vpPos = toMap(viewOffset.x, viewOffset.y)
  const vpW = Math.max(8, (viewSize.width / worldW) * MAP_W)
  const vpH = Math.max(6, (viewSize.height / worldH) * MAP_H)

  return (
    <div
      ref={mapRef}
      onPointerDown={navigate}
      onPointerMove={(e) => { if (e.buttons === 1) navigate(e) }}
      style={{
        position: 'fixed',
        bottom: 96,
        right: 16,
        width: MAP_W,
        height: MAP_H,
        background: 'linear-gradient(160deg, rgba(255,252,245,0.95) 0%, rgba(245,238,225,0.97) 100%)',
        backdropFilter: 'blur(12px)',
        borderRadius: 8,
        border: '1px solid rgba(200,170,110,0.35)',
        boxShadow: '0 6px 20px rgba(80,45,10,0.22), inset 0 1px 0 rgba(255,255,255,0.9)',
        cursor: 'crosshair',
        overflow: 'hidden',
        zIndex: 20,
        touchAction: 'none',
      }}
    >
      {/* 노트 */}
      {notes.map((note) => {
        const pos = toMap(note.x, note.y)
        const color = NOTE_COLORS[note.colorIndex] ?? NOTE_COLORS[0]
        const nw = Math.max(5, (NOTE_SIZE.width / worldW) * MAP_W)
        const nh = Math.max(4, (NOTE_SIZE.height / worldH) * MAP_H)
        return (
          <div
            key={note.id}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: nw,
              height: nh,
              backgroundColor: color,
              borderRadius: 1,
              opacity: 0.9,
            }}
          />
        )
      })}

      {/* 뷰포트 영역 표시 */}
      <div
        style={{
          position: 'absolute',
          left: vpPos.x,
          top: vpPos.y,
          width: vpW,
          height: vpH,
          border: '1.5px solid rgba(59,130,246,0.7)',
          borderRadius: 2,
          background: 'rgba(59,130,246,0.06)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
