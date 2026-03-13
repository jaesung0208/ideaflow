'use client'

import { useRef, useCallback, useState } from 'react'

// 두 터치 포인트 간 거리 계산
function getTouchDistance(touches: TouchList): number {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

// 두 터치 포인트의 중간점 계산
function getTouchMidpoint(touches: TouchList): { x: number; y: number } {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  }
}

interface UseCanvasGestureResult {
  scale: number
  isPinching: boolean
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}

export function useCanvasGesture(
  onScaleChange: (scale: number, originX: number, originY: number) => void
): UseCanvasGestureResult {
  const [scale, setScale] = useState(1)
  const [isPinching, setIsPinching] = useState(false)
  const lastDistanceRef = useRef<number | null>(null)
  const scaleRef = useRef(1)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setIsPinching(true)
      lastDistanceRef.current = getTouchDistance(e.touches as unknown as TouchList)
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2 || lastDistanceRef.current === null) return

    const currentDistance = getTouchDistance(e.touches as unknown as TouchList)
    const ratio = currentDistance / lastDistanceRef.current
    const nextScale = Math.min(Math.max(scaleRef.current * ratio, 0.3), 3)
    const midpoint = getTouchMidpoint(e.touches as unknown as TouchList)

    scaleRef.current = nextScale
    lastDistanceRef.current = currentDistance
    setScale(nextScale)
    onScaleChange(nextScale, midpoint.x, midpoint.y)
  }, [onScaleChange])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      lastDistanceRef.current = null
      setIsPinching(false)
    }
  }, [])

  return { scale, isPinching, onTouchStart, onTouchMove, onTouchEnd }
}
