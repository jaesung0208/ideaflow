// 커서 업데이트 전용 throttle - 최소 구현
export function throttle<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let lastCall = 0
  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= ms) {
      lastCall = now
      fn(...args)
    }
  }) as T
}
