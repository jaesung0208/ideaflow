'use client'

import { useCallback, useRef } from 'react'
import { useNotes } from '@/hooks/useNotes'
import Canvas from '@/components/Canvas'
import BottomToolbar from '@/components/BottomToolbar'

export default function Home() {
  const { notes, addNote, updateNote, moveNote, deleteNote, changeColor } = useNotes()
  const containerRef = useRef<HTMLDivElement>(null)

  // 캔버스 컨테이너 중앙에 노트 추가
  const handleAddNote = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    addNote(rect.width / 2, rect.height / 2)
  }, [addNote])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-50 canvas-container"
    >
      <Canvas
        notes={notes}
        onMove={moveNote}
        onUpdate={updateNote}
        onDelete={deleteNote}
        onColorChange={changeColor}
      />
      <BottomToolbar onAddNote={handleAddNote} />
    </div>
  )
}
