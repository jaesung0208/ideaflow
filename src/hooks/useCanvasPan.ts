'use client'

import { useState, useRef, useCallback } from 'react'
import React from 'react'

interface UseCanvasPanOptions {
  onPan: (dx: number, dy: number) => void
  isPinching: boolean
}

interface UseCanvasPanReturn {
  isPanning: boolean
  handlePointerDown: (e: React.PointerEvent) => void
  handlePointerMove: (e: React.PointerEvent) => void
  handlePointerUp: () => void
  handleCanvasClick: (e: React.MouseEvent) => void
}

/**
 * 캔버스 패닝(드래그 이동) 제스처를 처리하는 훅.
 * sticky-note, zone-handle 위에서는 패닝을 시작하지 않는다.
 */
export function useCanvasPan({ onPan, isPinching }: UseCanvasPanOptions): UseCanvasPanReturn {
  const [isPanning, setIsPanning] = useState(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const didPan = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isPinching) return
    const el = e.target as HTMLElement
    if (el.closest('[data-testid="sticky-note"]')) return
    if (el.closest('[data-zone-handle]')) return
    setIsPanning(true)
    didPan.current = false
    lastPos.current = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [isPinching])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning || isPinching) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    if (dx !== 0 || dy !== 0) didPan.current = true
    onPan(dx, dy)
  }, [isPanning, isPinching, onPan])

  const handlePointerUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (didPan.current) return
    const el = e.target as HTMLElement
    if (!el.closest('[data-testid="sticky-note"]')) {
      (document.activeElement as HTMLElement)?.blur()
    }
  }, [])

  return { isPanning, handlePointerDown, handlePointerMove, handlePointerUp, handleCanvasClick }
}
