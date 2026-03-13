'use client'

import { use, useCallback, useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { NicknameModal } from '@/components/NicknameModal'
import Canvas from '@/components/Canvas'
import BottomToolbar from '@/components/BottomToolbar'
import MiniMap from '@/components/MiniMap'
import { useNotes } from '@/hooks/useNotes'

interface Props {
  params: Promise<{ roomId: string }>
}

export default function RoomPage({ params }: Props) {
  const { roomId } = use(params)
  const { session, loading, updateNickname } = useAuth()
  const { notes, addNote, updateNote, moveNote, deleteNote, changeColor } = useNotes(roomId)
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 })
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setViewSize({ width: el.clientWidth, height: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handlePan = useCallback((dx: number, dy: number) => {
    setViewOffset(prev => ({ x: prev.x - dx, y: prev.y - dy }))
  }, [])

  const handleAddNote = useCallback(() => {
    const offset = (notes.length % 10) * 20
    addNote(
      viewOffset.x + (viewSize.width || window.innerWidth) / 2 + offset,
      viewOffset.y + (viewSize.height || window.innerHeight) / 2 + offset,
    )
  }, [addNote, notes.length, viewOffset, viewSize])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#c4a472]">
        <div className="text-white/70">연결 중...</div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden">
      {session?.isNew && <NicknameModal onConfirm={updateNickname} />}

      <Canvas
        notes={notes}
        viewOffset={viewOffset}
        onMove={moveNote}
        onUpdate={updateNote}
        onDelete={deleteNote}
        onColorChange={changeColor}
        onPan={handlePan}
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
