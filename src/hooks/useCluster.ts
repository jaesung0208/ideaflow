'use client'

import { useState, useCallback } from 'react'
import type { Note, ClusterGroup, ClusterResult } from '@/types'

type ClusterStatus = 'idle' | 'loading' | 'preview' | 'applied' | 'error'

interface UseClusterReturn {
  status: ClusterStatus
  groups: ClusterGroup[]
  errorMessage: string | null
  requestCluster: (notes: Note[], userId: string) => Promise<void>
  applyCluster: (notes: Note[]) => Note[]
  cancelCluster: () => void
  undoCluster: () => Note[] | null
}

/** 그룹별 노트 배치 좌표 계산 (그룹 인덱스 기반 격자 배치) */
function calcGroupPositions(
  groups: ClusterGroup[],
  notes: Note[]
): Map<string, { x: number; y: number }> {
  const noteMap = new Map(notes.map((n) => [n.id, n]))
  const positions = new Map<string, { x: number; y: number }>()
  const GROUP_COL_WIDTH = 340
  const NOTE_HEIGHT = 180
  const PADDING = 30

  groups.forEach((group, groupIdx) => {
    const baseX = 80 + groupIdx * GROUP_COL_WIDTH
    group.noteIds.forEach((noteId, noteIdx) => {
      if (noteMap.has(noteId)) {
        positions.set(noteId, {
          x: baseX,
          y: 100 + noteIdx * (NOTE_HEIGHT + PADDING),
        })
      }
    })
  })

  return positions
}

export function useCluster(): UseClusterReturn {
  const [status, setStatus] = useState<ClusterStatus>('idle')
  const [groups, setGroups] = useState<ClusterGroup[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [previousNotes, setPreviousNotes] = useState<Note[] | null>(null)

  const requestCluster = useCallback(async (notes: Note[], userId: string) => {
    const nonEmpty = notes.filter((n) => n.content.trim())
    if (nonEmpty.length < 2) {
      setErrorMessage('클러스터링하려면 내용이 있는 노트가 2개 이상 필요합니다')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMessage(null)

    try {
      const response = await fetch('/api/cluster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          notes: nonEmpty.map((n) => ({ id: n.id, content: n.content })),
        }),
      })

      const data: ClusterResult & { error?: string } = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'AI 기능을 일시적으로 사용할 수 없습니다')
      }

      setGroups(data.groups)
      setStatus('preview')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI 기능을 일시적으로 사용할 수 없습니다'
      setErrorMessage(message)
      setStatus('error')
    }
  }, [])

  const applyCluster = useCallback(
    (notes: Note[]): Note[] => {
      setPreviousNotes(notes)
      const positions = calcGroupPositions(groups, notes)
      const updatedNotes = notes.map((note) => {
        const pos = positions.get(note.id)
        return pos ? { ...note, x: pos.x, y: pos.y } : note
      })
      setStatus('applied')
      return updatedNotes
    },
    [groups]
  )

  const cancelCluster = useCallback(() => {
    setGroups([])
    setStatus('idle')
    setErrorMessage(null)
  }, [])

  const undoCluster = useCallback((): Note[] | null => {
    if (!previousNotes) return null
    const restored = previousNotes
    setPreviousNotes(null)
    setGroups([])
    setStatus('idle')
    return restored
  }, [previousNotes])

  return { status, groups, errorMessage, requestCluster, applyCluster, cancelCluster, undoCluster }
}
