import { renderHook, act } from '@testing-library/react'

// Firebase mock (훅보다 먼저 선언해야 함)
const mockUnsubscribe = jest.fn()
const mockOnSnapshot = jest.fn(() => mockUnsubscribe)
const mockAddDoc = jest.fn()
const mockUpdateDoc = jest.fn()
const mockDeleteDoc = jest.fn()
const mockCollection = jest.fn()
const mockDoc = jest.fn()
const mockQuery = jest.fn((ref) => ref)
const mockOrderBy = jest.fn()
const mockServerTimestamp = jest.fn(() => ({ seconds: 0 }))

jest.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  orderBy: (...args: unknown[]) => mockOrderBy(...args),
  serverTimestamp: () => mockServerTimestamp(),
}))

jest.mock('@/lib/firebase', () => ({ db: {} }))

import { useNotes } from '@/hooks/useNotes'

describe('useNotes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockOnSnapshot.mockReturnValue(mockUnsubscribe)
  })

  it('초기 notes는 빈 배열', () => {
    mockOnSnapshot.mockImplementation((_q, cb) => {
      cb({ docs: [] })
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useNotes('room-1'))
    expect(result.current.notes).toEqual([])
  })

  it('onSnapshot 데이터를 notes 상태에 매핑', () => {
    const fakeDoc = {
      id: 'note-1',
      data: () => ({ content: '테스트', x: 10, y: 20, colorIndex: 1 }),
    }

    mockOnSnapshot.mockImplementation((_q, cb) => {
      cb({ docs: [fakeDoc] })
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useNotes('room-1'))
    expect(result.current.notes).toHaveLength(1)
    expect(result.current.notes[0]).toMatchObject({ id: 'note-1', content: '테스트', x: 10, y: 20 })
  })

  it('addNote는 Firestore addDoc 호출', async () => {
    mockOnSnapshot.mockReturnValue(mockUnsubscribe)
    mockAddDoc.mockResolvedValue({ id: 'new-note' })

    const { result } = renderHook(() => useNotes('room-1'))

    await act(async () => {
      await result.current.addNote(50, 80)
    })

    expect(mockAddDoc).toHaveBeenCalledWith(
      undefined,  // collection mock returns undefined
      expect.objectContaining({ content: '', x: 50, y: 80 })
    )
  })

  it('addNote는 content 파라미터를 전달', async () => {
    mockOnSnapshot.mockReturnValue(mockUnsubscribe)
    mockAddDoc.mockResolvedValue({ id: 'new-note' })

    const { result } = renderHook(() => useNotes('room-1'))

    await act(async () => {
      await result.current.addNote(0, 0, '음성 메모 내용')
    })

    expect(mockAddDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ content: '음성 메모 내용' })
    )
  })

  it('updateNote는 Firestore updateDoc 호출', async () => {
    mockOnSnapshot.mockReturnValue(mockUnsubscribe)
    mockUpdateDoc.mockResolvedValue(undefined)

    const { result } = renderHook(() => useNotes('room-1'))

    await act(async () => {
      await result.current.updateNote('note-1', '수정된 내용')
    })

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ content: '수정된 내용' })
    )
  })

  it('moveNote는 x, y를 updateDoc에 전달', async () => {
    mockOnSnapshot.mockReturnValue(mockUnsubscribe)
    mockUpdateDoc.mockResolvedValue(undefined)

    const { result } = renderHook(() => useNotes('room-1'))

    await act(async () => {
      await result.current.moveNote('note-1', 200, 300)
    })

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ x: 200, y: 300 })
    )
  })

  it('deleteNote는 Firestore deleteDoc 호출', async () => {
    mockOnSnapshot.mockReturnValue(mockUnsubscribe)
    mockDeleteDoc.mockResolvedValue(undefined)

    const { result } = renderHook(() => useNotes('room-1'))

    await act(async () => {
      await result.current.deleteNote('note-1')
    })

    expect(mockDeleteDoc).toHaveBeenCalled()
  })

  it('changeColor는 colorIndex를 updateDoc에 전달', async () => {
    mockOnSnapshot.mockReturnValue(mockUnsubscribe)
    mockUpdateDoc.mockResolvedValue(undefined)

    const { result } = renderHook(() => useNotes('room-1'))

    await act(async () => {
      await result.current.changeColor('note-1', 3)
    })

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ colorIndex: 3 })
    )
  })

  it('언마운트 시 Firestore 구독 해제', () => {
    mockOnSnapshot.mockReturnValue(mockUnsubscribe)

    const { unmount } = renderHook(() => useNotes('room-1'))
    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
