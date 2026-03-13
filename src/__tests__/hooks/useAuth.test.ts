import { renderHook, act, waitFor } from '@testing-library/react'

// Firebase Auth mock
const mockUnsubscribe = jest.fn()
const mockSignInAnonymously = jest.fn()
let authStateCallback: ((user: unknown) => void) | null = null

jest.mock('firebase/auth', () => ({
  signInAnonymously: (...args: unknown[]) => mockSignInAnonymously(...args),
  onAuthStateChanged: (_auth: unknown, cb: (user: unknown) => void) => {
    authStateCallback = cb
    return mockUnsubscribe
  },
}))

jest.mock('@/lib/firebase', () => ({ auth: {}, db: {} }))

// jsdom에서 crypto.randomUUID mock
Object.defineProperty(global, 'crypto', {
  value: { randomUUID: jest.fn(() => 'test-tab-uuid') },
})

// matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn(() => ({ matches: false })),
})

import { useAuth } from '@/hooks/useAuth'

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    authStateCallback = null
    sessionStorage.clear()
    localStorage.clear()
  })

  it('초기 상태: loading true, session null', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(true)
    expect(result.current.session).toBeNull()
  })

  it('user 없으면 signInAnonymously 호출', async () => {
    mockSignInAnonymously.mockResolvedValue(undefined)

    renderHook(() => useAuth())

    await act(async () => {
      authStateCallback?.(null)
    })

    expect(mockSignInAnonymously).toHaveBeenCalled()
  })

  it('user 있으면 session 설정 및 loading false', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      authStateCallback?.({ uid: 'firebase-uid-123' })
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.session).not.toBeNull()
    expect(result.current.session?.nickname).toBe('익명 사용자')
  })

  it('localStorage에 닉네임 있으면 해당 닉네임으로 세션 설정', async () => {
    localStorage.setItem('ideaflow_nickname', '홍길동')

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      authStateCallback?.({ uid: 'uid-456' })
    })

    await waitFor(() => expect(result.current.session?.nickname).toBe('홍길동'))
  })

  it('updateNickname은 세션 nickname 업데이트 및 localStorage 저장', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      authStateCallback?.({ uid: 'uid-789' })
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.updateNickname('새 닉네임')
    })

    expect(result.current.session?.nickname).toBe('새 닉네임')
    expect(localStorage.getItem('ideaflow_nickname')).toBe('새 닉네임')
  })

  it('updateNickname 후 isNew는 false', async () => {
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      authStateCallback?.({ uid: 'uid-abc' })
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.updateNickname('테스터')
    })

    expect(result.current.session?.isNew).toBe(false)
  })

  it('matchMedia pointer:coarse이면 device가 mobile', async () => {
    ;(window.matchMedia as jest.Mock).mockReturnValue({ matches: true })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      authStateCallback?.({ uid: 'mobile-uid' })
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.session?.device).toBe('mobile')
  })

  it('언마운트 시 Auth 구독 해제', () => {
    const { unmount } = renderHook(() => useAuth())
    unmount()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
