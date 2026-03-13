'use client'

import { useState, useEffect } from 'react'

/**
 * 브라우저의 네트워크 연결 상태를 추적하는 훅.
 * navigator.onLine + online/offline 이벤트 기반.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() =>
    typeof window !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const onOnline  = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)

    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return isOnline
}
