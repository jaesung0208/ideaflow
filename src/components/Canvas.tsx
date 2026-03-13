'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import React from 'react'
import { Note } from '@/types'
import StickyNote from './StickyNote'
import { useCanvasGesture } from '@/hooks/useCanvasGesture'
import { useCanvasPan } from '@/hooks/useCanvasPan'

interface CanvasProps {
  notes: Note[]
  viewOffset: { x: number; y: number }
  onMove: (id: string, x: number, y: number) => void
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
  onColorChange: (id: string, colorIndex: number) => void
  onPan: (dx: number, dy: number) => void
  overlay?: React.ReactNode
}

export default function Canvas({ notes, viewOffset, onMove, onUpdate, onDelete, onColorChange, onPan, overlay }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  // 핀치줌 origin 상태 (핀치 중간점 기준)
  const [originX, setOriginX] = useState(0)
  const [originY, setOriginY] = useState(0)

  const handleScaleChange = useCallback((_newScale: number, ox: number, oy: number) => {
    setOriginX(ox)
    setOriginY(oy)
  }, [])

  const { scale, isPinching, onTouchStart, onTouchMove, onTouchEnd } = useCanvasGesture(handleScaleChange)

  const { isPanning, handlePointerDown, handlePointerMove, handlePointerUp, handleCanvasClick } =
    useCanvasPan({ onPan, isPinching })

  // non-passive touchmove 리스너: 브라우저 기본 줌/스크롤 차단
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return

    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length >= 2) e.preventDefault()
    }

    el.addEventListener('touchmove', preventDefault, { passive: false })
    return () => el.removeEventListener('touchmove', preventDefault)
  }, [])

  // 코르크 배경이 패닝에 따라 미세하게 이동 (현실감)
  const bgX = ((-viewOffset.x * 0.03) % 20 + 20) % 20
  const bgY = ((-viewOffset.y * 0.03) % 20 + 20) % 20

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 overflow-hidden"
      onClick={handleCanvasClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      data-testid="canvas"
      style={{
        cursor: isPanning ? 'grabbing' : 'default',
        backgroundColor: '#c4a472',
        backgroundImage: `
          radial-gradient(ellipse at 10% 90%, rgba(120,72,20,0.5) 0%, transparent 50%),
          radial-gradient(ellipse at 90% 10%, rgba(170,118,48,0.4) 0%, transparent 50%),
          radial-gradient(ellipse at 55% 55%, rgba(140,90,30,0.2) 0%, transparent 40%),
          radial-gradient(circle at 3px 3px,   rgba(0,0,0,0.09) 1.5px, transparent 0),
          radial-gradient(circle at 10px 10px, rgba(255,255,255,0.06) 1px,   transparent 0),
          radial-gradient(circle at 6px 15px,  rgba(0,0,0,0.06) 1px,   transparent 0),
          radial-gradient(circle at 15px 5px,  rgba(0,0,0,0.05) 1px,   transparent 0)
        `,
        backgroundSize: `
          100% 100%, 100% 100%, 100% 100%,
          18px 18px, 18px 18px, 16px 16px, 14px 14px
        `,
        backgroundPosition: `
          0 0, 0 0, 0 0,
          ${bgX}px ${bgY}px,
          ${bgX}px ${bgY}px,
          ${bgX}px ${bgY}px,
          ${bgX}px ${bgY}px
        `,
      }}
    >
      {/* 코르크 테두리 프레임 느낌 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 60px rgba(80,45,10,0.35)' }}
        aria-hidden="true"
      />

      {/* 노트 컨테이너 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${-viewOffset.x}px, ${-viewOffset.y}px) scale(${scale})`,
          transformOrigin: `${originX}px ${originY}px`,
          overflow: 'visible',
        }}
      >
        {overlay}
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
    </div>
  )
}
