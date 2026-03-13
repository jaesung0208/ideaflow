import { renderHook, act } from '@testing-library/react'
import { useCluster } from '@/hooks/useCluster'
import type { Note } from '@/types'

// fetch mock
const mockFetch = jest.fn()
global.fetch = mockFetch

const makeNote = (id: string, content: string): Note => ({
  id,
  content,
  x: 100,
  y: 100,
  colorIndex: 0,
  editorId: null,
})

describe('useCluster', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('초기 상태는 idle, groups 빈 배열, errorMessage null', () => {
    const { result } = renderHook(() => useCluster())
    expect(result.current.status).toBe('idle')
    expect(result.current.groups).toEqual([])
    expect(result.current.errorMessage).toBeNull()
  })

  it('내용 있는 노트가 1개 이하면 에러 상태', async () => {
    const { result } = renderHook(() => useCluster())

    await act(async () => {
      await result.current.requestCluster([makeNote('1', '혼자')], 'user1')
    })

    expect(result.current.status).toBe('error')
    expect(result.current.errorMessage).toContain('2개 이상')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('빈 내용 노트는 카운트에서 제외', async () => {
    const { result } = renderHook(() => useCluster())

    await act(async () => {
      await result.current.requestCluster(
        [makeNote('1', '내용 있음'), makeNote('2', '   ')],
        'user1'
      )
    })

    // 공백만 있는 노트 제외 → 유효 1개 → 에러
    expect(result.current.status).toBe('error')
  })

  it('API 성공 시 preview 상태로 groups 설정', async () => {
    const mockGroups = [
      { groupId: 'g1', groupName: '기술', noteIds: ['1', '2'] },
      { groupId: 'g2', groupName: '일상', noteIds: ['3'] },

    ]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockGroups }),
    })

    const { result } = renderHook(() => useCluster())
    const notes = [
      makeNote('1', 'React'),
      makeNote('2', 'Next.js'),
      makeNote('3', '점심 메뉴'),
    ]

    await act(async () => {
      await result.current.requestCluster(notes, 'user1')
    })

    expect(result.current.status).toBe('preview')
    expect(result.current.groups).toEqual(mockGroups)
    expect(mockFetch).toHaveBeenCalledWith('/api/cluster', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'x-user-id': 'user1' }),
    }))
  })

  it('API 실패(ok:false) 시 error 상태 및 에러 메시지', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Rate limit exceeded' }),
    })

    const { result } = renderHook(() => useCluster())

    await act(async () => {
      await result.current.requestCluster(
        [makeNote('1', '노트1'), makeNote('2', '노트2')],
        'user1'
      )
    })

    expect(result.current.status).toBe('error')
    expect(result.current.errorMessage).toBe('Rate limit exceeded')
  })

  it('네트워크 오류 시 error 상태', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useCluster())

    await act(async () => {
      await result.current.requestCluster(
        [makeNote('1', '노트1'), makeNote('2', '노트2')],
        'user1'
      )
    })

    expect(result.current.status).toBe('error')
    expect(result.current.errorMessage).toBe('Network error')
  })

  it('cancelCluster는 idle로 리셋', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: [{ groupId: 'g1', groupName: 'G', noteIds: ['1'] }] }),
    })

    const { result } = renderHook(() => useCluster())

    await act(async () => {
      await result.current.requestCluster(
        [makeNote('1', '노트1'), makeNote('2', '노트2')],
        'user1'
      )
    })
    expect(result.current.status).toBe('preview')

    act(() => { result.current.cancelCluster() })

    expect(result.current.status).toBe('idle')
    expect(result.current.groups).toEqual([])
    expect(result.current.errorMessage).toBeNull()
  })

  it('applyCluster는 노트 위치를 그룹 기반으로 재배치하고 applied 상태', async () => {
    const mockGroups = [
      { label: '그룹A', noteIds: ['1', '2'] },
      { label: '그룹B', noteIds: ['3'] },
    ]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockGroups }),
    })

    const { result } = renderHook(() => useCluster())
    const notes = [makeNote('1', 'a'), makeNote('2', 'b'), makeNote('3', 'c')]

    await act(async () => {
      await result.current.requestCluster(notes, 'u')
    })

    let updated: Note[] = []
    act(() => { updated = result.current.applyCluster(notes) })

    expect(result.current.status).toBe('applied')
    // 그룹A의 첫 번째 노트와 두 번째 노트는 x좌표가 같아야 함
    const note1 = updated.find((n) => n.id === '1')!
    const note2 = updated.find((n) => n.id === '2')!
    expect(note1.x).toBe(note2.x)
    // 그룹B(두 번째 그룹)의 노트는 x좌표가 더 커야 함
    const note3 = updated.find((n) => n.id === '3')!
    expect(note3.x).toBeGreaterThan(note1.x)
  })

  it('undoCluster는 이전 노트 위치 복원 후 idle', async () => {
    const mockGroups = [{ label: 'G', noteIds: ['1', '2'] }]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockGroups }),
    })

    const { result } = renderHook(() => useCluster())
    const originalNotes = [makeNote('1', 'a'), makeNote('2', 'b')]

    await act(async () => {
      await result.current.requestCluster(originalNotes, 'u')
    })
    act(() => { result.current.applyCluster(originalNotes) })

    let restored: Note[] | null = null
    act(() => { restored = result.current.undoCluster() })

    expect(result.current.status).toBe('idle')
    expect(restored).toEqual(originalNotes)
  })

  it('undoCluster: apply 전에는 null 반환', () => {
    const { result } = renderHook(() => useCluster())

    let restored: Note[] | null = null
    act(() => { restored = result.current.undoCluster() })

    expect(restored).toBeNull()
  })
})
