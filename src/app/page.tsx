'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useNotes } from '@/hooks/useNotes'
import Canvas from '@/components/Canvas'
import BottomToolbar from '@/components/BottomToolbar'
import MiniMap from '@/components/MiniMap'

export default function Home() {
  const { notes, addNote, updateNote, moveNote, deleteNote, changeColor } = useNotes()
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 })
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 })

  // 컨테이너 크기 측정 (미니맵 뷰포트 계산용)
  useEffect(() => {
    const update = () => {
      const el = containerRef.current
      if (el) setViewSize({ width: el.clientWidth, height: el.clientHeight })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // 캔버스 중앙에 노트 추가 (겹침 방지: 20px cascade)
  const handleAddNote = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const offset = (notes.length % 10) * 20
    addNote(viewOffset.x + rect.width / 2 + offset, viewOffset.y + rect.height / 2 + offset)
  }, [addNote, notes.length, viewOffset])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-50 canvas-container"
    >
      <Canvas
        notes={notes}
        viewOffset={viewOffset}
        onMove={moveNote}
        onUpdate={updateNote}
        onDelete={deleteNote}
        onColorChange={changeColor}
        onPan={(dx, dy) => setViewOffset((prev) => ({ x: prev.x - dx, y: prev.y - dy }))}
      />
      <BottomToolbar onAddNote={handleAddNote} />
      {viewSize.width > 0 && (
        <MiniMap
          notes={notes}
          viewOffset={viewOffset}
          viewSize={viewSize}
          onNavigate={(x, y) => setViewOffset({ x, y })}
        />
      )}
    </div>
  )
}
