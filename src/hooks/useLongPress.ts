'use client'

import { useRef, useCallback } from 'react'

interface LongPressOptions {
  delay?: number  // ms, 기본값 500
}

export function useLongPress(onLongPress: () => void, options: LongPressOptions = {}) {
  const { delay = 500 } = options
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const start = useCallback(() => {
    timerRef.current = setTimeout(() => {
      onLongPress()
    }, delay)
  }, [onLongPress, delay])

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
  }
}
