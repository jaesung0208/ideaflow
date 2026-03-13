'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection, doc, onSnapshot, setDoc, deleteDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { throttle } from '@/lib/throttle'
import type { Cursor } from '@/types'

const CURSOR_INACTIVE_MS = 30_000

export function useCursors(roomId: string, userId: string, nickname: string, color: string, device: 'mobile' | 'desktop' = 'desktop') {
  const [cursors, setCursors] = useState<Cursor[]>([])

  useEffect(() => {
    if (!roomId || !userId) return
    const cursorsRef = collection(db, 'rooms', roomId, 'cursors')
    const unsubscribe = onSnapshot(cursorsRef, (snapshot) => {
      const now = Date.now()
      setCursors(
        snapshot.docs
          .filter((d) => d.id !== userId)
          .map((d) => {
            const data = d.data()
            return {
              id: d.id,
              x: data.x as number,
              y: data.y as number,
              nickname: data.nickname as string,
              color: data.color as string,
              lastSeen: (data.lastSeen as Timestamp)?.toMillis() ?? 0,
              device: (data.device as 'mobile' | 'desktop') ?? 'desktop',
            }
          })
          .filter((c) => now - c.lastSeen < CURSOR_INACTIVE_MS)
      )
    })
    return () => unsubscribe()
  }, [roomId, userId])

  const updateCursorThrottled = useRef(
    throttle(async (x: number, y: number, uid: string, nick: string, col: string, dev: string, rid: string) => {
      if (!rid || !uid) return
      await setDoc(doc(db, 'rooms', rid, 'cursors', uid), {
        x, y, nickname: nick, color: col, device: dev, lastSeen: serverTimestamp(),
      })
    }, 100)
  ).current

  const updateCursor = useCallback((x: number, y: number) => {
    updateCursorThrottled(x, y, userId, nickname, color, device, roomId)
  }, [updateCursorThrottled, userId, nickname, color, device, roomId])

  const removeCursor = useCallback(async () => {
    if (!roomId || !userId) return
    await deleteDoc(doc(db, 'rooms', roomId, 'cursors', userId))
  }, [roomId, userId])

  useEffect(() => () => { removeCursor() }, [removeCursor])

  return { cursors, updateCursor, removeCursor }
}
