'use client'

import { useRef, useCallback } from 'react'
import { Note } from '@/types'
import StickyNote from './StickyNote'

interface CanvasProps {
  notes: Note[]
  onMove: (id: string, x: number, y: number) => void
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
  onColorChange: (id: string, colorIndex: number) => void
}

export default function Canvas({ notes, onMove, onUpdate, onDelete, onColorChange }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      (document.activeElement as HTMLElement)?.blur()
    }
  }, [])

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 overflow-hidden"
      onClick={handleCanvasClick}
      data-testid="canvas"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />
      {notes.map((note) => (
        <StickyNote
          key={note.id}
          note={note}
          onMove={onMove}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onColorChange={onColorChange}
        />
      ))}
    </div>
  )
}
