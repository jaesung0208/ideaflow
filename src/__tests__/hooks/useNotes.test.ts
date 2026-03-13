import { renderHook, act } from '@testing-library/react'

// Firebase mock — jest.mock 후 import된 함수는 jest.fn()으로 대체됨
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn((ref: unknown) => ref),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: 0 })),
}))

jest.mock('@/lib/firebase', () => ({ db: {} }))

// jest.mock 이후 import → 자동으로 mock 버전으로 바인딩
import {
  onSnapshot, addDoc, updateDoc, deleteDoc,
} from 'firebase/firestore'

import { useNotes } from '@/hooks/useNotes'

const mockOnSnapshot = onSnapshot as jest.Mock
const mockAddDoc    = addDoc    as jest.Mock
const mockUpdateDoc = updateDoc as jest.Mock
const mockDeleteDoc = deleteDoc as jest.Mock
const mockUnsubscribe = jest.fn()

describe('useNotes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockOnSnapshot.mockReturnValue(mockUnsubscribe)
  })

  it('초기 notes는 빈 배열', () => {
    mockOnSnapshot.mockImplementation((_q: unknown, cb: (s: { docs: [] }) => void) => {
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

    mockOnSnapshot.mockImplementation((_q: unknown, cb: (s: { docs: typeof fakeDoc[] }) => void) => {
      cb({ docs: [fakeDoc] })
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useNotes('room-1'))
    expect(result.current.notes).toHaveLength(1)
    expect(result.current.notes[0]).toMatchObject({ id: 'note-1', content: '테스트', x: 10, y: 20 })
  })

  it('addNote는 Firestore addDoc 호출', async () => {
    mockAddDoc.mockResolvedValue({ id: 'new-note' })

    const { result } = renderHook(() => useNotes('room-1'))

    await act(async () => {
      await result.current.addNote(50, 80)
    })

    expect(mockAddDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ content: '', x: 50, y: 80 })
    )
  })

  it('addNote는 content 파라미터를 전달', async () => {
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
    mockDeleteDoc.mockResolvedValue(undefined)

    const { result } = renderHook(() => useNotes('room-1'))

    await act(async () => {
      await result.current.deleteNote('note-1')
    })

    expect(mockDeleteDoc).toHaveBeenCalled()
  })

  it('changeColor는 colorIndex를 updateDoc에 전달', async () => {
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

  it('notesError: Firestore 오류 시 에러 메시지 반환', () => {
    mockOnSnapshot.mockImplementation(
      (_q: unknown, _cb: unknown, errCb: (e: Error) => void) => {
        errCb(new Error('Permission denied'))
        return mockUnsubscribe
      }
    )

    const { result } = renderHook(() => useNotes('room-1'))
    expect(result.current.notesError).toBeTruthy()
  })

  it('언마운트 시 Firestore 구독 해제', () => {
    const { unmount } = renderHook(() => useNotes('room-1'))
    unmount()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
